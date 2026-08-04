<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Daftar semua "halaman/modul" yang bisa dicentang admin di
     * Settings > Roles & Akses. Kalau kamu menambah modul baru di masa
     * depan, tambahkan juga entrinya di sini.
     */
    public static array $catalog = [
        ['key' => 'dashboard', 'label' => 'Dashboard', 'group' => 'Umum', 'sort_order' => 1],
        ['key' => 'incidents', 'label' => 'Incidents', 'group' => 'Modul HSE', 'sort_order' => 10],
        ['key' => 'inspections', 'label' => 'Inspections', 'group' => 'Modul HSE', 'sort_order' => 11],
        ['key' => 'trainings', 'label' => 'Trainings', 'group' => 'Modul HSE', 'sort_order' => 12],
        ['key' => 'capa', 'label' => 'CAPA', 'group' => 'Modul HSE', 'sort_order' => 13],
        ['key' => 'hse_performance', 'label' => 'HSE Performance', 'group' => 'Modul HSE', 'sort_order' => 14],
        ['key' => 'kpis', 'label' => 'KPI', 'group' => 'Modul HSE', 'sort_order' => 15],
        ['key' => 'documents', 'label' => 'Documents (kelola penuh)', 'group' => 'Modul HSE', 'sort_order' => 16],
        ['key' => 'permits', 'label' => 'Ijin Kerja — kelola & approve semua', 'group' => 'Ijin Kerja', 'sort_order' => 20],
        ['key' => 'permits_own', 'label' => 'Ijin Kerja — ajukan & lihat milik sendiri', 'group' => 'Ijin Kerja', 'sort_order' => 21],
        ['key' => 'documents_sop', 'label' => 'Dokumen SOP — lihat saja (read-only)', 'group' => 'Ijin Kerja', 'sort_order' => 22],
        ['key' => 'settings', 'label' => 'Settings (kelola role & karyawan)', 'group' => 'Administrasi', 'sort_order' => 30],
    ];

    public function run(): void
    {
        foreach (self::$catalog as $perm) {
            Permission::updateOrCreate(['key' => $perm['key']], $perm);
        }

        $admin = Role::updateOrCreate(
            ['slug' => 'admin'],
            ['name' => 'Admin', 'is_default' => true]
        );
        $admin->permissions()->sync(Permission::pluck('id'));

        $employee = Role::updateOrCreate(
            ['slug' => 'employee'],
            ['name' => 'Employee', 'is_default' => true]
        );
        $employeeKeys = ['dashboard', 'permits_own', 'documents_sop'];
        $employee->permissions()->sync(Permission::whereIn('key', $employeeKeys)->pluck('id'));
    }
}
