import { axiosInstance } from "../../utils/axios";

export const fetchFiles = async (filters = {}) => {
  try {
    const params = {};
    if (filters.page) params.page = parseInt(filters.page, 10);
    if (filters.limit) params.limit = parseInt(filters.limit, 10);
    if (filters.fileType) params.fileType = filters.fileType;
    if (filters.category) params.category = filters.category;
    if (filters.fileName) params.fileName = filters.fileName;

    const response = await axiosInstance.get(`/files`, { params });
    return response.data.data; // Expected: { data: [], total: number }
  } catch (error) {
    if (error.response?.status === 400) {
      throw new Error(JSON.stringify(error.response.data.message));
    }
    throw new Error(error.response?.data?.message || "Failed to fetch files");
  }
};

export const uploadFile = async (fileData) => {
  try {
    const formData = new FormData();
    formData.append("file", fileData.file);
    formData.append("category", fileData.category);
    formData.append("description", JSON.stringify(fileData.description));
    formData.append("filename", fileData.file_name);
    const response = await axiosInstance.post(`/files`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  } catch (error) {
    console.log(error.response.data);
    throw new Error(error.response?.data?.message || "Failed to upload file");
  }
};

export const updateFile = async (id, fileData) => {
  try {
    const formData = new FormData();
    if (fileData.file) formData.append("file", fileData.file);
    if (fileData.category) formData.append("category", fileData.category);
    if (fileData.file_name) formData.append("filename", fileData.file_name);
    if (fileData.description)
      formData.append("description", fileData.description);

    const response = await axiosInstance.put(`/files/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  } catch (error) {
    console.log(error.response.data.message);
    throw new Error(error.response.data.message || "Failed to update file");
  }
};

export const renameFile = async (id, newName) => {
  try {
    const response = await axiosInstance.patch(`/files/${id}/rename`, {
      newName,
    });
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw new Error(error.response?.data?.message || "Failed to rename file");
  }
};

export const deleteFile = async (id) => {
  try {
    await axiosInstance.delete(`/files/${id}`);
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete file");
  }
};
