import { axiosInstance } from "../../../utils/axios";


// send Contact Email function
const getLocation = async () => {
  try {
    const response = await axiosInstance.get("/location", {
      publicApi: true,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to get location info",
    );
  }
};

export default getLocation;
