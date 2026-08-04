# HSE Dashboard

Version : 1.0

---

# Tentang Project

HSE Dashboard merupakan aplikasi berbasis web yang digunakan untuk membantu perusahaan dalam mengelola aktivitas Health, Safety, and Environment (HSE).

Project dibangun menggunakan arsitektur modern dengan pemisahan Frontend dan Backend.

Frontend menggunakan React.

Backend menggunakan Laravel REST API.

Komunikasi dilakukan menggunakan JSON API.

---

# Tujuan Project

Project ini dibuat agar seluruh proses HSE dapat dilakukan secara digital.

Beberapa proses yang sebelumnya dilakukan menggunakan formulir kertas dapat dipindahkan ke dalam sistem sehingga lebih mudah dipantau.

---

# Target Pengguna

- HSE Officer
- Supervisor
- Manager
- Administrator
- Karyawan

---

# Modul Utama

Project terdiri dari beberapa modul utama.

## Dashboard

Menampilkan ringkasan seluruh aktivitas HSE.

---

## Work Permit

Mengelola seluruh izin kerja.

Contoh:

- Hot Work
- Working at Height
- Confined Space
- Electrical Work

---

## Incident

Mencatat kejadian kecelakaan kerja.

---

## Inspection

Mencatat hasil inspeksi lapangan.

---

## Documents

Menyimpan dokumen HSE.

---

## HSE Performance

Menampilkan KPI HSE.

---

## User Management

Mengelola user.

---

## Role & Permission

Mengatur hak akses setiap pengguna.

---

# Arsitektur

Frontend

↓

React

↓

Axios

↓

Laravel REST API

↓

Controller

↓

Model

↓

MySQL

↓

JSON Response

↓

React

---

# Alur Data

User

↓

Login

↓

Sanctum Authentication

↓

Frontend Request

↓

API

↓

Database

↓

Response

↓

Frontend

---

# Struktur Project

Project dipisahkan menjadi dua bagian.

frontend/

backend/

Tujuannya agar Frontend dan Backend dapat dikembangkan secara independen.

---

# Keuntungan Arsitektur

- Mudah maintenance
- Mudah dikembangkan
- Mudah migrasi
- Mudah deployment
- REST API reusable
- Mobile App siap menggunakan API yang sama

---

# Pengembangan Selanjutnya

Project dirancang agar dapat ditambahkan modul baru tanpa mengubah struktur utama.

Contoh:

- Audit
- Training
- PPE
- Asset
- Equipment
- Vehicle Inspection
- Contractor Management
