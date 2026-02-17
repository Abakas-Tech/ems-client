import { axiosInstance } from "../../../utils/axios";
// change Password function
export const changePassword = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/change-password", data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Change password error");
  }
};

// change Password function
export const refreshTokenApi = async () => {
  try {
    const response = await axiosInstance.post("/auth/refresh");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Refresh token error");
  }
};

// change Password function
export const logoutApi = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/logout", data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Logout error");
  }
};
