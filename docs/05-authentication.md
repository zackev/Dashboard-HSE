# Authentication

## Overview

Project menggunakan Laravel Sanctum sebagai sistem autentikasi.

Frontend tidak berkomunikasi langsung dengan database.

Seluruh proses login dilakukan melalui REST API.

---

# Login Flow

Browser

↓

React

↓

Axios

↓

POST /api/login

↓

AuthController

↓

Sanctum

↓

Token

↓

Frontend

---

# Authorization Header

Setelah login berhasil.

Frontend menyimpan token.

Seluruh request berikutnya menggunakan

Authorization

Bearer Token

---

# Protected Route

Semua endpoint penting berada di dalam middleware.

auth:sanctum

Contoh

GET /api/permits

GET /api/incidents

GET /api/documents

---

# Logout

Logout menghapus token Sanctum sehingga request berikutnya tidak lagi dianggap valid.

---

# Current User

Frontend dapat mengambil data user melalui endpoint

GET /api/me

Data digunakan untuk:

- Nama User
- Role
- Permission
- Profile

---

# Middleware

Semua endpoint sensitif diproteksi middleware.

User yang belum login tidak dapat mengakses data.

---

# Permission

Selain login.

Project menggunakan sistem permission.

Contoh

Dashboard

↓

Permission

↓

Permit

↓

Permission

↓

Inspection

↓

Permission

---

Hak akses ditentukan berdasarkan permission yang dimiliki user.
