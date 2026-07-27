/**
 * routes/hsePerformance.js
 * -------------------------------------------------------------------------
<<<<<<< HEAD
 * Modul HSE Performance: data HARIAN (per tanggal) — tenaga kerja hadir
 * (L/P), jam kerja normal per hari, dan jumlah kasus. Ada 2 hal yang
 * dihitung otomatis oleh server (tidak diinput manual):
 *
 * 1. MAN-HOUR HARI ITU
 *    Man-Hour = Jumlah Tenaga Kerja Hadir x Jam Kerja Normal per Hari
 *    Contoh: 10 Juni 2026, 100 orang hadir, jam kerja normal 8 jam/hari
 *            -> Man-Hour = 100 x 8 = 800
 *
 * 2. MAN-HOUR KUMULATIF & INDIKATOR (FR, SR, TRIR, LTIF)
 *    Setiap baris diurutkan berdasarkan tanggal, lalu dijumlahkan berjalan
 *    (running total) dari tanggal paling awal yang tercatat sampai baris
 *    tersebut. FR/SR/TRIR/LTIF dihitung dari angka KUMULATIF ini (bukan
 *    cuma data hari itu saja), karena itu praktik standar pelaporan HSE:
 *    rate yang bermakna dihitung dari akumulasi jam kerja & kasus, bukan
 *    dari satu hari saja (1 hari 800 jam kerja terlalu kecil untuk basis
 *    per-juta jam kerja).
 *
 *   FR   (Frequency Rate) = (Kumulatif LTI x 1.000.000) / Kumulatif Man-Hour
 *   SR   (Severity Rate)  = (Kumulatif Hari Hilang x 1.000.000) / Kumulatif Man-Hour
 *   TRIR                  = (Kumulatif Recordable Cases x 200.000) / Kumulatif Man-Hour
 *   LTIF                  = sama dengan FR (istilah lain untuk metrik yang sama)
 *
 *   Recordable Cases = Medical Treatment Case + Restricted Work Case +
 *                       Lost Time Incident + Fatality (First Aid Case &
 *                       Near Miss tidak dihitung recordable, konvensi umum).
 *
 * Basis kumulatif dihitung dari tanggal paling awal yang ada di data ini
 * (bukan reset per bulan/tahun). Kalau perusahaan Anda perlu reset per
 * tahun berjalan, tinggal filter rows berdasarkan tahun sebelum dihitung.
=======
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
>>>>>>> 405c9e708fa4a23d2ad6570c0fb57fb21d597f56
 * -------------------------------------------------------------------------
 */

const express = require('express');
const db = require('../db/database');

const router = express.Router();
const TABLE = 'hse_performance';

const ILO_BASE = 1000000;
const OSHA_BASE = 200000;
<<<<<<< HEAD
const DEFAULT_WORKING_HOURS = 8;
=======
>>>>>>> 405c9e708fa4a23d2ad6570c0fb57fb21d597f56

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

<<<<<<< HEAD
/**
 * Ambil semua raw rows, urutkan naik berdasarkan tanggal, lalu tempelkan
 * hasil hitung (man-hour hari itu, kumulatif, dan FR/SR/TRIR/LTIF) ke
 * setiap baris. Dipakai bareng oleh endpoint list & detail supaya baris
 * manapun yang diminta tetap konsisten dengan urutan tanggal keseluruhan.
 */
function computeAll(rawRows) {
  const sorted = [...rawRows].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  let cumManHours = 0;
  let cumLti = 0;
  let cumLostDays = 0;
  let cumRecordable = 0;

  return sorted.map((row) => {
    const male = Number(row.male_workers) || 0;
    const female = Number(row.female_workers) || 0;
    const workingHours = Number(row.working_hours) || DEFAULT_WORKING_HOURS;
    const lti = Number(row.lost_time_incident) || 0;
    const lostDays = Number(row.lost_days) || 0;
    const mtc = Number(row.medical_treatment_case) || 0;
    const rwc = Number(row.restricted_work_case) || 0;
    const fatality = Number(row.fatality) || 0;

    const manHoursToday = (male + female) * workingHours;
    const recordableToday = mtc + rwc + lti + fatality;

    cumManHours += manHoursToday;
    cumLti += lti;
    cumLostDays += lostDays;
    cumRecordable += recordableToday;

    const fr = cumManHours > 0 ? (cumLti * ILO_BASE) / cumManHours : 0;
    const sr = cumManHours > 0 ? (cumLostDays * ILO_BASE) / cumManHours : 0;
    const trir = cumManHours > 0 ? (cumRecordable * OSHA_BASE) / cumManHours : 0;
    const ltif = fr;

    return {
      ...row,
      working_hours: workingHours,
      total_workers: male + female,
      man_hours_today: manHoursToday,
      man_hours_cumulative: cumManHours,
      total_recordable_cases: recordableToday,
      cumulative_lti: cumLti,
      cumulative_lost_days: cumLostDays,
      cumulative_recordable_cases: cumRecordable,
      fr: round2(fr),
      sr: round2(sr),
      trir: round2(trir),
      ltif: round2(ltif)
    };
  });
}

router.get('/', (req, res) => {
  let rows = computeAll(db.getAll(TABLE));
=======
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
>>>>>>> 405c9e708fa4a23d2ad6570c0fb57fb21d597f56
  const { q } = req.query;
  if (q) {
    const needle = q.toLowerCase();
    rows = rows.filter((r) => JSON.stringify(r).toLowerCase().includes(needle));
  }
<<<<<<< HEAD
  // Tampilkan terbaru dulu di tabel (walau perhitungan kumulatifnya tetap dari yang paling awal)
  rows = [...rows].reverse();
=======
  rows = [...rows].sort((a, b) => (a.period < b.period ? 1 : -1));
>>>>>>> 405c9e708fa4a23d2ad6570c0fb57fb21d597f56
  res.json({ data: rows, total: rows.length });
});

router.get('/:id', (req, res) => {
<<<<<<< HEAD
  const all = computeAll(db.getAll(TABLE));
  const row = all.find((r) => r.id === Number(req.params.id));
  if (!row) return res.status(404).json({ error: 'Data HSE Performance tidak ditemukan' });
  res.json({ data: row });
});

router.post('/', (req, res) => {
  const required = ['date', 'male_workers', 'female_workers'];
=======
  const row = db.getById(TABLE, req.params.id);
  if (!row) return res.status(404).json({ error: 'Data HSE Performance tidak ditemukan' });
  res.json({ data: computeMetrics(row) });
});

router.post('/', (req, res) => {
  const required = ['period', 'man_hours'];
>>>>>>> 405c9e708fa4a23d2ad6570c0fb57fb21d597f56
  const missing = required.filter((f) => req.body[f] === undefined || req.body[f] === '');
  if (missing.length) {
    return res.status(400).json({ error: `Field wajib diisi: ${missing.join(', ')}` });
  }
<<<<<<< HEAD
  const payload = { ...req.body, working_hours: req.body.working_hours || DEFAULT_WORKING_HOURS };
  delete payload.man_hours; // selalu dihitung server, bukan diterima dari client
  const row = db.create(TABLE, payload);

  const all = computeAll(db.getAll(TABLE));
  const enriched = all.find((r) => r.id === row.id);
  res.status(201).json({ data: enriched });
});

router.put('/:id', (req, res) => {
  const payload = { ...req.body };
  delete payload.man_hours;
  const row = db.update(TABLE, req.params.id, payload);
  if (!row) return res.status(404).json({ error: 'Data HSE Performance tidak ditemukan' });

  const all = computeAll(db.getAll(TABLE));
  const enriched = all.find((r) => r.id === row.id);
  res.json({ data: enriched });
=======
  const row = db.create(TABLE, req.body);
  res.status(201).json({ data: computeMetrics(row) });
});

router.put('/:id', (req, res) => {
  const row = db.update(TABLE, req.params.id, req.body);
  if (!row) return res.status(404).json({ error: 'Data HSE Performance tidak ditemukan' });
  res.json({ data: computeMetrics(row) });
>>>>>>> 405c9e708fa4a23d2ad6570c0fb57fb21d597f56
});

router.delete('/:id', (req, res) => {
  const ok = db.remove(TABLE, req.params.id);
  if (!ok) return res.status(404).json({ error: 'Data HSE Performance tidak ditemukan' });
  res.json({ data: true });
});

<<<<<<< HEAD
module.exports = { router, computeAll, ILO_BASE, OSHA_BASE, DEFAULT_WORKING_HOURS };
=======
module.exports = { router, computeMetrics, ILO_BASE, OSHA_BASE };
>>>>>>> 405c9e708fa4a23d2ad6570c0fb57fb21d597f56
