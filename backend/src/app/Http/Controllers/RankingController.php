<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class RankingController extends Controller
{
	public function index()
	{
		$ranking = User::select(
            'id',
            'name as player_name',
            'balance'
        )
        ->orderByDesc('balance')
        ->limit(100)
        ->get();

    return response()->json($ranking);
	}
}
