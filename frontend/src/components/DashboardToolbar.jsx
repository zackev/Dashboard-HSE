import { Calendar, RotateCw, Download } from "lucide-react";

const EXPORT_FORMATS = [
  { value: "xlsx", label: "Excel (.xlsx)" },
  { value: "csv", label: "CSV" },
  { value: "pdf", label: "PDF" },
];

export default function DashboardToolbar({
  filters,
  setFilters,
  onRefresh,
  onExport,
}) {
  const isCustom = filters.period === "custom";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Period */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
        <Calendar size={16} />

        <select
          className="bg-transparent text-sm text-ink outline-none"
          value={filters.period}
          onChange={(e) =>
            setFilters({
              ...filters,
              period: e.target.value,
            })
          }
        >
          <option className="bg-surface text-ink" value="today">
            Today
          </option>
          <option className="bg-surface text-ink" value="yesterday">
            Yesterday
          </option>
          <option className="bg-surface text-ink" value="this_week">
            This Week
          </option>
          <option className="bg-surface text-ink" value="last_week">
            Last Week
          </option>
          <option className="bg-surface text-ink" value="this_month">
            This Month
          </option>
          <option className="bg-surface text-ink" value="last_month">
            Last Month
          </option>
          <option className="bg-surface text-ink" value="this_year">
            This Year
          </option>
          <option className="bg-surface text-ink" value="custom">
            Custom Range...
          </option>
        </select>
      </div>

      {/* Custom range date pickers - hanya tampil kalau period === 'custom' */}
      {isCustom && (
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2">
          <input
            type="date"
            className="bg-transparent text-sm outline-none"
            value={filters.startDate || ""}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
          />
          <span className="text-muted">-</span>
          <input
            type="date"
            className="bg-transparent text-sm text-ink outline-none"
            value={filters.endDate || ""}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
          />
        </div>
      )}

      <div className="ml-auto flex gap-2">
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm transition hover:bg-surface2"
        >
          <RotateCw size={16} />
          Refresh
        </button>

        {/* Export: pilih format lalu langsung download, mengikuti filter periode yang aktif */}
        <div className="flex items-center gap-2 rounded-lg bg-brand-orange px-3 py-2 text-sm font-medium text-white transition hover:opacity-90">
          <Download size={16} />
          <select
            className="bg-transparent text-sm text-white  outline-none [&>option]:text-ink"
            defaultValue=""
            onChange={(e) => {
              const format = e.target.value;
              if (format) {
                onExport(format);
                e.target.value = "";
              }
            }}
          >
            <option value="" disabled>
              Export
            </option>
            {EXPORT_FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
