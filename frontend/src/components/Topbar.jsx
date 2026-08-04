import { Search } from "lucide-react";

export default function Topbar({
  title,
  subtitle,
  showAdd,
  onAdd,
  search,
  onSearchChange,
  right,
}) {
  return (
    <header className="mb-5 flex flex-wrap items-start justify-between gap-5">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight">{title}</h1>
        <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2.5">
        {showAdd && (
          <div className="flex w-[220px] items-center gap-2 rounded-[10px] border border-border bg-surface px-3 py-2 max-sm:w-full">
            <Search size={15} className="text-muted" />
            <input
              type="text"
              placeholder="Cari data..."
              className="w-full bg-transparent text-[13px] outline-none"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}
        {showAdd && onAdd && (
          <button
            className="btn btn-primary whitespace-nowrap !text-white"
            onClick={onAdd}
          >
            + Tambah Data
          </button>
        )}
        {right}
      </div>
    </header>
  );
}
