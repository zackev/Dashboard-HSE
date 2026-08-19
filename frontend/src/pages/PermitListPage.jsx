import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import Badge from "../components/Badge.jsx";
import Topbar from "../components/Topbar.jsx";

export default function PermitListPage() {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const showToast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [overtimes, setOvertimes] = useState([]);
  const [overtimeLoading, setOvertimeLoading] = useState(false);
  const [myOvertimes, setMyOvertimes] = useState([]);
  const [editingOvertimeId, setEditingOvertimeId] = useState(null);
  const [editOvertimeForm, setEditOvertimeForm] = useState({
    date: "",
    start_time: "",
    end_time: "",
  });

  const isAdmin = hasPermission("permits");
  const isGm = hasPermission("permits_gm");

  async function load() {
    setLoading(true);

    try {
      const qs = search ? `?q=${encodeURIComponent(search)}` : "";

      const { data } = await api.get(`/permits${qs}`);

      setRows(data);

      // Employee mengambil pengajuan lembur dari permit miliknya
      if (!isAdmin && !isGm) {
        setOvertimeLoading(true);

        const overtimeResults = await Promise.all(
          data.map(async (permit) => {
            try {
              const response = await api.get(`/permits/${permit.id}/overtimes`);

              return (response.data || []).map((overtime) => ({
                ...overtime,
                permit: {
                  id: permit.id,
                  permit_no: permit.permit_no,
                  location: permit.location,
                  area: permit.area,
                },
              }));
            } catch {
              return [];
            }
          }),
        );

        setMyOvertimes(overtimeResults.flat());
      }
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setLoading(false);
      setOvertimeLoading(false);
    }
  }

  async function loadOvertimes() {
    if (!isAdmin && !isGm) return;

    setOvertimeLoading(true);

    try {
      const { data } = await api.get("/permit-overtimes");
      setOvertimes(data);
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setOvertimeLoading(false);
    }
  }

  function handleEditOvertime(overtime) {
    setEditingOvertimeId(overtime.id);

    setEditOvertimeForm({
      date: overtime.date || "",
      start_time: overtime.start_time ? overtime.start_time.slice(0, 5) : "",
      end_time: overtime.end_time ? overtime.end_time.slice(0, 5) : "",
    });
  }

  function handleCancelEditOvertime() {
    setEditingOvertimeId(null);

    setEditOvertimeForm({
      date: "",
      start_time: "",
      end_time: "",
    });
  }

  async function handleSaveOvertime(overtime) {
    try {
      await api.putJson(
        `/permits/${overtime.permit_id}/overtimes/${overtime.id}`,
        editOvertimeForm,
      );

      showToast("Pengajuan izin lembur berhasil diperbarui.");

      setEditingOvertimeId(null);

      await load();
    } catch (err) {
      showToast(err.message, true);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      load();
      loadOvertimes();
    }, 250);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function queueLabel(row) {
    if (row.status === "Submitted") return "Menunggu Admin";
    if (row.status === "GM Review") return "Menunggu GM";
    return row.status;
  }

  function approvalLabel(status) {
    if (!status) return "—";

    const normalized = String(status).toLowerCase();

    if (normalized === "approved") return "Approved";
    if (normalized === "rejected") return "Rejected";

    return "Pending";
  }

  async function handleDeleteOvertime(overtime) {
    const confirmed = window.confirm(
      "Yakin ingin menghapus pengajuan izin lembur ini?",
    );

    if (!confirmed) return;

    try {
      await api.del(`/permits/${overtime.permit_id}/overtimes/${overtime.id}`);

      showToast("Pengajuan izin lembur berhasil dihapus.");

      // Refresh data tabel
      load();
    } catch (err) {
      showToast(err.message, true);
    }
  }

  return (
    <>
      <Topbar
        title="Ijin Kerja"
        subtitle={
          isAdmin || isGm
            ? "Antrian review — Admin (tahap 1) lalu GM (tahap 2)"
            : "Ijin kerja yang kamu ajukan"
        }
        showAdd={!isAdmin && !isGm}
        onAdd={() => navigate("/permits/new")}
        search={search}
        onSearchChange={setSearch}
        right={!isAdmin && !isGm ? null : null}
      />
      {!isAdmin && !isGm && (
        <div className="mb-3 flex justify-end">
          <button
            className="btn btn-primary flex items-center gap-1.5 !text-white"
            onClick={() => navigate("/permits/new")}
          >
            <Plus size={15} /> Ajukan Ijin Kerja
          </button>
        </div>
      )}
      <div className="panel">
        {loading && (
          <p className="px-1 py-6 text-center text-sm text-muted">Memuat...</p>
        )}
        {!loading && rows.length === 0 && (
          <p className="px-1 py-6 text-center text-sm text-muted">
            Belum ada data.
          </p>
        )}
        {!loading && rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  {[
                    "No. Ijin",
                    "Lokasi",
                    "Pemohon",
                    ...(isAdmin || isGm
                      ? ["Admin Approval", "GM Approval"]
                      : []),
                    "Status",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap border-b border-border px-2.5 py-2 text-left text-[11.5px] font-bold uppercase tracking-wide text-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="cursor-pointer hover:bg-surface2/50"
                    onClick={() => navigate(`/permits/${row.id}`)}
                  >
                    <td className="border-b border-border px-2.5 py-2.5">
                      {row.permit_no}
                    </td>
                    <td className="border-b border-border px-2.5 py-2.5">
                      {row.location}
                    </td>
                    <td className="border-b border-border px-2.5 py-2.5">
                      {row.requested_by}
                    </td>
                    {(isAdmin || isGm) && (
                      <>
                        <td className="border-b border-border px-2.5 py-2.5">
                          <Badge
                            kind="status"
                            value={approvalLabel(row.admin_status)}
                          />
                        </td>

                        <td className="border-b border-border px-2.5 py-2.5">
                          <Badge
                            kind="status"
                            value={approvalLabel(row.gm_status)}
                          />
                        </td>
                      </>
                    )}
                    <td className="border-b border-border px-2.5 py-2.5">
                      <Badge kind="status" value={queueLabel(row)} />
                    </td>
                    <td className="border-b border-border px-2.5 py-2.5 text-right text-info">
                      Detail &rarr;
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {isAdmin || isGm ? (
        <div className="panel mt-4">
          <div className="mb-3">
            <h2 className="text-sm font-bold">Pengajuan Izin Lembur</h2>
            <p className="text-xs text-muted">
              Daftar pengajuan lembur yang perlu diproses Admin dan GM.
            </p>
          </div>

          {overtimeLoading ? (
            <p className="px-1 py-6 text-center text-sm text-muted">
              Memuat pengajuan lembur...
            </p>
          ) : overtimes.length === 0 ? (
            <p className="px-1 py-6 text-center text-sm text-muted">
              Belum ada pengajuan lembur.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    {[
                      "No. Ijin",
                      "Pemohon",
                      "Tanggal",
                      "Jam",
                      "Admin Approval",
                      "GM Approval",
                      "Status",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap border-b border-border px-2.5 py-2 text-left text-[11.5px] font-bold uppercase tracking-wide text-muted"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {overtimes.map((overtime) => (
                    <tr
                      key={overtime.id}
                      className="cursor-pointer hover:bg-surface2/50"
                      onClick={() => navigate(`/permits/${overtime.permit_id}`)}
                    >
                      <td className="border-b border-border px-2.5 py-2.5">
                        {overtime.permit?.permit_no || "—"}
                      </td>

                      <td className="border-b border-border px-2.5 py-2.5">
                        {overtime.requester?.name || "—"}
                      </td>

                      <td className="border-b border-border px-2.5 py-2.5 whitespace-nowrap">
                        {overtime.date || "—"}
                      </td>

                      <td className="border-b border-border px-2.5 py-2.5 whitespace-nowrap">
                        {overtime.start_time && overtime.end_time
                          ? `${overtime.start_time.slice(0, 5)} - ${overtime.end_time.slice(0, 5)}`
                          : "—"}
                      </td>

                      <td className="border-b border-border px-2.5 py-2.5">
                        <Badge
                          kind="status"
                          value={approvalLabel(overtime.admin_status)}
                        />
                      </td>

                      <td className="border-b border-border px-2.5 py-2.5">
                        <Badge
                          kind="status"
                          value={approvalLabel(overtime.gm_status)}
                        />
                      </td>

                      <td className="border-b border-border px-2.5 py-2.5">
                        <Badge
                          kind="status"
                          value={approvalLabel(overtime.status)}
                        />
                      </td>

                      <td className="border-b border-border px-2.5 py-2.5 text-right text-info">
                        Detail &rarr;
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}{" "}
      {!isAdmin && !isGm ? (
        <div className="panel mt-4">
          <div className="mb-3">
            <h2 className="text-sm font-bold">Pengajuan Izin Lembur Saya</h2>
            <p className="text-xs text-muted">
              Kelola pengajuan izin lembur yang telah Anda buat.
            </p>
          </div>

          {overtimeLoading ? (
            <p className="px-1 py-6 text-center text-sm text-muted">
              Memuat pengajuan lembur...
            </p>
          ) : myOvertimes.length === 0 ? (
            <p className="px-1 py-6 text-center text-sm text-muted">
              Belum ada pengajuan izin lembur.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    {[
                      "No. Izin",
                      "Tanggal",
                      "Jam",
                      "Admin Approval",
                      "GM Approval",
                      "Status",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap border-b border-border px-2.5 py-2 text-left text-[11.5px] font-bold uppercase tracking-wide text-muted"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {myOvertimes.map((overtime) => {
                    const canManage =
                      overtime.admin_status === "Pending" ||
                      overtime.admin_status === "Rejected" ||
                      overtime.gm_status === "Rejected";

                    return (
                      <tr key={overtime.id} className="hover:bg-surface2/50">
                        <td className="border-b border-border px-2.5 py-2.5">
                          {overtime.permit?.permit_no || "—"}
                        </td>
                        <td className="border-b border-border px-2.5 py-2.5 whitespace-nowrap">
                          {editingOvertimeId === overtime.id ? (
                            <input
                              type="date"
                              className="field-input"
                              value={editOvertimeForm.date}
                              onChange={(e) =>
                                setEditOvertimeForm({
                                  ...editOvertimeForm,
                                  date: e.target.value,
                                })
                              }
                            />
                          ) : (
                            overtime.date || "—"
                          )}
                        </td>
                        <td className="border-b border-border px-2.5 py-2.5 whitespace-nowrap">
                          {editingOvertimeId === overtime.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="time"
                                className="field-input"
                                value={editOvertimeForm.start_time}
                                onChange={(e) =>
                                  setEditOvertimeForm({
                                    ...editOvertimeForm,
                                    start_time: e.target.value,
                                  })
                                }
                              />

                              <span>-</span>

                              <input
                                type="time"
                                className="field-input"
                                value={editOvertimeForm.end_time}
                                onChange={(e) =>
                                  setEditOvertimeForm({
                                    ...editOvertimeForm,
                                    end_time: e.target.value,
                                  })
                                }
                              />
                            </div>
                          ) : overtime.start_time && overtime.end_time ? (
                            `${overtime.start_time.slice(0, 5)} - ${overtime.end_time.slice(0, 5)}`
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="border-b border-border px-2.5 py-2.5">
                          <Badge
                            kind="status"
                            value={approvalLabel(overtime.admin_status)}
                          />
                        </td>
                        <td className="border-b border-border px-2.5 py-2.5">
                          <Badge
                            kind="status"
                            value={approvalLabel(overtime.gm_status)}
                          />
                        </td>
                        <td className="border-b border-border px-2.5 py-2.5">
                          <Badge
                            kind="status"
                            value={approvalLabel(overtime.status)}
                          />
                        </td>
                        <td className="border-b border-border px-2.5 py-2.5">
                          {canManage &&
                            (editingOvertimeId === overtime.id ? (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  className="text-xs font-medium text-success hover:underline"
                                  onClick={() => handleSaveOvertime(overtime)}
                                >
                                  Simpan
                                </button>

                                <button
                                  type="button"
                                  className="text-xs font-medium text-muted hover:underline"
                                  onClick={handleCancelEditOvertime}
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  className="text-xs font-medium text-info hover:underline"
                                  onClick={() => handleEditOvertime(overtime)}
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  className="text-xs font-medium text-danger hover:underline"
                                  onClick={() => handleDeleteOvertime(overtime)}
                                >
                                  Hapus
                                </button>
                              </div>
                            ))}
                        </td>{" "}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </>
  );
}
