import { axiosInstance } from "../../../utils/axios";

const registerPushToken = async (data) => {
  const response = await axiosInstance.post(`/notifications/register-token`, data);
  return response.data;
}
const fetchNotifications = async (params) => {
  const response = await axiosInstance.get("/notifications", { params });
  return response.data;
};

const markNotificationRead = async (id) => {
  const response = await axiosInstance.patch(`/notifications/${id}`);
  return response.data;
};

const sendManualNotification = async (data) => {
  const response = await axiosInstance.post("/notifications", data);
  return response.data;
};

export { fetchNotifications, markNotificationRead, sendManualNotification, registerPushToken };
