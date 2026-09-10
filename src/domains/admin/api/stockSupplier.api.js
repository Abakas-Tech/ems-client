import { axiosInstance } from "../../../utils/axios";

const createSupplier = async (payload) => {
  try {
    const response = await axiosInstance.post("/stock/suppliers", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Create supplier error");
  }
};

const listSuppliers = async () => {
  try {
    const response = await axiosInstance.get("/stock/suppliers");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Fetch suppliers error");
  }
};

export { createSupplier, listSuppliers };
