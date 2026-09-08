import { axiosInstance } from "../../../utils/axios";

// Get notifications (paginated, optional is_read filter)
const getNotifications = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/admin-notifications", {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch notifications",
    );
  }
};

// Get unread count
// Cache-busted: this endpoint is polled repeatedly (mount, every socket
// reconnect, after every delete) with an identical URL and no params, so
// the browser's HTTP cache can — and did — silently serve a stale response
// instead of hitting the network. Headers + a throwaway query param force
// a real request every time.
const getUnreadCount = async () => {
  try {
    const response = await axiosInstance.get(
      "/admin-notifications/unread-count",
      {
        params: { _t: Date.now() },
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch unread count",
    );
  }
};

// Mark single notification as read
const markNotificationAsRead = async (id) => {
  try {
    const response = await axiosInstance.patch(
      `/admin-notifications/${id}/read`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to mark notification as read",
    );
  }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async () => {
  try {
    const response = await axiosInstance.patch("/admin-notifications/read-all");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to mark all notifications as read",
    );
  }
};

// Delete a single notification
const deleteNotification = async (id) => {
  try {
    const response = await axiosInstance.delete(`/admin-notifications/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete notification",
    );
  }
};

// Clear all notifications
const clearAllNotifications = async () => {
  try {
    const response = await axiosInstance.delete("/admin-notifications");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to clear notifications",
    );
  }
};

// Mark the notification matching a given activity as read (idempotent — no-op if none exists)
const markNotificationAsReadByReference = async (type, referenceId) => {
  try {
    const response = await axiosInstance.patch(
      `/admin-notifications/reference/${type}/${referenceId}/read`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to mark notification as read",
    );
  }
};

export {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  markNotificationAsReadByReference,
};
