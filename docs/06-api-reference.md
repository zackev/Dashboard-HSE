# API Reference

Seluruh API menggunakan format JSON.

Base URL

http://localhost:8000/api

---

# Authentication

POST /login

Digunakan untuk login.

---

POST /logout

Logout user.

---

GET /me

Mengambil data user yang sedang login.

---

# Dashboard

GET /dashboard

Mengambil seluruh data dashboard.

---

# Permit

GET /permits

Mengambil daftar permit.

---

POST /permits

Menambahkan permit baru.

---

GET /permits/{id}

Detail permit.

---

PUT /permits/{id}

Update permit.

---

DELETE /permits/{id}

Hapus permit.

---

# Incident

GET /incidents

POST /incidents

PUT /incidents/{id}

DELETE /incidents/{id}

---

# Inspection

GET /inspections

POST /inspections

PUT /inspections/{id}

DELETE /inspections/{id}

---

# Documents

GET /documents

POST /documents

DELETE /documents/{id}

---

Semua endpoint membutuhkan token Sanctum kecuali Login.
