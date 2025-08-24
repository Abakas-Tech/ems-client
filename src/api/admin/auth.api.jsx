import { axiosInstance } from "../../utils/axios";

//  Check current logged-in user with Bearer token
export const checkUser = async () => {
  const token = localStorage.getItem("authToken");
  return await axiosInstance.get("/auth/check-user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
// Admin login function
export const loginAdmin = async (credentials) => {
  try {
    const response = await axiosInstance.post("/auth/login", credentials);
    console.log(response.data);
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login error");
  }
};

// Forgot Password function
export const forgotPassword = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/forgot-password", data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Forgot password error");
  }
};

// Reset Password function
export const resetPassword = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/reset-password", data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Reset password error");
  }
};

// change Password function
export const changePassword = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/change-password", data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Change password error");
  }
};

// Get Profile function
export const getProfile = async () => {
  try {
    const response = await axiosInstance.get("/agent-profile");
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Profile fetch error");
  }
};

// Update Profile function
export const updateProfile = async (data) => {
  try {
    const response = await axiosInstance.put("/agent-profile", data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Profile update error");
  }
};
