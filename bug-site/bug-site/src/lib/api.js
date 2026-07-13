// Client for the BugSite backend (server/). The Catalog uses fetchProducts()
// with a static fallback, but the newer admin/community features below have no
// fallback on purpose — they only work when the Express + MongoDB API is up.
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request(path, options) {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const API_BASE = BASE;

// --- products ---
export const fetchProducts = () => request('/products');
export const createProduct = (body) => request('/products', { method: 'POST', body: JSON.stringify(body) });
export const updateProduct = (slug, body) => request(`/products/${slug}`, { method: 'PATCH', body: JSON.stringify(body) });
export const deleteProduct = (slug) => request(`/products/${slug}`, { method: 'DELETE' });

// --- reviews ---
export const fetchReviews = (slug) => request(slug ? `/reviews?slug=${encodeURIComponent(slug)}` : '/reviews');
export const createReview = (body) => request('/reviews', { method: 'POST', body: JSON.stringify(body) });
export const deleteReview = (id) => request(`/reviews/${id}`, { method: 'DELETE' });

// --- stats ---
export const fetchStats = () => request('/stats');
