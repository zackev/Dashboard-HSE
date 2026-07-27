/**
 * src/config/modules.jsx
 * -------------------------------------------------------------------------
 * Satu sumber kebenaran untuk semua modul CRUD: field form, kolom tabel,
 * dan mapping status -> tone badge (good/warning/bad/neutral).
 * Menambah modul baru = menambah 1 entry di MODULES + endpoint di backend.
 * -------------------------------------------------------------------------
 */

export const STATUS_TONE = {
  Open: "bad",
  "In Progress": "warn",
  Closed: "good",
  Completed: "good",
  Scheduled: "neutral",
  Done: "good",
  Cancelled: "bad",
  Low: "good",
  Medium: "warn",
  High: "bad",
  Draft: "neutral",
  Submitted: "warn",
  Approved: "good",
  Active: "good",
  Rejected: "bad",
  Expired: "bad",
  "Under Review": "warn",
  Obsolete: "bad",
  "On Track": "good",
  Achieved: "good",
  "Not Achieved": "bad",
  "At Risk": "warn",
};

export function toneOf(value) {
  return STATUS_TONE[value] || "neutral";
}

export const MODULES = {
  incidents: {
    label: "Incident",
    labelPlural: "Incidents",
    columns: [
      { key: "title", label: "Judul" },
      { key: "type", label: "Tipe", badge: "type" },
      { key: "severity", label: "Severity", badge: "status" },
      { key: "location", label: "Lokasi" },
      { key: "date", label: "Tanggal" },
      { key: "reported_by", label: "Pelapor" },
      { key: "status", label: "Status", badge: "status" },
    ],
    fields: [
      { key: "title", label: "Judul Kejadian", type: "text", required: true },
      {
        key: "type",
        label: "Tipe",
        type: "select",
        options: [
          "Near Miss",
          "Unsafe Act",
          "Unsafe Condition",
          "Hazard",
          "Accident",
        ],
        required: true,
      },
      {
        key: "severity",
        label: "Severity",
        type: "select",
        options: ["Low", "Medium", "High"],
        required: true,
      },
      { key: "location", label: "Lokasi", type: "text", required: true },
      { key: "date", label: "Tanggal Kejadian", type: "date", required: true },
      { key: "reported_by", label: "Dilaporkan Oleh", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["Open", "In Progress", "Closed"],
        required: true,
      },
      { key: "description", label: "Deskripsi", type: "textarea" },
    ],
  },
  inspections: {
    label: "Inspection",
    labelPlural: "Inspections",
    columns: [
      { key: "title", label: "Judul" },
      { key: "area", label: "Area" },
      { key: "inspector", label: "Inspektor" },
      { key: "date", label: "Tanggal" },
      { key: "status", label: "Status", badge: "status" },
      { key: "findings", label: "Temuan", truncate: true },
    ],
    fields: [
      { key: "title", label: "Judul Inspeksi", type: "text", required: true },
      { key: "area", label: "Area", type: "text", required: true },
      { key: "inspector", label: "Inspektor", type: "text", required: true },
      { key: "date", label: "Tanggal", type: "date", required: true },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["Scheduled", "In Progress", "Completed"],
        required: true,
      },
      { key: "findings", label: "Temuan", type: "textarea" },
    ],
  },
  trainings: {
    label: "Training",
    labelPlural: "Trainings",
    columns: [
      { key: "title", label: "Judul" },
      { key: "trainer", label: "Trainer" },
      { key: "date", label: "Tanggal" },
      { key: "participants", label: "Peserta" },
      { key: "status", label: "Status", badge: "status" },
    ],
    fields: [
      { key: "title", label: "Judul Pelatihan", type: "text", required: true },
      {
        key: "trainer",
        label: "Trainer / Instruktur",
        type: "text",
        required: true,
      },
      { key: "date", label: "Tanggal", type: "date", required: true },
      { key: "participants", label: "Jumlah Peserta", type: "number" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["Scheduled", "In Progress", "Completed", "Cancelled"],
        required: true,
      },
      { key: "notes", label: "Catatan", type: "textarea" },
    ],
  },
  capa: {
    label: "CAPA",
    labelPlural: "CAPA",
    columns: [
      { key: "title", label: "Judul" },
      { key: "related_to", label: "Terkait" },
      { key: "type", label: "Tipe", badge: "type" },
      { key: "pic", label: "PIC" },
      { key: "due_date", label: "Jatuh Tempo" },
      { key: "status", label: "Status", badge: "status" },
    ],
    fields: [
      { key: "title", label: "Judul Tindakan", type: "text", required: true },
      {
        key: "related_to",
        label: "Terkait dengan (mis. nama incident)",
        type: "text",
      },
      {
        key: "type",
        label: "Tipe",
        type: "select",
        options: ["Corrective", "Preventive"],
        required: true,
      },
      {
        key: "pic",
        label: "PIC (Penanggung Jawab)",
        type: "text",
        required: true,
      },
      { key: "due_date", label: "Jatuh Tempo", type: "date", required: true },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["Open", "In Progress", "Done"],
        required: true,
      },
    ],
  },
  hse_performance: {
    label: "Data HSE Performance Harian",
    labelPlural: "HSE Performance",
    columns: [
      { key: "date", label: "Tanggal" },
      {
        key: "_gender",
        label: "Tenaga Kerja (L/P)",
        render: (r) => `${r.male_workers ?? 0} / ${r.female_workers ?? 0}`,
      },
      { key: "working_hours", label: "Jam Kerja/Hari" },
      { key: "man_hours_today", label: "Man-Hour Hari Ini", format: "number" },
      {
        key: "man_hours_cumulative",
        label: "Man-Hour Kumulatif",
        format: "number",
      },
      { key: "near_miss", label: "Near Miss" },
      { key: "first_aid_case", label: "FAC" },
      { key: "medical_treatment_case", label: "MTC" },
      { key: "restricted_work_case", label: "RWC" },
      { key: "property_damage", label: "Property Damage" },
      { key: "lost_time_incident", label: "LTI" },
      { key: "fatality", label: "Fatality" },
      { key: "fr", label: "FR (kumulatif)", numeric: true },
      { key: "sr", label: "SR (kumulatif)", numeric: true },
      { key: "trir", label: "TRIR (kumulatif)", numeric: true },
      { key: "ltif", label: "LTIF (kumulatif)", numeric: true },
    ],
    fields: [
      { key: "date", label: "Tanggal", type: "date", required: true },
      {
        key: "male_workers",
        label: "Tenaga Kerja Hadir - Laki-laki",
        type: "number",
      },
      {
        key: "female_workers",
        label: "Tenaga Kerja Hadir - Perempuan",
        type: "number",
      },
      {
        key: "working_hours",
        label: "Jam Kerja Normal per Hari",
        type: "number",
        default: 8,
        required: true,
      },
      {
        key: "_man_hours_preview",
        label: "Man-Hour Hari Ini (otomatis)",
        type: "computed",
        compute: (v) => {
          const total =
            (Number(v.male_workers) || 0) + (Number(v.female_workers) || 0);
          const hours = Number(v.working_hours) || 0;
          return `${total} org × ${hours} jam = ${total * hours} Man-Hour`;
        },
      },
      { key: "near_miss", label: "Near Miss", type: "number" },
      { key: "first_aid_case", label: "First Aid Case (FAC)", type: "number" },
      {
        key: "medical_treatment_case",
        label: "Medical Treatment Case (MTC)",
        type: "number",
      },
      {
        key: "restricted_work_case",
        label: "Restricted Work Case (RWC)",
        type: "number",
      },
      { key: "property_damage", label: "Property Damage", type: "number" },
      {
        key: "lost_time_incident",
        label: "Lost Time Incident (LTI)",
        type: "number",
      },
      {
        key: "lost_days",
        label: "Jumlah Hari Hilang (untuk SR)",
        type: "number",
      },
      { key: "fatality", label: "Fatality", type: "number" },
      { key: "notes", label: "Catatan", type: "textarea" },
    ],
  },
  permits: {
    label: "Ijin Kerja",
    labelPlural: "Ijin Kerja",
    hasJsa: true,
    columns: [
      { key: "permit_no", label: "No. Ijin" },
      { key: "type", label: "Tipe", badge: "type" },
      { key: "location", label: "Lokasi" },
      { key: "valid_from", label: "Berlaku Dari" },
      { key: "valid_to", label: "Berlaku Sampai" },
      { key: "requested_by", label: "Diajukan Oleh" },
      { key: "status", label: "Status", badge: "status" },
      {
        key: "_jsa",
        label: "JSA",
        render: (r) => (
          <span
            className={
              r.jsa?.length
                ? "text-xs font-semibold text-good"
                : "text-xs italic text-muted"
            }
          >
            {r.jsa?.length ? `${r.jsa.length} langkah` : "Belum diisi"}
          </span>
        ),
      },
    ],
    fields: [
      {
        key: "permit_no",
        label: "Nomor Ijin Kerja",
        type: "text",
        required: true,
      },
      {
        key: "type",
        label: "Tipe Pekerjaan",
        type: "select",
        options: [
          "Hot Work",
          "Cold Work",
          "Confined Space",
          "Working at Height",
          "Electrical",
          "Excavation",
          "Lifting",
        ],
        required: true,
      },
      { key: "location", label: "Lokasi", type: "text", required: true },
      {
        key: "work_description",
        label: "Deskripsi Pekerjaan",
        type: "textarea",
      },
      { key: "requested_by", label: "Diajukan Oleh", type: "text" },
      { key: "approved_by", label: "Disetujui Oleh", type: "text" },
      {
        key: "valid_from",
        label: "Berlaku Dari",
        type: "date",
        required: true,
      },
      {
        key: "valid_to",
        label: "Berlaku Sampai",
        type: "date",
        required: true,
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          "Draft",
          "Submitted",
          "Approved",
          "Active",
          "Closed",
          "Rejected",
        ],
        required: true,
      },
    ],
  },
  kpis: {
    label: "KPI",
    labelPlural: "KPI",
    columns: [
      { key: "kpi_name", label: "Nama KPI" },
      { key: "category", label: "Kategori", badge: "type" },
      { key: "period", label: "Periode" },
      { key: "target", label: "Target" },
      { key: "actual", label: "Aktual" },
      { key: "unit", label: "Satuan" },
      { key: "status", label: "Status", badge: "status" },
    ],
    fields: [
      { key: "kpi_name", label: "Nama KPI", type: "text", required: true },
      {
        key: "category",
        label: "Kategori",
        type: "select",
        options: ["Leading", "Lagging"],
        required: true,
      },
      {
        key: "period",
        label: "Periode (mis. 2026, Q3 2026)",
        type: "text",
        required: true,
      },
      { key: "target", label: "Target", type: "number", required: true },
      { key: "actual", label: "Aktual", type: "number" },
      { key: "unit", label: "Satuan (mis. %, kasus, rate)", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["On Track", "At Risk", "Achieved", "Not Achieved"],
        required: true,
      },
    ],
  },
  documents: {
    label: "Document",
    labelPlural: "Document",
    hasFile: true,
    columns: [
      { key: "title", label: "Judul" },
      { key: "category", label: "Kategori", badge: "type" },
      { key: "doc_number", label: "No. Dokumen" },
      { key: "revision", label: "Revisi" },
      { key: "issue_date", label: "Terbit" },
      { key: "expiry_date", label: "Kedaluwarsa" },
      { key: "status", label: "Status", badge: "status" },
      {
        key: "_file",
        label: "File",
        render: (r) =>
          r.file_path
            ? { type: "link", href: r.file_path, text: r.file_name || "Unduh" }
            : { type: "empty", text: "Tidak ada file" },
      },
    ],
    fields: [
      { key: "title", label: "Judul Dokumen", type: "text", required: true },
      {
        key: "category",
        label: "Kategori",
        type: "select",
        options: [
          "Policy",
          "Procedure/SOP",
          "Certificate",
          "Legal Permit",
          "Report",
          "Other",
        ],
        required: true,
      },
      {
        key: "doc_number",
        label: "Nomor Dokumen",
        type: "text",
        required: true,
      },
      { key: "revision", label: "Revisi", type: "text" },
      {
        key: "issue_date",
        label: "Tanggal Terbit",
        type: "date",
        required: true,
      },
      { key: "expiry_date", label: "Tanggal Kedaluwarsa", type: "date" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["Active", "Under Review", "Expired", "Obsolete"],
        required: true,
      },
      { key: "uploaded_by", label: "Diunggah Oleh", type: "text" },
      { key: "file", label: "File Dokumen", type: "file" },
    ],
  },
};

export const NAV_GROUPS = [
  {
    items: [
      { key: "dashboard", label: "Dashboard" },
      { key: "incidents", label: "Incidents" },
      { key: "inspections", label: "Inspections" },
      { key: "trainings", label: "Trainings" },
      { key: "capa", label: "CAPA" },
    ],
  },
  {
    title: "Performa & Kepatuhan",
    items: [
      { key: "hse_performance", label: "HSE Performance" },
      { key: "permits", label: "Ijin Kerja" },
      { key: "kpis", label: "KPI" },
      { key: "documents", label: "Document" },
    ],
  },
];

export const VIEW_META = {
  dashboard: ["Dashboard", "Ringkasan kondisi K3 hari ini"],
  incidents: ["Incidents", "Catatan kejadian, hazard, dan near miss"],
  inspections: ["Inspections", "Jadwal & hasil inspeksi K3"],
  trainings: ["Trainings", "Riwayat & jadwal pelatihan K3"],
  capa: ["CAPA", "Corrective & Preventive Actions"],
  hse_performance: [
    "HSE Performance",
    "Data harian: tenaga kerja hadir, Man-Hour otomatis, dan SR/FR/TRIR/LTIF kumulatif",
  ],
  permits: [
    "Ijin Kerja",
    "Work permit: hot work, confined space, working at height, dsb.",
  ],
  kpis: ["KPI", "Target vs pencapaian indikator kinerja K3"],
  documents: ["Document", "Kebijakan, SOP, sertifikat, dan dokumen K3 lainnya"],
};
