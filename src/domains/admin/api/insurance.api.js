import { axiosInstance } from "../../../utils/axios";

// GET INSURANCE PARTICULARS
const getInsuranceParticulars = async (workerIds) => {
  try {
    const response = await axiosInstance.post("/insurance/particulars", {
      workerIds,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Fetch insurance particulars error",
    );
  }
};

export { getInsuranceParticulars };
