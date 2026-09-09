import React from "react";

const NotificationItem = ({ notification, onClick, isActive }) => {
  const isRead = notification.is_read;

  return (
    <button
      onClick={() => onClick(notification)}
      // Using list-group-item-action for professional hover effects without custom CSS
      className={`list-group-item list-group-item-action border-0 border-bottom p-3 ${
        isActive ? "bg-light" : "bg-white"
      }`}
      style={{ transition: "background-color 0.2s" }}
    >
      <div className="d-flex align-items-center">
        {/* Status Dot: Primary blue for unread, light gray for read */}
        <div className="me-3">
          <div
            className={`rounded-circle ${!isRead ? "bg-primary" : "bg-secondary-subtle border"}`}
            style={{ width: "8px", height: "8px" }}
          />
        </div>

        <div className="flex-grow-1 overflow-hidden">
          <div className="d-flex justify-content-between align-items-center mb-1">
            {/* Minimal difference: Bold for New, Normal for Read */}
            <span
              className={`small ${isRead ? "text-muted" : "fw-bold text-primary"}`}
            >
              {isRead ? "Read" : "New"}
            </span>
            <small className="text-muted" style={{ fontSize: "0.75rem" }}>
              {new Date(notification.created_at).toLocaleDateString()}
            </small>
          </div>

          {/* The message text: FontWeight is the main indicator */}
          <p
            className={`mb-0 text-truncate ${isRead ? "text-muted fw-normal" : "fw-semibold text-dark"}`}
          >
            {notification.message}
          </p>
        </div>
      </div>
    </button>
  );
};

export default NotificationItem;
