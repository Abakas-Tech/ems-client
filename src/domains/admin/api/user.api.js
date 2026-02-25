import { axiosInstance } from "../../../utils/axios";

// GET ALL USERS
const getUsers = async (params = {}) => {
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
const getUserById = async (id) => {
  try {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "User fetch error");
  }
};

// CREATE USER
const createUser = async (payload) => {
  try {
    const response = await axiosInstance.post("/users", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "User creation error");
  }
};

// UPDATE USER
const updateUser = async (id, payload) => {
  try {
    const response = await axiosInstance.put(`/users/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "User update error");
  }
};

// DELETE USER (ADMIN)
const deleteUser = async (id) => {
  try {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "User delete error");
  }
};

export { getUsers, getUserById, createUser, updateUser, deleteUser };
