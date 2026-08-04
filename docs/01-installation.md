# Installation Guide

## Persyaratan Sistem

Sebelum menjalankan project, pastikan software berikut telah terinstall.

### Backend

- PHP 8.3+
- Composer
- Laravel 11
- MySQL 8+
- Laragon / XAMPP (disarankan Laragon)

### Frontend

- NodeJS 20+
- npm

---

# Clone Project

```bash
git clone <repository>

cd hse-dashboard
```

---

# Struktur Project

```
hse-dashboard/

├── frontend/
├── hse-backend/
└── docs/
```

---

# Backend Installation

Masuk ke folder backend.

```bash
cd hse-backend
```

Install dependency.

```bash
composer install
```

Copy file environment.

```bash
cp .env.example .env
```

Generate application key.

```bash
php artisan key:generate
```

---

# Database

Buat database baru.

Contoh

```
hse_dashboard
```

Lalu sesuaikan file

```
.env
```

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hse_dashboard
DB_USERNAME=root
DB_PASSWORD=
```

---

# Migration

```bash
php artisan migrate --seed
```

Perintah ini akan

- membuat seluruh tabel
- menjalankan seeder
- mengisi dummy data

---

# Storage

```bash
php artisan storage:link
```

Digunakan agar file upload dapat diakses dari browser.

---

# Menjalankan Backend

```bash
php artisan serve
```

Default

```
http://127.0.0.1:8000
```

---

# Frontend Installation

Masuk ke folder frontend.

```bash
cd frontend
```

Install dependency.

```bash
npm install
```

---

# Jalankan Frontend

```bash
npm run dev
```

Default

```
http://localhost:5173
```

---

# Hasil

Frontend React akan berkomunikasi dengan Backend Laravel menggunakan REST API.

```
React
↓

Axios

↓

Laravel API

↓

MySQL
```
