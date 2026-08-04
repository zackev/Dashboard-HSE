import { useEffect, useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { api } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import Topbar from '../components/Topbar.jsx';

export default function SopDocuments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const showToast = useToast();

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const qs = search ? `?q=${encodeURIComponent(search)}` : '';
        const { data } = await api.get(`/documents-sop${qs}`);
        setRows(data);
      } catch (err) {
        showToast(err.message, true);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [search, showToast]);

  return (
    <>
      <Topbar
        title="Dokumen SOP"
        subtitle="Kebijakan & prosedur K3 yang berlaku — hanya untuk dibaca"
        showAdd
        onAdd={undefined}
        search={search}
        onSearchChange={setSearch}
      />

      <div className="panel">
        {loading && <p className="px-1 py-6 text-center text-sm text-muted">Memuat dokumen...</p>}
        {!loading && rows.length === 0 && (
          <p className="px-1 py-6 text-center text-sm text-muted">Belum ada dokumen SOP yang tersedia.</p>
        )}
        {!loading && rows.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {rows.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between gap-3 rounded-[10px] border border-border bg-surface2/40 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-brand-orange" />
                  <div>
                    <div className="text-[13.5px] font-semibold">{doc.title}</div>
                    <div className="text-[11.5px] text-muted">
                      {doc.doc_number} &middot; {doc.revision} &middot; Terbit {doc.issue_date}
                    </div>
                  </div>
                </div>
                {doc.file_path ? (
                  <a
                    href={doc.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost flex items-center gap-1.5 text-[12.5px]"
                  >
                    <Download size={14} /> Unduh
                  </a>
                ) : (
                  <span className="text-xs italic text-muted">Belum ada file</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
