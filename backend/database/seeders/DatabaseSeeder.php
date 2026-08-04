<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class, // roles & permissions dulu
            UserSeeder::class,           // baru user (butuh role_id)
            DataSeeder::class,           // baru data modul HSE + link ke user
        ]);
    }
}
