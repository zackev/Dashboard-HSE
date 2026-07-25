/**
 * server.js
 * -------------------------------------------------------------------------
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
 * -------------------------------------------------------------------------
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API
app.use('/api', apiRoutes);

// File dokumen yang di-upload (persisten di folder uploads/)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Frontend statis
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`HSE Dashboard jalan di http://localhost:${PORT}`);
});
