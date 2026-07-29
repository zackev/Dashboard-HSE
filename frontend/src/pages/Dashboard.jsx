import { useCallback, useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from 'recharts';
import { api } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import StatCard from '../components/StatCard.jsx';
import Badge from '../components/Badge.jsx';

const SEVERITY_COLORS = { Low: '#3fb27f', Medium: '#f2a93b', High: '#e5484d' };
const CAPA_COLORS = { Open: '#e5484d', 'In Progress': '#f2a93b', Done: '#3fb27f' };
const GENDER_COLORS = ['#4d9fec', '#ff6a13'];

function toChartData(obj, colorMap, fallback = '#8d98a3') {
  return Object.entries(obj).map(([name, value]) => ({ name, value, color: colorMap[name] || fallback }));
}

export default function Dashboard({ refreshKey }) {
  const [stats, setStats] = useState(null);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const showToast = useToast();

  const load = useCallback(async () => {
    try {
      const [{ data: s }, { data: incidents }] = await Promise.all([
        api.get('/stats'),
        api.get('/incidents')
      ]);
      setStats(s);
      setRecentIncidents(incidents.slice(0, 5));
    } catch (err) {
      showToast(err.message, true);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  if (!stats) {
    return <p className="text-muted">Memuat dashboard...</p>;
  }

  const perf = stats.hsePerformance.latest;
  const severityData = toChartData(stats.incidentsBySeverity, SEVERITY_COLORS);
  const capaData = toChartData(stats.capaByStatus, CAPA_COLORS);
  const genderData = [
    { name: 'Laki-laki', value: perf ? Number(perf.male_workers) || 0 : 0 },
    { name: 'Perempuan', value: perf ? Number(perf.female_workers) || 0 : 0 }
  ];
  const trend = stats.hsePerformance.trend;

  return (
    <>
      <div>
        <h1 className="text-[22px] font-bold tracking-tight">Dashboard</h1>
        <p className="mt-0.5 mb-5 text-[13px] text-muted">Ringkasan kondisi K3 hari ini</p>
      </div>

      <div className="mb-5 grid grid-cols-4 gap-4 max-md:grid-cols-2 max-sm:grid-cols-1">
        <StatCard label="Total Incidents" value={stats.totals.incidents} foot={`${stats.totals.openIncidents} masih terbuka`} accent="orange" />
        <StatCard label="Inspections" value={stats.totals.inspections} foot="total tercatat" accent="blue" />
        <StatCard label="Trainings" value={stats.totals.trainings} foot={`${stats.trainingParticipants} peserta total`} accent="green" />
        <StatCard label="CAPA Terbuka" value={stats.totals.openCapa} foot={`dari ${stats.totals.capa} total`} accent="red" />
      </div>

      <div className="mb-3 mt-6 flex items-baseline gap-2 border-t border-border pt-1.5 text-xs font-extrabold uppercase tracking-wide text-muted">
        HSE Performance
        {perf && <span className="font-semibold normal-case tracking-normal text-brand-yellow">per {perf.date} (kumulatif)</span>}
      </div>
      <div className="mb-5 grid grid-cols-4 gap-4 max-md:grid-cols-2 max-sm:grid-cols-1">
        <StatCard label="FR (Frequency Rate)" value={perf ? perf.fr : 0} foot="per 1.000.000 jam kerja" accent="blue" />
        <StatCard label="SR (Severity Rate)" value={perf ? perf.sr : 0} foot="per 1.000.000 jam kerja" accent="green" />
        <StatCard label="TRIR" value={perf ? perf.trir : 0} foot="per 200.000 jam kerja" accent="orange" />
        <StatCard label="LTIF" value={perf ? perf.ltif : 0} foot="per 1.000.000 jam kerja" accent="red" />
      </div>

      <div className="mb-5 grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        <div className="panel !mb-0">
          <h3 className="mb-3.5 text-sm font-semibold">Incidents berdasarkan Severity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={severityData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
                {severityData.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#222932', border: '1px solid #2b333c', borderRadius: 8, color: '#e9edf1' }} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#8d98a3' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="panel !mb-0">
          <h3 className="mb-3.5 text-sm font-semibold">Status CAPA</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={capaData}>
              <CartesianGrid stroke="#2b333c" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#8d98a3', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8d98a3', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#222932', border: '1px solid #2b333c', borderRadius: 8, color: '#e9edf1' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {capaData.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        <div className="panel !mb-0">
          <h3 className="mb-3.5 text-sm font-semibold">Tenaga Kerja Hadir (Tanggal Terbaru)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={genderData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
                {genderData.map((d, i) => (
                  <Cell key={d.name} fill={GENDER_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#222932', border: '1px solid #2b333c', borderRadius: 8, color: '#e9edf1' }} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#8d98a3' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="panel !mb-0">
          <h3 className="mb-3.5 text-sm font-semibold">Tren TRIR &amp; LTIF per Tanggal (Kumulatif)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend}>
              <CartesianGrid stroke="#2b333c" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#8d98a3', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8d98a3', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#222932', border: '1px solid #2b333c', borderRadius: 8, color: '#e9edf1' }} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#8d98a3' }} />
              <Line type="monotone" dataKey="trir" name="TRIR" stroke="#ff6a13" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="ltif" name="LTIF" stroke="#4d9fec" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel">
        <h3 className="mb-3.5 text-sm font-semibold">Snapshot Kepatuhan</h3>
        <div className="grid grid-cols-4 gap-3.5 max-md:grid-cols-2">
          <MiniStat value={stats.totals.activePermits} label="Ijin Kerja Aktif" />
          <MiniStat value={stats.totals.expiringPermits} label="Ijin Kerja Segera Berakhir" />
          <MiniStat value={`${stats.totals.kpiAchieved}/${stats.totals.kpis}`} label="KPI Tercapai" />
          <MiniStat value={stats.totals.docsExpiringSoon + stats.totals.docsExpired} label="Dokumen Perlu Perhatian" />
        </div>
      </div>

      <div className="panel">
        <h3 className="mb-3.5 text-sm font-semibold">Incidents Terbaru</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                {['Judul', 'Severity', 'Lokasi', 'Tanggal', 'Status'].map((h) => (
                  <th key={h} className="border-b border-border px-2.5 py-2 text-left text-[11.5px] font-bold uppercase tracking-wide text-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentIncidents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-2.5 py-6 text-center text-muted">Belum ada data incident.</td>
                </tr>
              )}
              {recentIncidents.map((r) => (
                <tr key={r.id}>
                  <td className="border-b border-border px-2.5 py-2.5">{r.title}</td>
                  <td className="border-b border-border px-2.5 py-2.5"><Badge kind="status" value={r.severity} /></td>
                  <td className="border-b border-border px-2.5 py-2.5">{r.location || '-'}</td>
                  <td className="border-b border-border px-2.5 py-2.5">{r.date}</td>
                  <td className="border-b border-border px-2.5 py-2.5"><Badge kind="status" value={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function MiniStat({ value, label }) {
  return (
    <div className="rounded-lg border border-border bg-surface2 p-3.5 text-center">
      <span className="block font-mono text-[22px] font-extrabold">{value}</span>
      <span className="mt-1 block text-[11px] text-muted">{label}</span>
    </div>
  );
}
