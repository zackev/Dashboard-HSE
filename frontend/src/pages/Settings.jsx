import { useEffect, useState } from "react";
import { Plus, Trash2, Save, ShieldPlus, Building2 } from "lucide-react";
import { api, STORAGE_BASE } from "../lib/api";
import { useToast } from "../context/ToastContext.jsx";
import Topbar from "../components/Topbar.jsx";

function RolesTab() {
  const [roles, setRoles] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [newRoleName, setNewRoleName] = useState("");
  const [loading, setLoading] = useState(true);
  const showToast = useToast();

  async function load() {
    setLoading(true);
    try {
      const [rolesRes, catalogRes] = await Promise.all([
        api.get("/settings/roles"),
        api.get("/settings/permissions-catalog"),
      ]);
      setRoles(rolesRes.data);
      setCatalog(catalogRes.data);
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createRole() {
    if (!newRoleName.trim()) return;
    try {
      await api.postJson("/settings/roles", {
        name: newRoleName.trim(),
        permission_keys: [],
      });
      setNewRoleName("");
      showToast("Role baru berhasil dibuat.");
      load();
    } catch (err) {
      showToast(err.message, true);
    }
  }

  async function togglePermission(role, key) {
    const has = role.permissions.some((p) => p.key === key);
    const nextKeys = has
      ? role.permissions.filter((p) => p.key !== key).map((p) => p.key)
      : [...role.permissions.map((p) => p.key), key];

    // update optimis di UI
    setRoles((prev) =>
      prev.map((r) =>
        r.id === role.id
          ? {
              ...r,
              permissions: catalog.filter((p) => nextKeys.includes(p.key)),
            }
          : r,
      ),
    );

    try {
      await api.putJson(`/settings/roles/${role.id}`, {
        permission_keys: nextKeys,
      });
    } catch (err) {
      showToast(err.message, true);
      load();
    }
  }

  async function deleteRole(role) {
    if (!window.confirm(`Hapus role "${role.name}"?`)) return;
    try {
      await api.del(`/settings/roles/${role.id}`);
      showToast("Role dihapus.");
      load();
    } catch (err) {
      showToast(err.message, true);
    }
  }

  if (loading) return <p className="text-sm text-muted">Memuat role...</p>;

  const groups = [...new Set(catalog.map((c) => c.group))];

  return (
    <div className="flex flex-col gap-5">
      <div className="panel !mb-0">
        <h3 className="mb-3 text-sm font-bold">Buat Role Baru</h3>
        <div className="flex gap-2.5">
          <input
            className="field-input flex-1"
            placeholder="Nama role, mis. Supervisor"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
          />
          <button
            className="btn btn-primary flex items-center gap-1.5 !text-white"
            onClick={createRole}
          >
            <ShieldPlus size={15} /> Buat Role
          </button>
        </div>
      </div>

      {roles.map((role) => (
        <div key={role.id} className="panel !mb-0">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold">
                {role.name}
                {role.is_default && (
                  <span className="ml-2 rounded-full bg-surface2 px-2 py-0.5 text-[10px] font-bold text-muted">
                    BAWAAN
                  </span>
                )}
              </h3>
              <p className="text-[11.5px] text-muted">
                {role.users_count} karyawan memakai role ini
              </p>
            </div>
            {!role.is_default && (
              <button
                className="btn-icon btn-icon-danger"
                title="Hapus role"
                onClick={() => deleteRole(role)}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          {groups.map((group) => (
            <div key={group} className="mb-3 last:mb-0">
              <div className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-muted">
                {group}
              </div>
              <div className="flex flex-wrap gap-2">
                {catalog
                  .filter((c) => c.group === group)
                  .map((perm) => {
                    const checked = role.permissions.some(
                      (p) => p.key === perm.key,
                    );
                    return (
                      <label
                        key={perm.key}
                        className={`flex cursor-pointer items-center gap-1.5 rounded-[8px] border px-2.5 py-1.5 text-[12px] font-semibold transition ${
                          checked
                            ? "border-brand-orange/50 bg-brand-orangedim text-brand-yellow"
                            : "border-border bg-surface2 text-muted hover:text-ink"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="accent-brand-orange"
                          checked={checked}
                          onChange={() => togglePermission(role, perm.key)}
                        />
                        {perm.label}
                      </label>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function EmployeesTab() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role_id: "",
  });
  const showToast = useToast();

  async function load() {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get("/settings/users"),
        api.get("/settings/roles"),
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createUser(e) {
    e.preventDefault();
    try {
      await api.postJson("/settings/users", form);
      showToast("Karyawan baru berhasil ditambahkan.");
      setForm({ name: "", email: "", phone: "", password: "", role_id: "" });
      load();
    } catch (err) {
      showToast(err.message, true);
    }
  }

  async function toggleActive(user) {
    try {
      await api.putJson(`/settings/users/${user.id}`, {
        is_active: !user.is_active,
      });
      load();
    } catch (err) {
      showToast(err.message, true);
    }
  }

  async function changeRole(user, roleId) {
    try {
      await api.putJson(`/settings/users/${user.id}`, {
        role_id: Number(roleId),
      });
      load();
    } catch (err) {
      showToast(err.message, true);
    }
  }

  async function deleteUser(user) {
    if (!window.confirm(`Hapus akun "${user.name}"?`)) return;
    try {
      await api.del(`/settings/users/${user.id}`);
      showToast("Karyawan dihapus.");
      load();
    } catch (err) {
      showToast(err.message, true);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="panel !mb-0">
        <h3 className="mb-3 text-sm font-bold">Tambah Karyawan</h3>
        <form
          onSubmit={createUser}
          className="grid grid-cols-2 gap-3 max-md:grid-cols-1"
        >
          <input
            className="field-input"
            placeholder="Nama lengkap"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <input
            className="field-input"
            placeholder="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <input
            className="field-input"
            placeholder="No. WhatsApp (62xxxxxxxxxx)"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <input
            className="field-input"
            placeholder="Password awal"
            type="password"
            required
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
          />
          <select
            className="field-input"
            required
            value={form.role_id}
            onChange={(e) =>
              setForm((f) => ({ ...f, role_id: e.target.value }))
            }
          >
            <option value="">Pilih role...</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="btn btn-primary flex items-center justify-center gap-1.5 !text-white"
          >
            <Plus size={15} /> Tambah Karyawan
          </button>
        </form>
      </div>

      <div className="panel !mb-0">
        <h3 className="mb-3 text-sm font-bold">Daftar Karyawan</h3>
        {loading ? (
          <p className="text-sm text-muted">Memuat...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  {["Nama", "Email", "WhatsApp", "Role", "Status", "Aksi"].map(
                    (h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap border-b border-border px-2.5 py-2 text-left text-[11.5px] font-bold uppercase tracking-wide text-muted"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="border-b border-border px-2.5 py-2.5">
                      {u.name}
                    </td>
                    <td className="border-b border-border px-2.5 py-2.5">
                      {u.email}
                    </td>
                    <td className="border-b border-border px-2.5 py-2.5">
                      {u.phone || "-"}
                    </td>
                    <td className="border-b border-border px-2.5 py-2.5">
                      <select
                        className="field-input !py-1 !text-xs"
                        value={u.role?.id || ""}
                        onChange={(e) => changeRole(u, e.target.value)}
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border-b border-border px-2.5 py-2.5">
                      <button
                        className={`badge ${u.is_active ? "bg-good/15 text-good" : "bg-bad/20 text-bad"}`}
                        onClick={() => toggleActive(u)}
                        title="Klik untuk ubah status"
                      >
                        {u.is_active ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>
                    <td className="border-b border-border px-2.5 py-2.5">
                      <button
                        className="btn-icon btn-icon-danger"
                        title="Hapus"
                        onClick={() => deleteUser(u)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function CompanyTab() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const showToast = useToast();

  async function load() {
    setLoading(true);

    try {
      const res = await api.get("/settings/company");
      setCompany(res.data);
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setCompany((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleLogoChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (
      !["image/svg+xml", "image/jpeg", "image/png", "image/webp"].includes(
        file.type,
      )
    ) {
      showToast("Logo harus berupa SVG, JPG, PNG, atau WebP.", true);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast("Ukuran logo maksimal 2 MB.", true);
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function saveCompany(e) {
    e.preventDefault();

    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("name", company.name || "");
      formData.append("short_name", company.short_name || "");
      formData.append("address", company.address || "");
      formData.append("city", company.city || "");
      formData.append("province", company.province || "");
      formData.append("postal_code", company.postal_code || "");
      formData.append("phone", company.phone || "");
      formData.append("email", company.email || "");
      formData.append("website", company.website || "");
      formData.append("npwp", company.npwp || "");
      formData.append("industry", company.industry || "");

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      formData.append("_method", "PUT");

      const res = await api.postForm("/settings/company", formData);

      setCompany(res.data);
      setLogoFile(null);
      setLogoPreview(null);

      showToast("Informasi perusahaan berhasil disimpan.");
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setSaving(false);
    }
  }
  if (loading) {
    return <p className="text-sm text-muted">Memuat informasi perusahaan...</p>;
  }

  if (!company) {
    return (
      <div className="panel !mb-0">
        <p className="text-sm text-muted">Data perusahaan belum tersedia.</p>
      </div>
    );
  }

  return (
    <form onSubmit={saveCompany} className="flex flex-col gap-5">
      {/* Informasi Perusahaan */}
      <div className="panel !mb-0">
        <div className="mb-4 flex items-center gap-2">
          <Building2 size={18} className="text-brand-yellow" />
          <div>
            <h3 className="text-sm font-bold">Informasi Perusahaan</h3>
            <p className="text-[11.5px] text-muted">
              Informasi ini akan digunakan pada website dan dokumen perusahaan.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          <div>
            <label className="mb-1 block text-[11.5px] font-semibold text-muted">
              Nama Perusahaan
            </label>
            <input
              className="field-input w-full"
              name="name"
              value={company.name || ""}
              onChange={handleChange}
              placeholder="Nama perusahaan"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-[11.5px] font-semibold text-muted">
              Nama Singkat
            </label>
            <input
              className="field-input w-full"
              name="short_name"
              value={company.short_name || ""}
              onChange={handleChange}
              placeholder="Nama singkat perusahaan"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11.5px] font-semibold text-muted">
              Industri
            </label>
            <input
              className="field-input w-full"
              name="industry"
              value={company.industry || ""}
              onChange={handleChange}
              placeholder="Contoh: Oil & Gas, Manufacturing"
            />
          </div>
        </div>
      </div>

      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-surface">
          {logoPreview || company.logo ? (
            <img
              src={logoPreview || `${STORAGE_BASE}/${company.logo}`}
              alt="Logo perusahaan"
              className="h-full w-full object-contain p-2"
            />
          ) : (
            <Building2 size={32} className="text-muted" />
          )}
        </div>

        <div>
          <label className="mb-1 block text-[11.5px] font-semibold text-muted">
            Logo Perusahaan
          </label>

          <input
            type="file"
            accept=".svg,.jpg,.jpeg,.png,.webp,image/svg+xml,image/jpeg,image/png,image/webp"
            onChange={handleLogoChange}
            className="block w-full text-xs"
          />

          <p className="mt-1 text-[10.5px] text-muted">
            SVG, JPG, PNG, atau WebP. Maksimal 2 MB.
          </p>
        </div>
      </div>

      {/* Alamat */}
      <div className="panel !mb-0">
        <h3 className="mb-3 text-sm font-bold">Alamat Perusahaan</h3>

        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-[11.5px] font-semibold text-muted">
              Alamat
            </label>
            <textarea
              className="field-input min-h-[90px] w-full"
              name="address"
              value={company.address || ""}
              onChange={handleChange}
              placeholder="Alamat lengkap perusahaan"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
            <div>
              <label className="mb-1 block text-[11.5px] font-semibold text-muted">
                Kota
              </label>
              <input
                className="field-input w-full"
                name="city"
                value={company.city || ""}
                onChange={handleChange}
                placeholder="Kota"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11.5px] font-semibold text-muted">
                Provinsi
              </label>
              <input
                className="field-input w-full"
                name="province"
                value={company.province || ""}
                onChange={handleChange}
                placeholder="Provinsi"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11.5px] font-semibold text-muted">
                Kode Pos
              </label>
              <input
                className="field-input w-full"
                name="postal_code"
                value={company.postal_code || ""}
                onChange={handleChange}
                placeholder="Kode pos"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Kontak */}
      <div className="panel !mb-0">
        <h3 className="mb-3 text-sm font-bold">Kontak Perusahaan</h3>

        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          <div>
            <label className="mb-1 block text-[11.5px] font-semibold text-muted">
              Nomor Telepon
            </label>
            <input
              className="field-input w-full"
              name="phone"
              value={company.phone || ""}
              onChange={handleChange}
              placeholder="Nomor telepon perusahaan"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11.5px] font-semibold text-muted">
              Email
            </label>
            <input
              className="field-input w-full"
              name="email"
              type="email"
              value={company.email || ""}
              onChange={handleChange}
              placeholder="email@perusahaan.com"
            />
          </div>

          <div className="col-span-2 max-md:col-span-1">
            <label className="mb-1 block text-[11.5px] font-semibold text-muted">
              Website
            </label>
            <input
              className="field-input w-full"
              name="website"
              value={company.website || ""}
              onChange={handleChange}
              placeholder="https://www.perusahaan.com"
            />
          </div>
        </div>
      </div>

      {/* Legal */}
      <div className="panel !mb-0">
        <h3 className="mb-3 text-sm font-bold">Informasi Legal</h3>

        <div>
          <label className="mb-1 block text-[11.5px] font-semibold text-muted">
            NPWP
          </label>
          <input
            className="field-input w-full"
            name="npwp"
            value={company.npwp || ""}
            onChange={handleChange}
            placeholder="Nomor NPWP perusahaan"
          />
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary flex items-center gap-1.5 !text-white"
        >
          <Save size={15} />
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
}

export default function Settings() {
  const [tab, setTab] = useState("roles");

  return (
    <>
      <Topbar
        title="Settings"
        subtitle="Kelola role, akses halaman, dan akun karyawan"
      />

      <div className="mb-4 flex gap-2">
        {[
          ["roles", "Roles & Akses"],
          ["employees", "Karyawan"],
          ["company", "Perusahaan"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-[10px] px-3.5 py-2 text-[13px] font-semibold transition ${
              tab === key
                ? "bg-brand-orangedim text-brand-yellow"
                : "bg-surface2 text-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "roles" && <RolesTab />}
      {tab === "employees" && <EmployeesTab />}
      {tab === "company" && <CompanyTab />}
    </>
  );
}
