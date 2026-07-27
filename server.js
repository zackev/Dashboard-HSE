/**
 * server.js
 * -------------------------------------------------------------------------
<<<<<<< HEAD
 * Entry point aplikasi HSE Dashboard (backend Node.js + Express).
 *
 * Semua data disimpan lifetime di db/data.json (lihat db/database.js).
 * API di-mount di /api/*.
 *
 * Frontend sekarang React + Vite + Tailwind (folder frontend/). Ada 2 cara jalanin:
 *
 *  1) DEVELOPMENT (hot reload, React & API jalan terpisah):
 *       Terminal 1: npm start            (Express API di :3000)
 *       Terminal 2: cd frontend && npm run dev   (Vite di :5173, proxy ke :3000)
 *     Buka http://localhost:5173
 *
 *  2) PRODUCTION-STYLE demo (satu server, satu port):
 *       cd frontend && npm install && npm run build
 *       cd .. && npm start
 *     Buka http://localhost:3000  (Express men-serve hasil build React dari frontend/dist)
=======
 * Entry point aplikasi HSE Dashboard (demo Node.js + Express).
 *
 * Semua data disimpan lifetime di db/data.json (lihat db/database.js).
 * API di-mount di /api/*, frontend statis (HTML/CSS/JS) disajikan dari
 * folder public/.
 *
 * Jalankan:
 *   npm install
 *   npm start
 * Lalu buka http://localhost:3000
>>>>>>> 405c9e708fa4a23d2ad6570c0fb57fb21d597f56
 * -------------------------------------------------------------------------
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
<<<<<<< HEAD
const fs = require('fs');
=======
>>>>>>> 405c9e708fa4a23d2ad6570c0fb57fb21d597f56
const apiRoutes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API
app.use('/api', apiRoutes);

// File dokumen yang di-upload (persisten di folder uploads/)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

<<<<<<< HEAD
// Frontend hasil build React (Vite) — hanya ada setelah `npm run build` di folder frontend/
const FRONTEND_DIST = path.join(__dirname, 'frontend', 'dist');

if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
  app.get('*', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.type('text/plain').send(
      'Frontend belum di-build.\n\n' +
      'Untuk development: cd frontend && npm install && npm run dev, lalu buka http://localhost:5173\n' +
      'Untuk production-style demo: cd frontend && npm install && npm run build, lalu jalankan ulang npm start di sini dan buka http://localhost:3000'
    );
  });
}

app.listen(PORT, () => {
  console.log(`HSE Dashboard API jalan di http://localhost:${PORT}`);
  if (!fs.existsSync(FRONTEND_DIST)) {
    console.log('Catatan: frontend/dist belum ada. Lihat pesan di http://localhost:' + PORT + ' untuk cara menjalankan frontend.');
  }
=======
// Frontend statis
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`HSE Dashboard jalan di http://localhost:${PORT}`);
>>>>>>> 405c9e708fa4a23d2ad6570c0fb57fb21d597f56
});
