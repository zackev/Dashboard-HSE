<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permit extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['jsa' => 'array'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by_id');
    }

    public static function hasValidJsa($jsa): bool
    {
        if (! is_array($jsa)) {
            return false;
        }
        foreach ($jsa as $row) {
            if (! empty(trim($row['step'] ?? ''))) {
                return true;
            }
        }
        return false;
    }
}
