// api/files.api.js
import { axiosInstance } from "../../../utils/axios";

const fetchFiles = async (params = {}) => {
  try {
    const response = await axiosInstance.get(`/files`, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch files");
  }
};

const uploadFile = async (formData) => {
  try {
    delete formData["file_url"];
    const response = await axiosInstance.post(`/files`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to upload file");
  }
};

const updateFile = async (id, formData) => {
  try {
    delete formData["file_url"];
    const response = await axiosInstance.patch(`/files/${id}`, formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update file");
  }
};

const fetchFile = async (id) => {
  try {
    const response = await axiosInstance.get(`/files/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch file");
  }
};
const deleteFile = async (id) => {
  try {
    const response = await axiosInstance.delete(`/files/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete file");
  }
};
const fetchCompanyFiles = async (filters) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      category = "",
      file_type = "",
    } = filters;

    const response = await axiosInstance.get(`/files/company/files`, {
      params: { page, limit, search, category, file_type },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch files");
  }
};

const fetchWorkerFolders = async (params) => {
  const {
    page = 1,
    limit = 20,
    name = "",
    passport = "",
    labourId = "",
  } = params;
  const response = await axiosInstance.get("/files/workers/folders", {
    params: { page, limit, name, passport, labourId },
  });
  return response.data;
};
const fetchWorkerDossier = async (workerId) => {
  const response = await axiosInstance.get(`/files/worker/${workerId}/dossier`);
  return response.data;
};
export {
  fetchFiles,
  uploadFile,
  updateFile,
  fetchFile,
  deleteFile,
  fetchCompanyFiles,
  fetchWorkerFolders,
  fetchWorkerDossier,
};
