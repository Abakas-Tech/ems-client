import {axiosInstance} from "../../utils/axios";

//  Check current logged-in user with Bearer token
export const checkUser = async () => {
  const token = localStorage.getItem("authToken");
  return await axiosInstance.get("api/auth/check-user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};