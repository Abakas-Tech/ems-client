import { axiosInstance } from "../../../utils/axios";


// GET ALL USERS 
export const getUsers = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/users", {
      params,
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Users fetch error");
  }
};

// GET USER BY ID
export const getUserById = async (id) => {
  try {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "User fetch error");
  }
};

// CREATE USER 
export const createUser = async (payload) => {
  try {
    const response = await axiosInstance.post("/users", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "User creation error");
  }
};


// UPDATE USER
export const updateUser = async (id, payload) => {
  try {
    const response = await axiosInstance.put(`/users/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "User update error");
  }
};


// DELETE USER (ADMIN)
export const deleteUser = async (id) => {
  try {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "User delete error");
  }
};
