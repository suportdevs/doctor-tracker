'use client';

// Browser API client for the admin panel and website forms.
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const TOKEN_KEY = 'dt_token';

export const tokenStore = {
  get: () => (typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY)),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(status, message, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

// Website content changed → ask Next.js to refresh its cached public pages (debounced).
const CMS_PATHS = ['/pages', '/menus', '/settings', '/media'];
let revalidateTimer;
function refreshWebsite() {
  clearTimeout(revalidateTimer);
  revalidateTimer = setTimeout(() => {
    fetch('/api/revalidate', { method: 'POST', headers: { Authorization: `Bearer ${tokenStore.get()}` } }).catch(() => {});
  }, 200);
}

async function request(method, path, body, { isForm } = {}) {
  const headers = {};
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !isForm) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_URL}/api${path}`, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });

  if (res.ok && method !== 'GET' && CMS_PATHS.some((p) => path.startsWith(p))) refreshWebsite();
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Session expired while using the admin → back to login.
    if (res.status === 401 && token && window.location.pathname.startsWith('/admin')) {
      tokenStore.clear();
      window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
    }
    throw new ApiError(res.status, data.message || 'Something went wrong', data);
  }
  return data;
}

// Drops empty values so URLs stay clean: { q: '', page: 2 } → "?page=2"
export const toQuery = (params) => {
  const s = new URLSearchParams(Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== '')).toString();
  return s ? `?${s}` : '';
};

export const api = {
  get: (path, params) => request('GET', `${path}${toQuery(params)}`),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  patch: (path, body) => request('PATCH', path, body),
  del: (path) => request('DELETE', path),
  upload: (path, formData) => request('POST', path, formData, { isForm: true }),
};
