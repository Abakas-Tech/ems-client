import axios from "axios";
import refreshToken  from "../domains/admin/api/auth.api";

const backend_server_url = import.meta.env.VITE_AXIOS_INSTANCE_BASE_URL;

const axiosInstance = axios.create({
  baseURL: backend_server_url,
  withCredentials: true, // send cookies automatically
});

let access_token = null; // in-memory token
let isRefreshing = false;
let failedQueue = [];

// Process queued requests after refresh
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Update in-memory access token
const setAccessToken = (token) => {
  access_token = token;
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    if (access_token) {
      config.headers.Authorization = `Bearer ${access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh API
        const response = await refreshToken.refreshTokenApi();
        const newAccessToken = response.data?.access_token;

        if (!newAccessToken)
          throw new Error("No access_token returned from refresh");

        // Update in-memory token
        setAccessToken(newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Retry queued requests
        processQueue(null, newAccessToken);

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        window.location.href = "/login"; // redirect to login if refresh fails
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default {
  axiosInstance,
  setAccessToken,
};
