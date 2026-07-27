import { useEffect, useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';

function emptyJsaRow() {
  return { step: '', hazard: '', control: '' };
}

export default function FormModal({ cfg, initialData, isEdit, onClose, onSubmit }) {
  const [values, setValues] = useState({});
  const [file, setFile] = useState(null);
  const [jsaRows, setJsaRows] = useState([emptyJsaRow()]);
  const showToast = useToast();

  useEffect(() => {
    const initial = {};
    cfg.fields.forEach((f) => {
      if (f.type === 'computed') return; // bukan field beneran, cuma tampilan
      initial[f.key] = initialData[f.key] ?? f.default ?? '';
    });
    setValues(initial);
    setFile(null);

    if (cfg.hasJsa) {
      const existing = Array.isArray(initialData.jsa) && initialData.jsa.length ? initialData.jsa : [emptyJsaRow()];
      setJsaRows(existing.map((r) => ({ step: r.step || '', hazard: r.hazard || '', control: r.control || '' })));
    }
  }, [cfg, initialData]);

  function setField(key, val) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  function updateJsaRow(index, key, val) {
    setJsaRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: val } : row)));
  }
  function addJsaRow() {
    setJsaRows((prev) => [...prev, emptyJsaRow()]);
  }
  function removeJsaRow(index) {
    setJsaRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (cfg.hasJsa) {
      const filled = jsaRows.filter((r) => r.step.trim() || r.hazard.trim() || r.control.trim());
      const complete = filled.filter((r) => r.step.trim());
      if (complete.length === 0) {
        showToast('JSA wajib diisi minimal 1 baris (Langkah Kerja) sebelum ijin kerja bisa diajukan.', true);
        return;
      }
      onSubmit(values, file, filled);
      return;
    }

    onSubmit(values, file);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface shadow-modal">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-bold">
            {isEdit ? `Edit ${cfg.label}` : `Tambah ${cfg.label}`}
          </h2>
          <button className="text-2xl leading-none text-muted hover:text-ink" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-3.5 px-6 py-4">
            {cfg.fields.map((f) => (
              <div key={f.key}>
                <label className="field-label" htmlFor={`f-${f.key}`}>
                  {f.label}
                </label>

                {f.type === 'computed' && (
                  <div className="rounded-lg border border-dashed border-brand-yellow/40 bg-surface2 px-3 py-2 font-mono text-[13.5px] text-brand-yellow">
                    {f.compute(values)}
                  </div>
                )}

                {f.type === 'file' && (
                  <>
                    <input
                      id={`f-${f.key}`}
                      type="file"
                      className="field-input file:mr-3 file:rounded-md file:border-0 file:bg-surface file:px-3 file:py-1.5 file:text-ink"
                      required={f.required && !isEdit}
                      onChange={(e) => setFile(e.target.files[0] || null)}
                    />
                    {isEdit && initialData.file_path && (
                      <div className="mt-1.5 text-[11.5px] text-muted">
                        File saat ini:{' '}
                        <a
                          className="font-semibold text-info hover:underline"
                          href={initialData.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {initialData.file_name || 'lihat file'}
                        </a>{' '}
                        &middot; unggah file baru untuk mengganti.
                      </div>
                    )}
                  </>
                )}

                {f.type === 'select' && (
                  <select
                    id={`f-${f.key}`}
                    className="field-input"
                    required={f.required}
                    value={values[f.key] ?? ''}
                    onChange={(e) => setField(f.key, e.target.value)}
                  >
                    {f.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                {f.type === 'textarea' && (
                  <textarea
                    id={`f-${f.key}`}
                    className="field-input min-h-[70px] resize-y"
                    required={f.required}
                    value={values[f.key] ?? ''}
                    onChange={(e) => setField(f.key, e.target.value)}
                  />
                )}

                {!['file', 'select', 'textarea', 'computed'].includes(f.type) && (
                  <input
                    id={`f-${f.key}`}
                    type={f.type}
                    className="field-input"
                    required={f.required}
                    value={values[f.key] ?? ''}
                    onChange={(e) => setField(f.key, e.target.value)}
                  />
                )}
              </div>
            ))}

            {cfg.hasJsa && (
              <div className="mt-1 rounded-lg border border-border bg-surface2/40 p-3.5">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-ink">Job Safety Analysis (JSA)</h3>
                  <span className="text-[11px] text-muted">Wajib diisi minimal 1 baris</span>
                </div>
                <p className="mb-3 text-[11.5px] text-muted">
                  Rinci setiap langkah kerja beserta potensi bahaya &amp; risikonya, dan langkah pengendaliannya sebelum ijin kerja bisa diajukan.
                </p>

                <div className="flex flex-col gap-3">
                  {jsaRows.map((row, i) => (
                    <div key={i} className="rounded-lg border border-border bg-surface p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wide text-muted">Langkah #{i + 1}</span>
                        <button
                          type="button"
                          className="btn-icon btn-icon-danger h-6 w-6"
                          title="Hapus baris"
                          onClick={() => removeJsaRow(i)}
                          disabled={jsaRows.length === 1}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div>
                          <label className="field-label !mb-1 !text-[10.5px]">Langkah Kerja</label>
                          <textarea
                            className="field-input min-h-[44px] resize-y text-[13px]"
                            value={row.step}
                            onChange={(e) => updateJsaRow(i, 'step', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="field-label !mb-1 !text-[10.5px]">Potensi Bahaya &amp; Risiko</label>
                          <textarea
                            className="field-input min-h-[44px] resize-y text-[13px]"
                            value={row.hazard}
                            onChange={(e) => updateJsaRow(i, 'hazard', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="field-label !mb-1 !text-[10.5px]">Langkah Pengendalian</label>
                          <textarea
                            className="field-input min-h-[44px] resize-y text-[13px]"
                            value={row.control}
                            onChange={(e) => updateJsaRow(i, 'control', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn btn-ghost mt-3 flex items-center gap-1.5 text-[12.5px]"
                  onClick={addJsaRow}
                >
                  <Plus size={14} /> Tambah Baris
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2.5 border-t border-border px-6 py-4">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
