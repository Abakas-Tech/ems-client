import React, { useState, useEffect } from "react";
import {
  fetchNotifications,
  markNotificationRead,
  sendManualNotification,
} from "../../../api/notification.api";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import NotificationItem from "../NotificationItem/NotificationItem";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
const NotificationPage = () => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const [notifications, setNotifications] = useState({ data: [], total: 0 });
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showCompose, setShowCompose] = useState(false);

  const [formData, setFormData] = useState({
    recipient_type: "worker",
    recipient_id: "",
    message: "",
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    showLoader();
    try {
      const response = await fetchNotifications();
      setNotifications({
        data: response?.data.data || [],
        total: response?.pagination?.total || 0,
      });
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  const handleSelect = async (notif) => {
    setSelectedNotification(notif);
    if (!notif.is_read) {
      try {
        await markNotificationRead(notif.id);
        setNotifications((prev) => ({
          ...prev,
          data: prev.data.map((n) =>
            n.id === notif.id ? { ...n, is_read: true } : n,
          ),
        }));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    showLoader();
    try {
      await sendManualNotification(formData);
      addMessage(true, "Notification sent!");
      setShowCompose(false);
      setFormData({ recipient_type: "worker", recipient_id: "", message: "" });
      loadNotifications();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="dashboard-wraper">
      {/* Header - Consistent Alignment */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-2">Notifications</h2>
          <p className="text-muted mb-0">Stay updated with system activity</p>
        </div>
        <div className="mt-3 mt-md-0">
          <button
            className="btn btn-main px-4 py-2 rounded-3 shadow-sm fw-semibold text-white"
            onClick={() => setShowCompose(true)}
          >
            <i className="bi bi-send-plus me-2"></i> Send Alert
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm overflow-hidden rounded-3">
        <div className="row g-0">
          {/* List Section */}
          <div
            className={`col-lg-5 border-end overflow-auto bg-white ${
              selectedNotification ? "d-none d-lg-block" : "col-12"
            }`}
            style={{ height: "calc(100vh - 250px)", minHeight: "500px" }}
          >
            <div className="p-3 bg-light border-bottom sticky-top z-1">
              <span className="fw-bold text-dark small text-uppercase tracking-wider">
                Recent Notifications
              </span>
            </div>

            <div className="list-group list-group-flush">
              {notifications.data.length === 0 ? (
                <div className="p-5 text-center my-auto">
                  <i className="bi bi-inbox text-muted display-6"></i>
                  <p className="text-muted small mt-2">No messages yet</p>
                </div>
              ) : (
                notifications.data.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onClick={handleSelect}
                    isActive={selectedNotification?.id === n.id}
                  />
                ))
              )}
            </div>
          </div>

          {/* Detail Section */}
          <div
            className={`col-lg-7 bg-white ${
              !selectedNotification ? "d-none d-lg-flex" : "col-12 d-flex"
            } flex-column`}
            style={{ height: "calc(100vh - 250px)", minHeight: "500px" }}
          >
            {selectedNotification ? (
              <div className="d-flex flex-column h-100">
                {/* Detail Header */}
                <div className="p-3 p-md-4 border-bottom bg-white">
                  <div className="d-flex align-items-center">
                    <BackButton onClick={() => setSelectedNotification(null)} />
                    <div>
                      <h6 className="fw-bold text-dark mb-0">Message Thread</h6>
                      <small className="text-muted">
                        {new Date(
                          selectedNotification.created_at,
                        ).toLocaleString()}
                      </small>
                    </div>
                  </div>
                </div>

                {/* Detail Body */}
                <div className="p-4 p-md-5 overflow-auto flex-grow-1">
                  <div className="bg-light p-4 rounded-3 border-start border-primary border-4 shadow-sm">
                    <p
                      className="text-dark lh-base mb-0 text-break"
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {selectedNotification.message}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="m-auto text-center py-5">
                <div
                  className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: "80px", height: "80px" }}
                >
                  <i className="bi bi-chat-left-text text-muted fs-2"></i>
                </div>
                <h6 className="text-dark fw-bold">Select a message</h6>
                <p className="text-muted small">
                  Choose a notification from the list to view its full content.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual Send Modal */}
      {showCompose && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0">
              <div className="modal-header">
                <h5 className="fw-bold mb-0">New System Alert</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCompose(false)}
                ></button>
              </div>
              <form onSubmit={handleSend}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label small text-muted fw-bold">
                        Type
                      </label>
                      <select
                        className="form-select"
                        value={formData.recipient_type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            recipient_type: e.target.value,
                          })
                        }
                      >
                        <option value="worker">Worker</option>
                        <option value="partner">Partner</option>
                        <option value="employer">Employer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-muted fw-bold">
                        User ID
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        required
                        value={formData.recipient_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            recipient_id: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small text-muted fw-bold">
                        Message
                      </label>
                      <textarea
                        className="form-control"
                        rows="5"
                        required
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0 px-4 pb-4">
                  <button
                    type="button"
                    className="btn btn-light px-4"
                    onClick={() => setShowCompose(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-main text-white px-4"
                  >
                    Send Notification
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
