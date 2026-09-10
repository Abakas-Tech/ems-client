import { axiosInstance } from "../../../utils/axios";

const createOrder = async (payload) => {
  try {
    const response = await axiosInstance.post("/stock/orders", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Create order error");
  }
};

const listOrders = async () => {
  try {
    const response = await axiosInstance.get("/stock/orders");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Fetch orders error");
  }
};

const updateOrder = async (id, payload) => {
  try {
    const response = await axiosInstance.patch(
      `/stock/orders/${id}`,
      payload,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Update order error");
  }
};

export { createOrder, listOrders, updateOrder };
