import { axiosInstance } from "../../../utils/axios";

// Extract passport data
const extractPassport = async (formData) => {
  try {
    const response = await axiosInstance.post("/passport/extract", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to extract passport data",
    );
  }
};

export { extractPassport };
