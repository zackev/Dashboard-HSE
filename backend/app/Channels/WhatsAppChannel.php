<?php

namespace App\Channels;

use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Channel notifikasi WhatsApp generik.
 *
 * Supaya dipakai, notification class harus punya method toWhatsApp($notifiable)
 * yang mengembalikan string pesan. Lihat App\Notifications\PermitSubmitted
 * atau App\Notifications\PermitStatusUpdated untuk contoh.
 *
 * Provider default: Fonnte (https://fonnte.com). Panduan setup lengkap ada
 * di README.md bagian "Setup Notifikasi WhatsApp".
 */
class WhatsAppChannel
{
    public function send(object $notifiable, Notification $notification): void
    {
        if (! config('services.whatsapp.enabled')) {
            return; // WA notification dimatikan lewat .env, tidak melempar error
        }

        if (! method_exists($notification, 'toWhatsApp')) {
            return;
        }

        $number = method_exists($notifiable, 'routeNotificationForWhatsApp')
            ? $notifiable->routeNotificationForWhatsApp()
            : null;

        $number = $number ?: config('services.whatsapp.fallback_number');

        if (! $number) {
            Log::warning('WhatsAppChannel: nomor tujuan kosong, notifikasi dilewati.', [
                'notifiable' => get_class($notifiable),
            ]);
            return;
        }

        $message = $notification->toWhatsApp($notifiable);

        $driver = config('services.whatsapp.driver', 'fonnte');

        match ($driver) {
            'fonnte' => $this->sendViaFonnte($number, $message),
            default => Log::warning("WhatsAppChannel: driver '{$driver}' belum didukung."),
        };
    }

    protected function sendViaFonnte(string $number, string $message): void
    {
        $token = config('services.whatsapp.token');
        $endpoint = config('services.whatsapp.endpoint');

        if (! $token) {
            Log::warning('WhatsAppChannel: FONNTE_TOKEN belum diisi di .env, notifikasi WA dilewati.');
            return;
        }

        try {
            $response = Http::asForm()
                ->withHeaders(['Authorization' => $token])
                ->post($endpoint, [
                    'target' => $this->normalizeNumber($number),
                    'message' => $message,
                ]);

            if (! $response->successful()) {
                Log::error('WhatsAppChannel (Fonnte) gagal kirim.', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('WhatsAppChannel (Fonnte) exception: '.$e->getMessage());
        }
    }

    /** Fonnte menerima format 62xxxxxxxxxx (tanpa +, tanpa spasi/strip). */
    protected function normalizeNumber(string $number): string
    {
        $number = preg_replace('/[^0-9]/', '', $number);
        if (str_starts_with($number, '0')) {
            $number = '62'.substr($number, 1);
        }
        return $number;
    }
}
