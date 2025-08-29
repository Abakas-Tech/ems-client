import { axiosInstance } from "../../../utils/axios";

// Get agent profile info
export const getAgentProfile = async () => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await axiosInstance.get("/agent-profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || error.message || "Unknown error",
    };
  }
};
