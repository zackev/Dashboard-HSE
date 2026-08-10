<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PermitOvertime extends Model
{
    protected $guarded = ['id'];

    public function permit()
    {
        return $this->belongsTo(Permit::class);
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function adminReviewer()
    {
        return $this->belongsTo(User::class, 'admin_reviewed_by');
    }

    public function gmReviewer()
    {
        return $this->belongsTo(User::class, 'gm_reviewed_by');
    }
}
