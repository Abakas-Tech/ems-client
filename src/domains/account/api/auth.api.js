import { axiosInstance } from "../../../utils/axios";

// email and password login api for admin employee and partner
export const loginWithEmail = async (credentials) => {
  try {
    const response = await axiosInstance.post("/auth/login", credentials);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login error");
  }
};
// phone and id login api for worker and employer
export const loginWithPhone = async (credentials) => {
  try {
    const response = await axiosInstance.post("/auth/login/identifier", credentials);
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login error");
  }
};

// resert password request api for all users
export const passwordResetRequest = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/password-reset/request", data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Forgot password error");
  }
};

// Reset Password function
export const passwordResetConfirm = async (data) => {
  try {
    const response = await axiosInstance.post(
      "/auth/password-reset/confirm",
      data,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Reset password error");
  }
};