# Database Documentation

## Overview

HSE Dashboard menggunakan MySQL sebagai database utama.

Laravel Eloquent digunakan sebagai ORM sehingga seluruh proses CRUD dilakukan melalui Model.

Database dirancang dengan konsep relasional agar setiap modul saling terhubung.

---

# Entity Relationship (High Level)

Users
│
├── Permits
├── Incidents
├── Inspections
├── Documents
└── HSE Performance

Property (future)

↓

Rooms (future)

↓

Tenants (future)

---

# Prinsip Database

Setiap data memiliki:

- Primary Key
- Timestamp
- Relasi menggunakan Foreign Key
- Soft Delete (jika diterapkan pada model tertentu)

---

# Modul Database

Project dibagi menjadi beberapa kelompok data.

## Authentication

Tabel:

- users
- personal_access_tokens
- password_reset_tokens

Digunakan untuk:

- Login
- Sanctum
- Authentication

---

## Permit Module

Tabel utama:

permits

Fungsi:

Menyimpan seluruh Work Permit.

Contoh data:

- Permit Number
- Permit Type
- Location
- Status
- Valid From
- Valid To
- User

Relasi:

Permit

↓

belongsTo(User)

---

## Incident Module

Tabel:

incidents

Digunakan mencatat:

- Near Miss
- Accident
- First Aid
- Lost Time Injury
- Property Damage

---

## Inspection Module

Tabel:

inspections

Berisi:

- Inspection Date
- Inspector
- Area
- Finding
- Recommendation

---

## Document Module

Tabel:

documents

Digunakan menyimpan:

- SOP
- Procedure
- HSE Manual
- Work Instruction

---

## Dashboard

Dashboard tidak memiliki tabel khusus.

Dashboard mengambil data dari berbagai tabel untuk menghasilkan KPI.

---

# Audit Trail

Sebagian besar data memiliki hubungan dengan user sehingga aktivitas dapat ditelusuri kembali.

Contoh

Permit

↓

Created By

↓

User

---

# Seeder

Project menyediakan Seeder untuk menghasilkan dummy data.

Tujuan:

- Demo
- Testing
- Development

---

# Migration

Seluruh struktur database berada pada folder

database/migrations

Migration menjadi sumber utama struktur tabel.
