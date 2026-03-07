import React, { useEffect, useState } from "react";
import NotificationContext from "./NotificationContext";
import { fetchNotifications } from "../../domains/admin/api/notification.api";
import useResponse from "../Response/useResponse";

const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { addMessage } = useResponse();

  const getNotifications = async () => {
    try {
      const response = await fetchNotifications();
      const count = response?.data?.data?.filter((n) => !n.is_read).length || 0;
      setUnreadCount(count);
      return response;
    } catch (error) {
      // Don't show error messages during background polling to avoid annoying the user
      setUnreadCount(0);
    }
  };
  useEffect(() => {
    getNotifications();

    // Poll every 60 seconds
    const interval = setInterval(getNotifications, 60000);

    // Clean up on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ setUnreadCount, unreadCount, getNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
