import  axiosInstance  from "../../../utils/axios";

// GET ALL EMPLOYERS for logged-in worker
const getEmployers = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/employers", {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Employers fetch error");
  }
};

// GET SINGLE EMPLOYER BY ID
const getEmployerById = async (employerId) => {
  try {
    const response = await axiosInstance.get(`/employers/${employerId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Employer fetch error");
  }
};

// CREATE EMPLOYER (ADMIN ONLY)
const createEmployer = async (payload) => {
  try {
    const response = await axiosInstance.post("/employers", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Employer creation error");
  }
};

// UPDATE EMPLOYER
const updateEmployer = async (employerId, payload) => {
  try {
    const response = await axiosInstance.put(
      `/employers/${employerId}`,
      payload,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Employer update error");
  }
};

// DELETE EMPLOYER (ADMIN ONLY)
const deleteEmployer = async (employerId) => {
  try {
    const response = await axiosInstance.delete(`/employers/${employerId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Employer delete error");
  }
};

export default {
  getEmployers,
  getEmployerById,
  createEmployer,
  updateEmployer,
  deleteEmployer,
};
