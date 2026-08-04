# docs/12-users-roles-permissions.md

# Users, Roles & Permissions

---

# Overview

Modul ini mengatur seluruh pengguna yang dapat mengakses HSE Dashboard beserta hak akses masing-masing.

Hak akses diberikan berdasarkan Role dan Permission sehingga setiap pengguna hanya dapat mengakses fitur sesuai tanggung jawabnya.

---

# User

User merupakan akun yang digunakan untuk login ke sistem.

Informasi dasar user meliputi:

- Nama
- Email
- Password
- Role
- Status

---

# Role

Role digunakan untuk mengelompokkan pengguna berdasarkan jabatan atau fungsi.

Contoh Role:

- Super Admin
- HSE Manager
- HSE Officer
- Supervisor
- Employee

---

# Permission

Permission digunakan untuk mengontrol akses terhadap setiap modul.

Contoh Permission:

- Dashboard
- Permit
- Incident
- Inspection
- Documents
- Users

---

# Authentication

Sistem menggunakan Laravel Sanctum untuk autentikasi.

Seluruh endpoint yang dilindungi memerlukan token autentikasi yang valid.

---

# Authorization Flow

Login

↓

Token

↓

Middleware

↓

Permission Check

↓

Controller

↓

Response

---

# Security

Setiap request akan diverifikasi sebelum diproses.

User tanpa permission yang sesuai akan menerima respon penolakan akses.

---

# Future Improvement

- Multi Company
- Multi Branch
- Single Sign-On (SSO)
- Active Directory Integration
- Two Factor Authentication (2FA)
- Login History
- Session Management
