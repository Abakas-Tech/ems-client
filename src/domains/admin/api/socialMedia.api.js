import { axiosInstance } from "../../../utils/axios";

// CREATE OR UPDATE SOCIAL MEDIA
const createOrUpdateSocialMedia = async (payload) => {
  try {
    const response = await axiosInstance.post("/social-media", payload);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Create or update social media error",
    );
  }
};

// GET SOCIAL MEDIA
const getSocialMedia = async () => {
  try {
    const response = await axiosInstance.get("/social-media");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Fetch social media error",
    );
  }
};

// DELETE SOCIAL MEDIA
const deleteSocialMedia = async () => {
  try {
    const response = await axiosInstance.delete("/social-media");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Delete social media error",
    );
  }
};

export { createOrUpdateSocialMedia, getSocialMedia, deleteSocialMedia };
