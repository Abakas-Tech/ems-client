import { axiosInstance } from "../../../utils/axios";

// CREATE OR UPDATE LOCATION
const createOrUpdateLocation = async (payload) => {
  try {
    const response = await axiosInstance.post("/location", payload);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Create or update location error",
    );
  }
};

// GET LOCATION
const getLocation = async () => {
  try {
    const response = await axiosInstance.get("/location");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Fetch location error",
    );
  }
};

// DELETE LOCATION
const deleteLocation = async () => {
  try {
    const response = await axiosInstance.delete("/location");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Delete location error",
    );
  }
};

export {
  createOrUpdateLocation,
  getLocation,
  deleteLocation,
};

