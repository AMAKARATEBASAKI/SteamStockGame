<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
    Schema::create('positions', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->cascadeOnDelete();
        $table->bigInteger('steam_app_id');

        $table->integer('amount');
        $table->bigInteger('buy_price');   // 単価
        $table->bigInteger('buy_total');   // buy_price * amount
        $table->timestamp('buy_time');
        $table->timestamp('auto_sell_time');

        $table->bigInteger('selling_price')->nullable();
        $table->bigInteger('sell_total')->nullable();
        $table->timestamp('sell_time')->nullable();

        $table->string('status')->default('open');
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('positions');
    }
};
