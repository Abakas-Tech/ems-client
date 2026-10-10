import { axiosInstance } from "../../../utils/axios";

// send Contact Email function
const sendContactEmail = async (contactData) => {
  try {
    const response = await axiosInstance.post("/contact/email", contactData, {
      publicApi: true,
    });
    return response.data;
  } catch (error) {
    const data = error.response?.data;
    const err = new Error(
      data?.errors?.[0] || data?.message || "Failed to send contact email",
    );
    err.status = error.response?.status;
    err.errors = Array.isArray(data?.errors) ? data.errors : [];
    throw err;
  }
};

export default sendContactEmail;
