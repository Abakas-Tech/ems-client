import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
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
import useNotification from "../../../../../context/Notification/useNotification";
import RoleButton from "../../../../../shared/components/RoleButton/RoleButton";

const NotificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getNotifications } = useNotification();
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  // --- Bulk Selection Data from Navigation State ---
  const incomingBulkIds = location.state?.bulkIds || null;
  const incomingType = location.state?.bulkType || null;
  const incomingName = location.state?.bulkName || null;
  const [notifications, setNotifications] = useState({ data: [], total: 0 });
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showCompose, setShowCompose] = useState(false);

  // Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    loadNotifications();

    // Trigger modal automatically if navigating from Worker/User list with IDs
    if (incomingBulkIds && incomingBulkIds.length > 0) {
      setShowCompose(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingBulkIds]);

  const loadNotifications = async () => {
    showLoader();
    try {
      const response = await getNotifications();
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
        getNotifications();
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
      // 1. Create a deep copy of the form values
      const finalData = {
        ...formValues,
        recipient_id: incomingBulkIds
          ? incomingBulkIds
          : formValues.recipient_id,
      };

      // 2. Define the strict mapping required by your Backend Joi validation
      const ROLE_MAP = {
        2: "employee",
        3: "partner",
        5: "employer",
        worker: "worker",
        employee: "employee", // Handle cases where it might already be a string
        partner: "partner",
        employer: "employer",
      };

      // 3. Convert the recipient_type to the required string format
      // We use .toString() to handle cases where the value might be a number
      const currentType = finalData.recipient_type?.toString();
      finalData.recipient_type = ROLE_MAP[currentType] || currentType;

      // 4. Send to API
      await sendManualNotification(finalData);

      addMessage(
        true,
        `Sent successfully to ${Array.isArray(finalData.recipient_id) ? finalData.recipient_id.length : 1} recipient(s)!`,
      );

      setShowCompose(false);
      setSearchTerm("");
      navigate(location.pathname, { replace: true, state: {} });
      loadNotifications();
    } catch (err) {
      // This is where your "recipient type must be one of..." error was being caught
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  // --- Custom Field Rendering (The Lock UI) ---
  const renderSearchField = useCallback(
    (field, inputValues, handleChange) => {
      // 1. Single User Mode (Locked)
      if (incomingBulkIds && incomingBulkIds.length === 1) {
        return (
          <div className="form-control d-flex align-items-center justify-content-between bg-light border-primary-subtle">
            <div>
              <i className="bi bi-person-fill text-primary me-2"></i>
              <span className="fw-bold text-primary"> {incomingName}</span>
            </div>
          </div>
        );
      }

      // 2. Bulk Mode (Locked)
      if (incomingBulkIds && incomingBulkIds.length > 1) {
        return (
          <div className="form-control d-flex align-items-center justify-content-between bg-light">
            <span className="text-primary fw-bold">
              <i className="bi bi-people-fill me-2"></i>
              {incomingBulkIds.length} Selected Recipients
            </span>
            <span className="badge bg-primary-subtle text-primary">
              Bulk Mode
            </span>
          </div>
        );
      }

      // 3. Manual Search Mode (Empty State)
      return (
        <>
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
              className="list-group position-absolute shadow-lg mt-1 z-3 w-auto"
              style={{
                maxHeight: "200px",
                overflowY: "auto",
                border: "1px solid #dee2e6",
              }}
            >
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  // Added w-100 and overflow-hidden here
                  className="list-group-item list-group-item-action small py-2 px-5 ps-3  d-flex align-items-center w-100 overflow-hidden"
                  onClick={() => {
                    handleChange("recipient_id", user.id);
                    setSearchTerm(user.name || `${user.full_name}`);
                    setSearchResults([]);
                  }}
                >
                  <div className="text-start w-100" style={{ minWidth: 0 }}>
                    <div className="fw-bold text-dark mb-0 text-truncate">
                      {user.name || `${user.full_name}`}
                    </div>
                    <div
                      className="text-muted text-truncate"
                      style={{ fontSize: "0.7rem", lineHeight: "1" }}
                    >
                      {user.email || user.phone_number}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      );
    },
    [searchTerm, searchResults, incomingBulkIds],
  );
  // --- Modal Form Configuration ---
  const fields = useMemo(() => {
    // Determine the label for the Recipient ID field
    let idLabel = "Find User";
    if (incomingBulkIds) {
      idLabel = incomingBulkIds.length === 1 ? "Recipient Info" : "Group Info";
    }
    const normalizedType = incomingType?.toString();
    return [
      {
        name: "recipient_type",
        label: "Recipient Role",
        type: "select",
        disabled: !!incomingBulkIds, // Locked if IDs are passed
        initialValue: normalizedType || "",
        options: [
          { value: "worker", label: "Worker" },
          { value: "3", label: "Partner" },
          { value: "5", label: "Employer" },
          { value: "2", label: "Employee" },
        ],
      },
      {
        name: "recipient_id",
        label: idLabel,
        type: "custom",
      },
      {
        name: "message",
        label: "Message Body",
        type: "textarea",
        placeholder: "Write your message here...",
      },
    ];
  }, [incomingBulkIds, incomingType]);

  return (
    <div className="dashboard-wraper">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Notifications</h2>
          <p className="text-muted small mb-0">
            Manage and send system-wide alerts
          </p>
        </div>
        <RoleButton
          visibleTo={[2, 1]}
          className="btn btn-main px-4 py-2 rounded-3 shadow-sm text-white fw-bold mt-3 mt-md-0"
          onClick={() => {
            setSearchTerm("");
            setShowCompose(true);
          }}
        >
          <i className="bi bi-send-plus me-2"></i> Send Alert
        </RoleButton>
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

      {showCompose && (
        <CreateModal
          show={showCompose}
          onClose={() => {
            setShowCompose(false);
            navigate(location.pathname, { replace: true, state: {} });
          }}
          onCreate={handleSend}
          title={
            incomingBulkIds
              ? incomingBulkIds.length === 1
                ? "Direct Notification"
                : "Bulk Notification"
              : "New Notification"
          }
          fields={fields}
          btnLabel={
            incomingBulkIds
              ? incomingBulkIds.length === 1
                ? "Send to User"
                : "Send to Group"
              : "Send Alert"
          }
          renderCustomField={renderSearchField}
        />
      )}
    </div>
  );
};

export default NotificationPage;
