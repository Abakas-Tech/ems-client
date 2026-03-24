import { axiosInstance } from "../../../utils/axios";

// change Password function
const getGalleryItems = async () => {
  try {
    const response = await axiosInstance.get("/gallery", { publicApi: true });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "fetch gallery error");
  }
};

export default getGalleryItems;