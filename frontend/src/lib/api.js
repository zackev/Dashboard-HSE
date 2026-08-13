/**
 * src/lib/api.js
 * -------------------------------------------------------------------------
 * Client API ke backend Laravel (/api/*), auth pakai Sanctum SPA (cookie
 * session + CSRF token), bukan token manual. Dipakai oleh semua halaman.
 * -------------------------------------------------------------------------
 */

const BASE = "/api";
export const STORAGE_BASE = "/storage";

let csrfReady = false;

/** Ambil cookie XSRF-TOKEN yang di-set Laravel lewat GET /sanctum/csrf-cookie. */
function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

/** Wajib dipanggil sebelum request yang mengubah state (POST/PUT/DELETE). */
async function ensureCsrf() {
  if (csrfReady && getCookie("XSRF-TOKEN")) return;
  await fetch("/sanctum/csrf-cookie", { credentials: "include" });
  csrfReady = true;
}

async function handle(res) {
  if (res.status === 401) {
    csrfReady = false;
    // Sesi habis / belum login -> lempar event supaya AuthContext redirect ke /login
    window.dispatchEvent(new CustomEvent("hse:unauthorized"));
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(
      json.error || json.message || `Request gagal (${res.status})`,
    );
  return json;
}

function authHeaders() {
  const token = getCookie("XSRF-TOKEN");
  return token ? { "X-XSRF-TOKEN": token } : {};
}

/** Bangun query string dari object, skip nilai null/undefined/"" biar URL bersih. */
function toQueryString(params) {
  if (!params) return "";
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      usp.append(key, value);
    }
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

export const api = {
  // Dipanggil api.get('/incidents') seperti biasa (tanpa params) TETAP jalan;
  // sekarang juga bisa api.get('/stats', { params: { period: 'today' } })
  get: (path, { params } = {}) =>
    fetch(`${BASE}${path}${toQueryString(params)}`, {
      credentials: "include",
    }).then(handle),

  postJson: async (path, body) => {
    await ensureCsrf();
    return fetch(`${BASE}${path}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(body),
    }).then(handle);
  },

  postForm: async (path, formData) => {
    await ensureCsrf();

    return fetch(`${BASE}${path}`, {
      method: "POST",
      credentials: "include",
      headers: {
        ...authHeaders(),
      },
      body: formData,
    }).then(handle);
  },

  putJson: async (path, body) => {
    await ensureCsrf();
    return fetch(`${BASE}${path}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(body),
    }).then(handle);
  },

  postForm: async (path, formData) => {
    await ensureCsrf();
    return fetch(`${BASE}${path}`, {
      method: "POST",
      credentials: "include",
      headers: { ...authHeaders() },
      body: formData,
    }).then(handle);
  },

  // Laravel tidak parse multipart di method PUT asli -> pakai POST + _method=PUT (method spoofing)
  putForm: async (path, formData) => {
    await ensureCsrf();
    formData.append("_method", "PUT");
    return fetch(`${BASE}${path}`, {
      method: "POST",
      credentials: "include",
      headers: { ...authHeaders() },
      body: formData,
    }).then(handle);
  },

  del: async (path) => {
    await ensureCsrf();
    return fetch(`${BASE}${path}`, {
      method: "DELETE",
      credentials: "include",
      headers: { ...authHeaders() },
    }).then(handle);
  },
};
