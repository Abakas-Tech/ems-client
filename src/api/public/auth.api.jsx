import {axiosInstance} from "../../utils/axios";

// Check current logged-in user
export const checkUser = async () => {
  return await axiosInstance.get("api/auth/check/user");
};

