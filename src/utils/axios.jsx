import axios from "axios";

// Environment-based URLs
const backend_server_url = import.meta.env.VITE_AXIOS_INSTANCE_BASE_URL;

// Node backend instance
const axiosInstance = axios.create({
  baseURL: backend_server_url,
  withCredentials: true,
});

export default axiosInstance;
