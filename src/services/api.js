import axios from 'axios';

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Fix: skip redirect on the initial profile-load request — AuthContext
      // already handles token removal. Only redirect on subsequent authenticated calls.
      const isProfileLoad = error.config?._isProfileLoad;
      if (!isProfileLoad) {
        localStorage.removeItem('token');
        // Use replace so the browser back-button doesn't loop
        window.location.replace('/');
      }
    }
    return Promise.reject(error);
  }
);

export default API;