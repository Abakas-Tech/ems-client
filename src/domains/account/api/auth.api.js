import { axiosInstance } from "../../../utils/axios";

// email and password login api for admin employee and partner
const loginWithEmail = async (credentials) => {
  try {
    const response = await axiosInstance.post("/auth/login", credentials, {
      publicApi: true,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login error");
  }
};

// phone and id login api for worker and employer
const loginWithPhone = async (credentials) => {
  try {
    const response = await axiosInstance.post("/auth/login", credentials, {
      publicApi: true,
    });
    return response;
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

export {
  loginWithEmail,
  loginWithPhone,
  passwordResetRequest,
  passwordResetConfirm,
};
