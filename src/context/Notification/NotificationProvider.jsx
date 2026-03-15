import React, { useContext, useEffect, useState } from "react";
import NotificationContext from "./NotificationContext";
import { fetchNotifications } from "../../domains/admin/api/notification.api";
import useProfile from "../Profile/useProfile";
import {
  setupPushNotifications,
  listenToForegroundNotifications,
} from "../../utils/push-notifications"; // Adjust path

const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { profile } = useProfile();

  const getNotifications = async () => {
    if (!profile) return;
    try {
      const response = await fetchNotifications();
      const count =
        response?.data?.data?.filter((n) => !n.is_read)?.length || 0;
      setUnreadCount(count);
      return response;
    } catch (error) {
      // Don't show error messages during background polling to avoid annoying the user
      setUnreadCount(0);
    }
  };
  useEffect(() => {
    if (!profile) return;

    // Setup push notifications
    setupPushNotifications();
    getNotifications();

    // Listen for foreground notifications
    const unsubscribe = listenToForegroundNotifications(() => {
      getNotifications();
    });
    // Poll every 60 seconds
    const interval = setInterval(getNotifications, 60000);

    // Clean up on unmount
    return () => {
      if (unsubscribe) unsubscribe();
      clearInterval(interval);
    };
  }, [profile]);

  return (
    <NotificationContext.Provider
      value={{ setUnreadCount, unreadCount, getNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
