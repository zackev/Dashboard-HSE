import { useCallback, useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  Users,
  Clock,
  AlertTriangle,
  AlertCircle,
  User,
  FileCheck2,
  FileText,
  Send,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { api } from "../lib/api.js";
import { useToast } from "../context/ToastContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import StatCard from "../components/StatCard.jsx";
import Badge from "../components/Badge.jsx";
import DashboardToolbar from "../components/DashboardToolbar";

const INCIDENT_SUMMARY_COLORS = {
  "Near Miss": "#4d9fec",
  "First Aid": "#3fb27f",
  "Medical Treatment": "#f2a93b",
  "Lost Time Injury": "#e5484d",
};

const PTW_STATUS_COLORS = {
  Draft: "#8d98a3",
  Submitted: "#f2a93b",
  Approved: "#4d9fec",
  Active: "#3fb27f",
  Closed: "#8d98a3",
  Rejected: "#e5484d",
};

function formatNumber(n) {
  return (Number(n) || 0).toLocaleString("id-ID");
}

export default function Dashboard({ refreshKey }) {
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    period: "this_month",
    startDate: null,

    endDate: null,
  });
  const showToast = useToast();
  const { theme } = useTheme();
  const { user } = useAuth();
  const isLight = theme === "light";

  // Warna chart menyesuaikan tema aktif, supaya tooltip/grid/label tetap
  // kebaca baik di mode terang maupun gelap.
  const chartTheme = {
    tooltipBg: isLight ? "#ffffff" : "#222932",
    tooltipBorder: isLight ? "#e0e4e9" : "#2b333c",
    tooltipText: isLight ? "#171c21" : "#e9edf1",
    tick: isLight ? "#5f6a75" : "#8d98a3",
    grid: isLight ? "#e0e4e9" : "#2b333c",
  };
  const tooltipStyle = {
    background: chartTheme.tooltipBg,
    border: `1px solid ${chartTheme.tooltipBorder}`,
    borderRadius: 8,
    color: chartTheme.tooltipText,
  };

  // Backend menerima start_date/end_date (snake_case), state filter di FE
  // pakai startDate/endDate (camelCase) -> di-mapping di sini saja supaya
  // penamaan di UI tetap konsisten dengan konvensi React yang sudah ada.
  const queryParams = {
    period: filters.period,
    start_date: filters.startDate,
    end_date: filters.endDate,
  };

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/stats", { params: queryParams });
      setStats(data);
    } catch (err) {
      showToast(err.message, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showToast, filters.period, filters.startDate, filters.endDate]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  function handleExport(format) {
    const raw = { format, ...queryParams };
    const usp = new URLSearchParams();
    Object.entries(raw).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        usp.append(key, value);
      }
    });
    // GET biasa (bukan fetch) supaya browser langsung download filenya;
    // cookie sesi Sanctum ikut terkirim otomatis karena same-origin (proxy Vite).
    window.open(`/api/stats/export?${usp.toString()}`, "_blank");
  }

  if (!stats) {
    return <p className="text-muted">Memuat dashboard...</p>;
  }

  if (stats.scope === "employee") {
    return <EmployeeDashboard stats={stats} userName={user?.name} />;
  }

  const incidentSummaryData = [
    { name: "Near Miss", value: stats.incidentSummary.nearMiss },
    { name: "First Aid", value: stats.incidentSummary.firstAid },
    {
      name: "Medical Treatment",
      value: stats.incidentSummary.medicalTreatment,
    },
    { name: "Lost Time Injury", value: stats.incidentSummary.lostTimeInjury },
  ];

  const ptwStatusData = Object.entries(stats.ptwStatus).map(
    ([name, value]) => ({ name, value }),
  );

  const compliance = stats.trainingCompliance;
  const radialData = [
    { name: "Compliance", value: compliance.percent, fill: "#3fb27f" },
  ];
  const totalIcons = 8;
  const filledIcons = Math.round((compliance.percent / 100) * totalIcons);

  return (
    <>
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">Dashboard</h1>

          <p className="mt-0.5 text-[13px] text-muted">
            Ringkasan kondisi K3 hari ini
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {
            <DashboardToolbar
              filters={filters}
              setFilters={setFilters}
              onRefresh={load}
              onExport={handleExport}
            />
          }

          {/* nanti Refresh */}

          {/* nanti Export */}
        </div>
      </div>

      <div className="mb-5 grid grid-cols-4 gap-4 max-md:grid-cols-2 max-sm:grid-cols-1">
        <StatCard
          icon={<Users size={18} />}
          label="Total Manpower"
          value={formatNumber(stats.manpower.total)}
          foot="Orang"
          accent="blue"
        />
        <StatCard
          icon={<Clock size={18} />}
          label="Safe Man Hours"
          value={formatNumber(stats.manpower.safeManHours)}
          foot="Jam (kumulatif)"
          accent="green"
        />
        <StatCard
          icon={<AlertTriangle size={18} />}
          label="Total Incident"
          value={stats.totals.incidents}
          foot="Kasus"
          accent="red"
        />
        <StatCard
          icon={<AlertCircle size={18} />}
          label="Near Miss"
          value={stats.incidentSummary.nearMiss}
          foot="Kasus (kumulatif)"
          accent="orange"
        />
      </div>

      <div className="mb-5 grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        <div className="panel !mb-0">
          <h3 className="mb-3.5 text-sm font-semibold">Incident Summary</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie
                  data={incidentSummaryData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {incidentSummaryData.map((d) => (
                    <Cell key={d.name} fill={INCIDENT_SUMMARY_COLORS[d.name]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <ul className="flex flex-col gap-2 text-[12.5px]">
              {incidentSummaryData.map((d) => (
                <li key={d.name} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: INCIDENT_SUMMARY_COLORS[d.name] }}
                  />
                  <span className="text-muted">{d.name}</span>
                  <span className="ml-auto font-mono font-bold">{d.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="panel !mb-0">
          <h3 className="mb-3.5 text-sm font-semibold">Safety Inspection</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats.safetyInspectionTrend}>
              <CartesianGrid stroke={chartTheme.grid} vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: chartTheme.tick, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: chartTheme.tick, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12, color: chartTheme.tick }} />
              <Line
                type="monotone"
                dataKey="inspection"
                name="Inspection"
                stroke="#4d9fec"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="finding"
                name="Finding"
                stroke="#e5484d"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
          {stats.safetyInspectionTrend.length === 0 && (
            <p className="mt-2 text-center text-xs text-muted">
              Belum ada data inspeksi untuk ditampilkan.
            </p>
          )}
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        <div className="panel !mb-0">
          <h3 className="mb-3.5 text-sm font-semibold">PTW Status</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie
                  data={ptwStatusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {ptwStatusData.map((d) => (
                    <Cell
                      key={d.name}
                      fill={PTW_STATUS_COLORS[d.name] || "#8d98a3"}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <ul className="flex flex-col gap-2 text-[12.5px]">
              {ptwStatusData.map((d) => (
                <li key={d.name} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      background: PTW_STATUS_COLORS[d.name] || "#8d98a3",
                    }}
                  />
                  <span className="text-muted">{d.name}</span>
                  <span className="ml-auto font-mono font-bold">{d.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="panel !mb-0">
          <h3 className="mb-3.5 text-sm font-semibold">Training Compliance</h3>
          <div className="flex items-center gap-5">
            <div className="relative h-[140px] w-[140px] flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="75%"
                  outerRadius="100%"
                  data={radialData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    dataKey="value"
                    cornerRadius={20}
                    background={{ fill: "rgb(var(--color-border))" }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold">
                  {compliance.percent}%
                </span>
                <span className="text-[10.5px] text-muted">Compliant</span>
              </div>
            </div>
            <div>
              <div className="mb-2.5 flex flex-wrap gap-1.5">
                {Array.from({ length: totalIcons }).map((_, i) => (
                  <User
                    key={i}
                    size={18}
                    className={i < filledIcons ? "text-good" : "text-border"}
                  />
                ))}
              </div>
              <p className="text-[12px] text-muted">
                {compliance.completed} dari {compliance.total} pelatihan selesai
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function EmployeeDashboard({ stats, userName }) {
  const { totals, recentPermits } = stats;

  return (
    <>
      <div>
        <h1 className="text-[22px] font-bold tracking-tight">
          Halo, {userName?.split(" ")[0] || "Karyawan"} 👋
        </h1>
        <p className="mt-0.5 mb-5 text-[13px] text-muted">
          Ringkasan Ijin Kerja & dokumen SOP milikmu
        </p>
      </div>

      <div className="mb-5 grid grid-cols-4 gap-4 max-md:grid-cols-2 max-sm:grid-cols-1">
        <StatCard
          icon={<FileCheck2 size={18} />}
          label="Total Ijin Kerja"
          value={totals.myPermits}
          foot="Diajukan"
          accent="blue"
        />
        <StatCard
          icon={<Send size={18} />}
          label="Menunggu Persetujuan"
          value={totals.myPermitsSubmitted}
          foot="Submitted"
          accent="orange"
        />
        <StatCard
          icon={<CheckCircle2 size={18} />}
          label="Disetujui / Aktif"
          value={totals.myPermitsApproved}
          foot="Approved/Active"
          accent="green"
        />
        <StatCard
          icon={<XCircle size={18} />}
          label="Ditolak"
          value={totals.myPermitsRejected}
          foot="Rejected"
          accent="red"
        />
      </div>

      <div className="panel">
        <div className="mb-3.5 flex items-center gap-2">
          <FileText size={16} className="text-brand-orange" />
          <h3 className="text-sm font-semibold">Dokumen SOP Aktif</h3>
          <span className="ml-auto font-mono text-sm font-bold">
            {totals.sopDocuments}
          </span>
        </div>
        <p className="text-[12.5px] text-muted">
          Lihat daftar lengkapnya di menu <strong>Dokumen SOP</strong> di
          sidebar.
        </p>
      </div>

      <div className="panel">
        <h3 className="mb-3.5 text-sm font-semibold">Ijin Kerja Terbaru</h3>
        {recentPermits.length === 0 ? (
          <p className="text-[12.5px] text-muted">
            Kamu belum pernah mengajukan ijin kerja.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {recentPermits.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-[10px] border border-border bg-surface2/40 px-3.5 py-2.5"
              >
                <div>
                  <div className="text-[13px] font-semibold">
                    {p.permit_no} &middot; {p.type}
                  </div>
                  <div className="text-[11.5px] text-muted">
                    {p.location} &middot; {p.valid_from} s/d {p.valid_to}
                  </div>
                </div>
                <Badge kind="status" value={p.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
