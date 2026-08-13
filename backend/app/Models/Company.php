<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    protected $fillable = [
        'name',
        'short_name',
        'logo',
        'address',
        'city',
        'province',
        'postal_code',
        'phone',
        'email',
        'website',
        'npwp',
        'industry',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}