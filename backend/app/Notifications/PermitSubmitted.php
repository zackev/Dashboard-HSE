<?php

namespace App\Notifications;

use App\Models\Permit;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PermitSubmitted extends Notification
{
    use Queueable;

    public function __construct(public Permit $permit) {}

    /**
     * Channel yang aktif: 'database' (bell icon) selalu jalan; 'mail' & 'whatsapp'
     * otomatis dilewati kalau belum dikonfigurasi (lihat MailChannel bawaan Laravel
     * & App\Channels\WhatsAppChannel::send).
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail', 'whatsapp'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'permit_submitted',
            'permit_id' => $this->permit->id,
            'permit_no' => $this->permit->permit_no,
            'requested_by' => $this->permit->requested_by,
            'title' => 'Pengajuan Ijin Kerja Baru',
            'message' => "{$this->permit->requested_by} mengajukan ijin kerja \"{$this->permit->permit_no}\" ({$this->permit->type}) — menunggu persetujuan Anda.",
            'url' => '/permits?status=Submitted',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Pengajuan Ijin Kerja Baru — '.$this->permit->permit_no)
            ->greeting('Halo '.$notifiable->name.',')
            ->line("Ada pengajuan ijin kerja baru yang perlu Anda tinjau:")
            ->line('No. Ijin: '.$this->permit->permit_no)
            ->line('Tipe: '.$this->permit->type)
            ->line('Lokasi: '.$this->permit->location)
            ->line('Diajukan oleh: '.$this->permit->requested_by)
            ->action('Buka Halaman Approval', config('app.frontend_url', env('FRONTEND_URL', '#')).'/permits')
            ->line('Silakan tinjau dan setujui/tolak pengajuan ini di dashboard.');
    }

    public function toWhatsApp(object $notifiable): string
    {
        return "*HSE Dashboard*\nPengajuan Ijin Kerja baru menunggu persetujuan Anda.\n\n"
            ."No. Ijin: {$this->permit->permit_no}\n"
            ."Tipe: {$this->permit->type}\n"
            ."Lokasi: {$this->permit->location}\n"
            ."Diajukan oleh: {$this->permit->requested_by}\n\n"
            .'Buka dashboard untuk approve/reject.';
    }
}
