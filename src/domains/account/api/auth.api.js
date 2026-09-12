import { axiosInstance } from "../../../utils/axios";

// email and password login api
const loginWithEmail = async (credentials) => {
  try {
    const response = await axiosInstance.post("/auth/login/email", credentials, {
      publicApi: true,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login error");
  }
};

// resert password request api for all users
const passwordResetRequest = async (data) => {
  try {
    const response = await axiosInstance.post(
      "/auth/password-reset/request",
      data,
      { publicApi: true },
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Forgot password error");
  }
};

// Reset Password function
const passwordResetConfirm = async (data) => {
  try {
    const response = await axiosInstance.post(
      "/auth/password-reset/confirm",
      data,
      { publicApi: true },
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Reset password error");
  }
};

export { loginWithEmail, passwordResetRequest, passwordResetConfirm };
