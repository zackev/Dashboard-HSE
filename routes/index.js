const express = require('express');
const makeCrudRouter = require('./crudFactory');
const db = require('../db/database');
<<<<<<< HEAD
const { router: hsePerformanceRouter, computeAll } = require('./hsePerformance');
const documentsRouter = require('./documents');
const permitsRouter = require('./permits');
=======
const { router: hsePerformanceRouter, computeMetrics } = require('./hsePerformance');
const documentsRouter = require('./documents');
>>>>>>> 405c9e708fa4a23d2ad6570c0fb57fb21d597f56

const router = express.Router();

// ---- CRUD per modul HSE ----
router.use('/incidents', makeCrudRouter('incidents', ['title', 'type', 'severity', 'location', 'date']));
router.use('/inspections', makeCrudRouter('inspections', ['title', 'area', 'inspector', 'date']));
router.use('/trainings', makeCrudRouter('trainings', ['title', 'trainer', 'date']));
router.use('/capa', makeCrudRouter('capa', ['title', 'type', 'pic', 'due_date']));
router.use('/hse_performance', hsePerformanceRouter);
<<<<<<< HEAD
router.use('/permits', permitsRouter);
=======
router.use('/permits', makeCrudRouter('permits', ['permit_no', 'type', 'location', 'valid_from', 'valid_to', 'status']));
>>>>>>> 405c9e708fa4a23d2ad6570c0fb57fb21d597f56
router.use('/kpis', makeCrudRouter('kpis', ['kpi_name', 'category', 'period', 'target', 'status']));
router.use('/documents', documentsRouter);

// ---- Statistik ringkas untuk dashboard ----
router.get('/stats', (req, res) => {
  const incidents = db.getAll('incidents');
  const inspections = db.getAll('inspections');
  const trainings = db.getAll('trainings');
  const capa = db.getAll('capa');
  const permits = db.getAll('permits');
  const kpis = db.getAll('kpis');
  const documents = db.getAll('documents');
<<<<<<< HEAD
  const hsePerf = computeAll(db.getAll('hse_performance')); // sudah terurut naik berdasarkan tanggal
=======
  const hsePerf = db.getAll('hse_performance').map(computeMetrics).sort((a, b) => (a.period > b.period ? 1 : -1));
>>>>>>> 405c9e708fa4a23d2ad6570c0fb57fb21d597f56

  const countBy = (rows, key) =>
    rows.reduce((acc, r) => {
      const k = r[key] || 'Unknown';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});

  const today = new Date();
  const in30days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const latestPerf = hsePerf.length ? hsePerf[hsePerf.length - 1] : null;
<<<<<<< HEAD
  const trend = hsePerf.slice(-14).map((p) => ({
    date: p.date, fr: p.fr, sr: p.sr, trir: p.trir, ltif: p.ltif
=======
  const trend = hsePerf.slice(-12).map((p) => ({
    period: p.period, fr: p.fr, sr: p.sr, trir: p.trir, ltif: p.ltif
>>>>>>> 405c9e708fa4a23d2ad6570c0fb57fb21d597f56
  }));

  const activePermits = permits.filter((p) => p.status === 'Active').length;
  const expiringPermits = permits.filter((p) => {
    if (!p.valid_to) return false;
    const d = new Date(p.valid_to);
    return d >= today && d <= in30days && p.status !== 'Closed' && p.status !== 'Rejected';
  }).length;

  const kpiAchieved = kpis.filter((k) => k.status === 'Achieved').length;

  const docsExpiringSoon = documents.filter((d) => {
    if (!d.expiry_date) return false;
    const exp = new Date(d.expiry_date);
    return exp >= today && exp <= in30days;
  }).length;
  const docsExpired = documents.filter((d) => d.expiry_date && new Date(d.expiry_date) < today).length;

  res.json({
    data: {
      totals: {
        incidents: incidents.length,
        inspections: inspections.length,
        trainings: trainings.length,
        capa: capa.length,
        openIncidents: incidents.filter((i) => i.status !== 'Closed').length,
        openCapa: capa.filter((c) => c.status !== 'Closed' && c.status !== 'Done').length,
        permits: permits.length,
        activePermits,
        expiringPermits,
        kpis: kpis.length,
        kpiAchieved,
        documents: documents.length,
        docsExpiringSoon,
        docsExpired
      },
      incidentsBySeverity: countBy(incidents, 'severity'),
      incidentsByStatus: countBy(incidents, 'status'),
      capaByStatus: countBy(capa, 'status'),
      trainingParticipants: trainings.reduce((sum, t) => sum + (Number(t.participants) || 0), 0),
      hsePerformance: {
        latest: latestPerf,
        trend
      }
    }
  });
});

module.exports = router;
