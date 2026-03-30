import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import { getUsers, deleteUser, updateUser } from "../../../api/user.api";
import { getPermission } from "../../../api/permission.api";
import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete";
import FilterUser from "./../../../components/user/FilterUser/FilterUser";
import Badge from "../../../../../shared/components/Badge/Badge";
import RoleButton from "../../../../../shared/components/RoleButton/RoleButton";

const ROLE_MAP = { 2: "Employee", 3: "Partner", 5: "Employer" };
const ROLE_COLOR = {
  2: "green",
  3: "blue",
  5: "yellow",
};

const ListUser = () => {
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    role_id: "",
    is_active: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const fetchUsers = async (page = 1) => {
    showLoader();
    try {
      const cleanFilters = {};
      if (filters.search) cleanFilters.search = filters.search;
      if (filters.role_id) cleanFilters.role_id = filters.role_id;
      if (filters.is_active !== "")
        cleanFilters.is_active = filters.is_active === "true" ? 1 : 0;

      cleanFilters.page = page;
      cleanFilters.limit = pagination.limit;

      const response = await getUsers(cleanFilters);
      setUsers(response?.data || []);
      setPagination({
        page: response?.pagination?.page || 1,
        limit: response?.pagination?.limit || 5,
        total: response?.pagination?.total || 0,
        pages: response?.pagination?.pages || 1,
      });
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    // Reset to first page when filters change
    fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Triggered by first double-click
  const handleRowDoubleClick = (row) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedUserIds([row.id]); // Select the first one automatically
    }
  };
  const handleSelectRow = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUserIds(users.map((u) => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleExitSelection = () => {
    setIsSelectionMode(false);
    setSelectedUserIds([]);
  };
  const handlePageChange = (newPage) => {
    fetchUsers(newPage);
  };

  // 1. Updated handler to accept an optional single user row
  const handleNotify = (row = null) => {
    let idsToNotify = [];
    let roleType = filters.role_id || "employee";
    let full_name = "";

    if (row && row.id) {
      // Single user click (from the table row)
      idsToNotify = [row.id];
      full_name = row.full_name || "";
      roleType = ROLE_MAP[row.role_id]?.toLowerCase() || roleType;
    } else {
      // Bulk action click (from the top bar)
      idsToNotify = selectedUserIds;

      // If only one person is selected, let's grab their name for a better UX
      if (idsToNotify.length === 1) {
        const selectedUser = users.find((u) => u.id === idsToNotify[0]);
        if (selectedUser) {
          full_name = selectedUser.full_name || "";
          roleType = ROLE_MAP[selectedUser.role_id]?.toLowerCase() || roleType;
        }
      } else if (idsToNotify.length > 1) {
        // For multiple users, we usually just pass the role type from filters
        full_name = "Multiple Users";
        const firstSelected = users.find((u) => u.id === idsToNotify[0]);
        roleType = ROLE_MAP[firstSelected?.role_id]?.toLowerCase() || roleType;
      }
    }

    if (idsToNotify.length === 0) return;

    navigate("/admin/notifications", {
      state: {
        bulkIds: idsToNotify,
        bulkType: roleType,
        bulkName: full_name,
      },
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ search: "", is_active: "" });
  };

  const handleDelete = (row) => {
    openModal(
      async () => {
        showLoader();
        try {
          const response = await deleteUser(row.id);
          addMessage(response?.success, response?.message);

          // Refresh current page after deletion
          fetchUsers(pagination.page);
        } catch (err) {
          addMessage(false, err.message);
        } finally {
          hideLoader();
        }
      },
      {
        title: "Are you sure you want to delete this user?",
        confirmText: "Delete",
      },
    );
  };
  const handleStatusToggle = (row) => {
    const action = row.is_active ? "archive" : "restore";
    const defaultTitle = `Are you sure you want to ${action}  this user?`;
    const defaultConfirmText = `${action.charAt(0).toUpperCase() + action.slice(1)}`;

    openModal(
      async () => {
        showLoader();
        try {
          const response = await updateUser(row.id, {
            is_active: row.is_active ? 0 : 1,
          });

          addMessage(response?.success, response?.message);

          // Refresh current page after update
          fetchUsers(pagination.page);
        } catch (err) {
          addMessage(false, err.message);
        } finally {
          hideLoader();
        }
      },
      {
        title: defaultTitle,
        confirmText: defaultConfirmText,
      },
    );
  };
  const handleEdit = async (row) => {
    showLoader();
    try {
      const permResponse = await getPermission(row.id);
      const userDataWithPermissions = {
        ...row,
        permissions: permResponse?.data || [],
      };
      navigate("/admin/user-management/create-user", {
        state: { isEditMode: true, userData: userDataWithPermissions },
      });
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  const handleCreateUser = () => {
    navigate("/admin/user-management/create-user", {
      state: { isEditMode: false },
    });
  };
  // Record Transaction Handler
  const handleRecordTransaction = (row) => {
    navigate("/admin/finances", {
      state: {
        userId: row.id,
        userName: row.full_name,
        userRole: "partner",
      },
    });
  };
  const columns = [
    {
      header: "Name",
      accessor: "full_name",
      render: (row) => <span className="fw-bold">{row.full_name}</span>,
    },
    { header: "Email", accessor: "email" },
    {
      header: "Phone",
      accessor: "phone",
      render: (row) => row.phone_number || "—",
    },
    {
      header: "Role",
      accessor: "role_id",
      render: (row) => {
        const roleName = ROLE_MAP[row.role_id] || row.role_name || "—";
        const roleColor = ROLE_COLOR[row.role_id] || "gray";

        return <Badge content={roleName} color={roleColor} />;
      },
    },
  ];

  const actions = [
    { type: "edit", onClick: handleEdit },
    { type: "notify", onClick: (row) => handleNotify(row) },
    { type: "archive", onClick: handleStatusToggle, showOn: true },
    { type: "restore", onClick: handleStatusToggle, showOn: false },
    { type: "delete", onClick: handleDelete },
    {
      type: "transaction",
      onClick: (row) => handleRecordTransaction(row),
      showOn: (row) => Number(row.role_id) === 3,
    },
  ];

  const emptyState = {
    title: "No users found",
    subtitle: "Add users to see them listed here",
  };

  return (
    <div className="dashboard-wraper ">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div className="flex-grow-1">
          <h2 className="fw-bold text-dark mb-2">User Management</h2>
          <p className="text-muted mb-0">
            Manage employees, employers, and partners — filter and control
            users.
          </p>
        </div>
        <RoleButton
          visibleTo={[2, 1]}
          className="btn btn-main"
          style={{ whiteSpace: "nowrap" }}
          onClick={handleCreateUser}
        >
          + Create User
        </RoleButton>
      </div>
      {isSelectionMode && (
        <div
          className="d-flex justify-content-between align-items-center shadow-lg border-0 rounded-4 mb-4 animate__animated animate__fadeInDown sticky-top px-4 py-3"
          style={{
            zIndex: 1000,
            top: "20px",
            backgroundColor: "rgba(255, 255, 255, 0.95)", // Glass effect
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(0, 0, 0, 0.05)",
            maxWidth: "900px",
            margin: "0 auto",
            width: "95%", // Ensures padding on mobile
          }}
        >
          {/* Left Side: Status Info */}
          <div className="d-flex align-items-center">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center me-3"
              style={{
                width: "45px",
                height: "45px",
                backgroundColor: "rgba(var(--maincolor-rgb), 0.1)", // Light version of your main color
                color: "var(--maincolor)",
              }}
            >
              <i className="bi bi-person-check-fill fs-4"></i>
            </div>
            <div>
              <h6
                className="mb-0 fw-bold text-dark"
                style={{ letterSpacing: "-0.3px" }}
              >
                Bulk Action Mode
              </h6>
              <p className="mb-0 text-muted small fw-medium">
                <span style={{ color: "var(--maincolor)" }}>
                  {selectedUserIds.length}
                </span>{" "}
                Users ready for notification
              </p>
            </div>
          </div>
          <div className="gap-2 d-flex">
            <RoleButton
              visibleTo={[1, 2]}
              className="btn btn-main btn-sm text-white px-3 fw-bold"
              disabled={selectedUserIds.length === 0}
              onClick={handleNotify}
            >
              Send Bulk Alert
            </RoleButton>
            <RoleButton
              visibleTo={[1, 2]}
              className="btn btn-light btn-sm border"
              onClick={handleExitSelection}
            >
              Cancel
            </RoleButton>
          </div>
        </div>
      )}
      <ListingComponent
        data={users}
        columns={columns}
        actions={isSelectionMode ? [] : actions}
        emptyState={emptyState}
        // Selection Props
        isSelectionMode={isSelectionMode}
        selectedIds={selectedUserIds}
        onSelectRow={handleSelectRow}
        onSelectAll={handleSelectAll}
        onRowDoubleClick={handleRowDoubleClick}
        showAvater={true}
        filtersComponent={
          <FilterUser
            filters={filters}
            onFilterChange={handleFilterChange}
            onClear={handleClearFilters}
          />
        }
        pagination={{
          page: pagination.page,
          limit: pagination.limit,
          total: pagination.total,
        }}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ListUser;
