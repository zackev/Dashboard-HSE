<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('permits', function (Blueprint $table) {
            // --- A. Klasifikasi Pekerjaan (multi-select) ---
            $table->json('work_classifications')->nullable()->after('type');

            // --- B. Informasi Pekerjaan (field tambahan) ---
            $table->string('area')->nullable()->after('location');
            $table->string('plant')->nullable()->after('area');
            $table->string('area_manager_name')->nullable()->after('plant');
            $table->string('area_manager_phone')->nullable()->after('area_manager_name');
            $table->string('requester_phone')->nullable()->after('requested_by');
            $table->string('supervisor_name')->nullable()->after('requester_phone');
            $table->string('supervisor_phone')->nullable()->after('supervisor_name');
            $table->string('safety_officer_name')->nullable()->after('supervisor_phone');
            $table->string('safety_officer_phone')->nullable()->after('safety_officer_name');
            $table->string('requester_company')->nullable()->after('safety_officer_phone');

            // --- B. Daftar Pekerja & C. Perlengkapan Kerja (dinamis, isi manual, mirip JSA) ---
            $table->json('workers')->nullable()->after('jsa');       // [{role, qty}]
            $table->json('equipment')->nullable()->after('workers'); // [{category, name, qty}]

            // --- E. Peralatan Keselamatan (multi-select dari daftar baku) ---
            $table->json('safety_equipment')->nullable()->after('equipment');

            // --- F. Izin Diberikan: jam kerja diisi pemohon ---
            $table->time('start_time')->nullable()->after('valid_to');
            $table->time('end_time')->nullable()->after('start_time');

            // --- Kop surat, diisi ADMIN saat review (bukan pemohon) ---
            $table->string('doc_number')->nullable()->after('permit_no');
            $table->string('doc_revision')->nullable()->after('doc_number');
            $table->date('doc_release_date')->nullable()->after('doc_revision');
            $table->string('doc_pages')->nullable()->after('doc_release_date');

            // --- Approval 2 tingkat: Admin (Pengawas K3) lalu GM ---
            $table->string('admin_status')->default('Pending')->after('status'); // Pending/Approved/Rejected
            $table->foreignId('admin_reviewed_by')->nullable()->after('admin_status')->constrained('users')->nullOnDelete();
            $table->timestamp('admin_reviewed_at')->nullable()->after('admin_reviewed_by');
            $table->text('admin_note')->nullable()->after('admin_reviewed_at');

            $table->string('gm_status')->default('Pending')->after('admin_note'); // Pending/Approved/Rejected
            $table->foreignId('gm_reviewed_by')->nullable()->after('gm_status')->constrained('users')->nullOnDelete();
            $table->timestamp('gm_reviewed_at')->nullable()->after('gm_reviewed_by');
            $table->text('gm_note')->nullable()->after('gm_reviewed_at');
        });

        // --- Izin Lembur: request terpisah berbasis permit yang sudah Approved,
        // alur approvalnya identik (Admin -> GM) ---
        Schema::create('permit_overtimes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('permit_id')->constrained('permits')->cascadeOnDelete();
            $table->foreignId('requested_by')->constrained('users')->cascadeOnDelete();
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->text('reason')->nullable();

            $table->string('status')->default('Submitted'); // Submitted/GM Review/Approved/Rejected

            $table->string('admin_status')->default('Pending');
            $table->foreignId('admin_reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('admin_reviewed_at')->nullable();
            $table->text('admin_note')->nullable();

            $table->string('gm_status')->default('Pending');
            $table->foreignId('gm_reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('gm_reviewed_at')->nullable();
            $table->text('gm_note')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permit_overtimes');
        Schema::table('permits', function (Blueprint $table) {
            $table->dropForeign(['admin_reviewed_by']);
            $table->dropForeign(['gm_reviewed_by']);
            $table->dropColumn([
                'work_classifications', 'area', 'plant', 'area_manager_name', 'area_manager_phone',
                'requester_phone', 'supervisor_name', 'supervisor_phone', 'safety_officer_name',
                'safety_officer_phone', 'requester_company', 'workers', 'equipment', 'safety_equipment',
                'start_time', 'end_time', 'doc_number', 'doc_revision', 'doc_release_date', 'doc_pages',
                'admin_status', 'admin_reviewed_by', 'admin_reviewed_at', 'admin_note',
                'gm_status', 'gm_reviewed_by', 'gm_reviewed_at', 'gm_note',
            ]);
        });
    }
};
