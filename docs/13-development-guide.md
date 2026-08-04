# docs/13-development-guide.md

# Development Guide

---

# Tujuan

Dokumen ini ditujukan bagi developer yang akan melakukan pengembangan, perbaikan bug, maupun penambahan fitur pada HSE Dashboard.

Panduan ini menjelaskan alur kerja yang direkomendasikan agar struktur project tetap konsisten.

---

# Arsitektur Project

Project dipisahkan menjadi dua aplikasi.

Frontend

React + Vite

Backend

Laravel REST API

Komunikasi dilakukan menggunakan JSON melalui HTTP Request.

---

# Struktur Project

```
hse-dashboard/

frontend/

hse-backend/
```

Frontend tidak boleh mengakses database secara langsung.

Seluruh komunikasi harus melalui REST API.

---

# Menambah Modul Baru

Urutan yang direkomendasikan.

## 1. Migration

Buat migration.

```bash
php artisan make:migration create_training_table
```

---

## 2. Model

```bash
php artisan make:model Training
```

---

## 3. Controller

```bash
php artisan make:controller Api/TrainingController
```

---

## 4. Route

Tambahkan route pada

routes/api.php

Contoh

GET

POST

PUT

DELETE

---

## 5. Validation

Tambahkan validasi request.

Pastikan seluruh input telah diverifikasi sebelum disimpan.

---

## 6. Permission

Tambahkan permission baru.

Contoh

training

training.create

training.edit

training.delete

---

## 7. Seeder

Jika diperlukan, tambahkan dummy data agar modul mudah diuji.

---

## 8. Frontend

Tambahkan halaman React.

Contoh

TrainingPage.jsx

---

## 9. Sidebar

Tambahkan menu baru pada Sidebar.

Pastikan hanya tampil untuk user yang memiliki permission.

---

## 10. API Service

Tambahkan endpoint baru pada file API Service.

Gunakan pola yang konsisten dengan modul lain.

---

## Coding Standard

### Backend

- Gunakan Controller untuk business logic.
- Gunakan Model untuk akses database.
- Jangan menulis query langsung pada Route.
- Gunakan Request Validation.
- Gunakan JSON Response yang konsisten.

---

### Frontend

- Pisahkan Page dan Component.
- Hindari business logic berlebihan di komponen.
- Gunakan Axios melalui API Service.
- Gunakan Loading State.
- Gunakan Error Handling.

---

# Naming Convention

Controller

PermitController

IncidentController

InspectionController

Model

Permit

Incident

Inspection

Migration

create_permits_table

create_incidents_table

Page

PermitPage.jsx

IncidentPage.jsx

InspectionPage.jsx

---

# Git Workflow

Disarankan menggunakan branch terpisah.

main

↓

feature

↓

testing

↓

production

---

# Testing

Sebelum melakukan commit.

Pastikan:

- Frontend berjalan normal.
- Backend berjalan normal.
- Migration berhasil.
- Seeder berhasil.
- CRUD berhasil.
- Permission berfungsi.
- Dashboard tidak error.

---

# Checklist Sebelum Commit

✓ Tidak ada error Console.

✓ Tidak ada error Network.

✓ Tidak ada merge conflict.

✓ Tidak ada file debug.

✓ Tidak ada console.log yang tertinggal.

✓ Endpoint telah diuji.

✓ UI tetap konsisten.

---

# Deployment Checklist

- Environment Production sudah sesuai.
- APP_DEBUG = false
- Database Production siap.
- Storage Link dibuat.
- Cache dibersihkan.
- Build Frontend berhasil.
- Backup database dilakukan sebelum update.

---

# Future Development

Project dirancang agar mudah dikembangkan.

Contoh modul yang dapat ditambahkan:

- Audit
- Training
- PPE
- Asset
- Contractor
- Vehicle Inspection
- Safety Observation
- Risk Assessment
- CAPA Management
