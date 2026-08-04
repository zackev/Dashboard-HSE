# Architecture

## Gambaran Umum

Project menggunakan arsitektur terpisah antara Frontend dan Backend.

Frontend bertugas menampilkan antarmuka.

Backend bertugas menyediakan REST API.

Database hanya diakses oleh Backend.

---

# Diagram

```
Browser

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

Database

↓

JSON

↓

React
```

---

# Frontend

Frontend dibangun menggunakan React + Vite.

Tugas utama frontend

- Login
- Menampilkan Dashboard
- Menampilkan Data
- Form CRUD
- Upload File
- Grafik

Frontend tidak pernah mengakses database secara langsung.

---

# Backend

Backend menggunakan Laravel.

Semua request diproses melalui

```
routes/api.php
```

Kemudian diarahkan ke Controller.

Controller akan berinteraksi dengan Model.

Model mengambil data dari MySQL.

---

# Database

Seluruh data tersimpan di MySQL.

Laravel menggunakan Eloquent ORM.

---

# Authentication

Authentication menggunakan Laravel Sanctum.

Alur

```
Login

↓

Token

↓

Authorization Header

↓

Middleware

↓

Controller
```

---

# Permission

Hak akses dilakukan menggunakan middleware permission.

Setiap endpoint memiliki permission masing-masing.

Contoh

Permit

↓

permission.any

↓

Controller
