import { axiosInstance } from "../../../utils/axios";

// send Contact Email function
const sendContactEmail = async (contactData) => {
  try {
    const response = await axiosInstance.post("/contact/email", contactData, {
      publicApi: true,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to send contact email",
    );
  }
};

export default sendContactEmail;
