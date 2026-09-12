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

// CREATE AGENT
const createAgent = async (data) => {
  try {
    const response = await axiosInstance.post("/workers/agent/agents", data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Create agent error");
  }
};

// GET ALL AGENTS
const getAgents = async (params) => {
  try {
    const response = await axiosInstance.get("/workers/agent/agents", {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Fetch agents error");
  }
};

// GET AGENT BY ID
const getAgent = async (agentId) => {
  try {
    const response = await axiosInstance.get(
      `/workers/agent/agents/${agentId}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Fetch agent error");
  }
};

// UPDATE AGENT
const updateAgent = async (agentId, data) => {
  try {
    const response = await axiosInstance.put(
      `/workers/agent/agents/${agentId}`,
      data,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Update agent error");
  }
};

// DELETE AGENT
const deleteAgent = async (agentId) => {
  try {
    const response = await axiosInstance.delete(
      `/workers/agent/agents/${agentId}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Delete agent error");
  }
};

export {
  createWorkerAgent,
  getWorkerAgents,
  getWorkerAgent,
  updateWorkerAgent,
  deleteWorkerAgent,
  createAgent,
  getAgents,
  getAgent,
  updateAgent,
  deleteAgent,
};
