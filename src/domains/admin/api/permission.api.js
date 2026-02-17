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
export const revokePermission = async (payload) => {
  try {
    const response = await axiosInstance.post("/permissions/revoke", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Revoke permission error");
  }
};

