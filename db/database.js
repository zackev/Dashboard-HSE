/**
 * db/database.js
 * -------------------------------------------------------------------------
 * Lapisan penyimpanan data super sederhana berbasis file JSON.
 *
 * Kenapa file JSON, bukan SQLite/MySQL?
 *  - Untuk DEMO ini, tujuannya nol dependency native & langsung jalan.
 *  - Data tetap "lifetime" (persisten) karena disimpan ke disk (db/data.json),
 *    bukan di memori, jadi tidak hilang saat server di-restart.
 *  - Struktur kode dibuat menyerupai "repository pattern": semua akses data
 *    lewat fungsi-fungsi di sini. Nanti kalau mau pindah ke Laravel + MySQL,
 *    cukup ganti isi fungsi-fungsi ini menjadi query Eloquent/DB, TANPA perlu
 *    mengubah routes/ maupun frontend, karena kontrak (nama fungsi & bentuk
 *    data) tetap sama.
 * -------------------------------------------------------------------------
 */

const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data.json');

// Struktur default kalau file belum ada
const DEFAULT_DATA = {
  incidents: [],
  inspections: [],
  trainings: [],
  capa: [], // Corrective & Preventive Actions
  hse_performance: [], // Data bulanan: tenaga kerja, jam kerja orang, kasus, dsb.
  permits: [], // Ijin Kerja (work permits)
  kpis: [], // KPI HSE
  documents: [], // Dokumen K3 (policy, SOP, sertifikat, dll)
  _seq: {
    incidents: 0, inspections: 0, trainings: 0, capa: 0,
    hse_performance: 0, permits: 0, kpis: 0, documents: 0
  }
};

// Menjamin tabel baru (mis. saat upgrade dari versi lama) selalu ada,
// supaya data.json lama tidak bikin error saat modul baru ditambahkan.
function ensureShape(data) {
  for (const key of Object.keys(DEFAULT_DATA)) {
    if (key === '_seq') continue;
    if (!Array.isArray(data[key])) data[key] = [];
  }
  data._seq = data._seq || {};
  for (const key of Object.keys(DEFAULT_DATA._seq)) {
    if (typeof data._seq[key] !== 'number') data._seq[key] = 0;
  }
  return data;
}

function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
  }
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  try {
    return ensureShape(JSON.parse(raw));
  } catch (e) {
    console.error('data.json rusak/corrupt, reset ke default.', e);
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function nextId(data, table) {
  data._seq[table] = (data._seq[table] || 0) + 1;
  return data._seq[table];
}

// ---- Generic CRUD helpers, dipakai oleh semua modul (incidents, inspections, dst) ----

function getAll(table, filterFn) {
  const data = readDB();
  const rows = data[table] || [];
  return filterFn ? rows.filter(filterFn) : rows;
}

function getById(table, id) {
  const data = readDB();
  return (data[table] || []).find((row) => row.id === Number(id));
}

function create(table, payload) {
  const data = readDB();
  const id = nextId(data, table);
  const now = new Date().toISOString();
  const row = { id, ...payload, created_at: now, updated_at: now };
  data[table].push(row);
  writeDB(data);
  return row;
}

function update(table, id, payload) {
  const data = readDB();
  const idx = data[table].findIndex((row) => row.id === Number(id));
  if (idx === -1) return null;
  const now = new Date().toISOString();
  data[table][idx] = {
    ...data[table][idx],
    ...payload,
    id: data[table][idx].id, // id tidak boleh berubah
    updated_at: now
  };
  writeDB(data);
  return data[table][idx];
}

function remove(table, id) {
  const data = readDB();
  const idx = data[table].findIndex((row) => row.id === Number(id));
  if (idx === -1) return false;
  data[table].splice(idx, 1);
  writeDB(data);
  return true;
}

module.exports = { getAll, getById, create, update, remove, readDB, writeDB };
