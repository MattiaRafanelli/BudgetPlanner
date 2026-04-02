const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const api = {
  get: (endpoint: string) =>
    fetch(`${API_BASE}${endpoint}`).then(res => res.json()),

  post: (endpoint: string, data: unknown) =>
    fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),

  put: (endpoint: string, data: unknown) =>
    fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),

  delete: (endpoint: string) =>
    fetch(`${API_BASE}${endpoint}`, { method: 'DELETE' }).then(res => res.json()),
};
