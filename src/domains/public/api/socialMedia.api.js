import { axiosInstance } from "../../../utils/axios";

// get social media api function
const getSocialMedia = async (contactData) => {
  try {
    const response = await axiosInstance.get("/social-media", contactData, {
      publicApi: true,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to get social media",
    );
  }
};

export default getSocialMedia;
