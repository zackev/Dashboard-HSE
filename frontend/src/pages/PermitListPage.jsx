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

  const isAdmin = hasPermission("permits");
  const isGm = hasPermission("permits_gm");

  async function load() {
    setLoading(true);
    try {
      const qs = search ? `?q=${encodeURIComponent(search)}` : "";
      const { data } = await api.get(`/permits${qs}`);
      setRows(data);
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function queueLabel(row) {
    if (row.status === "Submitted") return "Menunggu Admin";
    if (row.status === "GM Review") return "Menunggu GM";
    return row.status;
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
        right={
          !isAdmin && !isGm ? null : null
        }
      />
      {!isAdmin && !isGm && (
        <div className="mb-3 flex justify-end">
          <button className="btn btn-primary flex items-center gap-1.5 !text-white" onClick={() => navigate("/permits/new")}>
            <Plus size={15} /> Ajukan Ijin Kerja
          </button>
        </div>
      )}

      <div className="panel">
        {loading && <p className="px-1 py-6 text-center text-sm text-muted">Memuat...</p>}
        {!loading && rows.length === 0 && (
          <p className="px-1 py-6 text-center text-sm text-muted">Belum ada data.</p>
        )}
        {!loading && rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  {["No. Ijin", "Lokasi", "Pemohon", "Status", ""].map((h) => (
                    <th key={h} className="whitespace-nowrap border-b border-border px-2.5 py-2 text-left text-[11.5px] font-bold uppercase tracking-wide text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="cursor-pointer hover:bg-surface2/50" onClick={() => navigate(`/permits/${row.id}`)}>
                    <td className="border-b border-border px-2.5 py-2.5">{row.permit_no}</td>
                    <td className="border-b border-border px-2.5 py-2.5">{row.location}</td>
                    <td className="border-b border-border px-2.5 py-2.5">{row.requested_by}</td>
                    <td className="border-b border-border px-2.5 py-2.5">
                      <Badge kind="status" value={queueLabel(row)} />
                    </td>
                    <td className="border-b border-border px-2.5 py-2.5 text-right text-info">Detail &rarr;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
