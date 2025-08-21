// axiosInstances.js
import axios from "axios";

const backend_server_url = import.meta.env.VITE_AXIOS_INSTANCE_BASE_URL;
const python_server_url = import.meta.env.VITE_AXIOS_PYTHON_BASE_URL;

// Node backend instance
const axiosInstance = axios.create({
  baseURL: backend_server_url,
  headers: {
    "Content-Type": "application/json",
  },
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

export { axiosInstance, axiosPythonInstance };
