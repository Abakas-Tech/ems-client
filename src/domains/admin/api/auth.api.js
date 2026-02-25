import axios from "../../../utils/axios";

// change Password function
const changePassword = async (data) => {
  try {
    const response = await axios.axiosInstance.post("/auth/change-password", data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Change password error");
  }
};

// change Password function
const refreshTokenApi = async () => {
  try {
    const response = await axios.axiosInstance.post("/auth/refresh");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Refresh token error");
  }
};

// change Password function
const logoutApi = async (data) => {
  try {
    const response = await axios.axiosInstance.post("/auth/logout", data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Logout error");
  }
};

export default {
  changePassword,
  refreshTokenApi,
  logoutApi,
};
