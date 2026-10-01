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
let onAuthFailure = null;
const setAuthFailureHandler = (handler) => {
  onAuthFailure = handler;
};
let isLoggingOut = false;
const setLoggingOut = (value) => {
  isLoggingOut = value;
};

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

// Read in-memory access token (needed by the Socket.IO client, which can't
// use the axios interceptor since it authenticates via a handshake, not headers)
const getAccessToken = () => access_token;

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

// Simple, user-friendly messages for failures that don't come back with a
// message from the API (no connection, a timeout, or a proxy/gateway error
// page). Messages sent by the API itself are left exactly as they are.
const FRIENDLY_STATUS_MESSAGES = {
  408: "The request took too long. Please try again.",
  413: "The file is too large to upload. Please use a smaller file.",
  499: "The request took too long. Please try again.",
  502: "The server is temporarily unavailable. Please try again in a moment.",
  503: "The server is temporarily unavailable. Please try again in a moment.",
  504: "The server took too long to respond. Please try again.",
};

const applyFriendlyErrorMessage = (error) => {
  if (axios.isCancel?.(error)) return;

  const response = error.response;
  const apiMessage =
    response?.data && typeof response.data === "object"
      ? response.data.message
      : null;
  if (apiMessage) return;

  let friendly = null;
  if (!response) {
    friendly =
      error.code === "ECONNABORTED" || error.code === "ETIMEDOUT"
        ? "The request took too long. Please check your internet connection and try again."
        : "Could not reach the server. Please check your internet connection and try again.";
  } else {
    friendly =
      FRIENDLY_STATUS_MESSAGES[response.status] ||
      (response.status >= 500
        ? "Something went wrong on the server. Please try again."
        : null);
  }
  if (!friendly) return;

  // Both places the API helpers read from: error.response.data.message
  // and error.message.
  error.message = friendly;
  if (response) {
    response.data =
      response.data && typeof response.data === "object"
        ? { ...response.data, message: friendly }
        : { message: friendly };
  }
};

// RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isPublic = originalRequest?.publicApi === true;
    if (error.response?.status === 401 && isLoggingOut) {
      return Promise.reject(error);
    }

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

        if (onAuthFailure) {
          onAuthFailure();
        } else {
          window.location.href = "/";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    applyFriendlyErrorMessage(error);
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
  } catch {
    setAccessToken(null);
  }
  return false;
};

export {
  axiosInstance,
  setAccessToken,
  hasAccessToken,
  initAuth,
  setAuthFailureHandler,
  setLoggingOut,
  getAccessToken,
};
