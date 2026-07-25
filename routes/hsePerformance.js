/**
 * routes/hsePerformance.js
 * -------------------------------------------------------------------------
 * Modul HSE Performance: data bulanan (tenaga kerja, jam kerja orang, dan
 * jumlah kasus) plus perhitungan otomatis indikator standar K3:
 *
 *   FR   (Frequency Rate)        = (Lost Time Incident x 1.000.000) / Jam Kerja Orang
 *   SR   (Severity Rate)         = (Jumlah Hari Hilang x 1.000.000) / Jam Kerja Orang
 *   TRIR (Total Recordable
 *         Incident Rate)         = (Total Recordable Cases x 200.000) / Jam Kerja Orang
 *   LTIF (Lost Time Injury
 *         Frequency)             = (Lost Time Incident x 1.000.000) / Jam Kerja Orang
 *
 * Catatan metodologi (supaya transparan, bukan black box):
 *  - FR & SR memakai basis 1.000.000 jam kerja orang, mengikuti konvensi
 *    ILO / Permenaker No. 5 Tahun 2018 yang umum dipakai di Indonesia.
 *  - TRIR memakai basis 200.000 jam kerja orang, mengikuti konvensi OSHA
 *    (setara 100 pekerja x 40 jam/minggu x 50 minggu) yang paling umum
 *    dipakai secara internasional untuk recordable case rate.
 *  - Total Recordable Cases = Medical Treatment Case + Restricted Work Case
 *    + Lost Time Incident + Fatality (First Aid Case & Near Miss TIDAK
 *    dihitung sebagai recordable case, sesuai konvensi umum).
 *  - LTIF di sini menggunakan rumus yang sama dengan FR (LTI x 1.000.000 /
 *    jam kerja orang) karena keduanya memang mengacu pada metrik yang sama
 *    (frekuensi kecelakaan hilang waktu kerja); ditampilkan sebagai dua
 *    kartu terpisah karena keduanya lazim disebut dengan istilah berbeda
 *    dalam laporan HSE di Indonesia.
 *
 * Jika perusahaan Anda memakai basis/definisi berbeda, angka BASE di bawah
 * ini bisa disesuaikan.
 * -------------------------------------------------------------------------
 */

const express = require('express');
const db = require('../db/database');

const router = express.Router();
const TABLE = 'hse_performance';

const ILO_BASE = 1000000;
const OSHA_BASE = 200000;

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function computeMetrics(row) {
  const manHours = Number(row.man_hours) || 0;
  const lti = Number(row.lost_time_incident) || 0;
  const lostDays = Number(row.lost_days) || 0;
  const mtc = Number(row.medical_treatment_case) || 0;
  const rwc = Number(row.restricted_work_case) || 0;
  const fatality = Number(row.fatality) || 0;
  const recordableCases = mtc + rwc + lti + fatality;

  const fr = manHours > 0 ? (lti * ILO_BASE) / manHours : 0;
  const sr = manHours > 0 ? (lostDays * ILO_BASE) / manHours : 0;
  const trir = manHours > 0 ? (recordableCases * OSHA_BASE) / manHours : 0;
  const ltif = fr;

  return {
    ...row,
    total_workers: (Number(row.male_workers) || 0) + (Number(row.female_workers) || 0),
    total_recordable_cases: recordableCases,
    fr: round2(fr),
    sr: round2(sr),
    trir: round2(trir),
    ltif: round2(ltif)
  };
}

router.get('/', (req, res) => {
  let rows = db.getAll(TABLE).map(computeMetrics);
  const { q } = req.query;
  if (q) {
    const needle = q.toLowerCase();
    rows = rows.filter((r) => JSON.stringify(r).toLowerCase().includes(needle));
  }
  rows = [...rows].sort((a, b) => (a.period < b.period ? 1 : -1));
  res.json({ data: rows, total: rows.length });
});

router.get('/:id', (req, res) => {
  const row = db.getById(TABLE, req.params.id);
  if (!row) return res.status(404).json({ error: 'Data HSE Performance tidak ditemukan' });
  res.json({ data: computeMetrics(row) });
});

router.post('/', (req, res) => {
  const required = ['period', 'man_hours'];
  const missing = required.filter((f) => req.body[f] === undefined || req.body[f] === '');
  if (missing.length) {
    return res.status(400).json({ error: `Field wajib diisi: ${missing.join(', ')}` });
  }
  const row = db.create(TABLE, req.body);
  res.status(201).json({ data: computeMetrics(row) });
});

router.put('/:id', (req, res) => {
  const row = db.update(TABLE, req.params.id, req.body);
  if (!row) return res.status(404).json({ error: 'Data HSE Performance tidak ditemukan' });
  res.json({ data: computeMetrics(row) });
});

router.delete('/:id', (req, res) => {
  const ok = db.remove(TABLE, req.params.id);
  if (!ok) return res.status(404).json({ error: 'Data HSE Performance tidak ditemukan' });
  res.json({ data: true });
});

module.exports = { router, computeMetrics, ILO_BASE, OSHA_BASE };
