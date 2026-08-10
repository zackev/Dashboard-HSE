import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { api } from "../lib/api.js";
import { useToast } from "../context/ToastContext.jsx";

const WORK_TYPES = ["Hot Work", "Cold Work", "Confined Space", "Working at Height", "Electrical", "Excavation", "Lifting"];

function emptyJsaRow() {
  return { step: "", hazard: "", control: "" };
}
function emptyWorkerRow() {
  return { role: "", qty: "" };
}
function emptyEquipmentRow() {
  return { category: "Alat", name: "", qty: "" };
}

const emptyForm = {
  permit_no: "",
  type: WORK_TYPES[0],
  location: "",
  work_description: "",
  valid_from: "",
  valid_to: "",
  start_time: "",
  end_time: "",
  area: "",
  plant: "",
  area_manager_name: "",
  area_manager_phone: "",
  requester_phone: "",
  supervisor_name: "",
  supervisor_phone: "",
  safety_officer_name: "",
  safety_officer_phone: "",
  requester_company: "",
  work_classifications: [],
  safety_equipment: [],
};

export default function PermitFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const showToast = useToast();

  const [options, setOptions] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [jsaRows, setJsaRows] = useState([emptyJsaRow()]);
  const [workerRows, setWorkerRows] = useState([emptyWorkerRow()]);
  const [equipmentRows, setEquipmentRows] = useState([emptyEquipmentRow()]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/permits/form-options").then(({ data }) => setOptions(data));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/permits/${id}`).then(({ data }) => {
      setForm({ ...emptyForm, ...data });
      setJsaRows(data.jsa?.length ? data.jsa : [emptyJsaRow()]);
      setWorkerRows(data.workers?.length ? data.workers : [emptyWorkerRow()]);
      setEquipmentRows(data.equipment?.length ? data.equipment : [emptyEquipmentRow()]);
    });
  }, [id, isEdit]);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleMulti(key, value) {
    setForm((f) => {
      const current = f[key] || [];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...f, [key]: next };
    });
  }

  function updateRow(rows, setRows, index, key, value) {
    setRows(rows.map((r, i) => (i === index ? { ...r, [key]: value } : r)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        jsa: jsaRows.filter((r) => r.step.trim() || r.hazard.trim() || r.control.trim()),
        workers: workerRows.filter((r) => r.role.trim()),
        equipment: equipmentRows.filter((r) => r.name.trim()),
      };
      if (isEdit) {
        await api.putJson(`/permits/${id}`, payload);
        showToast("Ijin kerja berhasil diperbarui.");
      } else {
        await api.postJson("/permits", payload);
        showToast("Ijin kerja berhasil diajukan.");
      }
      navigate("/permits");
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setSaving(false);
    }
  }

  if (!options) return <p className="text-muted">Memuat form...</p>;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-10">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight">
          {isEdit ? "Edit Ijin Kerja" : "Ajukan Ijin Kerja Baru"}
        </h1>
        <p className="mt-0.5 text-[13px] text-muted">Surat Izin Pekerjaan Resiko Tinggi</p>
      </div>

      {/* A. Klasifikasi Pekerjaan */}
      <div className="panel !mb-0">
        <h3 className="mb-3 text-sm font-bold">A. Klasifikasi Pekerjaan</h3>
        <div className="flex flex-wrap gap-2">
          {options.work_classifications.map((c) => (
            <label
              key={c}
              className={`flex cursor-pointer items-center gap-1.5 rounded-[8px] border px-2.5 py-1.5 text-[12px] font-semibold ${
                form.work_classifications.includes(c)
                  ? "border-brand-orange/50 bg-brand-orangedim text-brand-yellow"
                  : "border-border bg-surface2 text-muted hover:text-ink"
              }`}
            >
              <input
                type="checkbox"
                className="accent-brand-orange"
                checked={form.work_classifications.includes(c)}
                onChange={() => toggleMulti("work_classifications", c)}
              />
              {c}
            </label>
          ))}
        </div>
      </div>

      {/* B. Informasi Pekerjaan */}
      <div className="panel !mb-0">
        <h3 className="mb-3 text-sm font-bold">B. Informasi Pekerjaan</h3>
        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          <input className="field-input" placeholder="Nomor Ijin Kerja *" required value={form.permit_no} onChange={(e) => setField("permit_no", e.target.value)} />
          <select className="field-input" value={form.type} onChange={(e) => setField("type", e.target.value)}>
            {WORK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <textarea className="field-input col-span-2 max-md:col-span-1" placeholder="Deskripsi Pekerjaan" rows={2} value={form.work_description} onChange={(e) => setField("work_description", e.target.value)} />
          <input className="field-input" placeholder="Lokasi *" required value={form.location} onChange={(e) => setField("location", e.target.value)} />
          <input className="field-input" placeholder="Area" value={form.area} onChange={(e) => setField("area", e.target.value)} />
          <input className="field-input" placeholder="Plant" value={form.plant} onChange={(e) => setField("plant", e.target.value)} />
          <input className="field-input" placeholder="Perusahaan Pemohon" value={form.requester_company} onChange={(e) => setField("requester_company", e.target.value)} />
          <input className="field-input" placeholder="Nama Manajer Area" value={form.area_manager_name} onChange={(e) => setField("area_manager_name", e.target.value)} />
          <input className="field-input" placeholder="Telp Manajer Area" value={form.area_manager_phone} onChange={(e) => setField("area_manager_phone", e.target.value)} />
          <input className="field-input" placeholder="Telp Pemohon (Anda)" value={form.requester_phone} onChange={(e) => setField("requester_phone", e.target.value)} />
          <input className="field-input" placeholder="Nama Pengawas" value={form.supervisor_name} onChange={(e) => setField("supervisor_name", e.target.value)} />
          <input className="field-input" placeholder="Telp Pengawas" value={form.supervisor_phone} onChange={(e) => setField("supervisor_phone", e.target.value)} />
          <input className="field-input" placeholder="Nama Petugas K3" value={form.safety_officer_name} onChange={(e) => setField("safety_officer_name", e.target.value)} />
          <input className="field-input" placeholder="Telp Petugas K3" value={form.safety_officer_phone} onChange={(e) => setField("safety_officer_phone", e.target.value)} />
          <input type="date" className="field-input" required value={form.valid_from} onChange={(e) => setField("valid_from", e.target.value)} title="Berlaku Dari" />
          <input type="date" className="field-input" required value={form.valid_to} onChange={(e) => setField("valid_to", e.target.value)} title="Berlaku Sampai" />
          <input type="time" className="field-input" required value={form.start_time} onChange={(e) => setField("start_time", e.target.value)} title="Mulai Jam" />
          <input type="time" className="field-input" required value={form.end_time} onChange={(e) => setField("end_time", e.target.value)} title="Sampai Jam" />
        </div>

        {/* Daftar Pekerja */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-muted">Daftar Pekerja</span>
            <button type="button" className="btn-icon" onClick={() => setWorkerRows([...workerRows, emptyWorkerRow()])}>
              <Plus size={14} />
            </button>
          </div>
          {workerRows.map((row, i) => (
            <div key={i} className="mb-1.5 flex gap-2">
              <input className="field-input flex-1" placeholder="Role (mis. Welder)" value={row.role} onChange={(e) => updateRow(workerRows, setWorkerRows, i, "role", e.target.value)} />
              <input className="field-input w-24" type="number" min="0" placeholder="Jumlah" value={row.qty} onChange={(e) => updateRow(workerRows, setWorkerRows, i, "qty", e.target.value)} />
              <button type="button" className="btn-icon btn-icon-danger" disabled={workerRows.length === 1} onClick={() => setWorkerRows(workerRows.filter((_, idx) => idx !== i))}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* C. Perlengkapan Kerja */}
      <div className="panel !mb-0">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold">C. Perlengkapan Kerja</h3>
          <button type="button" className="btn-icon" onClick={() => setEquipmentRows([...equipmentRows, emptyEquipmentRow()])}>
            <Plus size={14} />
          </button>
        </div>
        {equipmentRows.map((row, i) => (
          <div key={i} className="mb-1.5 flex gap-2">
            <select className="field-input w-36" value={row.category} onChange={(e) => updateRow(equipmentRows, setEquipmentRows, i, "category", e.target.value)}>
              {options.equipment_categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input className="field-input flex-1" placeholder="Nama alat/mesin/material" value={row.name} onChange={(e) => updateRow(equipmentRows, setEquipmentRows, i, "name", e.target.value)} />
            <input className="field-input w-24" type="number" min="0" placeholder="Jumlah" value={row.qty} onChange={(e) => updateRow(equipmentRows, setEquipmentRows, i, "qty", e.target.value)} />
            <button type="button" className="btn-icon btn-icon-danger" disabled={equipmentRows.length === 1} onClick={() => setEquipmentRows(equipmentRows.filter((_, idx) => idx !== i))}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* D. Keselamatan Kerja (JSA) */}
      <div className="panel !mb-0">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold">D. Keselamatan Kerja (JSA)</h3>
          <button type="button" className="btn-icon" onClick={() => setJsaRows([...jsaRows, emptyJsaRow()])}>
            <Plus size={14} />
          </button>
        </div>
        {jsaRows.map((row, i) => (
          <div key={i} className="mb-1.5 flex gap-2">
            <input className="field-input flex-1" placeholder="Aktivitas" value={row.step} onChange={(e) => updateRow(jsaRows, setJsaRows, i, "step", e.target.value)} />
            <input className="field-input flex-1" placeholder="Potensi Bahaya" value={row.hazard} onChange={(e) => updateRow(jsaRows, setJsaRows, i, "hazard", e.target.value)} />
            <input className="field-input flex-1" placeholder="Langkah Aman" value={row.control} onChange={(e) => updateRow(jsaRows, setJsaRows, i, "control", e.target.value)} />
            <button type="button" className="btn-icon btn-icon-danger" disabled={jsaRows.length === 1} onClick={() => setJsaRows(jsaRows.filter((_, idx) => idx !== i))}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* E. Peralatan Keselamatan */}
      <div className="panel !mb-0">
        <h3 className="mb-3 text-sm font-bold">E. Peralatan Keselamatan</h3>
        {Object.entries(options.safety_equipment_groups).map(([group, items]) => (
          <div key={group} className="mb-3 last:mb-0">
            <div className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-muted">{group}</div>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <label
                  key={item}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-[8px] border px-2.5 py-1.5 text-[12px] font-semibold ${
                    form.safety_equipment.includes(item)
                      ? "border-brand-orange/50 bg-brand-orangedim text-brand-yellow"
                      : "border-border bg-surface2 text-muted hover:text-ink"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="accent-brand-orange"
                    checked={form.safety_equipment.includes(item)}
                    onChange={() => toggleMulti("safety_equipment", item)}
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2.5">
        <button type="submit" disabled={saving} className="btn btn-primary !text-white">
          {saving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Ajukan Ijin Kerja"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => navigate("/permits")}>
          Batal
        </button>
      </div>
    </form>
  );
}
