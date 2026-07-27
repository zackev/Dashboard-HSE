/**
 * routes/crudFactory.js
 * -------------------------------------------------------------------------
 * Membuat router Express dengan endpoint CRUD standar untuk satu "tabel":
 *   GET    /api/<table>        -> list semua data (mendukung ?status=&q=)
 *   GET    /api/<table>/:id    -> detail satu data
 *   POST   /api/<table>        -> buat data baru
 *   PUT    /api/<table>/:id    -> update data
 *   DELETE /api/<table>/:id    -> hapus data
 *
 * `requiredFields` dipakai untuk validasi sederhana sebelum create/update.
 *
 * Catatan migrasi ke Laravel:
 *  Endpoint & response shape di sini sengaja dibuat mengikuti konvensi REST
 *  standar (resource controller Laravel: index/show/store/update/destroy),
 *  supaya frontend tidak perlu banyak berubah saat backend diganti.
 * -------------------------------------------------------------------------
 */

const express = require('express');
const db = require('../db/database');

function makeCrudRouter(table, requiredFields = []) {
  const router = express.Router();

  // LIST (dengan optional filter status & pencarian teks sederhana di title)
  router.get('/', (req, res) => {
    const { status, q } = req.query;
    let rows = db.getAll(table);

    if (status) {
      rows = rows.filter((r) => (r.status || '').toLowerCase() === status.toLowerCase());
    }
    if (q) {
      const needle = q.toLowerCase();
      rows = rows.filter((r) => JSON.stringify(r).toLowerCase().includes(needle));
    }

    // urutkan terbaru dulu
    rows = [...rows].sort((a, b) => (a.date < b.date ? 1 : -1));

    res.json({ data: rows, total: rows.length });
  });

  // DETAIL
  router.get('/:id', (req, res) => {
    const row = db.getById(table, req.params.id);
    if (!row) return res.status(404).json({ error: `${table} dengan id ${req.params.id} tidak ditemukan` });
    res.json({ data: row });
  });

  // CREATE
  router.post('/', (req, res) => {
    const missing = requiredFields.filter((f) => !req.body[f] && req.body[f] !== 0);
    if (missing.length) {
      return res.status(400).json({ error: `Field wajib diisi: ${missing.join(', ')}` });
    }
    const row = db.create(table, req.body);
    res.status(201).json({ data: row });
  });

  // UPDATE
  router.put('/:id', (req, res) => {
    const row = db.update(table, req.params.id, req.body);
    if (!row) return res.status(404).json({ error: `${table} dengan id ${req.params.id} tidak ditemukan` });
    res.json({ data: row });
  });

  // DELETE
  router.delete('/:id', (req, res) => {
    const ok = db.remove(table, req.params.id);
    if (!ok) return res.status(404).json({ error: `${table} dengan id ${req.params.id} tidak ditemukan` });
    res.json({ data: true });
  });

  return router;
}

module.exports = makeCrudRouter;
