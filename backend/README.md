# HSE Dashboard — Backend (Laravel API)

Backend ini menggantikan versi lama (Node.js/Express + file JSON) sepenuhnya
dengan **Laravel 11** + **MySQL**, sebagai REST API untuk frontend React yang
berjalan terpisah (folder `hse-dashboard-frontend/`).

## Fitur utama

- **Auth** berbasis session cookie via **Laravel Sanctum (SPA mode)** — aman untuk React di domain/port berbeda saat development.
- **RBAC dinamis**: role & permission (akses per halaman) diatur oleh Admin sendiri lewat halaman *Settings*, bukan hardcode di kode.
- Semua 8 modul HSE lama (Incidents, Inspections, Trainings, CAPA, HSE Performance, KPI, Documents) + modul baru **Ijin Kerja (Permits)** dengan alur submit → approve/reject.
- **Notifikasi 3 channel**: Web (bell icon), Email, dan **WhatsApp** (opsional, panduan di bawah).
- Semua data lama dari `db/data.json` dipindahkan ke database lewat seeder, ditambah beberapa data contoh supaya dashboard langsung terlihat "hidup".

---

## 1. Instalasi

Butuh **PHP >= 8.2**, **Composer**, dan **MySQL** terpasang di komputer/servermu (project ini dibuat di lingkungan tanpa akses internet/PHP, jadi `vendor/` belum ada — jalankan langkah di bawah di komputermu sendiri).

```bash
cd hse-backend
composer install
cp .env.example .env
php artisan key:generate
```

Edit `.env`, sesuaikan minimal:

```env
DB_DATABASE=hse_dashboard
DB_USERNAME=root
DB_PASSWORD=

FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173
```

Buat database kosong bernama `hse_dashboard` (atau sesuai `DB_DATABASE`), lalu:

```bash
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

Backend akan jalan di `http://localhost:8000`.

### Akun contoh (dari seeder)

| Role     | Email                        | Password  |
|----------|-------------------------------|-----------|
| Admin    | admin@hse-dashboard.test      | password  |
| Employee | andi@hse-dashboard.test       | password  |
| Employee | siti@hse-dashboard.test       | password  |
| Employee | budi@hse-dashboard.test       | password  |

**Ganti password ini sebelum dipakai di production.**

---

## 2. Menjalankan bersama Frontend (React)

Di terminal terpisah:

```bash
cd hse-dashboard-frontend
npm install
npm run dev
```

Buka `http://localhost:5173`. React akan memanggil API ke `http://localhost:8000/api/*` dengan cookie session (Sanctum), jadi CORS & `SANCTUM_STATEFUL_DOMAINS` di `.env` backend **harus** cocok dengan URL React yang kamu pakai.

---

## 3. RBAC Dinamis — cara kerja

- Tabel `permissions` = daftar "halaman/modul" (dashboard, incidents, permits, settings, dst).
- Tabel `roles` = role yang bisa dibuat admin sebanyak apapun.
- Admin login → menu **Settings > Roles & Akses** → buat role baru, centang halaman yang boleh diakses.
- Role bawaan `Admin` & `Employee` tidak bisa dihapus (supaya sistem selalu punya minimal 1 admin), tapi permission-nya tetap bisa diedit.
- Setiap route API dilindungi middleware `permission:<key>`, jadi kalau admin mencentang/menghapus akses suatu halaman untuk suatu role, itu langsung berlaku tanpa deploy ulang kode.

Employee default hanya diberi akses: `dashboard`, `permits_own` (ajukan & lihat ijin kerja miliknya), `documents_sop` (lihat dokumen SOP, read-only).

---

## 4. Setup Notifikasi Email

Default `.env`: `MAIL_MAILER=log` — email tidak benar-benar terkirim, hanya ditulis ke `storage/logs/laravel.log` (bagus untuk development/testing).

Untuk email sungguhan, isi kredensial SMTP di `.env`, misalnya pakai Gmail SMTP, SendGrid, Mailgun, dsb:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=namakamu@gmail.com
MAIL_PASSWORD=app_password_gmail
MAIL_FROM_ADDRESS=namakamu@gmail.com
MAIL_FROM_NAME="HSE Dashboard"
```

---

## 5. Setup Notifikasi WhatsApp (panduan lengkap)

Notifikasi WA **mati secara default** (`WHATSAPP_ENABLED=false`) supaya aplikasi tidak error kalau belum kamu setup. Arsitekturnya modular (`App\Channels\WhatsAppChannel`), jadi provider apapun bisa dipakai — panduan di bawah pakai **Fonnte** (https://fonnte.com) karena gratis untuk mulai, tidak perlu verifikasi bisnis Meta, dan tinggal scan QR seperti WhatsApp Web.

### Langkah-langkah Fonnte

1. **Daftar akun**
   Buka https://fonnte.com → klik "Daftar" / "Register" → daftar pakai email, verifikasi email kamu.

2. **Hubungkan nomor WhatsApp**
   - Login ke dashboard Fonnte → menu **Device** → klik **Tambah/Add Device**.
   - Akan muncul **QR Code**.
   - Buka WhatsApp di HP yang mau dipakai untuk mengirim notifikasi (disarankan nomor khusus, bukan nomor pribadi) → **Setelan/Settings > Perangkat Tertaut/Linked Devices > Tautkan Perangkat** → scan QR Code tadi.
   - Setelah tersambung, status device di dashboard Fonnte akan berubah jadi **Connected**.

3. **Ambil Token API**
   - Di halaman **Device** yang sama, kamu akan melihat **Token** unik untuk device tersebut (deretan huruf+angka).
   - Salin token itu.

4. **Isi ke file `.env` backend Laravel**

   ```env
   WHATSAPP_ENABLED=true
   WHATSAPP_DRIVER=fonnte
   FONNTE_TOKEN=isi_token_dari_dashboard_fonnte
   FONNTE_ENDPOINT=https://api.fonnte.com/send
   ```

5. **Pastikan nomor HP karyawan/admin sudah terisi**
   Notifikasi WA dikirim ke kolom `phone` pada tabel `users` (format `62xxxxxxxxxx`, boleh diawali `0` juga — otomatis dikonversi oleh sistem). Isi ini lewat halaman **Settings > Karyawan** di dashboard, atau langsung waktu membuat akun.

6. **Testing**
   ```bash
   php artisan tinker
   ```
   ```php
   $user = App\Models\User::first();
   $user->notify(new App\Notifications\PermitStatusUpdated(App\Models\Permit::first()));
   ```
   Kalau berhasil, HP tujuan akan menerima pesan WA dalam beberapa detik. Kalau gagal, cek `storage/logs/laravel.log` — ada log error dari `WhatsAppChannel` (mis. token salah, device Fonnte disconnect, dll).

### Kalau mau pakai provider lain (Twilio, Wablas, Woo-WA, dst)

Cukup edit `sendViaFonnte()` di `app/Channels/WhatsAppChannel.php`, atau tambahkan method baru dan ubah `WHATSAPP_DRIVER` di `.env`. Struktur `match ($driver) { ... }` di file itu sudah disiapkan supaya gampang ditambah provider lain tanpa mengubah bagian lain sistem.

### Catatan penting Fonnte

- Paket gratis Fonnte ada batas jumlah pesan/hari — cek halaman pricing mereka kalau volume notifikasi tinggi.
- Nomor WA yang dipakai untuk mengirim (device) sebaiknya nomor aktif yang tidak dipakai chat pribadi terus-menerus, supaya tidak mudah kena limit oleh WhatsApp.
- Device bisa ter-disconnect sendiri (mis. HP mati lama / logout WA Web) — kalau notifikasi WA berhenti terkirim, cek status **Connected/Disconnected** di dashboard Fonnte dan scan ulang QR kalau perlu.

---

## 6. Struktur Endpoint API (ringkas)

Semua di-prefix `/api`. Auth pakai cookie Sanctum — jangan lupa panggil
`GET /sanctum/csrf-cookie` dulu dari frontend sebelum `POST /login` (lihat
`lib/api.js` di frontend).

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/login` | Login (email, password) |
| POST | `/logout` | Logout |
| GET | `/me` | Data user login + role + daftar permission |
| GET | `/dashboard` | Statistik dashboard (otomatis sesuai role) |
| GET/POST/PUT/DELETE | `/incidents`, `/inspections`, `/trainings`, `/capa`, `/hse_performance`, `/kpis`, `/documents` | CRUD modul (admin/permission terkait) |
| GET/POST/PUT/DELETE | `/permits` | Ijin Kerja — admin lihat semua, employee otomatis ter-scope ke miliknya |
| POST | `/permits/{id}/approve` | Approve ijin kerja (admin) |
| POST | `/permits/{id}/reject` | Reject ijin kerja + alasan (admin) |
| GET | `/documents-sop` | Dokumen SOP read-only (employee) |
| GET | `/notifications` | List notifikasi + jumlah belum dibaca |
| POST | `/notifications/{id}/read` | Tandai satu notifikasi dibaca |
| GET/POST/PUT/DELETE | `/settings/roles` | Kelola role & permission |
| GET/POST/PUT/DELETE | `/settings/users` | Kelola karyawan |

---

## 7. Menghitung HSE Performance (TRIR & LTIF)

Data HSE Performance bersifat **harian**. Man-hour dihitung otomatis:
`(male_workers + female_workers) x working_hours`. TRIR & LTIF dihitung
**kumulatif** dari baris pertama sampai baris tersebut (bukan per-hari
sendiri-sendiri), rumusnya:

```
TRIR = (kumulatif near_miss + first_aid + medical_treatment + restricted_work + property_damage) / kumulatif man-hour x 200.000
LTIF = (kumulatif lost_time_incident + fatality) / kumulatif man-hour x 1.000.000
```

Logika ini ada di `App\Models\HsePerformance::computeAll()`, identik dengan
versi Node.js sebelumnya.
