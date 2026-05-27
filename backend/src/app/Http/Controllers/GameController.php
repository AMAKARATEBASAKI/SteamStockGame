<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\SteamGameService;

class GameController extends Controller
{
    public function show($appid, SteamGameService $service)
    {
        $game = $service->getGameInfo($appid);

        if (!$game) {
            return response()->json([
                'message' => 'Game not found'
            ], 404);
        }

        return response()->json($game);
    }
}
