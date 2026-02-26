import { axiosInstance } from "../../../utils/axios";

const fetchFiles = async (params = {}) => {
  try {
    const response = await axiosInstance.get(`/files`, { params });
    return response.data.data; // Expected: { data: [], total: number }
  } catch (error) {
    if (error.response?.status === 400) {
      throw new Error(JSON.stringify(error.response.data.message));
    }
    throw new Error(error.response?.data?.message || "Failed to fetch files");
  }
};

const uploadFile = async (formData) => {
  try {
    delete formData["file_url"];
    const response = await axiosInstance.post(`/files`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to upload file");
  }
};

const updateFile = async (id, formData) => {
  try {
    delete formData["file_url"];
    const response = await axiosInstance.patch(`/files/${id}`, formData);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update file");
  }
};

const deleteFile = async (id) => {
  try {
    await axiosInstance.delete(`/files/${id}`);
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete file");
  }
};

export { fetchFiles, uploadFile, updateFile, deleteFile };
