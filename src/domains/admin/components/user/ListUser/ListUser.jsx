import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import { getUsers, deleteUser, updateUser } from "../../../api/user.api";
import { getPermission } from "../../../api/permission.api";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete";
import FilterUser from "./../../../components/user/FilterUser/FilterUser";

const ROLE_MAP = { 2: "Employee", 3: "Partner", 5: "Employer" };
const ROLE_COLOR = {
  2: "text-success", // Employee
  3: "text-primary", // Partner
  5: "text-warning", // Employer 
};

const ListUser = () => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();
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

  const handlePageChange = (newPage) => {
    fetchUsers(newPage);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ search: "", role_id: "", is_active: "" });
  };

  const handleDelete = (row) => {
    openModal(async () => {
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
    });
  };
  const handleStatusToggle = (row) => {
    const action = row.is_active ? "archive" : "restore";
    const defaultTitle = `Are you sure you want to ${action}  this user?`;
    const defaultConfirmText = `Yes, ${action.charAt(0).toUpperCase() + action.slice(1)}`;

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
      navigate("/admin/create-user", {
        state: { isEditMode: true, userData: userDataWithPermissions },
      });
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  const handleCreateUser = () => {
    navigate("/admin/create-user", { state: { isEditMode: false } });
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
        const roleClass = ROLE_COLOR[row.role_id] || "text-muted";
        return <span className={`badge border fw-semibold ${roleClass}`}>{roleName}</span>;
      },
    },
  ];

  const actions = [
    { type: "edit", onClick: handleEdit },
    { type: "archive", onClick: handleStatusToggle, showOn: true },
    { type: "restore", onClick: handleStatusToggle, showOn: false },
    { type: "delete", onClick: handleDelete },
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
        <button
          className="btn btn-main"
          style={{ whiteSpace: "nowrap" }}
          onClick={handleCreateUser}
        >
          + Create User
        </button>
      </div>

      <ListingComponent
        data={users}
        columns={columns}
        actions={actions}
        emptyState={emptyState}
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
          onPageChange: handlePageChange,
        }}
      />
    </div>
  );
};

export default ListUser;
