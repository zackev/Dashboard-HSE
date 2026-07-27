/**
 * routes/permits.js
 * -------------------------------------------------------------------------
 * Modul Ijin Kerja (Work Permit). Sebelum ijin kerja bisa disimpan, JSA
 * (Job Safety Analysis) wajib diisi minimal 1 baris — setiap baris berisi:
 *   1. Langkah Kerja
 *   2. Potensi Bahaya & Risiko
 *   3. Langkah Pengendalian
 *
 * `jsa` disimpan sebagai array di dalam record permit, mis:
 *   jsa: [{ step: "...", hazard: "...", control: "..." }, ...]
 * -------------------------------------------------------------------------
 */

const express = require('express');
const db = require('../db/database');

const router = express.Router();
const TABLE = 'permits';

function hasValidJsa(jsa) {
  return Array.isArray(jsa) && jsa.some((row) => row && String(row.step || '').trim().length > 0);
}

router.get('/', (req, res) => {
  const { status, q } = req.query;
  let rows = db.getAll(TABLE);
  if (status) rows = rows.filter((r) => (r.status || '').toLowerCase() === status.toLowerCase());
  if (q) {
    const needle = q.toLowerCase();
    rows = rows.filter((r) => JSON.stringify(r).toLowerCase().includes(needle));
  }
  rows = [...rows].sort((a, b) => (a.valid_from < b.valid_from ? 1 : -1));
  res.json({ data: rows, total: rows.length });
});

router.get('/:id', (req, res) => {
  const row = db.getById(TABLE, req.params.id);
  if (!row) return res.status(404).json({ error: 'Ijin Kerja tidak ditemukan' });
  res.json({ data: row });
});

router.post('/', (req, res) => {
  const required = ['permit_no', 'type', 'location', 'valid_from', 'valid_to', 'status'];
  const missing = required.filter((f) => !req.body[f]);
  if (missing.length) {
    return res.status(400).json({ error: `Field wajib diisi: ${missing.join(', ')}` });
  }
  if (!hasValidJsa(req.body.jsa)) {
    return res.status(400).json({ error: 'JSA wajib diisi minimal 1 baris (Langkah Kerja) sebelum ijin kerja bisa diajukan.' });
  }
  const row = db.create(TABLE, req.body);
  res.status(201).json({ data: row });
});

router.put('/:id', (req, res) => {
  // Saat edit, JSA cuma divalidasi kalau memang dikirim ulang (klien selalu
  // mengirim field jsa lengkap dari form, jadi ini pada praktiknya selalu jalan).
  if (req.body.jsa !== undefined && !hasValidJsa(req.body.jsa)) {
    return res.status(400).json({ error: 'JSA wajib diisi minimal 1 baris (Langkah Kerja).' });
  }
  const row = db.update(TABLE, req.params.id, req.body);
  if (!row) return res.status(404).json({ error: 'Ijin Kerja tidak ditemukan' });
  res.json({ data: row });
});

router.delete('/:id', (req, res) => {
  const ok = db.remove(TABLE, req.params.id);
  if (!ok) return res.status(404).json({ error: 'Ijin Kerja tidak ditemukan' });
  res.json({ data: true });
});

module.exports = router;
