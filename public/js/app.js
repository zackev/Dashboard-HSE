/**
 * public/js/app.js
 * -------------------------------------------------------------------------
 * Vanilla JS SPA kecil untuk HSE Command.
 * Semua data lewat REST API di /api/* (lihat routes/ di server).
 * Modul: incidents, inspections, trainings, capa, hse_performance,
 *        permits, kpis, documents.
 * -------------------------------------------------------------------------
 */

const API = '/api';

/* ---------------------------------------------------------------------
 * Pemetaan status/severity -> "tone" visual (good/warning/bad/neutral).
 * Menambah modul baru dengan istilah status baru cukup nambah baris di sini,
 * tidak perlu nambah CSS baru.
 * --------------------------------------------------------------------- */
const STATUS_TONE = {
  // umum / incidents / inspections / trainings / capa
  Open: 'bad', 'In Progress': 'warning', Closed: 'good', Completed: 'good',
  Scheduled: 'neutral', Done: 'good', Cancelled: 'bad',
  // severity
  Low: 'good', Medium: 'warning', High: 'bad',
  // permits (ijin kerja)
  Draft: 'neutral', Submitted: 'warning', Approved: 'good', Active: 'good', Rejected: 'bad', Expired: 'bad',
  // documents
  'Under Review': 'warning', Obsolete: 'bad',
  // kpi
  'On Track': 'good', Achieved: 'good', 'Not Achieved': 'bad', 'At Risk': 'warning'
};

/* ---------------------------------------------------------------------
 * Konfigurasi per modul: field form, kolom tabel, dsb.
 * Menambah modul baru cukup menambah 1 entry di sini + endpoint di server.
 * --------------------------------------------------------------------- */
const MODULES = {
  incidents: {
    label: 'Incident',
    labelPlural: 'Incidents',
    columns: [
      { key: 'title', label: 'Judul' },
      { key: 'type', label: 'Tipe', badge: 'type' },
      { key: 'severity', label: 'Severity', badge: 'status' },
      { key: 'location', label: 'Lokasi' },
      { key: 'date', label: 'Tanggal' },
      { key: 'reported_by', label: 'Pelapor' },
      { key: 'status', label: 'Status', badge: 'status' }
    ],
    fields: [
      { key: 'title', label: 'Judul Kejadian', type: 'text', required: true },
      { key: 'type', label: 'Tipe', type: 'select', options: ['Near Miss', 'Unsafe Act', 'Unsafe Condition', 'Hazard', 'Accident'], required: true },
      { key: 'severity', label: 'Severity', type: 'select', options: ['Low', 'Medium', 'High'], required: true },
      { key: 'location', label: 'Lokasi', type: 'text', required: true },
      { key: 'date', label: 'Tanggal Kejadian', type: 'date', required: true },
      { key: 'reported_by', label: 'Dilaporkan Oleh', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Open', 'In Progress', 'Closed'], required: true },
      { key: 'description', label: 'Deskripsi', type: 'textarea' }
    ]
  },
  inspections: {
    label: 'Inspection',
    labelPlural: 'Inspections',
    columns: [
      { key: 'title', label: 'Judul' },
      { key: 'area', label: 'Area' },
      { key: 'inspector', label: 'Inspektor' },
      { key: 'date', label: 'Tanggal' },
      { key: 'status', label: 'Status', badge: 'status' },
      { key: 'findings', label: 'Temuan', truncate: true }
    ],
    fields: [
      { key: 'title', label: 'Judul Inspeksi', type: 'text', required: true },
      { key: 'area', label: 'Area', type: 'text', required: true },
      { key: 'inspector', label: 'Inspektor', type: 'text', required: true },
      { key: 'date', label: 'Tanggal', type: 'date', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Scheduled', 'In Progress', 'Completed'], required: true },
      { key: 'findings', label: 'Temuan', type: 'textarea' }
    ]
  },
  trainings: {
    label: 'Training',
    labelPlural: 'Trainings',
    columns: [
      { key: 'title', label: 'Judul' },
      { key: 'trainer', label: 'Trainer' },
      { key: 'date', label: 'Tanggal' },
      { key: 'participants', label: 'Peserta' },
      { key: 'status', label: 'Status', badge: 'status' }
    ],
    fields: [
      { key: 'title', label: 'Judul Pelatihan', type: 'text', required: true },
      { key: 'trainer', label: 'Trainer / Instruktur', type: 'text', required: true },
      { key: 'date', label: 'Tanggal', type: 'date', required: true },
      { key: 'participants', label: 'Jumlah Peserta', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'], required: true },
      { key: 'notes', label: 'Catatan', type: 'textarea' }
    ]
  },
  capa: {
    label: 'CAPA',
    labelPlural: 'CAPA',
    columns: [
      { key: 'title', label: 'Judul' },
      { key: 'related_to', label: 'Terkait' },
      { key: 'type', label: 'Tipe', badge: 'type' },
      { key: 'pic', label: 'PIC' },
      { key: 'due_date', label: 'Jatuh Tempo' },
      { key: 'status', label: 'Status', badge: 'status' }
    ],
    fields: [
      { key: 'title', label: 'Judul Tindakan', type: 'text', required: true },
      { key: 'related_to', label: 'Terkait dengan (mis. nama incident)', type: 'text' },
      { key: 'type', label: 'Tipe', type: 'select', options: ['Corrective', 'Preventive'], required: true },
      { key: 'pic', label: 'PIC (Penanggung Jawab)', type: 'text', required: true },
      { key: 'due_date', label: 'Jatuh Tempo', type: 'date', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Open', 'In Progress', 'Done'], required: true }
    ]
  },
  hse_performance: {
    label: 'Data HSE Performance',
    labelPlural: 'HSE Performance',
    dateKey: 'period',
    columns: [
      { key: 'period', label: 'Periode' },
      {
        key: '_gender', label: 'Tenaga Kerja (L/P)',
        render: (r) => `${r.male_workers ?? 0} / ${r.female_workers ?? 0}`
      },
      { key: 'man_hours', label: 'Jam Kerja Orang', format: 'number' },
      { key: 'near_miss', label: 'Near Miss' },
      { key: 'first_aid_case', label: 'FAC' },
      { key: 'medical_treatment_case', label: 'MTC' },
      { key: 'restricted_work_case', label: 'RWC' },
      { key: 'property_damage', label: 'Property Damage' },
      { key: 'lost_time_incident', label: 'LTI' },
      { key: 'fatality', label: 'Fatality' },
      { key: 'fr', label: 'FR', numeric: true },
      { key: 'sr', label: 'SR', numeric: true },
      { key: 'trir', label: 'TRIR', numeric: true },
      { key: 'ltif', label: 'LTIF', numeric: true }
    ],
    fields: [
      { key: 'period', label: 'Periode (Bulan)', type: 'month', required: true },
      { key: 'male_workers', label: 'Tenaga Kerja Hadir - Laki-laki', type: 'number' },
      { key: 'female_workers', label: 'Tenaga Kerja Hadir - Perempuan', type: 'number' },
      { key: 'man_hours', label: 'Jam Kerja Orang (Man-Hours)', type: 'number', required: true },
      { key: 'near_miss', label: 'Near Miss', type: 'number' },
      { key: 'first_aid_case', label: 'First Aid Case (FAC)', type: 'number' },
      { key: 'medical_treatment_case', label: 'Medical Treatment Case (MTC)', type: 'number' },
      { key: 'restricted_work_case', label: 'Restricted Work Case (RWC)', type: 'number' },
      { key: 'property_damage', label: 'Property Damage', type: 'number' },
      { key: 'lost_time_incident', label: 'Lost Time Incident (LTI)', type: 'number' },
      { key: 'lost_days', label: 'Jumlah Hari Hilang (untuk SR)', type: 'number' },
      { key: 'fatality', label: 'Fatality', type: 'number' },
      { key: 'notes', label: 'Catatan', type: 'textarea' }
    ]
  },
  permits: {
    label: 'Ijin Kerja',
    labelPlural: 'Ijin Kerja',
    dateKey: 'valid_from',
    columns: [
      { key: 'permit_no', label: 'No. Ijin' },
      { key: 'type', label: 'Tipe', badge: 'type' },
      { key: 'location', label: 'Lokasi' },
      { key: 'valid_from', label: 'Berlaku Dari' },
      { key: 'valid_to', label: 'Berlaku Sampai' },
      { key: 'requested_by', label: 'Diajukan Oleh' },
      { key: 'status', label: 'Status', badge: 'status' }
    ],
    fields: [
      { key: 'permit_no', label: 'Nomor Ijin Kerja', type: 'text', required: true },
      { key: 'type', label: 'Tipe Pekerjaan', type: 'select', options: ['Hot Work', 'Cold Work', 'Confined Space', 'Working at Height', 'Electrical', 'Excavation', 'Lifting'], required: true },
      { key: 'location', label: 'Lokasi', type: 'text', required: true },
      { key: 'work_description', label: 'Deskripsi Pekerjaan', type: 'textarea' },
      { key: 'requested_by', label: 'Diajukan Oleh', type: 'text' },
      { key: 'approved_by', label: 'Disetujui Oleh', type: 'text' },
      { key: 'valid_from', label: 'Berlaku Dari', type: 'date', required: true },
      { key: 'valid_to', label: 'Berlaku Sampai', type: 'date', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Draft', 'Submitted', 'Approved', 'Active', 'Closed', 'Rejected'], required: true }
    ]
  },
  kpis: {
    label: 'KPI',
    labelPlural: 'KPI',
    dateKey: 'period',
    columns: [
      { key: 'kpi_name', label: 'Nama KPI' },
      { key: 'category', label: 'Kategori', badge: 'type' },
      { key: 'period', label: 'Periode' },
      { key: 'target', label: 'Target' },
      { key: 'actual', label: 'Aktual' },
      { key: 'unit', label: 'Satuan' },
      { key: 'status', label: 'Status', badge: 'status' }
    ],
    fields: [
      { key: 'kpi_name', label: 'Nama KPI', type: 'text', required: true },
      { key: 'category', label: 'Kategori', type: 'select', options: ['Leading', 'Lagging'], required: true },
      { key: 'period', label: 'Periode (mis. 2026, Q3 2026)', type: 'text', required: true },
      { key: 'target', label: 'Target', type: 'number', required: true },
      { key: 'actual', label: 'Aktual', type: 'number' },
      { key: 'unit', label: 'Satuan (mis. %, kasus, rate)', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['On Track', 'At Risk', 'Achieved', 'Not Achieved'], required: true }
    ]
  },
  documents: {
    label: 'Document',
    labelPlural: 'Document',
    hasFile: true,
    dateKey: 'issue_date',
    columns: [
      { key: 'title', label: 'Judul' },
      { key: 'category', label: 'Kategori', badge: 'type' },
      { key: 'doc_number', label: 'No. Dokumen' },
      { key: 'revision', label: 'Revisi' },
      { key: 'issue_date', label: 'Terbit' },
      { key: 'expiry_date', label: 'Kedaluwarsa' },
      { key: 'status', label: 'Status', badge: 'status' },
      {
        key: '_file', label: 'File',
        render: (r) => r.file_path
          ? `<a class="doc-file-link" href="${r.file_path}" target="_blank" rel="noopener">Unduh</a>`
          : `<span class="doc-no-file">Tidak ada file</span>`
      }
    ],
    fields: [
      { key: 'title', label: 'Judul Dokumen', type: 'text', required: true },
      { key: 'category', label: 'Kategori', type: 'select', options: ['Policy', 'Procedure/SOP', 'Certificate', 'Legal Permit', 'Report', 'Other'], required: true },
      { key: 'doc_number', label: 'Nomor Dokumen', type: 'text', required: true },
      { key: 'revision', label: 'Revisi', type: 'text' },
      { key: 'issue_date', label: 'Tanggal Terbit', type: 'date', required: true },
      { key: 'expiry_date', label: 'Tanggal Kedaluwarsa', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Under Review', 'Expired', 'Obsolete'], required: true },
      { key: 'uploaded_by', label: 'Diunggah Oleh', type: 'text' },
      { key: 'file', label: 'File Dokumen', type: 'file' }
    ]
  }
};

let state = {
  currentView: 'dashboard',
  editing: null, // { module, id } saat mode edit, null saat create
  charts: {}
};

/* ---------------------------------------------------------------------
 * Helpers umum
 * --------------------------------------------------------------------- */
async function apiGet(path) {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error((await res.json()).error || 'Gagal memuat data');
  return res.json();
}
async function apiSendJson(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Gagal menyimpan data');
  return json;
}
async function apiSendForm(method, path, formData) {
  const res = await fetch(`${API}${path}`, { method, body: formData });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Gagal menyimpan data');
  return json;
}

function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.toggle('is-error', isError);
  toast.classList.remove('is-hidden');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.add('is-hidden'), 2800);
}

function toneOf(value) {
  return STATUS_TONE[value] || 'neutral';
}
function badgeClass(kind, value) {
  if (kind === 'type') return 'badge badge-type';
  return `badge badge-${toneOf(value)}`;
}
function formatNumber(n) {
  const num = Number(n) || 0;
  return num.toLocaleString('id-ID');
}

/* ---------------------------------------------------------------------
 * Navigasi antar view
 * --------------------------------------------------------------------- */
const VIEW_META = {
  dashboard: ['Dashboard', 'Ringkasan kondisi K3 hari ini'],
  incidents: ['Incidents', 'Catatan kejadian, hazard, dan near miss'],
  inspections: ['Inspections', 'Jadwal & hasil inspeksi K3'],
  trainings: ['Trainings', 'Riwayat & jadwal pelatihan K3'],
  capa: ['CAPA', 'Corrective & Preventive Actions'],
  hse_performance: ['HSE Performance', 'Tenaga kerja, jam kerja orang, kasus, dan indikator SR/FR/TRIR/LTIF'],
  permits: ['Ijin Kerja', 'Work permit: hot work, confined space, working at height, dsb.'],
  kpis: ['KPI', 'Target vs pencapaian indikator kinerja K3'],
  documents: ['Document', 'Kebijakan, SOP, sertifikat, dan dokumen K3 lainnya']
};

function switchView(view) {
  state.currentView = view;
  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.view === view);
  });
  document.querySelectorAll('.view').forEach((section) => {
    section.classList.toggle('is-hidden', section.id !== `view-${view}`);
  });

  const [title, sub] = VIEW_META[view];
  document.getElementById('view-title').textContent = title;
  document.getElementById('view-subtitle').textContent = sub;

  const addBtn = document.getElementById('btn-add');
  addBtn.style.display = view === 'dashboard' ? 'none' : 'inline-block';

  document.getElementById('global-search').value = '';

  if (view === 'dashboard') {
    loadDashboard();
  } else {
    loadTable(view);
  }
}

document.getElementById('nav').addEventListener('click', (e) => {
  const btn = e.target.closest('.nav-item');
  if (btn) switchView(btn.dataset.view);
});

/* ---------------------------------------------------------------------
 * Render tabel generik per modul
 * --------------------------------------------------------------------- */
async function loadTable(moduleKey, query = '') {
  const cfg = MODULES[moduleKey];
  const tbody = document.querySelector(`#table-${moduleKey} tbody`);
  tbody.innerHTML = `<tr class="empty-row"><td colspan="${cfg.columns.length + 1}">Memuat data...</td></tr>`;

  try {
    const qs = query ? `?q=${encodeURIComponent(query)}` : '';
    const { data, total } = await apiGet(`/${moduleKey}${qs}`);
    renderRows(moduleKey, data);
    if (!query) updateNavCount(moduleKey, total);
  } catch (err) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="${cfg.columns.length + 1}">Gagal memuat: ${err.message}</td></tr>`;
  }
}

function renderRows(moduleKey, rows) {
  const cfg = MODULES[moduleKey];
  const tbody = document.querySelector(`#table-${moduleKey} tbody`);

  if (!rows.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="${cfg.columns.length + 1}">Belum ada data ${cfg.labelPlural}. Klik "Tambah Data" untuk mulai.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map((row) => {
    const cells = cfg.columns.map((col) => {
      if (col.render) return `<td>${col.render(row)}</td>`;

      let val = row[col.key] ?? '';
      if (col.truncate && String(val).length > 40) val = String(val).slice(0, 40) + '…';
      if (col.format === 'number') val = formatNumber(val);

      if (col.badge) {
        return `<td><span class="${badgeClass(col.badge, val)}">${escapeHtml(String(val || '-'))}</span></td>`;
      }
      const cls = col.numeric ? ' class="col-numeric"' : '';
      return `<td${cls}>${escapeHtml(String(val === '' || val === undefined ? '-' : val))}</td>`;
    }).join('');

    const titleForConfirm = (row.title || row.kpi_name || row.permit_no || row.period || '').toString().replace(/'/g, "\\'");

    return `
      <tr>
        ${cells}
        <td>
          <div class="row-actions">
            <button class="btn-icon" title="Edit" onclick="openEdit('${moduleKey}', ${row.id})">✎</button>
            <button class="btn-icon danger" title="Hapus" onclick="confirmDelete('${moduleKey}', ${row.id}, '${escapeHtml(titleForConfirm)}')">🗑</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ---------------------------------------------------------------------
 * Nav counts (badge kecil jumlah data di sidebar)
 * --------------------------------------------------------------------- */
async function refreshNavCounts() {
  for (const key of Object.keys(MODULES)) {
    try {
      const { total } = await apiGet(`/${key}`);
      updateNavCount(key, total);
    } catch (_) { /* diamkan, sidebar tetap 0 */ }
  }
}
function updateNavCount(moduleKey, total) {
  if (total === undefined) return;
  const el = document.getElementById(`count-${moduleKey}`);
  if (el) el.textContent = total;
}

/* ---------------------------------------------------------------------
 * Modal: create / edit
 * --------------------------------------------------------------------- */
const overlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalFields = document.getElementById('modal-fields');
const modalForm = document.getElementById('modal-form');

function openCreate() {
  if (state.currentView === 'dashboard') return;
  state.editing = { module: state.currentView, id: null };
  renderModalFields(state.currentView, {}, false);
  modalTitle.textContent = `Tambah ${MODULES[state.currentView].label}`;
  overlay.classList.remove('is-hidden');
}

window.openEdit = async function openEdit(moduleKey, id) {
  try {
    const { data } = await apiGet(`/${moduleKey}/${id}`);
    state.editing = { module: moduleKey, id };
    renderModalFields(moduleKey, data, true);
    modalTitle.textContent = `Edit ${MODULES[moduleKey].label}`;
    overlay.classList.remove('is-hidden');
  } catch (err) {
    showToast(err.message, true);
  }
};

window.confirmDelete = async function confirmDelete(moduleKey, id, title) {
  const ok = window.confirm(`Hapus "${title || 'data ini'}"? Tindakan ini tidak bisa dibatalkan.`);
  if (!ok) return;
  try {
    await apiSendJson('DELETE', `/${moduleKey}/${id}`, {});
    showToast('Data berhasil dihapus.');
    loadTable(moduleKey);
    refreshNavCounts();
    if (state.currentView === 'dashboard') loadDashboard();
  } catch (err) {
    showToast(err.message, true);
  }
};

function renderModalFields(moduleKey, data, isEdit) {
  const cfg = MODULES[moduleKey];
  modalFields.innerHTML = cfg.fields.map((f) => {
    const value = data[f.key] ?? '';

    if (f.type === 'file') {
      const req = f.required && !isEdit ? 'required' : '';
      const currentFileNote = isEdit && data.file_path
        ? `<div class="field-hint">File saat ini: <a class="doc-file-link" href="${data.file_path}" target="_blank" rel="noopener">${escapeHtml(data.file_name || 'lihat file')}</a> &middot; unggah file baru untuk mengganti.</div>`
        : '';
      return `
        <div class="field">
          <label for="f-${f.key}">${f.label}</label>
          <input id="f-${f.key}" name="${f.key}" type="file" ${req} />
          ${currentFileNote}
        </div>`;
    }
    if (f.type === 'select') {
      const options = f.options.map((opt) =>
        `<option value="${opt}" ${opt === value ? 'selected' : ''}>${opt}</option>`
      ).join('');
      return `
        <div class="field">
          <label for="f-${f.key}">${f.label}</label>
          <select id="f-${f.key}" name="${f.key}" ${f.required ? 'required' : ''}>${options}</select>
        </div>`;
    }
    if (f.type === 'textarea') {
      return `
        <div class="field">
          <label for="f-${f.key}">${f.label}</label>
          <textarea id="f-${f.key}" name="${f.key}" ${f.required ? 'required' : ''}>${escapeHtml(String(value))}</textarea>
        </div>`;
    }
    return `
      <div class="field">
        <label for="f-${f.key}">${f.label}</label>
        <input id="f-${f.key}" name="${f.key}" type="${f.type}" value="${escapeHtml(String(value))}" ${f.required ? 'required' : ''} />
      </div>`;
  }).join('');
}

function closeModal() {
  overlay.classList.add('is-hidden');
  state.editing = null;
  modalForm.reset();
}

document.getElementById('btn-add').addEventListener('click', openCreate);
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-cancel').addEventListener('click', closeModal);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

modalForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const { module: moduleKey, id } = state.editing;
  const cfg = MODULES[moduleKey];

  try {
    if (cfg.hasFile) {
      const formData = new FormData();
      cfg.fields.forEach((f) => {
        const el = document.getElementById(`f-${f.key}`);
        if (f.type === 'file') {
          if (el.files[0]) formData.append('file', el.files[0]);
        } else {
          formData.append(f.key, el.value);
        }
      });
      if (id) {
        await apiSendForm('PUT', `/${moduleKey}/${id}`, formData);
        showToast('Perubahan berhasil disimpan.');
      } else {
        await apiSendForm('POST', `/${moduleKey}`, formData);
        showToast('Data baru berhasil ditambahkan.');
      }
    } else {
      const payload = {};
      cfg.fields.forEach((f) => {
        const el = document.getElementById(`f-${f.key}`);
        payload[f.key] = f.type === 'number' ? Number(el.value || 0) : el.value;
      });
      if (id) {
        await apiSendJson('PUT', `/${moduleKey}/${id}`, payload);
        showToast('Perubahan berhasil disimpan.');
      } else {
        await apiSendJson('POST', `/${moduleKey}`, payload);
        showToast('Data baru berhasil ditambahkan.');
      }
    }

    closeModal();
    loadTable(moduleKey);
    refreshNavCounts();
  } catch (err) {
    showToast(err.message, true);
  }
});

/* ---------------------------------------------------------------------
 * Pencarian global (memfilter tabel view yang sedang aktif)
 * --------------------------------------------------------------------- */
let searchTimer;
document.getElementById('global-search').addEventListener('input', (e) => {
  clearTimeout(searchTimer);
  const q = e.target.value;
  searchTimer = setTimeout(() => {
    if (state.currentView !== 'dashboard') loadTable(state.currentView, q);
  }, 250);
});

/* ---------------------------------------------------------------------
 * Dashboard: stat cards + charts + tabel incidents terbaru
 * --------------------------------------------------------------------- */
async function loadDashboard() {
  try {
    const { data: stats } = await apiGet('/stats');

    document.getElementById('stat-incidents').textContent = stats.totals.incidents;
    document.getElementById('stat-incidents-open').textContent = `${stats.totals.openIncidents} masih terbuka`;
    document.getElementById('stat-inspections').textContent = stats.totals.inspections;
    document.getElementById('stat-trainings').textContent = stats.totals.trainings;
    document.getElementById('stat-participants').textContent = `${stats.trainingParticipants} peserta total`;
    document.getElementById('stat-capa-open').textContent = stats.totals.openCapa;
    document.getElementById('stat-capa-total').textContent = `dari ${stats.totals.capa} total`;

    const perf = stats.hsePerformance.latest;
    document.getElementById('perf-period-label').textContent = perf ? `periode ${perf.period}` : '';
    document.getElementById('stat-fr').textContent = perf ? perf.fr : '0';
    document.getElementById('stat-sr').textContent = perf ? perf.sr : '0';
    document.getElementById('stat-trir').textContent = perf ? perf.trir : '0';
    document.getElementById('stat-ltif').textContent = perf ? perf.ltif : '0';

    document.getElementById('mini-permits-active').textContent = stats.totals.activePermits;
    document.getElementById('mini-permits-expiring').textContent = stats.totals.expiringPermits;
    document.getElementById('mini-kpi-achieved').textContent = `${stats.totals.kpiAchieved}/${stats.totals.kpis}`;
    document.getElementById('mini-docs-attention').textContent = stats.totals.docsExpiringSoon + stats.totals.docsExpired;

    renderSeverityChart(stats.incidentsBySeverity);
    renderCapaChart(stats.capaByStatus);
    renderGenderChart(perf);
    renderTrendChart(stats.hsePerformance.trend);

    const { data: incidents } = await apiGet('/incidents');
    renderRecentIncidents(incidents.slice(0, 5));

    refreshNavCounts();
  } catch (err) {
    showToast(err.message, true);
  }
}

function renderRecentIncidents(rows) {
  const tbody = document.querySelector('#table-recent-incidents tbody');
  if (!rows.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="5">Belum ada data incident.</td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map((r) => `
    <tr>
      <td>${escapeHtml(r.title)}</td>
      <td><span class="${badgeClass('status', r.severity)}">${r.severity}</span></td>
      <td>${escapeHtml(r.location || '-')}</td>
      <td>${r.date}</td>
      <td><span class="${badgeClass('status', r.status)}">${r.status}</span></td>
    </tr>
  `).join('');
}

function renderSeverityChart(bySeverity) {
  const ctx = document.getElementById('chart-severity');
  const labels = Object.keys(bySeverity);
  const values = Object.values(bySeverity);
  const colorMap = { Low: '#3fb27f', Medium: '#f2a93b', High: '#e5484d' };

  if (state.charts.severity) state.charts.severity.destroy();
  state.charts.severity = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: labels.map((l) => colorMap[l] || '#8d98a3'), borderWidth: 0 }]
    },
    options: {
      plugins: { legend: { position: 'bottom', labels: { color: '#8d98a3', boxWidth: 12 } } },
      cutout: '65%'
    }
  });
}

function renderCapaChart(byStatus) {
  const ctx = document.getElementById('chart-capa');
  const labels = Object.keys(byStatus);
  const values = Object.values(byStatus);
  const colorMap = { Open: '#e5484d', 'In Progress': '#f2a93b', Done: '#3fb27f' };

  if (state.charts.capa) state.charts.capa.destroy();
  state.charts.capa = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: labels.map((l) => colorMap[l] || '#ff6a13'), borderRadius: 6, maxBarThickness: 46 }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#8d98a3' }, grid: { display: false } },
        y: { ticks: { color: '#8d98a3', precision: 0 }, grid: { color: '#2b333c' }, beginAtZero: true }
      }
    }
  });
}

function renderGenderChart(perf) {
  const ctx = document.getElementById('chart-gender');
  const male = perf ? Number(perf.male_workers) || 0 : 0;
  const female = perf ? Number(perf.female_workers) || 0 : 0;

  if (state.charts.gender) state.charts.gender.destroy();
  state.charts.gender = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Laki-laki', 'Perempuan'],
      datasets: [{ data: [male, female], backgroundColor: ['#4d9fec', '#ff6a13'], borderWidth: 0 }]
    },
    options: {
      plugins: { legend: { position: 'bottom', labels: { color: '#8d98a3', boxWidth: 12 } } },
      cutout: '65%'
    }
  });
}

function renderTrendChart(trend) {
  const ctx = document.getElementById('chart-trend');
  const labels = trend.map((t) => t.period);

  if (state.charts.trend) state.charts.trend.destroy();

  if (!trend.length) {
    state.charts.trend = new Chart(ctx, {
      type: 'line',
      data: { labels: ['Belum ada data'], datasets: [] },
      options: { plugins: { legend: { display: false } } }
    });
    return;
  }

  state.charts.trend = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'TRIR', data: trend.map((t) => t.trir), borderColor: '#ff6a13', backgroundColor: 'rgba(255,106,19,.15)', tension: 0.3, fill: true },
        { label: 'LTIF', data: trend.map((t) => t.ltif), borderColor: '#4d9fec', backgroundColor: 'rgba(77,159,236,.12)', tension: 0.3, fill: true }
      ]
    },
    options: {
      plugins: { legend: { position: 'bottom', labels: { color: '#8d98a3', boxWidth: 12 } } },
      scales: {
        x: { ticks: { color: '#8d98a3' }, grid: { display: false } },
        y: { ticks: { color: '#8d98a3' }, grid: { color: '#2b333c' }, beginAtZero: true }
      }
    }
  });
}

/* ---------------------------------------------------------------------
 * Init
 * --------------------------------------------------------------------- */
switchView('dashboard');
refreshNavCounts();
