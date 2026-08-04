<?php

namespace App\Notifications;

use App\Models\Permit;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PermitStatusUpdated extends Notification
{
    use Queueable;

    public function __construct(public Permit $permit) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail', 'whatsapp'];
    }

    protected function isApproved(): bool
    {
        return in_array($this->permit->status, ['Approved', 'Active']);
    }

    public function toDatabase(object $notifiable): array
    {
        $verb = $this->isApproved() ? 'disetujui' : 'ditolak';

        return [
            'type' => 'permit_status_updated',
            'permit_id' => $this->permit->id,
            'permit_no' => $this->permit->permit_no,
            'status' => $this->permit->status,
            'title' => 'Ijin Kerja '.ucfirst($verb),
            'message' => "Ijin kerja \"{$this->permit->permit_no}\" Anda telah {$verb}"
                .($this->permit->status === 'Rejected' && $this->permit->rejection_reason
                    ? " — alasan: {$this->permit->rejection_reason}"
                    : '.'),
            'url' => '/permits',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $verb = $this->isApproved() ? 'Disetujui' : 'Ditolak';
        $mail = (new MailMessage)
            ->subject("Ijin Kerja {$this->permit->permit_no} {$verb}")
            ->greeting('Halo '.$notifiable->name.',')
            ->line("Status ijin kerja Anda telah diperbarui:")
            ->line('No. Ijin: '.$this->permit->permit_no)
            ->line('Status: '.$this->permit->status);

        if ($this->permit->status === 'Rejected' && $this->permit->rejection_reason) {
            $mail->line('Alasan penolakan: '.$this->permit->rejection_reason);
        }

        return $mail->action('Lihat Detail', config('app.frontend_url', env('FRONTEND_URL', '#')).'/permits');
    }

    public function toWhatsApp(object $notifiable): string
    {
        $verb = $this->isApproved() ? 'DISETUJUI ✅' : 'DITOLAK ❌';
        $msg = "*HSE Dashboard*\nIjin kerja Anda: {$this->permit->permit_no}\nStatus: {$verb}";
        if ($this->permit->status === 'Rejected' && $this->permit->rejection_reason) {
            $msg .= "\nAlasan: {$this->permit->rejection_reason}";
        }
        return $msg;
    }
}
