const API_BASE = import.meta.env.VITE_API_URL || '';

export default function apiFetch(path, options = {}) {
  return fetch(`${API_BASE}${path}`, options);
}
