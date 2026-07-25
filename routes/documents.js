/**
 * routes/documents.js
 * -------------------------------------------------------------------------
 * Modul Document: menyimpan metadata dokumen K3 (policy, SOP, sertifikat,
 * ijin legal, laporan, dll) beserta file fisiknya (opsional).
 *
 * File di-upload lewat multipart/form-data (field "file"), disimpan di
 * folder /uploads (persisten di disk, ikut "lifetime" seperti data.json),
 * dan disajikan lagi lewat static route /uploads di server.js.
 * -------------------------------------------------------------------------
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db/database');

const TABLE = 'documents';
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } }); // maks 15MB

function deleteFileIfExists(filePathRelative) {
  if (!filePathRelative) return;
  const abs = path.join(__dirname, '..', filePathRelative.replace(/^\//, ''));
  if (fs.existsSync(abs)) {
    try { fs.unlinkSync(abs); } catch (e) { console.error('Gagal hapus file lama:', e.message); }
  }
}

const router = express.Router();

router.get('/', (req, res) => {
  const { status, q } = req.query;
  let rows = db.getAll(TABLE);
  if (status) rows = rows.filter((r) => (r.status || '').toLowerCase() === status.toLowerCase());
  if (q) {
    const needle = q.toLowerCase();
    rows = rows.filter((r) => JSON.stringify(r).toLowerCase().includes(needle));
  }
  rows = [...rows].sort((a, b) => (a.issue_date < b.issue_date ? 1 : -1));
  res.json({ data: rows, total: rows.length });
});

router.get('/:id', (req, res) => {
  const row = db.getById(TABLE, req.params.id);
  if (!row) return res.status(404).json({ error: 'Document tidak ditemukan' });
  res.json({ data: row });
});

router.post('/', upload.single('file'), (req, res) => {
  const required = ['title', 'category', 'doc_number', 'issue_date', 'status'];
  const missing = required.filter((f) => !req.body[f]);
  if (missing.length) {
    return res.status(400).json({ error: `Field wajib diisi: ${missing.join(', ')}` });
  }
  const payload = { ...req.body };
  if (req.file) {
    payload.file_name = req.file.originalname;
    payload.file_path = `/uploads/${req.file.filename}`;
  }
  const row = db.create(TABLE, payload);
  res.status(201).json({ data: row });
});

router.put('/:id', upload.single('file'), (req, res) => {
  const existing = db.getById(TABLE, req.params.id);
  if (!existing) return res.status(404).json({ error: 'Document tidak ditemukan' });

  const payload = { ...req.body };
  if (req.file) {
    deleteFileIfExists(existing.file_path);
    payload.file_name = req.file.originalname;
    payload.file_path = `/uploads/${req.file.filename}`;
  }
  const row = db.update(TABLE, req.params.id, payload);
  res.json({ data: row });
});

router.delete('/:id', (req, res) => {
  const existing = db.getById(TABLE, req.params.id);
  const ok = db.remove(TABLE, req.params.id);
  if (!ok) return res.status(404).json({ error: 'Document tidak ditemukan' });
  if (existing) deleteFileIfExists(existing.file_path);
  res.json({ data: true });
});

module.exports = router;
