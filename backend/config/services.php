<?php

return [
    'whatsapp' => [
        // Provider WA. Panduan lengkap ada di README bagian "Setup Notifikasi WhatsApp".
        // Default menggunakan Fonnte (https://fonnte.com).
        'driver' => env('WHATSAPP_DRIVER', 'fonnte'),
        'enabled' => (bool) env('WHATSAPP_ENABLED', false),
        'token' => env('FONNTE_TOKEN'),
        'endpoint' => env('FONNTE_ENDPOINT', 'https://api.fonnte.com/send'),
        // Nomor default kalau user penerima tidak punya nomor HP terisi
        'fallback_number' => env('WHATSAPP_FALLBACK_NUMBER'),
    ],
];
