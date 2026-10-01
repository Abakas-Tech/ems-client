import { axiosInstance } from "../../../utils/axios";

// ─────────────────────────────────────────────────────────────
// ORGANIZATION SETTINGS (Admin only — the API returns 403 for staff)
// Stamp & signature images, stored on Cloudinary by the server.
// ─────────────────────────────────────────────────────────────

const fetchOrganizationSettings = async () => {
  try {
    const response = await axiosInstance.get("/organization-settings");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error fetching organization settings",
    );
  }
};

// kind: "stamp" | "signature"
const uploadOrganizationImage = async (kind, file) => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await axiosInstance.post(
      `/organization-settings/${kind}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || `Failed to upload ${kind}`);
  }
};

const deleteOrganizationImage = async (kind) => {
  try {
    const response = await axiosInstance.delete(
      `/organization-settings/${kind}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || `Failed to delete ${kind}`);
  }
};

export {
  fetchOrganizationSettings,
  uploadOrganizationImage,
  deleteOrganizationImage,
};
