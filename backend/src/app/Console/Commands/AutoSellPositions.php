<?php

namespace App\Console\Commands;

use App\Models\Position;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use App\Services\PriceService;
use App\Services\SteamService;

class AutoSellPositions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'positions:auto-sell';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Auto sell positions';
    
    /**
     * Execute the console command.
     */
    public function __construct(
        private SteamService $steamService,
        private PriceService $priceService
    ) {
        parent::__construct(); 
    }

    public function handle(): int
    {
        $positions = Position::where('status', 'open')
            ->where('auto_sell_time', '<=', now())
            ->get();

        $prices = [];

        foreach ($positions->pluck('steam_app_id')->unique() as $appId) {
            try {
                $players = $this->steamService->getPlayerCount($appId);
                $prices[$appId] = $this->priceService->calculate($players);
            } catch (\Throwable $e) {
                Log::error("Failed to fetch price for app #{$appId}", [
                    'error' => $e->getMessage(),
                ]);
            }
        }

        foreach ($positions as $position) {
            if (!array_key_exists($position->steam_app_id, $prices)) {
                Log::warning("Skipping position #{$position->id} because price could not be determined");
                continue;
            }

            try {
                DB::transaction(function () use ($position, $prices) {
                    $freshPosition = Position::whereKey($position->id)
                        ->lockForUpdate()
                        ->first();

                    if (!$freshPosition) {
                        return;
                    }

                    if ($freshPosition->status !== 'open' || $freshPosition->auto_sell_time > now()) {
                        return;
                    }

                    $user = User::whereKey($freshPosition->user_id)
                        ->lockForUpdate()
                        ->first();

                    if (!$user) {
                        throw new \RuntimeException("User #{$freshPosition->user_id} not found");
                    }

                    $sellPrice = $prices[$freshPosition->steam_app_id];
                    $total = $sellPrice * $freshPosition->amount;

                    $user->increment('balance', $total);

                    $freshPosition->update([
                        'selling_price' => $sellPrice,
                        'sell_total' => $total,
                        'sell_time' => now(),
                        'status' => 'closed',
                    ]);
                });

                Log::info("Position #{$position->id} sold for user #{$position->user_id}", [
                    'price' => $prices[$position->steam_app_id],
                    'total' => $prices[$position->steam_app_id] * $position->amount,
                ]);
            } catch (\Throwable $e) {
                Log::error("Failed to sell position #{$position->id}", [
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return self::SUCCESS;
    }
}