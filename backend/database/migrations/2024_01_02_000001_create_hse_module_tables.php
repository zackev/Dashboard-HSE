<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('incidents', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('type');
            $table->string('severity');
            $table->string('location');
            $table->date('date');
            $table->string('reported_by')->nullable();
            $table->string('status');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('inspections', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('area');
            $table->string('inspector');
            $table->date('date');
            $table->string('status');
            $table->text('findings')->nullable();
            $table->timestamps();
        });

        Schema::create('trainings', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('trainer');
            $table->date('date');
            $table->unsignedInteger('participants')->nullable();
            $table->string('status');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('capas', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('related_to')->nullable();
            $table->string('type');
            $table->string('pic');
            $table->date('due_date');
            $table->string('status');
            $table->timestamps();
        });

        Schema::create('hse_performances', function (Blueprint $table) {
            $table->id();
            $table->date('date')->comment('Data HARIAN, bukan bulanan');
            $table->unsignedInteger('male_workers')->default(0);
            $table->unsignedInteger('female_workers')->default(0);
            $table->unsignedInteger('working_hours')->default(8)->comment('Jam kerja normal per hari');
            $table->unsignedInteger('near_miss')->default(0);
            $table->unsignedInteger('first_aid_case')->default(0);
            $table->unsignedInteger('medical_treatment_case')->default(0);
            $table->unsignedInteger('restricted_work_case')->default(0);
            $table->unsignedInteger('property_damage')->default(0);
            $table->unsignedInteger('lost_time_incident')->default(0);
            $table->unsignedInteger('lost_days')->default(0);
            $table->unsignedInteger('fatality')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('permits', function (Blueprint $table) {
            $table->id();
            $table->string('permit_no');
            $table->string('type');
            $table->string('location');
            $table->text('work_description')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete()
                ->comment('Karyawan yang mengajukan (diisi otomatis dari akun login)');
            $table->string('requested_by')->nullable()->comment('Nama pengaju (denormalized, untuk tampilan/riwayat lama)');
            $table->string('approved_by')->nullable();
            $table->foreignId('approved_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->date('valid_from');
            $table->date('valid_to');
            $table->string('status')->default('Submitted');
            $table->json('jsa')->nullable()->comment('Job Safety Analysis: [{step,hazard,control}]');
            $table->timestamps();
        });

        Schema::create('kpis', function (Blueprint $table) {
            $table->id();
            $table->string('kpi_name');
            $table->string('category');
            $table->string('period');
            $table->decimal('target', 12, 2)->default(0);
            $table->decimal('actual', 12, 2)->nullable();
            $table->string('unit')->nullable();
            $table->string('status');
            $table->timestamps();
        });

        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('category');
            $table->string('doc_number');
            $table->string('revision')->nullable();
            $table->date('issue_date');
            $table->date('expiry_date')->nullable();
            $table->string('status');
            $table->string('uploaded_by')->nullable();
            $table->string('file_name')->nullable();
            $table->string('file_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
        Schema::dropIfExists('kpis');
        Schema::dropIfExists('permits');
        Schema::dropIfExists('hse_performances');
        Schema::dropIfExists('capas');
        Schema::dropIfExists('trainings');
        Schema::dropIfExists('inspections');
        Schema::dropIfExists('incidents');
    }
};
