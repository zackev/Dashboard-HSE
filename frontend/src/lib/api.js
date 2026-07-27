/**
 * src/lib/api.js
 * -------------------------------------------------------------------------
 * Client API kecil untuk komunikasi ke backend Express (/api/*).
 * Dipakai oleh semua halaman lewat hook useCrud (lihat lib/useCrud.js).
 * -------------------------------------------------------------------------
 */

const BASE = '/api';

async function handle(res) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Request gagal (${res.status})`);
  return json;
}

export const api = {
  get: (path) => fetch(`${BASE}${path}`).then(handle),

  postJson: (path, body) =>
    fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(handle),

  putJson: (path, body) =>
    fetch(`${BASE}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(handle),

  postForm: (path, formData) =>
    fetch(`${BASE}${path}`, { method: 'POST', body: formData }).then(handle),

  putForm: (path, formData) =>
    fetch(`${BASE}${path}`, { method: 'PUT', body: formData }).then(handle),

  del: (path) => fetch(`${BASE}${path}`, { method: 'DELETE' }).then(handle)
};
