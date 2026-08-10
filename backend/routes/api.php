<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CapaController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\DocumentSopController;
use App\Http\Controllers\Api\HsePerformanceController;
use App\Http\Controllers\Api\IncidentController;
use App\Http\Controllers\Api\InspectionController;
use App\Http\Controllers\Api\KpiController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PermitController;
use App\Http\Controllers\Api\PermitOvertimeController;
use App\Http\Controllers\Api\Settings\RoleController;
use App\Http\Controllers\Api\Settings\UserController;
use App\Http\Controllers\Api\TrainingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — dikonsumsi React SPA lewat Sanctum (cookie session auth)
|--------------------------------------------------------------------------
| Setiap modul dilindungi middleware permission:<key> yang mengecek RBAC
| dinamis (lihat App\Http\Middleware\EnsurePermission + tabel roles/
| permissions). Admin bisa mengatur permission tiap role dari halaman
| Settings tanpa perlu ubah route ini.
*/

// ---- Auth (publik) ----
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard: konten disesuaikan otomatis di controller sesuai permission user
    // (nama endpoint /stats dipertahankan sama seperti versi lama supaya
    // frontend React yang sudah ada tidak perlu diubah)
    Route::get('/stats', [DashboardController::class, 'index']);

    // Notifikasi (bell icon)
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);

    // ---- Modul admin-only (perlu permission sesuai nama modul) ----
    Route::middleware('permission:incidents')->group(function () {
        Route::get('incidents', [IncidentController::class, 'index']);
        Route::get('incidents/{id}', [IncidentController::class, 'show']);
        Route::post('incidents', [IncidentController::class, 'store']);
        Route::put('incidents/{id}', [IncidentController::class, 'update']);
        Route::delete('incidents/{id}', [IncidentController::class, 'destroy']);
    });
    Route::middleware('permission:inspections')->group(function () {
        Route::get('inspections', [InspectionController::class, 'index']);
        Route::get('inspections/{id}', [InspectionController::class, 'show']);
        Route::post('inspections', [InspectionController::class, 'store']);
        Route::put('inspections/{id}', [InspectionController::class, 'update']);
        Route::delete('inspections/{id}', [InspectionController::class, 'destroy']);
    });
    Route::middleware('permission:trainings')->group(function () {
        Route::get('trainings', [TrainingController::class, 'index']);
        Route::get('trainings/{id}', [TrainingController::class, 'show']);
        Route::post('trainings', [TrainingController::class, 'store']);
        Route::put('trainings/{id}', [TrainingController::class, 'update']);
        Route::delete('trainings/{id}', [TrainingController::class, 'destroy']);
    });
    Route::middleware('permission:capa')->group(function () {
        Route::get('capa', [CapaController::class, 'index']);
        Route::get('capa/{id}', [CapaController::class, 'show']);
        Route::post('capa', [CapaController::class, 'store']);
        Route::put('capa/{id}', [CapaController::class, 'update']);
        Route::delete('capa/{id}', [CapaController::class, 'destroy']);
    });
    Route::middleware('permission:hse_performance')->group(function () {
        Route::get('hse_performance', [HsePerformanceController::class, 'index']);
        Route::get('hse_performance/{id}', [HsePerformanceController::class, 'show']);
        Route::post('hse_performance', [HsePerformanceController::class, 'store']);
        Route::put('hse_performance/{id}', [HsePerformanceController::class, 'update']);
        Route::delete('hse_performance/{id}', [HsePerformanceController::class, 'destroy']);
    });
    Route::middleware('permission:kpis')->group(function () {
        Route::get('kpis', [KpiController::class, 'index']);
        Route::get('kpis/{id}', [KpiController::class, 'show']);
        Route::post('kpis', [KpiController::class, 'store']);
        Route::put('kpis/{id}', [KpiController::class, 'update']);
        Route::delete('kpis/{id}', [KpiController::class, 'destroy']);
    });
    Route::middleware('permission:documents')->group(function () {
        Route::get('documents', [DocumentController::class, 'index']);
        Route::get('documents/{id}', [DocumentController::class, 'show']);
        Route::post('documents', [DocumentController::class, 'store']);
        Route::post('documents/{id}', [DocumentController::class, 'update']); // POST + _method=PUT (multipart)
        Route::delete('documents/{id}', [DocumentController::class, 'destroy']);
    });

    // Dokumen SOP read-only untuk employee (permission terpisah dari 'documents')
    Route::middleware('permission:documents_sop')->group(function () {
        Route::get('documents-sop', [DocumentSopController::class, 'index']);
    });

    // ---- Ijin Kerja (Permits) ----
    // Tidak dibungkus middleware permission secara blanket: admin (permission
    // 'permits') melihat semua, employee (permission 'permits_own') tetap
    // boleh akses endpoint yang sama tapi otomatis di-scope ke user_id
    // miliknya sendiri di dalam PermitController.
    // Ijin Kerja: admin (permission 'permits'), GM (permission 'permits_gm'),
    // dan employee (permission 'permits_own') semua akses endpoint yang sama;
    // scoping detail (lihat semua vs cuma milik sendiri) ditangani di
    // PermitController itu sendiri.
    Route::get('permits/form-options', [PermitController::class, 'formOptions']);
    Route::middleware('permission.any:permits,permits_gm,permits_own')->group(function () {
        Route::get('permits', [PermitController::class, 'index']);
        Route::get('permits/{id}', [PermitController::class, 'show']);
        Route::post('permits', [PermitController::class, 'store']);
        Route::put('permits/{id}', [PermitController::class, 'update']);
        Route::delete('permits/{id}', [PermitController::class, 'destroy']);
        Route::get('permits/{id}/print', [PermitController::class, 'print']);

        // Izin Lembur - pemohon ajukan, admin & GM review (dicek permission
        // di dalam controller masing2 method, bukan di middleware, karena
        // action approve/reject cuma boleh role tertentu)
        Route::get('permits/{permitId}/overtimes', [PermitOvertimeController::class, 'index']);
        Route::post('permits/{permitId}/overtimes', [PermitOvertimeController::class, 'store']);
    });
    Route::middleware('permission:permits')->group(function () {
        Route::post('permits/{id}/admin-review', [PermitController::class, 'adminReview']);
        Route::post('permits/{permitId}/overtimes/{overtimeId}/admin-review', [PermitOvertimeController::class, 'adminReview']);
    });
    Route::middleware('permission:permits_gm')->group(function () {
        Route::post('permits/{id}/gm-review', [PermitController::class, 'gmReview']);
        Route::post('permits/{permitId}/overtimes/{overtimeId}/gm-review', [PermitOvertimeController::class, 'gmReview']);
    });

    // ---- Settings (admin-only) ----
    Route::middleware('permission:settings')->prefix('settings')->group(function () {
        Route::get('roles', [RoleController::class, 'index']);
        Route::get('permissions-catalog', [RoleController::class, 'permissionsCatalog']);
        Route::post('roles', [RoleController::class, 'store']);
        Route::put('roles/{id}', [RoleController::class, 'update']);
        Route::delete('roles/{id}', [RoleController::class, 'destroy']);

        Route::get('users', [UserController::class, 'index']);
        Route::post('users', [UserController::class, 'store']);
        Route::put('users/{id}', [UserController::class, 'update']);
        Route::delete('users/{id}', [UserController::class, 'destroy']);
    });
});
