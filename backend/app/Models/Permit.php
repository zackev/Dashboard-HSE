<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permit extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'jsa' => 'array',
            'work_classifications' => 'array',
            'workers' => 'array',
            'equipment' => 'array',
            'safety_equipment' => 'array',
            'doc_release_date' => 'date:Y-m-d',
        ];
    }

    /**
     * Daftar tetap "Klasifikasi Pekerjaan" (bagian A form) - multi-select.
     * Satu sumber kebenaran dipakai backend (validasi) & frontend (checkbox),
     * diekspos lewat GET /permits/form-options.
     */
    const WORK_CLASSIFICATIONS = [
        'Kerja Panas', 'Kerja Listrik', 'Ketinggian', 'Alat Berat',
        'Perpipaan', 'Tangki', 'Ruang Terbatas', 'Galian',
    ];

    /**
     * Daftar tetap "Peralatan Keselamatan" (bagian E form) - multi-select,
     * dikelompokkan persis seperti 3 kolom di form kertas.
     */
    const SAFETY_EQUIPMENT_GROUPS = [
        'Alat Pelindung Diri' => [
            'Helm', 'Kacamata', 'Goggle', 'Tameng Muka', 'Kap Las', 'Masker Kain', 'Masker Kimia',
            'Earplug / Earmuff', 'Sarung Tangan Katun', 'Sarung Tangan Karet', 'Sarung Tangan Kulit',
            'Sarung Tangan Las', 'Sabuk Keselamatan', 'Full Body Harness',
        ],
        'Pelindung Tambahan' => [
            'Pelampung', 'Baju Lab', 'Sepatu Keselamatan', 'Sepatu Boots', 'Tabung Pernafasan', 'Apron',
        ],
        'Perlengkapan Keselamatan & Darurat' => [
            'Pemadam Api (APAR, Karung Goni Basah)', 'Barikade (Garis/Tanda Bahaya)', 'Rambu/Tanda Bahaya',
            'LOTO (Lock Out Tag Out)', 'Radio Telekomunikasi', 'Jaring/Tali Keselamatan',
        ],
    ];

    /** Kategori baris pada tabel C. Perlengkapan Kerja. */
    const EQUIPMENT_CATEGORIES = ['Alat', 'Mesin', 'Material', 'Alat Berat'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by_id');
    }

    public function adminReviewer()
    {
        return $this->belongsTo(User::class, 'admin_reviewed_by');
    }

    public function gmReviewer()
    {
        return $this->belongsTo(User::class, 'gm_reviewed_by');
    }

    public function overtimes()
    {
        return $this->hasMany(PermitOvertime::class);
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
