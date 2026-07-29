# HSE Command — Dashboard K3

Dashboard HSE (Health, Safety, Environment) dengan CRUD lengkap untuk 8 modul.

**Stack:**
- **Frontend:** React + Vite + Tailwind CSS (folder `frontend/`)
- **Backend:** Node.js + Express, penyimpanan file JSON (folder root — `db/`, `routes/`, `server.js`)
- Dibuat berlapis (frontend murni React yang fetch ke REST API) supaya backend Node ini bisa diganti Laravel nanti tanpa menyentuh frontend sama sekali.

## Modul

- **Incidents** — kejadian, near miss, unsafe act/condition, hazard
- **Inspections** — inspeksi rutin (APAR, APD, area kerja, dll)
- **Trainings** — pelatihan & induksi K3
- **CAPA** — Corrective & Preventive Actions (tindak lanjut)
- **HSE Performance** — tenaga kerja hadir (L/P), Jam Kerja Orang, Near Miss,
  First Aid Case, Medical Treatment Case, Restricted Work Case, Property
  Damage, Lost Time Incident, Fatality — dengan **SR, FR, TRIR, dan LTIF
  dihitung otomatis** setiap kali data disimpan
- **Ijin Kerja** — work permit (hot work, cold work, confined space, working
  at height, electrical, excavation, lifting)
- **KPI** — target vs aktual untuk indikator leading & lagging K3
- **Document** — kebijakan, SOP, sertifikat, ijin legal, laporan — termasuk
  **upload & unduh file**

Data disimpan **lifetime** di `db/data.json`, file dokumen yang di-upload tersimpan
lifetime di folder `uploads/`.

## Cara Menjalankan

Ada 2 cara. Untuk demo/pengembangan sehari-hari, pakai **Mode Development**.

### Mode Development (disarankan — hot reload)

Backend dan frontend jalan di 2 proses terpisah; Vite mem-proxy `/api` dan
`/uploads` ke Express supaya tidak ada masalah CORS.

```bash
# Terminal 1 — jalankan backend API (port 3000)
npm install
npm start

# Terminal 2 — jalankan frontend React (port 5173)
cd frontend
npm install
npm run dev
```

Buka **http://localhost:5173** — ini yang dipakai untuk development, karena
perubahan kode React langsung terlihat tanpa refresh manual.

### Mode Production-style (satu server, satu port)

Build React jadi file statis, lalu biarkan Express yang menyajikannya.

```bash
cd frontend
npm install
npm run build
cd ..
npm install
npm start
```

Buka **http://localhost:3000** — Express otomatis mendeteksi `frontend/dist`
dan menyajikan hasil build React dari situ (lihat `server.js`).

> Kalau `frontend/dist` belum ada (belum di-build), membuka `http://localhost:3000`
> akan menampilkan instruksi cara build, bukan error kosong.

## Struktur Proyek

```
hse-dashboard/
├── server.js                # Entry point Express: /api/* + serve frontend/dist
├── package.json              # Dependency backend (express, cors, multer)
├── db/
│   ├── database.js           # Layer penyimpanan (JSON file, mirip repository pattern)
│   └── data.json             # File data (lifetime storage)
├── routes/
│   ├── crudFactory.js        # Generator endpoint CRUD generik
│   ├── hsePerformance.js     # HSE Performance harian + Man-Hour otomatis + kumulatif SR/FR/TRIR/LTIF
│   ├── permits.js            # Ijin Kerja + validasi JSA wajib diisi
│   ├── documents.js          # Endpoint khusus Document + upload file (multer)
│   └── index.js               # Mount semua route + endpoint /api/stats
├── uploads/                   # File dokumen yang di-upload (dibuat otomatis)
└── frontend/                  # React + Vite + Tailwind
    ├── vite.config.js         # Proxy /api & /uploads ke Express saat dev
    ├── tailwind.config.js     # Palet warna & desain token
    └── src/
        ├── main.jsx           # Entry point React (Router + ToastProvider)
        ├── App.jsx            # Layout shell + routing antar halaman
        ├── index.css          # Tailwind directives + beberapa util class
        ├── lib/api.js         # Client fetch tipis untuk /api/*
        ├── config/modules.jsx # Satu sumber kebenaran: field form & kolom tabel tiap modul
        ├── context/ToastContext.jsx
        ├── components/
        │   ├── Sidebar.jsx, Topbar.jsx, StatCard.jsx, Badge.jsx
        │   ├── DataTable.jsx  # Tabel generik berbasis config kolom
        │   ├── FormModal.jsx  # Modal form generik (text/select/textarea/number/date/file/computed/JSA editor)
        │   ├── JsaDetailModal.jsx # Modal read-only: detail lengkap JSA saat kolom JSA di tabel diklik
        │   └── CrudPage.jsx   # Halaman CRUD generik, dipakai 7 dari 8 modul
        └── pages/
            ├── Dashboard.jsx           # Stat cards + chart (Recharts)
            └── HsePerformancePage.jsx  # CrudPage + panel metodologi perhitungan
```

**Menambah modul baru** cukup:
1. Tambah endpoint di `routes/` (atau pakai `crudFactory.js` kalau CRUD standar).
2. Tambah 1 entry di `frontend/src/config/modules.jsx` (field form + kolom tabel).
3. Tambah 1 baris di `NAV_GROUPS` (sidebar) dan `VIEW_META` (judul halaman), lalu 1 `<Route>` di `App.jsx`.

Tidak perlu bikin komponen tabel/form baru — semua modul CRUD standar otomatis
dapat tabel & form lewat `CrudPage` + `DataTable` + `FormModal`.

## API Endpoint

Modul dengan CRUD generik (`incidents`, `inspections`, `trainings`, `capa`, `permits`, `kpis`):

| Method | Endpoint                 | Keterangan                          |
|--------|---------------------------|--------------------------------------|
| GET    | `/api/<modul>`            | List semua data (`?q=` cari)         |
| GET    | `/api/<modul>/:id`        | Detail satu data                    |
| POST   | `/api/<modul>`            | Buat data baru                      |
| PUT    | `/api/<modul>/:id`        | Update data                         |
| DELETE | `/api/<modul>/:id`        | Hapus data                          |
| GET    | `/api/stats`              | Ringkasan statistik untuk dashboard |

Dua modul punya perilaku khusus:
- **`/api/hse_performance`** — data **harian** (per tanggal). Man-Hour dihitung otomatis oleh server (`total_workers × working_hours`), tidak diinput manual. Response setiap baris disertai field hasil hitung: `man_hours_today`, `man_hours_cumulative`, `total_recordable_cases`, `fr`, `sr`, `trir`, `ltif` (4 indikator terakhir dihitung dari angka **kumulatif**, bukan cuma data hari itu).
- **`/api/permits`** (Ijin Kerja) — wajib menyertakan `jsa` (array Job Safety Analysis) berisi minimal 1 baris dengan `step` (Langkah Kerja) terisi, kalau tidak server menolak dengan `400`.
- **`/api/documents`** — `POST` dan `PUT` menerima `multipart/form-data` (bukan JSON) karena ada field upload file (`file`). Response menyertakan `file_name` dan `file_path` (bisa diunduh langsung lewat `/uploads/<nama file>`).

## Perhitungan Man-Hour (HSE Performance)

Admin cukup input **jumlah tenaga kerja yang hadir** (dipecah laki-laki & perempuan) dan **jam kerja normal per hari** untuk tanggal tersebut — Man-Hour langsung dihitung otomatis, tidak perlu dihitung manual:

```
Man-Hour Hari Ini = Jumlah Tenaga Kerja Hadir × Jam Kerja Normal per Hari
```

**Contoh:** tanggal 10 Juni 2026, total tenaga kerja hadir 100 orang, jam kerja normal 8 jam/hari →
`Man-Hour = 100 × 8 = 800`.

Setiap baris juga punya **Man-Hour Kumulatif** — akumulasi berjalan (running total) dari tanggal paling awal yang tercatat di sistem sampai baris tersebut. Jumlah kasus (Near Miss, FAC, MTC, RWC, LTI, Fatality, Hari Hilang) juga diakumulasi dengan cara yang sama untuk menghitung SR/FR/TRIR/LTIF di bawah ini.

> Kumulatif dihitung dari tanggal paling awal yang ada di `db/data.json` (tidak reset otomatis per bulan/tahun). Kalau perlu reset per tahun berjalan, logikanya ada di `computeAll()` pada `routes/hsePerformance.js`.

## Perhitungan SR, FR, TRIR, LTIF (berbasis kumulatif)

| Indikator | Rumus | Basis |
|-----------|-------|-------|
| **FR** (Frequency Rate) | (Kumulatif Lost Time Incident × 1.000.000) ÷ Kumulatif Man-Hour | 1.000.000 jam kerja (konvensi ILO / Permenaker No. 5/2018) |
| **SR** (Severity Rate) | (Kumulatif Jumlah Hari Hilang × 1.000.000) ÷ Kumulatif Man-Hour | 1.000.000 jam kerja |
| **TRIR** (Total Recordable Incident Rate) | (Kumulatif Total Recordable Cases × 200.000) ÷ Kumulatif Man-Hour | 200.000 jam kerja (konvensi OSHA, setara 100 pekerja) |
| **LTIF** (Lost Time Injury Frequency) | (Kumulatif Lost Time Incident × 1.000.000) ÷ Kumulatif Man-Hour | 1.000.000 jam kerja |

Catatan:
- Dihitung dari angka **kumulatif**, bukan data satu hari saja — ini praktik standar pelaporan HSE karena man-hour satu hari (ratusan) terlalu kecil untuk basis per-1.000.000/200.000 jam kerja.
- **Total Recordable Cases** = Medical Treatment Case + Restricted Work Case + Lost Time Incident + Fatality (First Aid Case & Near Miss tidak dihitung sebagai recordable, sesuai konvensi umum).
- **LTIF** memakai rumus yang sama dengan **FR** karena keduanya mengacu ke metrik yang sama (frekuensi kecelakaan hilang waktu kerja); ditampilkan sebagai dua kartu terpisah karena istilahnya lazim dipakai berbeda dalam laporan HSE Indonesia.
- Basis perhitungan (1.000.000 / 200.000 / jam kerja default 8) bisa disesuaikan di `routes/hsePerformance.js` kalau perusahaan Anda memakai konvensi lain.

## JSA (Job Safety Analysis) pada Ijin Kerja

Sebelum ijin kerja bisa disimpan/diajukan, form Ijin Kerja mewajibkan pengisian JSA — tabel baris yang bisa ditambah sesuai kebutuhan (tombol **+ Tambah Baris**), masing-masing berisi:

1. **Langkah Kerja**
2. **Potensi Bahaya & Risiko**
3. **Langkah Pengendalian**

Minimal 1 baris dengan "Langkah Kerja" terisi wajib ada — divalidasi baik di frontend (sebelum submit) maupun di backend (`routes/permits.js`, menolak dengan HTTP 400 kalau kosong). Data JSA disimpan sebagai array nested di dalam record permit (`permit.jsa`).

Di tabel Ijin Kerja, kolom **JSA** menampilkan jumlah langkah (mis. "3 langkah") sebagai tombol — klik untuk membuka detail lengkap semua baris JSA (Langkah Kerja, Potensi Bahaya & Risiko, Langkah Pengendalian) dalam modal read-only (`frontend/src/components/JsaDetailModal.jsx`), tanpa perlu masuk ke mode edit.

## Rencana Migrasi ke Laravel

Karena frontend React ini murni bicara lewat REST API (`fetch('/api/...')`),
migrasi backend ke Laravel tidak menyentuh `frontend/` sama sekali:

1. **Model & Migration** — buat model Eloquent untuk tiap tabel di `db/data.json`
   (`Incident`, `Inspection`, `Training`, `Capa`, `HsePerformance`, `Permit`, `Kpi`, `Document`).
2. **Controller** — resource controller (`index/show/store/update/destroy`) dengan
   response JSON `{ data: ... }` / `{ data: ..., total: ... }`, sama seperti sekarang.
3. **Route** — daftarkan di `routes/api.php` dengan prefix yang sama persis
   (`/api/incidents`, `/api/hse_performance`, dst).
4. **HSE Performance** — pindahkan logika perhitungan SR/FR/TRIR/LTIF dari
   `routes/hsePerformance.js` ke accessor Eloquent atau service class.
5. **Documents** — ganti `multer` dengan `Storage::disk('public')` bawaan Laravel
   untuk upload file, endpoint tetap menerima `multipart/form-data`.
6. **Frontend** — cukup ubah base URL API kalau backend Laravel di-deploy di
   domain berbeda (lihat `frontend/src/lib/api.js`), atau deploy hasil `npm run build`
   ke folder `public/` Laravel supaya satu domain.

## Catatan Demo

- Data seed awal sudah disediakan di `db/data.json` supaya dashboard langsung
  terisi saat pertama kali dibuka.
- Untuk mengosongkan data dan mulai dari nol, hapus isi array di `db/data.json`
  (atau hapus filenya, nanti otomatis dibuat ulang dengan struktur kosong).
- Chart menggunakan [Recharts](https://recharts.org/), ikon pakai
  [lucide-react](https://lucide.dev/) — keduanya bundel via Vite, tidak butuh
  koneksi internet saat runtime (beda dengan versi vanilla JS sebelumnya yang
  memuat Chart.js dari CDN).
