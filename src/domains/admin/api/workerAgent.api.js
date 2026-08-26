import { axiosInstance } from "../../../utils/axios";

// CREATE WORKER AGENT INFORMATION
const createWorkerAgent = async (userId, data) => {
  try {
    const response = await axiosInstance.post(`/workers/agent/${userId}`, data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Create worker agent error",
    );
  }
};

// GET ALL WORKER AGENTS
const getWorkerAgents = async () => {
  try {
    const response = await axiosInstance.get("/workers/agent/all");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Fetch worker agents error",
    );
  }
};

// GET WORKER AGENT BY USER ID
const getWorkerAgent = async (userId) => {
  try {
    const response = await axiosInstance.get(`/workers/agent/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Fetch worker agent error",
    );
  }
};

// UPDATE WORKER AGENT INFORMATION
const updateWorkerAgent = async (userId, data) => {
  try {
    const response = await axiosInstance.put(`/workers/agent/${userId}`, data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Update worker agent error",
    );
  }
};

// DELETE WORKER AGENT INFORMATION
const deleteWorkerAgent = async (userId) => {
  try {
    const response = await axiosInstance.delete(`/workers/agent/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Delete worker agent error",
    );
  }
};

export {
  createWorkerAgent,
  getWorkerAgents,
  getWorkerAgent,
  updateWorkerAgent,
  deleteWorkerAgent,
};
