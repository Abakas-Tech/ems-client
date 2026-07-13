import { axiosInstance } from "../../../utils/axios";

// CREATE COMPLAINT
const createComplaint = async (payload) => {
  try {
    const response = await axiosInstance.post("/complaints", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Create complaint error");
  }
};

// GET COMPLAINTS
const getComplaints = async (params) => {
  try {
    const response = await axiosInstance.get("/complaints", { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Fetch complaints error");
  }
};

// GET COMPLAINT BY ID
const getComplaintById = async (id) => {
  try {
    const response = await axiosInstance.get(`/complaints/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Fetch complaint error");
  }
};

// UPDATE COMPLAINT STATUS
const updateComplaintStatus = async (id, status) => {
  try {
    const response = await axiosInstance.put(`/complaints/${id}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Update complaint status error",
    );
  }
};

// UPDATE COMPLAINT OUTCOME
const updateComplaintOutcome = async (id, complaint_outcome) => {
  try {
    const response = await axiosInstance.put(`/complaints/${id}/outcome`, {
      complaint_outcome,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Update complaint outcome error",
    );
  }
};
// UPDATE COMPLAINT
const updateComplaint = async (id, payload) => {
  try {
    const response = await axiosInstance.put(`/complaints/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Update complaint error");
  }
};

// ADD RESOLUTION ATTEMPTS
const addResolutionAttempts = async (id, attempts) => {
  try {
    const response = await axiosInstance.post(
      `/complaints/${id}/resolution-attempts`,
      { attempts },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Add resolution attempts error",
    );
  }
};

// DELETE COMPLAINT
const deleteComplaint = async (id) => {
  try {
    const response = await axiosInstance.delete(`/complaints/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Delete complaint error");
  }
};

export {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  updateComplaintOutcome,
  updateComplaint,
  addResolutionAttempts,
  deleteComplaint,
};
