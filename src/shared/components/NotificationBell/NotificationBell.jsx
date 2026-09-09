import React, { useEffect, useRef, useState } from "react";
import { FaBell } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import useAdminNotifications from "../../../context/AdminNotification/useAdminNotifications";

const timeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// Below this width, the 340px anchored dropdown no longer fits the
// viewport and gets clipped on one side. Switch to a full-width sheet
// pinned under the navbar instead of an anchored panel.
const MOBILE_BREAKPOINT = 576;

const NotificationBell = () => {
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useAdminNotifications();

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT,
  );
  const panelRef = useRef(null);

  // Track viewport width so the panel can switch layout on resize/rotate,
  // not just on initial mount.
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      fetchNotifications({ limit: 10 });
    }
  };

  const handleItemClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    setOpen(false);
    // notification.type is 'login' or 'audit' (matches the notifications
    // table's ENUM), reference_id is the login_activity/audit_logs row id.
    navigate(
      `/admin/activities/${notification.type}/${notification.reference_id}`,
    );
  };

  // Anchored dropdown on desktop/tablet, full-width sheet under the navbar
  // on mobile so it never overflows the screen edge.
  const panelStyle = isMobile
    ? {
        position: "fixed",
        top: "60px",
        left: "8px",
        right: "8px",
        width: "auto",
        maxHeight: "calc(100vh - 80px)",
        overflowY: "auto",
        zIndex: 1050,
      }
    : {
        position: "absolute",
        top: "calc(100% + 10px)",
        right: 0,
        width: "340px",
        maxWidth: "calc(100vw - 24px)",
        maxHeight: "420px",
        overflowY: "auto",
        zIndex: 1000,
      };

  return (
    <div className="position-relative" ref={panelRef}>
      <button
        type="button"
        className="btn btn-link p-0 position-relative"
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--maincolor)",
        }}
        onClick={handleToggle}
        aria-label="Notifications"
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "rgba(0,0,0,0.06)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <FaBell style={{ fontSize: "1.4rem" }} />
        {unreadCount > 0 && (
          <span
            className="position-absolute d-flex align-items-center justify-content-center"
            style={{
              top: "3px",
              right: "1px",
              minWidth: "18px",
              height: "16px",
              borderRadius: "8px",
              background: "#ff0000",
              color: "#fff",
              fontSize: "0.68rem",
              fontWeight: 600,
              padding: "0 4px",
              lineHeight: 1,
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="bg-white border rounded shadow" style={panelStyle}>
          <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
            <span className="fw-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                className="btn btn-link btn-sm p-0"
                style={{ fontSize: "0.8rem" }}
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center text-muted py-4 small">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-muted py-4 small">
              No notifications yet
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleItemClick(n)}
                className="px-3 py-2 border-bottom"
                style={{
                  cursor: "pointer",
                  backgroundColor: n.is_read ? "transparent" : "#f5f3ff",
                }}
              >
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <span className="fw-semibold" style={{ fontSize: "0.85rem" }}>
                    {n.title}
                  </span>
                  {!n.is_read && (
                    <span
                      className="rounded-circle bg-primary flex-shrink-0"
                      style={{
                        width: "8px",
                        height: "8px",
                        marginTop: "4px",
                      }}
                    />
                  )}
                </div>
                <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                  {n.message}
                </div>
                <div className="text-muted mt-1" style={{ fontSize: "0.7rem" }}>
                  {timeAgo(n.created_at)}
                </div>
              </div>
            ))
          )}

          <div className="text-center py-2 border-top">
            <Link
              to="/admin/activities"
              className="small"
              onClick={() => setOpen(false)}
            >
              View all
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
