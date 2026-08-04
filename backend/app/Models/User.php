<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'phone', 'password', 'role_id', 'is_active',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function permits()
    {
        return $this->hasMany(Permit::class);
    }

    /** Nomor WA dalam format internasional (62xxxx), dipakai channel WhatsApp. */
    public function routeNotificationForWhatsApp(): ?string
    {
        return $this->phone;
    }

    public function hasPermission(string $key): bool
    {
        if (! $this->role) {
            return false;
        }

        return $this->role->permissions()->where('key', $key)->exists();
    }
}
