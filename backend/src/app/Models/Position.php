<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Position extends Model
{
    protected $fillable = [
        'user_id' ,
        'steam_app_id',
        'amount',
        'buy_price',
        'buy_total',
        'buy_time',
        'auto_sell_time',
        'status',
    ];
}
