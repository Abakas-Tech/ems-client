import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  fetchNotifications,
  markNotificationRead,
  sendManualNotification,
} from "../../../api/notification.api";
import { listWorkers } from "../../../../admin/api/worker.api";
import { getUsers } from "../../../api/user.api";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import NotificationItem from "../NotificationItem/NotificationItem";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import CreateModal from "../../../../../shared/components/CreateModal/CreateModal";

const NotificationPage = () => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const [notifications, setNotifications] = useState({ data: [], total: 0 });
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showCompose, setShowCompose] = useState(false);

  // Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const ROLE_MAP = { 2: "Employee", 3: "Partner", 5: "Employer" };
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
        console.error("Failed to mark read:", e);
      }
    }
  };

  const handleUserSearch = async (val, role) => {
    setSearchTerm(val);
    if (!role || val.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      let response;
      if (role === "worker") {
        response = await listWorkers({ search: val });
        setSearchResults(response?.data?.items || []);
      } else {
        response = await getUsers({ search: val, role_id: role });
        setSearchResults(response?.data || []);
      }
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const handleSend = async (formValues) => {
    showLoader();
    try {
      // Convert recipient_type value to role name from ROLE_MAP
      if (formValues.recipient_type != "worker") {
        if (formValues.recipient_type === "2") {
          console.log("it's chnaged");
          formValues.recipient_type = "employee";
        } else if (formValues.recipient_type === "3") {
          formValues.recipient_type = "partner";
        } else if (formValues.recipient_type === "5") {
          formValues.recipient_type = "employer";
        }
      }
      console.log(formValues);
      await sendManualNotification(formValues);
      addMessage(true, "Notification sent successfully!");
      setShowCompose(false);
      setSearchTerm("");
      loadNotifications();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  // --- Search UI Logic ---
  const renderSearchField = useCallback(
    (field, inputValues, handleChange) => (
      <div className="position-relative">
        <input
          type="text"
          className="form-control"
          placeholder={
            inputValues.recipient_type
              ? "Type to search..."
              : "Choose a role first"
          }
          disabled={!inputValues.recipient_type}
          value={searchTerm}
          required={!inputValues.recipient_id}
          style={{ backgroundColor: "#EDF1FB", borderRadius: "8px" }}
          autoComplete="off"
          onChange={(e) =>
            handleUserSearch(e.target.value, inputValues.recipient_type)
          }
        />
        {searchResults.length > 0 && (
          <div
            className="list-group position-absolute w-100 shadow-lg mt-1 z-3"
            style={{ maxHeight: "200px", overflowY: "auto" }}
          >
            {searchResults.map((user) => (
              <button
                key={user.id}
                type="button"
                className="list-group-item list-group-item-action small py-2 d-flex justify-content-between"
                onClick={() => {
                  handleChange("recipient_id", user.id);
                  setSearchTerm(user.name || `${user.full_name}`);
                  setSearchResults([]);
                }}
              >
                <div>
                  <div className="fw-bold text-dark">
                    {user.name || `${user.full_name}`}
                  </div>
                  <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                    {user.email || user.phone_number}
                  </div>
                </div>
                <span className="badge bg-light text-primary border h-50 my-auto">
                  ID: {user.id}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    ),
    [searchTerm, searchResults],
  );

  const fields = useMemo(
    () => [
      {
        name: "recipient_type",
        label: "Recipient Role",
        type: "select",
        options: [
          { value: "worker", label: "Worker" },
          { value: "3", label: "Partner" },
          { value: "5", label: "Employer" },
          { value: "2", label: "Employee" },
        ],
      },
      {
        name: "recipient_id",
        label: "Find User",
        type: "custom",
      },
      {
        name: "message",
        label: "Message Body",
        type: "textarea",
      },
    ],
    [],
  );

  return (
    <div className="dashboard-wraper">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Notifications</h2>
          <p className="text-muted small mb-0">
            Manage and send system-wide alerts
          </p>
        </div>
        <button
          className="btn btn-main px-4 py-2 rounded-3 shadow-sm text-white fw-bold mt-3 mt-md-0"
          onClick={() => {
            setSearchTerm("");
            setShowCompose(true);
          }}
        >
          <i className="bi bi-send-plus me-2"></i> Send Alert
        </button>
      </div>

      <div className="card border-0 shadow-sm overflow-hidden rounded-4">
        <div className="row g-0">
          {/* Sidebar List */}
          <div
            className={`col-lg-5 border-end overflow-auto bg-white ${selectedNotification ? "d-none d-lg-block" : "col-12"}`}
            style={{ height: "calc(100vh - 250px)", minHeight: "500px" }}
          >
            <div className="p-3 bg-light border-bottom sticky-top z-1">
              <h6 className="fw-bold text-muted text-uppercase mb-0 small tracking-wider">
                Inbox
              </h6>
            </div>
            <div className="list-group list-group-flush">
              {notifications.data.length === 0 ? (
                <div className="p-5 text-center text-muted">
                  <i className="bi bi-inbox display-6"></i>
                  <p className="mt-2">No notifications found.</p>
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

          {/* Detail View */}
          <div
            className={`col-lg-7 bg-white ${!selectedNotification ? "d-none d-lg-flex" : "col-12 d-flex"} flex-column`}
            style={{ height: "calc(100vh - 250px)", minHeight: "500px" }}
          >
            {selectedNotification ? (
              <div className="d-flex flex-column h-100">
                <div className="p-3 p-md-4 border-bottom bg-white d-flex align-items-center">
                  <BackButton onClick={() => setSelectedNotification(null)} />
                  <div className="ms-3">
                    <h6 className="fw-bold text-dark mb-0">Message Details</h6>
                    <small className="text-muted d-flex align-items-center">
                      <i className="bi bi-clock me-1"></i>
                      {new Date(
                        selectedNotification.created_at,
                      ).toLocaleString()}
                    </small>
                  </div>
                </div>
                <div className="p-4 p-md-5 overflow-auto flex-grow-1">
                  <div
                    className="bg-light p-4 shadow-sm border border-light-subtle"
                    style={{
                      borderRadius: "20px 20px 20px 4px",
                      maxWidth: "90%",
                    }}
                  >
                    <p
                      className="text-dark lh-lg mb-0 text-break"
                      style={{ whiteSpace: "pre-wrap", fontSize: "1rem" }}
                    >
                      {selectedNotification.message}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="m-auto text-center py-5">
                <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
                  <i className="bi bi-chat-dots text-muted fs-1"></i>
                </div>
                <h6 className="fw-bold">Select a message</h6>
                <p className="text-muted small px-4">
                  Choose an item from the left to read its full content.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCompose && (
        <CreateModal
          show={showCompose}
          onClose={() => setShowCompose(false)}
          onCreate={handleSend}
          title="Compose Notification"
          fields={fields}
          btnLabel="Send Alert"
          renderCustomField={renderSearchField}
        />
      )}
    </div>
  );
};

export default NotificationPage;
