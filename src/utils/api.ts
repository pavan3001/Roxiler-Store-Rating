import axios from 'axios';

// Determine API base URL:
// - If VITE_API_BASE_URL is set, use it (explicit override)
// - In production use the deployed Render URL as fallback
// - In development use a relative '/api' so Vite's dev proxy can forward requests and avoid CORS
const explicitBase = import.meta.env.VITE_API_BASE_URL;
const isProd = import.meta.env.PROD;
const API_BASE_URL = explicitBase
  ? explicitBase
  : isProd
  ? 'https://roxiler-store-rating-raiq.onrender.com/api'
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // ensure cookies (for session auth) and other credentials are sent
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;