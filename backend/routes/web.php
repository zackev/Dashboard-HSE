<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'HSE Dashboard API aktif. Frontend React berjalan terpisah (lihat README).',
    ]);
});
