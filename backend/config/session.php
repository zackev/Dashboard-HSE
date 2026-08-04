<?php

return [
    'driver' => env('SESSION_DRIVER', 'database'),
    'lifetime' => (int) env('SESSION_LIFETIME', 120),
    'expire_on_close' => false,
    'encrypt' => false,
    'files' => storage_path('framework/sessions'),
    'connection' => env('SESSION_CONNECTION'),
    'table' => 'sessions',
    'store' => env('SESSION_STORE'),
    'lottery' => [2, 100],
    'cookie' => env('SESSION_COOKIE', 'hse_dashboard_session'),
    'path' => '/',
    // Untuk dev cross-port (React di :5173, Laravel di :8000) domain dikosongkan (null)
    'domain' => env('SESSION_DOMAIN'),
    'secure' => env('SESSION_SECURE_COOKIE', false),
    'http_only' => true,
    // 'lax' cukup untuk same-site dev; kalau frontend & backend beda domain di production, pakai 'none' + secure=true (HTTPS wajib)
    'same_site' => env('SESSION_SAME_SITE', 'lax'),
    'partitioned' => false,
];
