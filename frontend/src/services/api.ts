// @ts-nocheck
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials:true,
});



// Response interceptor to handle token refresh (skeleton for future use)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // If we receive a 401 Unauthorized and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        
        return api(originalRequest);
      } catch (err) {
        // Refresh failed, user needs to login again
        localStorage.removeItem("user");
        window.location.href = "/auth/login";
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
