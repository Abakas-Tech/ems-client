import axiosInstance from "../../utils/axios";

// Fetch agent profile
export const fetchAgentProfile = async () => {
  try {
    const response = await axiosInstance.get("/agent-profile");
    console.log("Agent response:", response);
    return response.data.data || null; // return agent object
  } catch (error) {
    console.error("Error fetching agent profile:", error.message);
    return null;
  }
};


