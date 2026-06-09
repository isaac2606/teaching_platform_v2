import axios from "axios";

const API_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add the JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh (skeleton for future use)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // If we receive a 401 Unauthorized and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        // Example refresh logic (you will need a refresh endpoint on backend)
        // const res = await axios.post(`${API_URL}/auth/refresh`, { token: refreshToken });
        // localStorage.setItem("accessToken", res.data.accessToken);
        // originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        // return api(originalRequest);
        return Promise.reject(error); // fallback until refresh endpoint exists
      } catch (err) {
        // Refresh failed, user needs to login again
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
