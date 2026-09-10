import { axiosInstance } from "../../../utils/axios";

const createBatch = async (payload) => {
  try {
    const response = await axiosInstance.post("/stock/inventory", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Add batch error");
  }
};

const listBatches = async () => {
  try {
    const response = await axiosInstance.get("/stock/inventory");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Fetch inventory error",
    );
  }
};

export { createBatch, listBatches };
