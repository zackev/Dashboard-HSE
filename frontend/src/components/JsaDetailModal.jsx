import { X, ListChecks } from 'lucide-react';

export default function JsaDetailModal({ permit, onClose }) {
  if (!permit) return null;
  const rows = Array.isArray(permit.jsa) ? permit.jsa : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface shadow-modal">
        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold">
              <ListChecks size={18} className="text-brand-yellow" />
              Detail JSA &mdash; {permit.permit_no}
            </h2>
            <p className="mt-1 text-[12.5px] text-muted">
              {permit.type} &middot; {permit.location}
            </p>
          </div>
          <button className="text-2xl leading-none text-muted hover:text-ink" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          {rows.length === 0 ? (
            <p className="text-sm italic text-muted">Belum ada data JSA untuk ijin kerja ini.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {rows.map((row, i) => (
                <div key={i} className="rounded-lg border border-border bg-surface2 p-4">
                  <div className="mb-3 text-xs font-extrabold uppercase tracking-wide text-brand-yellow">
                    Langkah #{i + 1}
                  </div>
                  <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <dt className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-muted">
                        Langkah Kerja
                      </dt>
                      <dd className="whitespace-pre-wrap text-[13px] text-ink">{row.step || '-'}</dd>
                    </div>
                    <div>
                      <dt className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-muted">
                        Potensi Bahaya &amp; Risiko
                      </dt>
                      <dd className="whitespace-pre-wrap text-[13px] text-ink">{row.hazard || '-'}</dd>
                    </div>
                    <div>
                      <dt className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-muted">
                        Langkah Pengendalian
                      </dt>
                      <dd className="whitespace-pre-wrap text-[13px] text-ink">{row.control || '-'}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-border px-6 py-4">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
