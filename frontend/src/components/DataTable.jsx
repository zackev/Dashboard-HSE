import { Pencil, Trash2, ListChecks } from 'lucide-react';
import Badge from './Badge.jsx';

function formatNumber(n) {
  return (Number(n) || 0).toLocaleString('id-ID');
}

function renderCell(col, row, onJsaClick) {
  if (col.jsaColumn) {
    const count = Array.isArray(row.jsa) ? row.jsa.length : 0;
    if (count === 0) {
      return <span className="text-xs italic text-muted">Belum diisi</span>;
    }
    return (
      <button
        type="button"
        onClick={() => onJsaClick?.(row)}
        className="inline-flex items-center gap-1 text-xs font-semibold text-good underline decoration-dotted underline-offset-2 hover:text-good/80"
        title="Lihat detail JSA"
      >
        <ListChecks size={13} />
        {count} langkah
      </button>
    );
  }

  if (col.render) {
    const result = col.render(row);
    if (result && typeof result === 'object') {
      if (result.type === 'link') {
        return (
          <a
            href={result.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-info hover:underline"
          >
            {result.text}
          </a>
        );
      }
      if (result.type === 'empty') {
        return <span className="text-xs italic text-muted">{result.text}</span>;
      }
    }
    return result;
  }

  let val = row[col.key];
  if (col.truncate && typeof val === 'string' && val.length > 40) val = val.slice(0, 40) + '…';
  if (col.format === 'number') val = formatNumber(val);
  if (col.badge) return <Badge kind={col.badge} value={val} />;

  return val === '' || val === undefined || val === null ? '-' : val;
}

export default function DataTable({ cfg, rows, loading, onEdit, onDelete, onJsaClick }) {
  const colCount = cfg.columns.length + 1;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            {cfg.columns.map((col) => (
              <th
                key={col.key}
                className="whitespace-nowrap border-b border-border px-2.5 py-2 text-left text-[11.5px] font-bold uppercase tracking-wide text-muted"
              >
                {col.label}
              </th>
            ))}
            <th className="w-[90px] border-b border-border px-2.5 py-2 text-left text-[11.5px] font-bold uppercase tracking-wide text-muted">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={colCount} className="px-2.5 py-8 text-center text-muted">
                Memuat data...
              </td>
            </tr>
          )}
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={colCount} className="px-2.5 py-8 text-center text-muted">
                Belum ada data {cfg.labelPlural}. Klik &quot;Tambah Data&quot; untuk mulai.
              </td>
            </tr>
          )}
          {!loading &&
            rows.map((row) => (
              <tr key={row.id} className="hover:bg-white/[0.02]">
                {cfg.columns.map((col) => (
                  <td
                    key={col.key}
                    className={`border-b border-border px-2.5 py-2.5 align-top ${col.numeric ? 'font-mono text-right' : ''}`}
                  >
                    {renderCell(col, row, onJsaClick)}
                  </td>
                ))}
                <td className="border-b border-border px-2.5 py-2.5 align-top">
                  <div className="flex gap-1.5">
                    <button className="btn-icon" title="Edit" onClick={() => onEdit(row)}>
                      <Pencil size={14} />
                    </button>
                    <button
                      className="btn-icon btn-icon-danger"
                      title="Hapus"
                      onClick={() => onDelete(row)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
