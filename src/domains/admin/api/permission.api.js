import  axios  from "../../../utils/axios";

// GRANT PERMISSION
const grantPermissions = async (payload) => {
  try {
    const response = await axios.axiosInstance.post("/permissions/grant", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Grant permission error");
  }
};

// REVOKE PERMISSION
const revokePermissions = async (payload) => {
  try {
    const response = await axios.axiosInstance.post("/permissions/revoke", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Revoke permission error");
  }
};

// GET USER PERMISSIONS
const getPermission = async (userId) => {
  try {
    const response = await axios.axiosInstance.get(`/permissions/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Fetch permission error");
  }
};

export {
  grantPermissions,
  revokePermissions,
  getPermission,
};
