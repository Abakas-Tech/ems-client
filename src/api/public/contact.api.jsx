import instance from "../../utils/axios.jsx";

export const sendContactRequest = async (formData) => {
  try {
    const response = await instance.post("/contact", formData);
    return response.data;
  } catch (error) {
    console.error("Error sending contact request:", error.message);
    throw error;
  }
};
