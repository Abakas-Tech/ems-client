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


