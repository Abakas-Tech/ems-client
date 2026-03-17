import { axiosInstance } from "../../../utils/axios";

const getSocialMedias = async () => {
  try {
    const response = await axiosInstance.get("/social-media");
    console.log(response);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to get social medias",
    );
  }
};

export { getSocialMedias };
