# docs/08-permits.md

# Work Permit Module

---

# Overview

Work Permit merupakan salah satu modul utama dalam HSE Dashboard.

Modul ini digunakan untuk mengelola seluruh izin kerja yang membutuhkan persetujuan sebelum pekerjaan dilaksanakan.

Contoh:

- Hot Work
- Working at Height
- Confined Space
- Electrical Work
- Excavation
- Lifting
- General Work

---

# Tujuan

Work Permit dibuat untuk memastikan bahwa seluruh pekerjaan berisiko telah memenuhi persyaratan keselamatan.

Setiap permit memiliki status yang dapat dipantau oleh Supervisor maupun HSE.

---

# Business Process

User

↓

Create Permit

↓

Validation

↓

Save Database

↓

Approval

↓

Active

↓

Expired

↓

History

---

# Flow Diagram

PermitPage.jsx

↓

Axios

↓

GET /api/permits

↓

routes/api.php

↓

PermitController@index

↓

Permit Model

↓

Database

↓

JSON

↓

Permit Table

---

# CRUD

Create

↓

Store

↓

Database

---

Read

↓

List Permit

↓

Search

↓

Filter

↓

Pagination

---

Update

↓

Edit Permit

↓

Save

---

Delete

↓

Soft Delete / Delete

---

# Search

Permit dapat dicari berdasarkan

Permit Number

Location

Type

Status

Tanggal

---

# Filter

Filter berdasarkan

Status

User

Tanggal

Lokasi

Jenis Permit

---

# Status

Contoh status

Draft

Pending

Approved

Rejected

Expired

Closed

---

# Relasi

Permit

↓

User

Permit dibuat oleh seorang User.

---

# API

GET /api/permits

POST /api/permits

GET /api/permits/{id}

PUT /api/permits/{id}

DELETE /api/permits/{id}

---

# Frontend

Frontend bertugas:

Menampilkan tabel

Menampilkan modal

Filter

Search

Pagination

Loading

Notification

---

# Backend

Backend bertugas:

Validasi

Permission

Business Logic

Query Database

JSON Response

---

# Validation

Contoh validasi

Permit Number wajib unik

Type wajib dipilih

Location wajib diisi

Valid From tidak boleh kosong

Valid To tidak boleh lebih kecil dari Valid From

---

# Security

Endpoint hanya dapat diakses oleh user yang memiliki permission permit.

User tanpa permission tidak dapat melihat data.

---

# Future Improvement

Workflow Approval

Digital Signature

QR Code

Permit Attachment

Permit History

Revision

Risk Assessment

JSA Integration

Email Reminder

WhatsApp Reminder
