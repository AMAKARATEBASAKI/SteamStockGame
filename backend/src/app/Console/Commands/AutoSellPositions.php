<?php

namespace App\Console\Commands;

use App\Models\Position;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

use App\Services\SteamService;
use App\Services\PriceService;
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
        DB::transaction(function () {
            
            $positions = Position::where('status', 'open')
                ->where('auto_sell_time', '<=', now())
                ->lockForUpdate()
                ->get();

            foreach ($positions as $position) {
                try {
                    $user = User::findOrFail($position->user_id);

                    $players = $this->steamService->getPlayerCount($position->steam_app_id);
                    $sellPrice = $this->priceService->calculate($players);

                    $total = $sellPrice * $position->amount;

                    // balance 加算
                    $user->increment('balance', $total);

                    // position 更新
                    Position::whereKey($position->id)->update([
                        'selling_price' => $sellPrice,
                        'sell_total' => $total,
                        'sell_time' => now(),
                        'status' => 'closed',
                    ]);

                    Log::info("Position #{$position->id} sold for user #{$position->user_id}", [
                        'price' => $sellPrice,
                        'total' => $total,
                    ]);
                } catch (\Exception $e) {
                    Log::error("Failed to sell position #{$position->id}", ['error' => $e->getMessage()]);
                }
            }
        });
        return self::SUCCESS;
    }
}