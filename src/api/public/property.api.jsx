import instance from "../../utils/axios";

export const fetchFeaturedProperties = async () => {
  try {
    const response = await instance.get("/properties?isFeatured=true");
    console.log(response);
    return response.data.data.properties || [];
  } catch (error) {
    console.error("Error fetching featured properties:", error.message);
    return [];
  }
};

export const fetchPropertyImages = async (propertyId) => {
  try {
    const response = await instance.get(`/properties/${propertyId}/images`);
    console.log(response);
    return response.data.data.data || [];
  } catch (error) {
    console.error("Error fetching property images:", error.message);
    return [];
  }
};
