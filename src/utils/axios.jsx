import axios from "axios";
import { refreshTokenApi } from "../domains/admin/api/auth.api";

const backend_server_url = import.meta.env.VITE_AXIOS_INSTANCE_BASE_URL;

const axiosInstance = axios.create({
  baseURL: backend_server_url,
  withCredentials: true,
});

let access_token = null;
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

// REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use(
  (config) => {
    const isPublic = config.publicApi === true;

    // Attach token only if request is protected (default)
    if (!isPublic && access_token) {
      config.headers.Authorization = `Bearer ${access_token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isPublic = originalRequest?.publicApi === true;

    // Only refresh for protected requests
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isPublic
    ) {
      if (isRefreshing) {
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
        const response = await refreshTokenApi();
        const newAccessToken = response.data?.access_token;

        if (!newAccessToken)
          throw new Error("No access_token returned from refresh");

        setAccessToken(newAccessToken);

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

const hasAccessToken = () => !!access_token;
const initAuth = async () => {
  try {
    const response = await refreshTokenApi();
    const newAccessToken = response.data?.access_token;

    if (newAccessToken) {
      setAccessToken(newAccessToken);
      return true;
    }
  } catch  {
    setAccessToken(null);
  }
  return false;
};

export { axiosInstance, setAccessToken, hasAccessToken , initAuth };
