import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import Topbar from '../components/Topbar.jsx';
import DataTable from '../components/DataTable.jsx';
import FormModal from '../components/FormModal.jsx';
import JsaDetailModal from '../components/JsaDetailModal.jsx';

export default function CrudPage({ moduleKey, cfg, title, subtitle, onDataChanged, extraTop }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalState, setModalState] = useState(null); // { isEdit, data }
  const [jsaDetailRow, setJsaDetailRow] = useState(null); // baris permit yang lagi dilihat detail JSA-nya
  const showToast = useToast();

  const load = useCallback(
    async (q = '') => {
      setLoading(true);
      try {
        const qs = q ? `?q=${encodeURIComponent(q)}` : '';
        const { data } = await api.get(`/${moduleKey}${qs}`);
        setRows(data);
      } catch (err) {
        showToast(err.message, true);
      } finally {
        setLoading(false);
      }
    },
    [moduleKey, showToast]
  );

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleKey]);

  useEffect(() => {
    const t = setTimeout(() => load(search), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function openCreate() {
    setModalState({ isEdit: false, data: {} });
  }
  function openEdit(row) {
    setModalState({ isEdit: true, data: row });
  }
  function closeModal() {
    setModalState(null);
  }

  async function handleSubmit(values, file, jsaRows) {
    try {
      const id = modalState.isEdit ? modalState.data.id : null;

      if (cfg.hasFile) {
        const formData = new FormData();
        Object.entries(values).forEach(([k, v]) => formData.append(k, v));
        if (file) formData.append('file', file);
        if (id) {
          await api.putForm(`/${moduleKey}/${id}`, formData);
        } else {
          await api.postForm(`/${moduleKey}`, formData);
        }
      } else {
        const payload = {};
        cfg.fields.forEach((f) => {
          if (f.type === 'computed') return;
          payload[f.key] = f.type === 'number' ? Number(values[f.key] || 0) : values[f.key];
        });
        if (cfg.hasJsa) payload.jsa = jsaRows;

        if (id) {
          await api.putJson(`/${moduleKey}/${id}`, payload);
        } else {
          await api.postJson(`/${moduleKey}`, payload);
        }
      }

      showToast(id ? 'Perubahan berhasil disimpan.' : 'Data baru berhasil ditambahkan.');
      closeModal();
      load(search);
      onDataChanged?.();
    } catch (err) {
      showToast(err.message, true);
    }
  }

  async function handleDelete(row) {
    const label = row.title || row.kpi_name || row.permit_no || row.date || 'data ini';
    if (!window.confirm(`Hapus "${label}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      await api.del(`/${moduleKey}/${row.id}`);
      showToast('Data berhasil dihapus.');
      load(search);
      onDataChanged?.();
    } catch (err) {
      showToast(err.message, true);
    }
  }

  return (
    <>
      <Topbar
        title={title}
        subtitle={subtitle}
        showAdd
        onAdd={openCreate}
        search={search}
        onSearchChange={setSearch}
      />
      {extraTop}
      <div className="panel">
        <DataTable
          cfg={cfg}
          rows={rows}
          loading={loading}
          onEdit={openEdit}
          onDelete={handleDelete}
          onJsaClick={cfg.hasJsa ? setJsaDetailRow : undefined}
        />
      </div>

      {modalState && (
        <FormModal
          cfg={cfg}
          initialData={modalState.data}
          isEdit={modalState.isEdit}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}

      {cfg.hasJsa && jsaDetailRow && (
        <JsaDetailModal permit={jsaDetailRow} onClose={() => setJsaDetailRow(null)} />
      )}
    </>
  );
}
