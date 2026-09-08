/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";

import {
  listLoginActivity,
  listAuditLog,
  deleteLoginActivity,
  deleteAuditLog,
} from "../../../api/activity.api";
import { getUsers } from "../../../api/user.api";

import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import ActivityFilter from "../ActivityFilter/ActivityFilter";
import Badge from "../../../../../shared/components/Badge/Badge";
import { useDelete } from "../../../../../context/Delete/useDelete";
import useNotifications from "../../../../../context/Notification/useNotifications";

const TABS = [
  { key: "login", label: "Login Activity" },
  { key: "audit", label: "Audit Log" },
];

// Keys we read/write on the URL for filters (kept separate from tab/page
// so we can clear just the filter keys without touching those).
const FILTER_KEYS = [
  "search",
  "person_id",
  "status",
  "action",
  "from_date",
  "to_date",
];

// Segmented pill-style tab switcher (matches the CV template switcher style)
function TabSwitcher({ active, onChange, options }) {
  return (
    <div
      role="tablist"
      aria-label="Activity type"
      style={{
        display: "inline-flex",
        border: "1px solid #d8dadd",
        borderRadius: 8,
        padding: 3,
        background: "#f4f5f6",
        gap: 2,
      }}
    >
      {options.map((option) => {
        const isActive = active === option.key;

        return (
          <button
            key={option.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.key)}
            style={{
              border: "none",
              borderRadius: 6,
              padding: "6px 14px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              color: isActive ? "#fff" : "#5b5f66",
              background: isActive ? "#47BCD2" : "transparent",
              transition: "background 0.15s ease, color 0.15s ease",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

const ListActivities = () => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { refreshUnreadCount } = useNotifications();
  const navigate = useNavigate();

  // Tab / filters / page all live in the URL now instead of local state.
  // That way when we navigate to a detail page and come back, React Router
  // re-mounts this component from the *same URL* it left off on, and we
  // read the same tab/filters/page back out — no more resetting to "login".
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get("tab") || "login";
  const page = Number(searchParams.get("page")) || 1;
  const [limit] = useState(10);

  const filters = {
    search: searchParams.get("search") || "",
    person_id: searchParams.get("person_id") || "",
    status: searchParams.get("status") || "",
    action: searchParams.get("action") || "",
    from_date: searchParams.get("from_date") || "",
    to_date: searchParams.get("to_date") || "",
  };
  const filtersKey = JSON.stringify(filters);

  const [users, setUsers] = useState([]);

  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({});

  const { openModal } = useDelete();

  // ── Bulk selection state ──
  // Checkboxes are hidden until the user double-clicks a row to enter
  // selection mode (mirrors the admin/staff pattern in ListCandidates).
  const [isBulkSelectionMode, setIsBulkSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [selectionResetKey, setSelectionResetKey] = useState(0);

  // Merge updates into the URL search params. Empty/undefined values are
  // removed entirely so the URL doesn't fill up with blank params.
  const updateParams = (updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });
      return next;
    });
  };

  const handleView = (row) => {
    navigate(`/admin/activities/${activeTab}/${row.id}`, {
      state: { activity: row, type: activeTab },
    });
  };

  const handleDelete = (row) => {
    openModal(
      async () => {
        showLoader();
        try {
          const response =
            activeTab === "login"
              ? await deleteLoginActivity(row.id)
              : await deleteAuditLog(row.id);
          addMessage(
            response?.success,
            response?.message || "Deleted successfully",
          );
          fetchActivities();
          // Backend also deletes this record's notification row (see
          // deleteByReference in the audit/login services) — re-sync the
          // badge now instead of waiting for the next socket reconnect.
          refreshUnreadCount();
        } catch (err) {
          addMessage(false, err.message);
        } finally {
          hideLoader();
        }
      },
      {
        title: `Are you sure you want to delete this ${activeTab === "login" ? "login" : "audit"} record?`,
        confirmText: "Delete",
      },
    );
  };

  // ── Bulk selection handlers ──
  const handleRowDoubleClick = (row) => {
    if (!row?.id) return;
    if (!isBulkSelectionMode) {
      setIsBulkSelectionMode(true);
      setSelectedIds([row.id]);
    }
  };

  const handleSelectRow = (id) => {
    if (!id) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };

  const handleSelectAll = (checked) => {
    const currentPageIds = rows.map((r) => r.id).filter(Boolean);
    setSelectedIds((prev) =>
      checked
        ? Array.from(new Set([...prev, ...currentPageIds]))
        : prev.filter((sid) => !currentPageIds.includes(sid)),
    );
  };

  const handleCancelSelection = () => {
    setSelectedIds([]);
    setIsBulkSelectionMode(false);
    setSelectionResetKey((prev) => prev + 1);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    const recordLabel = activeTab === "login" ? "login" : "audit";

    openModal(
      async () => {
        setBulkDeleteLoading(true);
        try {
          const deleteFn =
            activeTab === "login" ? deleteLoginActivity : deleteAuditLog;
          const results = await Promise.allSettled(
            selectedIds.map((id) => deleteFn(id)),
          );
          const failed = results.filter((r) => r.status === "rejected").length;
          const succeeded = results.length - failed;

          if (failed > 0) {
            addMessage(
              succeeded > 0,
              succeeded > 0
                ? `Deleted ${succeeded} record(s); ${failed} failed.`
                : `Failed to delete selected records.`,
            );
          } else {
            addMessage(true, `Deleted ${succeeded} record(s) successfully.`);
          }

          setSelectedIds([]);
          setIsBulkSelectionMode(false);
          setSelectionResetKey((prev) => prev + 1);
          fetchActivities();
          // Same as single delete — each deleted record's notification row
          // is gone server-side too, so re-sync the badge.
          refreshUnreadCount();
        } catch (err) {
          addMessage(false, err.message || "Failed to delete selected records");
        } finally {
          setBulkDeleteLoading(false);
        }
      },
      {
        title: `Are you sure you want to delete ${count} selected ${recordLabel} record${count === 1 ? "" : "s"}?`,
        confirmText: "Delete",
      },
    );
  };

  const actions = [
    { type: "view", bypassRole: true, onClick: handleView },
    { type: "delete", bypassRole: true, onClick: handleDelete },
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers({ limit: 100 });
        setUsers(response?.data || []);
      } catch (error) {
        addMessage(false, error.message || "Failed to load users list");
      }
    };
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildParams = () => {
    const base = {
      page,
      limit,
      start_date: filters.from_date || undefined,
      end_date: filters.to_date || undefined,
    };

    if (activeTab === "login") {
      return {
        ...base,
        user_id: filters.person_id || undefined,
        status: filters.status || undefined,
      };
    }

    return {
      ...base,
      actor_id: filters.person_id || undefined,
      action: filters.action || undefined,
      search: filters.search || undefined,
    };
  };

  const fetchActivities = async () => {
    try {
      showLoader();
      const params = buildParams();

      const response =
        activeTab === "login"
          ? await listLoginActivity(params)
          : await listAuditLog(params);

      setRows(response?.data || []);
      setPagination(response?.pagination || {});
    } catch (error) {
      addMessage(false, error.message || "Failed to load activities");
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filtersKey, page, limit]);

  // Selected ids only make sense for the current tab/filter/page combo —
  // clear them and exit selection mode whenever any of those change so
  // stale ids (and a lingering checkbox UI) can't carry over.
  useEffect(() => {
    setSelectedIds([]);
    setIsBulkSelectionMode(false);
    setSelectionResetKey((prev) => prev + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filtersKey, page]);

  const handleTabChange = (tabKey) => {
    if (tabKey === activeTab) return;
    // Switching tabs resets filters and page, same as before — but now
    // it's expressed as a single URL replace instead of three setState calls.
    setSearchParams({ tab: tabKey, page: "1" });
  };

  const handleFilterChange = (f) => {
    updateParams({ ...f, page: "1" });
  };

  const handleClear = () => {
    const cleared = {};
    FILTER_KEYS.forEach((key) => {
      cleared[key] = undefined;
    });
    updateParams({ ...cleared, page: "1" });
  };

  const handlePageChange = (p) => {
    updateParams({ page: p });
  };

  const formatDateTime = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const loginColumns = [
    {
      key: "full_name",
      header: "User",
      render: (item) => (
        <div>
          <div className="fw-bold text-dark">{item.full_name || "Unknown"}</div>
          {item.email_attempted && (
            <div className="text-muted" style={{ fontSize: "0.75rem" }}>
              {item.email_attempted}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (item) => item.role || "—",
    },
    {
      key: "ip_address",
      header: "IP Address",
      render: (item) => item.ip_address || "—",
    },
    {
      key: "location",
      header: "Location",
      render: (item) =>
        [item.city, item.country].filter(Boolean).join(", ") || "—",
    },
    {
      key: "device_name",
      header: "Device",
      render: (item) => item.device_name || "—",
    },
    {
      key: "created_at",
      header: "Login Time",
      render: (item) => formatDateTime(item.created_at),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <div>
          <Badge
            content={item.status === "success" ? "Success" : "Failed"}
            color={item.status === "success" ? "green" : "red"}
          />
          {item.status !== "success" && item.failure_reason && (
            <div className="text-muted mt-1" style={{ fontSize: "0.75rem" }}>
              {item.failure_reason}
            </div>
          )}
        </div>
      ),
    },
  ];

  const auditColumns = [
    {
      key: "actor_name",
      header: "Staff",
      render: (item) => (
        <span className="fw-bold text-dark">{item.actor_name || "—"}</span>
      ),
    },
    {
      key: "module",
      header: "Module",
      render: (item) => item.module || "—",
    },
    {
      key: "action",
      header: "Action",
      render: (item) => (
        <Badge
          content={item.action ? item.action.toUpperCase() : "—"}
          color="yellow"
        />
      ),
    },

    {
      key: "created_at",
      header: "Date / Time",
      render: (item) => formatDateTime(item.created_at),
    },
    {
      key: "message",
      header: "Details",
      render: (item) => item.message || "—",
    },
  ];

  return (
    <div className="dashboard-wraper">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-2">Activities</h2>
        <p className="text-muted mb-0">
          Track staff logins and every action taken across the system.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <TabSwitcher
          active={activeTab}
          onChange={handleTabChange}
          options={TABS}
        />

        {isBulkSelectionMode && (
          <div className="d-flex gap-2 align-items-center">
            {selectedIds.length > 0 && (
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={handleBulkDelete}
                disabled={bulkDeleteLoading}
              >
                {bulkDeleteLoading
                  ? "Deleting..."
                  : `Delete Selected (${selectedIds.length})`}
              </button>
            )}
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={handleCancelSelection}
              disabled={bulkDeleteLoading}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <ActivityFilter
        type={activeTab}
        filters={filters}
        users={users}
        onFilterChange={handleFilterChange}
        onClear={handleClear}
      />

      <ListingComponent
        title={activeTab === "login" ? "Login Activity" : "Audit Log"}
        loading={false}
        data={rows}
        pagination={pagination}
        onPageChange={handlePageChange}
        columns={activeTab === "login" ? loginColumns : auditColumns}
        actions={actions}
        isSelectionMode={isBulkSelectionMode}
        selectedIds={selectedIds}
        onSelectRow={handleSelectRow}
        onSelectAll={handleSelectAll}
        onRowDoubleClick={handleRowDoubleClick}
        resetSelectionSignal={selectionResetKey}
      />
    </div>
  );
};

export default ListActivities;
