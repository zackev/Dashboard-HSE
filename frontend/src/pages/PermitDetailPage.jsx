import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Printer, Check, X, Send } from "lucide-react";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import Badge from "../components/Badge.jsx";
import Topbar from "../components/Topbar.jsx";

function Field({ label, value }) {
  return (
    <div>
      <div className="text-[10.5px] font-bold uppercase tracking-wide text-muted">
        {label}
      </div>
      <div className="text-[13px]">{value || "-"}</div>
    </div>
  );
}

export default function PermitDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const showToast = useToast();

  const [permit, setPermit] = useState(null);
  const [overtimes, setOvertimes] = useState([]);
  const [docFields, setDocFields] = useState({
    doc_number: "",
    doc_revision: "",
    doc_release_date: "",
    doc_pages: "",
  });
  const [otForm, setOtForm] = useState({
    date: "",
    start_time: "",
    end_time: "",
    reason: "",
  });

  const isAdmin = hasPermission("permits");
  const isGm = hasPermission("permits_gm");
  const isOwner = permit && user && permit.user_id === user.id;

  async function load() {
    try {
      const { data } = await api.get(`/permits/${id}`);
      setPermit(data);
      const ot = await api.get(`/permits/${id}/overtimes`);
      setOvertimes(ot.data);
    } catch (err) {
      showToast(err.message, true);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function submitAdminReview(action) {
    if (action === "reject" && !window.confirm("Tolak ijin kerja ini?")) return;
    const note =
      action === "reject"
        ? (window.prompt("Alasan penolakan (opsional):") ?? "")
        : null;
    try {
      await api.postJson(`/permits/${id}/admin-review`, {
        action,
        note,
        ...docFields,
      });
      showToast(
        action === "approve"
          ? "Disetujui, diteruskan ke GM."
          : "Ijin kerja ditolak.",
      );
      load();
    } catch (err) {
      showToast(err.message, true);
    }
  }

  async function submitGmReview(action) {
    if (action === "reject" && !window.confirm("Tolak ijin kerja ini?")) return;
    const note =
      action === "reject"
        ? (window.prompt("Alasan penolakan (opsional):") ?? "")
        : null;
    try {
      await api.postJson(`/permits/${id}/gm-review`, { action, note });
      showToast(
        action === "approve"
          ? "Ijin kerja disetujui final."
          : "Ijin kerja ditolak.",
      );
      load();
    } catch (err) {
      showToast(err.message, true);
    }
  }

  async function requestOvertime(e) {
    e.preventDefault();
    try {
      await api.postJson(`/permits/${id}/overtimes`, otForm);
      showToast("Izin lembur diajukan.");
      setOtForm({ date: "", start_time: "", end_time: "", reason: "" });
      load();
    } catch (err) {
      showToast(err.message, true);
    }
  }

  async function reviewOvertime(overtimeId, stage, action) {
    const note =
      action === "reject"
        ? (window.prompt("Alasan penolakan (opsional):") ?? "")
        : null;
    try {
      await api.postJson(
        `/permits/${id}/overtimes/${overtimeId}/${stage}-review`,
        { action, note },
      );
      showToast("Berhasil diproses.");
      load();
    } catch (err) {
      showToast(err.message, true);
    }
  }

  function handlePrint() {
    window.open(`/api/permits/${id}/print`, "_blank");
  }

  if (!permit) return <p className="text-muted">Memuat...</p>;

  const canPrint = isAdmin || isGm || (isOwner && permit.status === "Approved");
  const canAdminReview = isAdmin && permit.admin_status === "Pending";
  const canGmReview =
    isGm &&
    permit.admin_status === "Approved" &&
    permit.gm_status === "Pending";
  const canRequestOvertime = isOwner && permit.status === "Approved";

  return (
    <>
      <Topbar
        title={`Ijin Kerja — ${permit.permit_no}`}
        subtitle={permit.location}
        right={
          canPrint && (
            <button
              className="btn btn-ghost flex items-center gap-1.5"
              onClick={handlePrint}
            >
              <Printer size={15} /> Export PDF
            </button>
          )
        }
      />

      <div className="mb-4 flex items-center gap-2">
        <Badge kind="status" value={permit.status} />
        <span className="text-xs text-muted">
          Admin: <Badge kind="status" value={permit.admin_status} /> &middot;
          GM: <Badge kind="status" value={permit.gm_status} />
        </span>
      </div>

      <div className="panel !mb-4 grid grid-cols-3 gap-4 max-md:grid-cols-2 max-sm:grid-cols-1">
        <Field
          label="Klasifikasi"
          value={(permit.work_classifications || []).join(", ")}
        />
        <Field
          label="Lokasi / Area / Plant"
          value={`${permit.location} / ${permit.area || "-"} / ${permit.plant || "-"}`}
        />
        <Field
          label="Pemohon"
          value={`${permit.requested_by} (${permit.requester_phone || "-"})`}
        />
        <Field
          label="Berlaku"
          value={`${permit.valid_from} s/d ${permit.valid_to}`}
        />
        <Field
          label="Jam Kerja"
          value={`${permit.start_time || "-"} - ${permit.end_time || "-"}`}
        />
        <Field label="Pengawas" value={permit.supervisor_name} />
        <Field label="Petugas K3" value={permit.safety_officer_name} />
        <Field label="Manajer Area" value={permit.area_manager_name} />
        <Field label="Perusahaan Pemohon" value={permit.requester_company} />
      </div>

      <div className="panel !mb-4">
        <h3 className="mb-3 text-sm font-bold">Daftar Pekerja</h3>
        <div className="flex flex-wrap gap-2 text-[12.5px]">
          {(permit.workers || []).map((w, i) => (
            <span key={i} className="rounded-[8px] bg-surface2 px-2.5 py-1">
              {w.role}: <strong>{w.qty}</strong>
            </span>
          ))}
          {(!permit.workers || permit.workers.length === 0) && (
            <span className="text-muted">-</span>
          )}
        </div>
      </div>

      <div className="panel !mb-4">
        <h3 className="mb-3 text-sm font-bold">Perlengkapan Kerja</h3>
        <div className="flex flex-wrap gap-2 text-[12.5px]">
          {(permit.equipment || []).map((e, i) => (
            <span key={i} className="rounded-[8px] bg-surface2 px-2.5 py-1">
              [{e.category}] {e.name}: <strong>{e.qty}</strong>
            </span>
          ))}
          {(!permit.equipment || permit.equipment.length === 0) && (
            <span className="text-muted">-</span>
          )}
        </div>
      </div>

      <div className="panel !mb-4">
        <h3 className="mb-3 text-sm font-bold">JSA (Keselamatan Kerja)</h3>
        <div className="flex flex-col gap-2">
          {(permit.jsa || []).map((row, i) => (
            <div
              key={i}
              className="rounded-[8px] border border-border p-2.5 text-[12.5px]"
            >
              <div>
                <strong>Aktivitas:</strong> {row.step}
              </div>
              <div>
                <strong>Potensi Bahaya:</strong> {row.hazard}
              </div>
              <div>
                <strong>Langkah Aman:</strong> {row.control}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel !mb-4">
        <h3 className="mb-3 text-sm font-bold">Peralatan Keselamatan</h3>
        <div className="flex flex-wrap gap-1.5 text-[12px]">
          {(permit.safety_equipment || []).map((item) => (
            <span
              key={item}
              className="rounded-full bg-good/15 px-2.5 py-1 text-good"
            >
              {item}
            </span>
          ))}
          {(!permit.safety_equipment ||
            permit.safety_equipment.length === 0) && (
            <span className="text-muted">-</span>
          )}
        </div>
      </div>

      {/* Review Admin */}
      {canAdminReview && (
        <div className="panel !mb-4 border-brand-orange/40">
          <h3 className="mb-3 text-sm font-bold">
            Review Admin (Tahap 1) — isi kop surat sebelum approve
          </h3>
          <div className="mb-3 grid grid-cols-2 gap-3 max-md:grid-cols-1">
            <input
              className="field-input"
              placeholder="No Dok"
              value={docFields.doc_number}
              onChange={(e) =>
                setDocFields((f) => ({ ...f, doc_number: e.target.value }))
              }
            />
            <input
              className="field-input"
              placeholder="No Rev"
              value={docFields.doc_revision}
              onChange={(e) =>
                setDocFields((f) => ({ ...f, doc_revision: e.target.value }))
              }
            />
            <input
              type="date"
              className="field-input"
              placeholder="Tgl Rilis"
              value={docFields.doc_release_date}
              onChange={(e) =>
                setDocFields((f) => ({
                  ...f,
                  doc_release_date: e.target.value,
                }))
              }
            />
            <input
              className="field-input"
              placeholder="Jml Halaman (mis. 1 dari 1)"
              value={docFields.doc_pages}
              onChange={(e) =>
                setDocFields((f) => ({ ...f, doc_pages: e.target.value }))
              }
            />
          </div>
          <div className="flex gap-2">
            <button
              className="btn flex items-center gap-1.5 border-good/40 text-good"
              onClick={() => submitAdminReview("approve")}
            >
              <Check size={15} /> Setujui, teruskan ke GM
            </button>
            <button
              className="btn flex items-center gap-1.5 border-bad/40 text-bad"
              onClick={() => submitAdminReview("reject")}
            >
              <X size={15} /> Tolak
            </button>
          </div>
        </div>
      )}

      {/* Review GM */}
      {canGmReview && (
        <div className="panel !mb-4 border-brand-orange/40">
          <h3 className="mb-3 text-sm font-bold">
            Review GM (Tahap 2 / Final)
          </h3>
          <div className="flex gap-2">
            <button
              className="btn flex items-center gap-1.5 border-good/40 text-good"
              onClick={() => submitGmReview("approve")}
            >
              <Check size={15} /> Setujui (Final)
            </button>
            <button
              className="btn flex items-center gap-1.5 border-bad/40 text-bad"
              onClick={() => submitGmReview("reject")}
            >
              <X size={15} /> Tolak
            </button>
          </div>
        </div>
      )}

      {permit.status === "Rejected" && (
        <div className="panel !mb-4 border-bad/40">
          <h3 className="mb-1 text-sm font-bold text-bad">Ditolak</h3>
          <p className="text-[12.5px] text-muted">
            {permit.rejection_reason || "Tidak ada catatan."}
          </p>
        </div>
      )}

      {/* Izin Lembur */}
      <div className="panel !mb-4">
        <h3 className="mb-3 text-sm font-bold">Izin Lembur</h3>

        {canRequestOvertime && (
          <form
            onSubmit={requestOvertime}
            className="mb-4 grid grid-cols-4 gap-2 max-md:grid-cols-2"
          >
            <input
              type="date"
              required
              className="field-input"
              value={otForm.date}
              onChange={(e) =>
                setOtForm((f) => ({ ...f, date: e.target.value }))
              }
            />
            <input
              type="time"
              required
              className="field-input"
              value={otForm.start_time}
              onChange={(e) =>
                setOtForm((f) => ({ ...f, start_time: e.target.value }))
              }
            />
            <input
              type="time"
              required
              className="field-input"
              value={otForm.end_time}
              onChange={(e) =>
                setOtForm((f) => ({ ...f, end_time: e.target.value }))
              }
            />
            <button
              type="submit"
              className="btn btn-primary flex items-center justify-center gap-1.5 !text-white"
            >
              <Send size={14} /> Ajukan
            </button>
            <input
              className="field-input col-span-4 max-md:col-span-2"
              placeholder="Alasan lembur (opsional)"
              value={otForm.reason}
              onChange={(e) =>
                setOtForm((f) => ({ ...f, reason: e.target.value }))
              }
            />
          </form>
        )}

        {overtimes.length === 0 && (
          <p className="text-[12.5px] text-muted">
            Belum ada pengajuan lembur.
          </p>
        )}
        <div className="flex flex-col gap-2">
          {overtimes.map((ot) => (
            <div
              key={ot.id}
              className="rounded-[10px] border border-border p-3 text-[12.5px]"
            >
              <div className="mb-1 flex items-center justify-between">
                <span>
                  {ot.date} &middot; {ot.start_time} - {ot.end_time}
                </span>
                <Badge kind="status" value={ot.status} />
              </div>
              {ot.reason && <p className="text-muted">{ot.reason}</p>}

              {isAdmin && ot.admin_status === "Pending" && (
                <div className="mt-2 flex gap-2">
                  <button
                    className="btn-icon border-good/40 text-good"
                    onClick={() => reviewOvertime(ot.id, "admin", "approve")}
                  >
                    <Check size={14} />
                  </button>
                  <button
                    className="btn-icon btn-icon-danger"
                    onClick={() => reviewOvertime(ot.id, "admin", "reject")}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              {isGm &&
                ot.admin_status === "Approved" &&
                ot.gm_status === "Pending" && (
                  <div className="mt-2 flex gap-2">
                    <button
                      className="btn-icon border-good/40 text-good"
                      onClick={() => reviewOvertime(ot.id, "gm", "approve")}
                    >
                      <Check size={14} />
                    </button>
                    <button
                      className="btn-icon btn-icon-danger"
                      onClick={() => reviewOvertime(ot.id, "gm", "reject")}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>

      <button className="btn btn-ghost" onClick={() => navigate("/permits")}>
        &larr; Kembali ke Daftar
      </button>
    </>
  );
}
