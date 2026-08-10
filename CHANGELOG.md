# Patch: Ijin Kerja (Work Permit) — Form Lengkap + Approval 2 Tingkat + Cetak PDF

Extract dan timpa ke project kamu masing-masing. File BARU vs DIUBAH ditandai di bawah.

## backend/
- database/migrations/2024_02_01_000001_add_work_permit_form_fields.php   (BARU - migration, jalankan `php artisan migrate`)
- app/Models/Permit.php                                                   (DIUBAH - tambah konstanta pilihan + relasi baru)
- app/Models/PermitOvertime.php                                           (BARU)
- app/Http/Controllers/Api/PermitController.php                          (DIUBAH TOTAL - state machine 2 tingkat)
- app/Http/Controllers/Api/PermitOvertimeController.php                  (BARU)
- database/seeders/RolePermissionSeeder.php                              (DIUBAH - tambah permission 'permits_gm' + role GM)
- resources/views/exports/work-permit-pdf.blade.php                      (BARU - layout cetak PDF)
- routes/api.php                                                          (DIUBAH - route admin-review/gm-review/print/overtimes)

## frontend/
- src/pages/PermitListPage.jsx      (BARU)
- src/pages/PermitFormPage.jsx      (BARU)
- src/pages/PermitDetailPage.jsx    (BARU)
- src/App.jsx                       (DIUBAH - routing /permits diganti pakai 3 halaman baru di atas)
- src/components/Sidebar.jsx        (DIUBAH - altPermission sekarang bisa array, GM ikut lihat menu Ijin Kerja)
- src/config/modules.jsx            (DIUBAH - NAV_GROUPS permits.altPermission jadi array)

## Langkah setelah extract

1. Backend:
   ```
   php artisan migrate
   php artisan db:seed --class=RolePermissionSeeder   # AMAN untuk data production, pakai updateOrCreate
   php artisan config:clear
   ```
2. Buat/assign akun dengan role "GM" lewat Settings > Karyawan (role-nya sudah otomatis
   dibuat oleh seeder di atas, tinggal pilih role GM saat tambah/edit karyawan).
3. Frontend: tidak ada package baru, tinggal build ulang (`npm run build`) / restart dev server.

## Yang PERLU kamu tes manual

- Submit ijin kerja baru sebagai employee -> cek semua field & checkbox kesimpen benar
- Login sebagai Admin -> approve tahap 1 (isi No Dok dkk) -> cek notifikasi masuk ke akun GM
- Login sebagai GM -> approve tahap 2 -> cek status jadi Approved di akun pemohon
- Cetak PDF dari 3 sisi (pemohon setelah approved, admin, GM) -> bandingkan hasilnya
  dengan gambar form asli, kabari aku bagian mana yang perlu disesuaikan lagi
- Coba reject di tahap Admin, lalu di tahap GM -> pastikan catatan alasan muncul di pemohon
- Ajukan Izin Lembur dari permit yang sudah Approved -> approve 2 tingkat juga
