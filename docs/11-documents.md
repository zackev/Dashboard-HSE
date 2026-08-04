# docs/11-documents.md

# Documents Module

---

# Overview

Documents Module digunakan sebagai pusat penyimpanan dokumen HSE.

Dokumen dapat berupa SOP, Work Instruction, Manual, Form, maupun dokumen pendukung lainnya.

---

# Tujuan

- Menyimpan dokumen HSE
- Memudahkan pencarian dokumen
- Menjamin dokumen selalu tersedia
- Mendukung proses audit

---

# Business Process

Administrator

↓

Upload Document

↓

Validation

↓

Storage

↓

Database

↓

Document List

↓

Download

---

# Flow Diagram

DocumentPage.jsx

↓

Axios

↓

POST /api/documents

↓

DocumentController

↓

Storage

↓

Database

↓

JSON

↓

Document Table

---

# CRUD

Upload

↓

Storage

↓

Database

---

Read

↓

Document List

---

Update

↓

Update Metadata

---

Delete

↓

Delete File

↓

Delete Database

---

# Search

Pencarian berdasarkan:

- Nama Dokumen
- Kategori
- Uploader

---

# Filter

- Category
- Upload Date
- Status

---

# API

GET /api/documents

POST /api/documents

DELETE /api/documents/{id}

---

# Frontend

- Upload Form
- Drag & Drop
- Table
- Search
- Preview
- Download

---

# Backend

- Upload File
- Validation
- Storage
- CRUD
- JSON Response

---

# Validation

- File wajib dipilih
- Ukuran file sesuai batas sistem
- Format file harus valid

---

# Security

Dokumen hanya dapat diakses oleh user yang memiliki hak akses.

---

# Future Improvement

- Versioning
- Document Approval
- Expired Document Reminder
- Preview PDF
- OCR Search
- Cloud Storage
