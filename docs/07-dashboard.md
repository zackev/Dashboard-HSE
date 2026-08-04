# docs/07-dashboard.md

# Dashboard Module

---

# Tujuan

Dashboard merupakan halaman utama setelah pengguna berhasil login.

Dashboard bertugas memberikan ringkasan kondisi HSE perusahaan secara real-time.

Dashboard bukan tempat menyimpan data, tetapi mengambil informasi dari berbagai modul dan menggabungkannya menjadi KPI (Key Performance Indicator).

---

# Fungsi Dashboard

Dashboard digunakan untuk:

- Menampilkan statistik HSE
- Menampilkan jumlah Work Permit
- Menampilkan jumlah Incident
- Menampilkan jumlah Inspection
- Menampilkan statistik dokumen
- Menampilkan grafik
- Menampilkan aktivitas terbaru

Dashboard menjadi pusat monitoring seluruh sistem.

---

# Business Flow

User Login

↓

Dashboard Page

↓

Axios Request

↓

GET /api/dashboard

↓

DashboardController

↓

Permit

↓

Incident

↓

Inspection

↓

Documents

↓

Database

↓

JSON

↓

Dashboard Cards

↓

Charts

↓

Table

---

# Data Source

Dashboard mengambil data dari berbagai tabel.

Contoh:

permits

incidents

inspections

documents

users

Dashboard tidak memiliki tabel sendiri.

---

# Komponen Dashboard

Dashboard terdiri dari beberapa bagian.

## Summary Card

Menampilkan total data.

Contoh

Total Permit

Total Incident

Total Inspection

Total User

---

## Charts

Digunakan untuk visualisasi data.

Contoh

Permit Status

Incident Trend

Inspection Progress

Monthly Activity

---

## Recent Activity

Menampilkan aktivitas terbaru.

Misalnya

Permit terbaru

Incident terbaru

Inspection terbaru

---

# Controller

DashboardController bertugas:

- Mengambil data
- Menghitung statistik
- Menggabungkan beberapa query
- Menghasilkan JSON

Controller tidak melakukan rendering HTML.

Seluruh data dikirim dalam bentuk JSON.

---

# Frontend

Dashboard React bertugas:

- Memanggil API
- Menampilkan Card
- Menampilkan Chart
- Menampilkan Table
- Menampilkan Loading
- Menampilkan Error

Frontend tidak melakukan perhitungan business logic.

---

# API

GET /api/dashboard

Response

{
summary: {},
charts: {},
recent: {}
}

---

# Future Improvement

Dashboard dapat dikembangkan dengan:

- Real-time Notification
- WebSocket
- Live Chart
- Export Dashboard PDF
- Email Summary
- KPI Target
- Trend Analysis
