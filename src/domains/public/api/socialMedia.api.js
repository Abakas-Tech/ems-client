import { axiosInstance } from "../../../utils/axios";

const getSocialMedias = async () => {
  try {
    const response = await axiosInstance.get("/social-media", {
      publicApi: true,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to get social medias",
    );
  }
};

export default getSocialMedias;
