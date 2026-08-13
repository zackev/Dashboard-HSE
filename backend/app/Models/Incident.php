<?php

namespace App\Models;

use App\Models\Scopes\CompanyScope;
use Illuminate\Database\Eloquent\Model;

class Incident extends Model
{
    protected $table = 'incidents';

    protected $guarded = ['id'];

    protected static function booted(): void
    {
        static::addGlobalScope(new CompanyScope);

        static::creating(function (Incident $incident) {
            if (auth()->check() && !$incident->company_id) {
                $incident->company_id = auth()->user()->company_id;
            }
        });
    }
}