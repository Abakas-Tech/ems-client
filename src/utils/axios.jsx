import axios from "axios";

// Environment-based URLs
const backend_server_url = import.meta.env.VITE_AXIOS_INSTANCE_BASE_URL;
const python_server_url = import.meta.env.VITE_AXIOS_PYTHON_BASE_URL;

// Node backend instance
const axiosInstance = axios.create({
  baseURL: backend_server_url,
  withCredentials: true, // send cookies
});

// Python backend instance
const axiosPythonInstance = axios.create({
  baseURL: python_server_url,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // usually chatbot APIs don’t need cookies
});

// Request interceptor to attach token
const attachAuthToken = (config) => {
const token = sessionStorage.getItem("authToken"); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Error handler
const handleRequestError = (error) => Promise.reject(error);

// Attach interceptors
axiosInstance.interceptors.request.use(attachAuthToken, handleRequestError);

export { axiosInstance, axiosPythonInstance };
