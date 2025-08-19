import axios from "axios";

const backend_server_url = import.meta.env.VITE_AXIOS_INSTANCE_BASE_URL;

// Create instance
const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // send cookies
});

export default axiosInstance;
