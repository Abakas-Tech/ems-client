import React, { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import NotificationContext from "./NotificationContext";
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markNotificationAsReadByReference,
  markAllNotificationsAsRead,
  deleteNotification as deleteNotificationApi,
  clearAllNotifications,
} from "../../domains/admin/api/notification.api";
import { getAccessToken } from "../../utils/axios";
import useProfile from "../Profile/useProfile";
import useResponse from "../Response/useResponse";

// Socket.IO connects to the server origin directly, not the REST /api path
const backend_server_url = import.meta.env.VITE_AXIOS_INSTANCE_BASE_URL;
const socketBaseUrl = backend_server_url.replace(/\/api\/?$/, "");

const AdminNotificationProvider = ({ children }) => {
  const { profile } = useProfile();
  const { addMessage } = useResponse();

  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const socketRef = useRef(null);

  // General version counter for `unreadCount`. Every mutation that touches
  // unreadCount — not just refreshUnreadCount() — bumps this. A GET request
  // in flight when a newer mutation happens (a click, a socket push, another
  // refresh) is now provably stale and gets discarded instead of silently
  // overwriting the more recent value. Previously this ref was only bumped
  // by refreshUnreadCount() itself, so it could still clobber an optimistic
  // markAsRead()/delete()/socket update that happened while it was in flight.
  const unreadVersionRef = useRef(0);

  const isAdmin = profile?.role === "admin";

  const fetchNotifications = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const response = await getNotifications(params);
      setNotifications(response?.data || []);
      setPagination(response?.pagination || {});
    } catch (error) {
      addMessage(false, error.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    const requestVersion = ++unreadVersionRef.current;
    try {
      const response = await getUnreadCount();
      // Discard if ANYTHING has touched unreadCount since this request was
      // issued — another refresh, a markAsRead, a delete, or a socket event.
      if (requestVersion !== unreadVersionRef.current) return;
      setUnreadCount(response?.data?.count || 0);
    } catch {
      // silent — badge count is best-effort, don't surface a toast for it
    }
  }, []);

  // NOTE: reads `notifications` from closure so we can flip is_read in the
  // list immediately for the "unread" background styling. unreadCount is
  // NOT derived from local arithmetic anymore — see comment on
  // refreshUnreadCount below for why.
  const markAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)),
      );
      // Previously this did setUnreadCount(prev => prev - 1) directly, and
      // bumped unreadVersionRef so any in-flight refreshUnreadCount() GET
      // would get discarded rather than clobber the decrement. That fixed
      // the overcount bug, but created a dead end: once that GET was
      // discarded, nothing ever issued a NEW one, so the badge could only
      // resync on the next incidental mount/socket-reconnect — which is
      // exactly why a full page reload was "fixing" it.
      // Calling the real refresh here instead means every click always
      // converges to server truth, with no arithmetic to drift out of sync.
      refreshUnreadCount();
    } catch (error) {
      addMessage(false, error.message || "Failed to mark as read");
    }
  };

  const markAsReadByReference = async (type, referenceId) => {
    try {
      await markNotificationAsReadByReference(type, referenceId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.type === type && n.reference_id === referenceId
            ? { ...n, is_read: 1 }
            : n,
        ),
      );
      refreshUnreadCount();
    } catch {
      // silent — background side-effect of viewing a page, not a direct
      // user action, so a failed toast would just be noise
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      unreadVersionRef.current += 1; // invalidate any in-flight refresh
      setUnreadCount(0);
    } catch (error) {
      addMessage(false, error.message || "Failed to mark all as read");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await deleteNotificationApi(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      // Same reasoning as markAsRead above — a real refresh instead of
      // manual arithmetic guarantees a follow-up GET always fires, so a
      // discarded in-flight response is never a dead end.
      refreshUnreadCount();
    } catch (error) {
      addMessage(false, error.message || "Failed to delete notification");
    }
  };

  const clearAll = async () => {
    try {
      await clearAllNotifications();
      setNotifications([]);
      unreadVersionRef.current += 1; // invalidate any in-flight refresh
      setUnreadCount(0);
    } catch (error) {
      addMessage(false, error.message || "Failed to clear notifications");
    }
  };

  // Initial unread count fetch for admins (badge should show even before the
  // dropdown/panel is opened and fetchNotifications() is called)
  useEffect(() => {
    if (isAdmin) {
      refreshUnreadCount();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  // Socket connection lifecycle — admin only
  useEffect(() => {
    if (!isAdmin) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io(socketBaseUrl, {
      // auth as a function is re-evaluated on every (re)connection attempt,
      // so a token that rotated via the axios refresh flow is always current
      auth: (cb) => cb({ token: getAccessToken() }),
      withCredentials: true,
    });

    socket.on("notification:new", (notification) => {
      unreadVersionRef.current += 1; // invalidate any in-flight refresh
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    socket.on("connect", () => {
      refreshUnreadCount();
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        pagination,
        unreadCount,
        loading,
        fetchNotifications,
        refreshUnreadCount,
        markAsRead,
        markAsReadByReference,
        markAllAsRead,
        deleteNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default AdminNotificationProvider;
