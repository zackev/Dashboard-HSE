<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'up'],
    'allowed_methods' => ['*'],

    // Isi dengan URL frontend React kamu, mis: http://localhost:5173
    'allowed_origins' => array_filter(explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173'))),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,

    // WAJIB true supaya cookie sesi Sanctum terkirim dari React (fetch/axios withCredentials)
    'supports_credentials' => true,
];
