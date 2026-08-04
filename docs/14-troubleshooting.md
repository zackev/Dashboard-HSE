# docs/14-troubleshooting.md

# Troubleshooting

Dokumen ini berisi kumpulan permasalahan yang pernah ditemui selama proses pengembangan beserta solusi yang direkomendasikan.

---

# Laravel

## Route [login] not defined

Penyebab

Middleware mencoba melakukan redirect ke route login yang tidak tersedia pada REST API.

Solusi

Gunakan middleware API yang mengembalikan JSON Response.

Pastikan seluruh endpoint API berada pada routes/api.php.

---

## Call to undefined method Builder::query()

Penyebab

Method query() dipanggil setelah with().

Contoh yang salah

Permit::with(...)->query()

Solusi

Gunakan

Permit::query()->with(...)

atau

Permit::with(...)

tanpa memanggil query() kembali.

---

## php is not recognized

Penyebab

PHP belum masuk PATH.

Solusi

Gunakan Terminal Laragon atau tambahkan folder PHP ke Environment Variable Windows.

---

## Composer Install Gagal

Penyebab

Dependency tidak sesuai atau package diblokir security advisory.

Solusi

- Jalankan composer update jika diperlukan.
- Pastikan versi PHP sesuai.
- Periksa composer.json.

---

## Migration Gagal

Penyebab

Konfigurasi database salah.

Solusi

Periksa file .env

Pastikan:

DB_DATABASE

DB_USERNAME

DB_PASSWORD

telah sesuai.

---

## Storage Tidak Bisa Diakses

Solusi

Jalankan

php artisan storage:link

---

# React

## Failed to resolve import

Penyebab

File tidak ditemukan atau penamaan berbeda.

Solusi

Periksa:

- Nama file
- Huruf besar/kecil
- Path import

---

## Axios 500 Internal Server Error

Penyebab

Backend mengalami exception.

Solusi

Lihat:

storage/logs/laravel.log

Periksa Network Tab pada Browser.

---

## CORS Error

Penyebab

Backend belum mengizinkan origin frontend.

Solusi

Periksa konfigurasi CORS Laravel.

---

## Blank Screen

Penyebab

Error JavaScript.

Solusi

Periksa Browser Console.

Pastikan tidak ada import yang gagal.

---

# Database

## Data Tidak Muncul

Penyebab

- Seeder belum dijalankan.
- Query salah.
- Kolom tidak sesuai.
- Relasi gagal.

Solusi

Periksa:

Database

↓

Model

↓

Controller

↓

API Response

↓

Frontend

---

## Tabel Kosong

Penyebab

Migration berhasil tetapi Seeder belum dijalankan.

Solusi

php artisan migrate:fresh --seed

---

# Git

## Merge Conflict

Penyebab

Perubahan pada branch berbeda.

Solusi

Selesaikan conflict sebelum commit.

Pastikan tidak ada:

<<<<<<<

=======

> > > > > > >

yang tersisa.

---

# Railway Deployment

## Deployment Gagal

Penyebab

Environment belum lengkap.

Solusi

Periksa:

APP_KEY

Database

Storage

Build Command

Start Command

---

# Vite

## npm run dev gagal

Penyebab

Package belum terinstall.

Solusi

Jalankan

npm install

kemudian

npm run dev

---

# Build Gagal

Penyebab

Import salah.

Dependency belum ada.

Solusi

Periksa seluruh pesan error.

---

# Best Practice

Jika terjadi error.

Gunakan urutan pemeriksaan berikut.

Browser

↓

Console

↓

Network

↓

Laravel Log

↓

Database

↓

Source Code

↓

Configuration

Langkah tersebut akan membantu menemukan penyebab masalah dengan lebih cepat dibanding langsung mengubah kode tanpa analisis.

---

# Catatan

Selama proses pengembangan HSE Dashboard, setiap bug baru yang ditemukan sebaiknya ditambahkan ke dokumen ini beserta penyebab dan solusi. Dengan demikian, dokumen ini akan menjadi basis pengetahuan (knowledge base) tim sehingga permasalahan yang sama tidak perlu dianalisis dari awal setiap kali muncul.
