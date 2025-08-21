import { axiosInstance } from "../../utils/axios";

// Function to send form data to backend 
export const sendContactRequest = async (formData) => {
  try {
    const response = await axiosInstance.post("/contact", formData);
    return response.data;
  } catch (error) {
    console.error("Error sending contact request:", error.message);
    throw error;
  }
};

// Function to send contact message 
export const sendContactMessage = async (contactForm) => {
  const res = await axiosInstance.post("/contact", contactForm);
  return res.data.data;
};

// Function to fetch agent profile
export const fetchAgentProfile = async () => {
  try {
    const response = await axiosInstance.get("/agent-profile");
    console.log(response);
    return response.data.data;
  } catch (error) {
    console.error(
      "Error fetching agent profile:",
      error.message,
      error.response?.data
    );
    return null; 
  }
};
