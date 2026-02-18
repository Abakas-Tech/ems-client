import { axiosInstance } from "../../../utils/axios";


// GRANT PERMISSION 
export const grantPermissions = async (payload) => {
  try {
    const response = await axiosInstance.post("/permissions/grant", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Grant permission error");
  }
};


// REVOKE PERMISSION 
export const revokePermissions = async (payload) => {
  try {
    const response = await axiosInstance.post("/permissions/revoke", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Revoke permission error");
  }
};

// GET USER PERMISSIONS
export const getPermission = async (userId) => {
 
  try {
    const response = await axiosInstance.get(`/permissions/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Fetch permission error");
  }
};
