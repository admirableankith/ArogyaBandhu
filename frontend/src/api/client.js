import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-inject JWT token from localStorage if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('arogya_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized on protected route, can clear token
      // Avoid auto redirect if on login/public page
    }
    return Promise.reject(error);
  }
);

export default api;
