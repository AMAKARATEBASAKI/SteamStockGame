<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\DB;
use App\Models\Position;
use App\Services\SteamService;
use App\Services\PriceService;

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

    //価格
    $steamService = new SteamService();
    $priceService = new PriceService();

    $players = $steamService->getPlayerCount($data['steam_app_id']);
    $price = $priceService->calculate($players);

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

    public function open(Request $request)
    {
        $positions = Position::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->orderBy('buy_time', 'desc')
            ->get();

        return response()->json($positions);
    }

    public function history(Request $request)
    {
        $positions = Position::where('user_id', $request->user()->id)
            ->where('status', 'closed')
            ->orderBy('sell_time', 'desc')
            ->get();

        return response()->json($positions);
    }
}