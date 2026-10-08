import { axiosInstance } from "../../../utils/axios";

// Messages sent from the public website's contact form (admin only)

const getContactMessages = async (params) => {
  try {
    const response = await axiosInstance.get("/contact/messages", { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Fetch messages error");
  }
};

const getUnreadContactCount = async () => {
  try {
    const response = await axiosInstance.get("/contact/messages/unread-count");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Fetch unread count error");
  }
};

const setContactMessageRead = async (id, isRead) => {
  try {
    const response = await axiosInstance.patch(`/contact/messages/${id}/read`, {
      is_read: isRead,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Update message error");
  }
};

const markAllContactMessagesRead = async () => {
  try {
    const response = await axiosInstance.patch("/contact/messages/read-all");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Update messages error");
  }
};

const setContactMessageStarred = async (id, isStarred) => {
  try {
    const response = await axiosInstance.patch(`/contact/messages/${id}/star`, {
      is_starred: isStarred,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Update message error");
  }
};

const deleteContactMessage = async (id) => {
  try {
    const response = await axiosInstance.delete(`/contact/messages/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Delete message error");
  }
};

export {
  getContactMessages,
  getUnreadContactCount,
  setContactMessageRead,
  markAllContactMessagesRead,
  setContactMessageStarred,
  deleteContactMessage,
};
