<?php

namespace Database\Seeders;

use App\Models\Permit;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('slug', 'admin')->firstOrFail();
        $employeeRole = Role::where('slug', 'employee')->firstOrFail();

        $admin = User::updateOrCreate(
            ['email' => 'admin@hse-dashboard.test'],
            [
                'name' => 'Rina Wijaya',
                'phone' => '6281234500001',
                'password' => Hash::make('password'),
                'role_id' => $adminRole->id,
                'is_active' => true,
            ]
        );

        $employees = [
            ['name' => 'Andi Saputra', 'email' => 'andi@hse-dashboard.test', 'phone' => '6281234500002'],
            ['name' => 'Siti Rahma', 'email' => 'siti@hse-dashboard.test', 'phone' => '6281234500003'],
            ['name' => 'Budi Hartono', 'email' => 'budi@hse-dashboard.test', 'phone' => '6281234500004'],
        ];

        foreach ($employees as $e) {
            User::updateOrCreate(
                ['email' => $e['email']],
                [
                    'name' => $e['name'],
                    'phone' => $e['phone'],
                    'password' => Hash::make('password'),
                    'role_id' => $employeeRole->id,
                    'is_active' => true,
                ]
            );
        }

        // Hubungkan ijin kerja yang sudah di-seed DataSeeder ke akun employee
        // yang namanya cocok, supaya begitu login sebagai mis. "Andi Saputra"
        // dia langsung melihat riwayat ijin kerjanya sendiri.
        // NB: proses linking sebenarnya dilakukan di DataSeeder::seedPermits()
        // (dijalankan setelah seeder ini), karena permit baru dibuat di sana.
    }
}
