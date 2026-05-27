<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\SteamService;
use App\Services\SteamGameService;

class GameController extends Controller
{
    public function show($appid, SteamGameService $service, SteamService $steamService)
    {
        $game = $service->getGameInfo($appid);

        if (!$game) {
            return response()->json([
                'message' => 'Game not found'
            ], 404);
        }

        $game['player_count'] = $steamService->getPlayerCount((int) $appid);

        return response()->json($game);
    }
}
