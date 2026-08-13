<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $tables = [
            'incidents',
            'inspections',
            'trainings',
            'capas',
            'hse_performances',
            'kpis',
            'documents',
            'permits',
            'permit_overtimes',
        ];

        foreach ($tables as $tableName) {

            // 1. Tambahkan company_id hanya jika belum ada
            if (!Schema::hasColumn($tableName, 'company_id')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->foreignId('company_id')
                        ->nullable()
                        ->after('id')
                        ->index();
                });
            }

            // 2. Isi data lama dengan company default
            DB::table($tableName)
                ->whereNull('company_id')
                ->update([
                    'company_id' => 1,
                ]);

            // 3. Tambahkan foreign key jika belum ada
            $foreignKeyExists = DB::selectOne("
                SELECT COUNT(*) AS count
                FROM information_schema.TABLE_CONSTRAINTS
                WHERE CONSTRAINT_SCHEMA = DATABASE()
                  AND TABLE_NAME = ?
                  AND CONSTRAINT_NAME = ?
                  AND CONSTRAINT_TYPE = 'FOREIGN KEY'
            ", [
                $tableName,
                $tableName . '_company_id_foreign',
            ]);

            if ((int) $foreignKeyExists->count === 0) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->foreign('company_id')
                        ->references('id')
                        ->on('companies')
                        ->cascadeOnDelete();
                });
            }
        }
    }

    public function down(): void
    {
        $tables = [
            'incidents',
            'inspections',
            'trainings',
            'capas',
            'hse_performances',
            'kpis',
            'documents',
            'permits',
            'permit_overtimes',
        ];

        foreach ($tables as $tableName) {

            if (!Schema::hasColumn($tableName, 'company_id')) {
                continue;
            }

            $foreignKeyExists = DB::selectOne("
                SELECT COUNT(*) AS count
                FROM information_schema.TABLE_CONSTRAINTS
                WHERE CONSTRAINT_SCHEMA = DATABASE()
                  AND TABLE_NAME = ?
                  AND CONSTRAINT_NAME = ?
                  AND CONSTRAINT_TYPE = 'FOREIGN KEY'
            ", [
                $tableName,
                $tableName . '_company_id_foreign',
            ]);

            if ((int) $foreignKeyExists->count > 0) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->dropForeign(['company_id']);
                });
            }

            Schema::table($tableName, function (Blueprint $table) {
                $table->dropColumn('company_id');
            });
        }
    }
};