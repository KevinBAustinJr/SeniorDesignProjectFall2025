// api.js
// ----------------------
// Centralized fetch helper for HttpOnly cookie auth
// ----------------------
export async function apiGet(endpoint) {
  const res = await fetch(`/api/admin/${endpoint}`, {
    credentials: 'include', // ✅ send cookies automatically
  });

  if (res.status === 401) {
    throw new Error('Unauthorized'); // session expired or no token
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'API request failed');
  }

  return await res.json();
}
