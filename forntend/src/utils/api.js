import axios from 'axios';

// Prefer VITE_API_URL from env; fall back to the backend default when missing.
const baseURL = import.meta.env?.VITE_API_URL || 'http://129.159.225.108:5000/api';

const api = axios.create({
  baseURL,
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 🔴 FORCE NO CACHE PER REQUEST (important)
  config.headers['Cache-Control'] = 'no-cache';

  return config;
});

export default api;
