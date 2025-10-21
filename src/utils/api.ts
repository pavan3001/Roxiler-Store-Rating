import axios from 'axios';

// Determine API base URL:
// - If VITE_API_BASE_URL is set, use it (explicit override)
// - In production use the deployed Render URL as fallback
// - In development use a relative '/api' so Vite's dev proxy can forward requests and avoid CORS
const explicitBase = import.meta.env.VITE_API_BASE_URL;
const isProd = import.meta.env.PROD;
// In development default to the local backend on port 5000 to avoid
// browser requests targeting the Vite dev port (which can cause
// net::ERR_CONNECTION_REFUSED if Vite isn't proxying). Use VITE_API_BASE_URL
// to override when needed.
const API_BASE_URL = explicitBase
  ? explicitBase
  : isProd
  ? 'https://roxiler-store-rating-raiq.onrender.com/api'
  : 'http://localhost:5000/api';

// Helpful log so developers know which base the client is using
try {
  console.info('[api] using base URL:', API_BASE_URL);
} catch {
  /* ignore */
}

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
    // Detailed logging to help debug network / CORS / server errors in the browser
    try {
      console.error('API response error:', {
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        responseData: error.response?.data,
        headers: error.response?.headers,
      });
    } catch {
      // ignore logging errors
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;