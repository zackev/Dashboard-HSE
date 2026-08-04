# docs/09-incidents.md

# Incident Module

---

# Overview

Incident Module digunakan untuk mencatat seluruh kejadian yang berhubungan dengan Health, Safety, and Environment (HSE).

Seluruh kejadian yang terjadi di lingkungan kerja dicatat dalam modul ini sebagai bahan evaluasi, pelaporan, serta analisis untuk mencegah kejadian serupa di masa mendatang.

---

# Tujuan

Modul Incident memiliki tujuan untuk:

- Mendokumentasikan seluruh kejadian HSE
- Membantu proses investigasi
- Menjadi dasar evaluasi keselamatan kerja
- Menyediakan data statistik incident
- Menjadi sumber data Dashboard HSE

---

# Jenis Incident

Contoh incident yang dapat dicatat:

- Near Miss
- First Aid Case
- Medical Treatment Case
- Lost Time Injury
- Property Damage
- Environmental Incident

---

# Business Process

Employee

↓

Report Incident

↓

Validation

↓

Database

↓

Investigation

↓

Corrective Action

↓

Closed

↓

Dashboard

---

# Flow Diagram

IncidentPage.jsx

↓

Axios

↓

GET /api/incidents

↓

routes/api.php

↓

IncidentController@index

↓

Incident Model

↓

Database

↓

JSON

↓

Incident Table

---

# CRUD

Create

↓

Store Incident

↓

Database

---

Read

↓

Incident List

↓

Search

↓

Filter

↓

Pagination

---

Update

↓

Edit Incident

↓

Save

---

Delete

↓

Delete Incident

---

# Search

Data incident dapat dicari berdasarkan:

- Nomor Incident
- Lokasi
- Jenis Incident
- Status
- Reporter

---

# Filter

Filter berdasarkan:

- Status
- Severity
- Tanggal
- Area

---

# Status

Contoh status:

Open

Under Investigation

Corrective Action

Closed

---

# API

GET /api/incidents

POST /api/incidents

GET /api/incidents/{id}

PUT /api/incidents/{id}

DELETE /api/incidents/{id}

---

# Frontend

Frontend bertugas:

- Menampilkan daftar incident
- Form tambah incident
- Edit incident
- Search
- Filter
- Pagination
- Loading
- Error Handling

---

# Backend

Backend bertugas:

- Validasi data
- Menyimpan incident
- Mengambil data
- Mengupdate data
- Menghapus data
- Mengirim JSON Response

---

# Validation

Contoh validasi:

- Incident Number wajib unik
- Incident Type wajib dipilih
- Location wajib diisi
- Incident Date wajib diisi
- Description wajib diisi

---

# Security

Endpoint hanya dapat diakses oleh user yang memiliki permission incident.

---

# Future Improvement

- Photo Evidence
- Root Cause Analysis
- Corrective Action Tracking
- Notification
- Email Reminder
- WhatsApp Reminder
- Export PDF
