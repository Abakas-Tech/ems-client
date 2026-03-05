import { axiosInstance } from "../../../utils/axios";

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

export { fetchNotifications, markNotificationRead, sendManualNotification };
