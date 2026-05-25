<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\RankingController;

Route::get('/ping', function () {
    return response()->json([
        'message' => 'pong',
    ]);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->get('/me', function (Request $request) {
    return $request->user();
});

Route::middleware('auth:sanctum')->post('/positions/buy', [PositionController::class, 'buy']);

Route::middleware('auth:sanctum')
    ->get('/positions/open', [PositionController::class, 'open']);

Route::middleware('auth:sanctum')
    ->get('/positions/history', [PositionController::class, 'history']);

Route::get('/ranking', [RankingController::class, 'index']);