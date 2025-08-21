import { axiosInstance } from "../../utils/axios";

export const fetchFeaturedProperties = async () => {
  try {
    const response = await axiosInstance.get("/properties?isFeatured=true");
    return response.data.data.properties || [];
  } catch (error) {
    console.error("Error fetching featured properties:", error.message);
    return [];
  }
};

export const fetchFeaturedPropertyImages = async (propertyId) => {
  try {
    const response = await axiosInstance.get(
      `/properties/${propertyId}/images`
    );
    console.log(response);
    return response.data.data.data || [];
  } catch (error) {
    console.error("Error fetching property images:", error.message);
    return [];
  }
};
