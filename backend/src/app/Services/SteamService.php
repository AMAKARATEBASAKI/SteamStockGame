<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class SteamService
{
    public function getPlayerCount(int $appId): int
    {
        $response = Http::retry(2, 200)
            ->timeout(5)
            ->get('https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/', [
                'appid' => $appId,
            ]);

        if (!$response->successful()) {
            throw new \RuntimeException("Failed to fetch player count for app #{$appId}");
        }

        $data = $response->json();
        $playerCount = $data['response']['player_count'] ?? null;

        if ($playerCount === null) {
            throw new \RuntimeException("Player count was missing for app #{$appId}");
        }

        return (int) $playerCount;
    }
}