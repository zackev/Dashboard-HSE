<?php

namespace App\Models;

use App\Models\Scopes\CompanyScope;
use Illuminate\Database\Eloquent\Model;

class Training extends Model
{
    protected $table = 'trainings';

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
