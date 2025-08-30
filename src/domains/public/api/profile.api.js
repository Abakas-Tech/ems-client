import { axiosInstance } from "../../../utils/axios";

// Get agent profile info
export const getAgentProfile = async () => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await axiosInstance.get("/agent-profile", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data; // only response.data
  } catch (error) {
    // Throw sanitized error for frontend
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch agent profile"
    );
  }
};
