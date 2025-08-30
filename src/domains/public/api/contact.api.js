import { axiosInstance } from "../../../utils/axios";

// Function to send form data to backend
export const sendContactRequest = async (formData) => {
  try {
    const response = await axiosInstance.post("/contact", formData);
    return response.data; // only response.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to send contact request"
    );
  }
};

// Function to fetch agent profile
export const fetchAgentProfile = async () => {
  try {
    const response = await axiosInstance.get("/agent-profile");
    return response.data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch agent profile"
    );
  }
};
