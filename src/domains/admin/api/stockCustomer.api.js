import { axiosInstance } from "../../../utils/axios";

const createCustomer = async (payload) => {
  try {
    const response = await axiosInstance.post("/stock/customers", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Add pharmacy error");
  }
};

const listCustomers = async () => {
  try {
    const response = await axiosInstance.get("/stock/customers");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Fetch pharmacies error",
    );
  }
};

const getLedger = async () => {
  try {
    const response = await axiosInstance.get("/stock/customers/ledger");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Fetch credit ledger error",
    );
  }
};

const recordPayment = async (customerId, amount) => {
  try {
    const response = await axiosInstance.post(
      `/stock/customers/${customerId}/payments`,
      { amount },
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Record payment error");
  }
};

export { createCustomer, listCustomers, getLedger, recordPayment };
