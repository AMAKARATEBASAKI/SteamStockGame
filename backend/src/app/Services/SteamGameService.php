<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class SteamGameService
{
    public function getGameInfo($appId)
    {
        $response = Http::get(
            "https://store.steampowered.com/api/appdetails",
            [
                'appids' => $appId,
            ]
        );

        $data = $response->json();

        if (
            !isset($data[$appId]['success']) ||
            !$data[$appId]['success']
        ) {
            return null;
        }

        return [
            'appid' => $appId,
            'name' => $data[$appId]['data']['name'] ?? null,
        ];
    }
}