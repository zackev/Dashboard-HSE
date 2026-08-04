# docs/10-inspections.md

# Inspection Module

---

# Overview

Inspection Module digunakan untuk mencatat hasil inspeksi rutin maupun inspeksi khusus yang dilakukan oleh tim HSE.

Modul ini membantu perusahaan memastikan seluruh area kerja memenuhi standar keselamatan yang berlaku.

---

# Tujuan

- Mencatat hasil inspeksi
- Menemukan potensi bahaya
- Mendokumentasikan temuan
- Mengontrol tindak lanjut
- Menjadi sumber data Dashboard

---

# Business Process

Inspector

↓

Create Inspection

↓

Validation

↓

Database

↓

Finding

↓

Recommendation

↓

Follow Up

↓

Closed

---

# Flow Diagram

InspectionPage.jsx

↓

Axios

↓

GET /api/inspections

↓

InspectionController@index

↓

Inspection Model

↓

Database

↓

JSON

↓

Inspection Table

---

# CRUD

Create

↓

Inspection

↓

Database

---

Read

↓

Inspection List

---

Update

↓

Edit Inspection

---

Delete

↓

Delete Inspection

---

# Search

Pencarian berdasarkan:

- Area
- Inspector
- Status
- Finding

---

# Filter

- Area
- Department
- Status
- Date

---

# API

GET /api/inspections

POST /api/inspections

GET /api/inspections/{id}

PUT /api/inspections/{id}

DELETE /api/inspections/{id}

---

# Frontend

- Inspection Table
- Search
- Filter
- Modal
- Pagination
- Loading
- Notification

---

# Backend

- Validation
- CRUD
- Database Query
- JSON Response

---

# Validation

- Area wajib diisi
- Inspector wajib dipilih
- Date wajib diisi
- Finding wajib diisi

---

# Security

Inspection hanya dapat diakses sesuai permission user.

---

# Future Improvement

- Checklist Template
- Digital Signature
- Mobile Inspection
- QR Code
- Image Upload
- Export Excel
- Export PDF
