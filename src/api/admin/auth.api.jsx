import { axiosInstance } from "../../utils/axios";

//  Check current logged-in user with Bearer token
export const checkUser = async () => {
  const token = localStorage.getItem("authToken");
  return await axiosInstance.get("/auth/check-user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const loginAdmin = async (credentials) => {
  try {
    const response = await axiosInstance.post("/auth/login", credentials);
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login error");
  }
};
