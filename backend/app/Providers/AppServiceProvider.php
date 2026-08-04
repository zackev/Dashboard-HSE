<?php

namespace App\Providers;

use Illuminate\Notifications\ChannelManager;
use Illuminate\Support\ServiceProvider;
use App\Channels\WhatsAppChannel;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Daftarkan channel notifikasi custom "whatsapp" supaya bisa dipakai
        // di method via() pada class Notification, mis: return ['database','mail','whatsapp'];
        $this->app->make(ChannelManager::class)->extend('whatsapp', function ($app) {
            return new WhatsAppChannel();
        });
    }
}
