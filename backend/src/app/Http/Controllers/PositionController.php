<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\DB;
use App\Models\Position;

class PositionController extends Controller
{
    public function buy(Request $request)
{
    $data = $request->validate([
        'steam_app_id' => 'required|integer',
        'amount' => 'required|integer|min:1',
        'auto_sell_time' => 'required|date',
    ]);

    $user = $request->user();

    // 仮の株価（ダミー）
    $price = 100;
    $total = $price * $data['amount'];

    DB::transaction(function () use ($user, $data, $price, $total) {
        if ($user->balance < $total) {
            abort(400, 'Not enough balance');
        }

        $user->decrement('balance', $total);

        Position::create([
            'user_id' => $user->id,
            'steam_app_id' => $data['steam_app_id'],
            'amount' => $data['amount'],
            'buy_price' => $price,
            'buy_total' => $total,
            'buy_time' => now(),
            'auto_sell_time' => $data['auto_sell_time'],
            'status' => 'open',
        ]);
    });

    return response()->json(['status' => 'ok']);
}
}
