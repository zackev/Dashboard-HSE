# HSE Command — Dashboard K3 (Demo Node.js)

Dashboard HSE (Health, Safety, Environment) dengan CRUD lengkap untuk 8 modul:

- **Incidents** — kejadian, near miss, unsafe act/condition, hazard
- **Inspections** — inspeksi rutin (APAR, APD, area kerja, dll)
- **Trainings** — pelatihan & induksi K3
- **CAPA** — Corrective & Preventive Actions (tindak lanjut)
- **HSE Performance** — tenaga kerja hadir (L/P), Jam Kerja Orang, Near Miss,
  First Aid Case, Medical Treatment Case, Restricted Work Case, Property
  Damage, Lost Time Incident, Fatality — dengan **SR, FR, TRIR, dan LTIF
  dihitung otomatis** setiap kali data disimpan
- **Ijin Kerja** — work permit (hot work, cold work, confined space, working
  at height, electrical, excavation, lifting) lengkap dengan masa berlaku & approval
- **KPI** — target vs aktual untuk indikator leading & lagging K3
- **Document** — kebijakan, SOP, sertifikat, ijin legal, laporan — termasuk
  **upload & unduh file** (disimpan di folder `uploads/`)

Data disimpan **lifetime** di `db/data.json` (file JSON di disk), jadi tidak hilang
setiap kali server di-restart — beda dengan penyimpanan di memori. File dokumen
yang di-upload juga tersimpan lifetime di folder `uploads/`.

## Perhitungan HSE Performance (SR, FR, TRIR, LTIF)

Modul HSE Performance menghitung otomatis 4 indikator standar K3 setiap kali
data bulanan disimpan:

| Indikator | Rumus | Basis |
|-----------|-------|-------|
| **FR** (Frequency Rate) | (Lost Time Incident × 1.000.000) ÷ Jam Kerja Orang | 1.000.000 jam kerja (konvensi ILO / Permenaker No. 5/2018) |
| **SR** (Severity Rate) | (Jumlah Hari Hilang × 1.000.000) ÷ Jam Kerja Orang | 1.000.000 jam kerja |
| **TRIR** (Total Recordable Incident Rate) | (Total Recordable Cases × 200.000) ÷ Jam Kerja Orang | 200.000 jam kerja (konvensi OSHA, setara 100 pekerja) |
| **LTIF** (Lost Time Injury Frequency) | (Lost Time Incident × 1.000.000) ÷ Jam Kerja Orang | 1.000.000 jam kerja |

Catatan:
- **Total Recordable Cases** = Medical Treatment Case + Restricted Work Case + Lost Time Incident + Fatality (First Aid Case & Near Miss tidak dihitung sebagai recordable, sesuai konvensi umum).
- **LTIF** memakai rumus yang sama dengan **FR** karena keduanya memang mengacu ke metrik yang sama (frekuensi kecelakaan hilang waktu kerja); ditampilkan sebagai dua kartu terpisah karena istilahnya lazim dipakai berbeda dalam laporan HSE Indonesia.
- Basis perhitungan (1.000.000 / 200.000) bisa disesuaikan di `routes/hsePerformance.js` kalau perusahaan Anda memakai konvensi lain.

## Cara Menjalankan

```bash
cd hse-dashboard
npm install
npm start
```

Lalu buka **http://localhost:3000** di browser.

Untuk mode development (auto-restart saat file berubah):

```bash
npm run dev
```

## Struktur Proyek

```
hse-dashboard/
├── server.js              # Entry point Express
├── db/
│   ├── database.js        # Layer penyimpanan (JSON file, mirip repository pattern)
│   └── data.json          # File data (lifetime storage)
├── routes/
│   ├── crudFactory.js      # Generator endpoint CRUD generik (incidents, inspections, trainings, capa, permits, kpis)
│   ├── hsePerformance.js   # Endpoint khusus HSE Performance + perhitungan SR/FR/TRIR/LTIF
│   ├── documents.js        # Endpoint khusus Document + upload file (multer)
│   └── index.js            # Mount semua route + endpoint /api/stats
├── uploads/                # File dokumen yang di-upload (dibuat otomatis)
└── public/                # Frontend statis (vanilla HTML/CSS/JS + Chart.js)
    ├── index.html
    ├── css/style.css
    └── js/app.js
```

## API Endpoint

Modul dengan CRUD generik (`incidents`, `inspections`, `trainings`, `capa`, `permits`, `kpis`) punya pola REST yang sama:

| Method | Endpoint                 | Keterangan                          |
|--------|--------------------------|--------------------------------------|
| GET    | `/api/<modul>`           | List semua data (`?q=` cari, `?status=` filter) |
| GET    | `/api/<modul>/:id`       | Detail satu data                    |
| POST   | `/api/<modul>`           | Buat data baru                      |
| PUT    | `/api/<modul>/:id`       | Update data                         |
| DELETE | `/api/<modul>/:id`       | Hapus data                          |
| GET    | `/api/stats`             | Ringkasan statistik untuk dashboard |

Contoh: `GET /api/incidents`, `POST /api/capa`, `PUT /api/inspections/3`, `GET /api/permits`, `POST /api/kpis`, dst.

Dua modul punya perilaku khusus:
- **`/api/hse_performance`** — response setiap baris disertai field hasil hitung: `total_workers`, `total_recordable_cases`, `fr`, `sr`, `trir`, `ltif`.
- **`/api/documents`** — `POST` dan `PUT` menerima `multipart/form-data` (bukan JSON) karena ada field upload file (`file`). Response menyertakan `file_name` dan `file_path` (bisa diunduh langsung lewat `/uploads/<nama file>`).

## Rencana Migrasi ke Laravel

Struktur di atas sengaja dibuat menyerupai konvensi Laravel supaya migrasinya
minim perubahan di frontend:

1. **Model & Migration** — buat model Eloquent untuk `Incident`, `Inspection`,
   `Training`, `Capa` sesuai field yang sudah ada di `MODULES` (lihat
   `public/js/app.js`) dan `db/data.json`.
2. **Controller** — buat resource controller (`php artisan make:controller
   IncidentController --api`, dst) dengan method `index/show/store/update/destroy`
   yang response JSON-nya mengikuti bentuk `{ data: ... }` / `{ data: ..., total: ... }`
   seperti di `routes/crudFactory.js` saat ini, agar frontend tidak perlu diubah.
3. **Route** — daftarkan di `routes/api.php` dengan prefix `/api/incidents`, dst,
   persis seperti endpoint Node saat ini.
4. **Endpoint stats** — pindahkan logika di `routes/index.js` (`/api/stats`) ke
   controller/service Laravel, query agregasi bisa pakai Eloquent `groupBy`.
5. **Frontend** — folder `public/` bisa dipakai apa adanya (disajikan Laravel
   lewat `public/` juga, atau lewat Blade view yang meng-include file yang sama),
   karena semua akses data lewat `fetch('/api/...')`, tidak peduli backend-nya
   Node atau Laravel.

Dengan begitu, saat nanti pindah ke Laravel, cukup ganti "mesin" di baliknya —
kontrak API dan tampilan tetap sama.

## Catatan Demo

- Data seed awal sudah disediakan di `db/data.json` supaya dashboard langsung
  terisi saat pertama kali dibuka.
- Untuk mengosongkan data dan mulai dari nol, hapus isi array di `db/data.json`
  (atau hapus filenya, nanti otomatis dibuat ulang dengan struktur kosong).
- Chart menggunakan [Chart.js](https://www.chartjs.org/) via CDN — butuh koneksi
  internet saat dibuka di browser.
