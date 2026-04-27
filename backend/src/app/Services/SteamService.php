<?php

namespace App\Services;

class SteamService
{
    public function getPlayerCount(int $appId): int
    {
        // TODO APIを入れる
        return rand(1000, 100000);
    }
}