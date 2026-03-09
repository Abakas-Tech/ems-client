import { axiosInstance } from "../../../utils/axios";

// CREATE GALLERY ITEM
const createGalleryItem = async (formData) => {
  try {
    const response = await axiosInstance.post("/gallery", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Create gallery item error",
    );
  }
};

// GET ALL GALLERY ITEMS
const getGalleryItems = async () => {
  try {
    const response = await axiosInstance.get("/gallery");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Fetch gallery items error",
    );
  }
};

// GET SINGLE GALLERY ITEM
const getGalleryItem = async (id) => {
  try {
    const response = await axiosInstance.get(`/gallery/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Fetch gallery item error",
    );
  }
};

// UPDATE GALLERY ITEM
const updateGalleryItem = async (id, formData) => {
  try {
    const response = await axiosInstance.put(`/gallery/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Update gallery item error",
    );
  }
};

// DELETE SINGLE GALLERY ITEM
const deleteGalleryItem = async (id) => {
  try {
    const response = await axiosInstance.delete(`/gallery/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Delete gallery item error",
    );
  }
};

// DELETE ALL GALLERY ITEMS
const deleteAllGalleryItems = async () => {
  try {
    const response = await axiosInstance.delete(`/gallery`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Delete all gallery items error",
    );
  }
};

export {
  createGalleryItem,
  getGalleryItems,
  getGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  deleteAllGalleryItems,
};
