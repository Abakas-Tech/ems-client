import instance from "../../utils/axios";

export const fetchFeaturedProperties = async () => {
  try {
    const response = await instance.get("/properties?isFeatured=true");
    return response.data.data.properties || [];
  } catch (error) {
    console.error("Error fetching featured properties:", error.message);
    return [];
  }
};
