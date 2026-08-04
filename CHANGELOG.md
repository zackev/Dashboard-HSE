# Patch: Dashboard Filter per Periode + Export (xlsx/csv/pdf)

Extract isi folder ini ke root project kamu masing-masing (backend/frontend),
timpa file yang sudah ada. Semua path di bawah RELATIF terhadap root project.

## backend/ -> timpa ke folder Laravel kamu
- app/Http/Controllers/Api/DashboardController.php   (DIUBAH - filter periode + method export())
- app/Exports/DashboardSummaryExport.php              (BARU)
- resources/views/exports/dashboard-pdf.blade.php     (BARU)
- routes/api.php                                      (DIUBAH - +1 route GET /stats/export)

Sebelum jalan, install package:
    composer require maatwebsite/excel barryvdh/laravel-dompdf

## frontend/ -> timpa ke folder React kamu
- src/lib/api.js                  (DIUBAH - get() bisa terima query params)
- src/components/DashboardToolbar.jsx  (DIUBAH - custom date range + export beneran jalan)
- src/pages/Dashboard.jsx         (DIUBAH - kirim filter ke backend + handler export)

Tidak ada package npm baru yang dibutuhkan.

Detail lengkap tiap perubahan ada di riwayat chat.
