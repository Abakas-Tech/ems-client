import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ListingComponent from "../../../../shared/components/ListingComponent/ListingComponent";
import UserFilters from "../../components/Users/UserFilters";
import user from "../../api/user.api";
import permission from "../../api/permission.api";
import useLoader from "../../../../context/Loader/UseLoader";
import useResponse from "../../../../context/response/UseResponse";
import { useConfirmDelete } from "../../../../context/Delete/UseDelete";

// Map role IDs to role names
const ROLE_MAP = {
  2: "Employee",
  3: "Partner",
  5: "Employer",
};

const UsersPage = () => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { openModal } = useConfirmDelete();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    role_id: "",
    is_active: "",
  });

  // FETCH USERS
  useEffect(() => {
    const fetchData = async () => {
      showLoader();
      try {
        const cleanFilters = {};
        if (filters.search) cleanFilters.search = filters.search;
        if (filters.role_id) cleanFilters.role_id = filters.role_id;
        if (filters.is_active !== "")
          cleanFilters.is_active = filters.is_active === "true" ? 1 : 0;

        const response = await user.getUsers(cleanFilters);
        setUsers(response?.data || response || []);
      } catch (err) {
        addMessage(false, err.message);
      } finally {
        hideLoader();
      }
    };

    fetchData();
  }, [filters]);

  // FILTER HANDLERS
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ search: "", role_id: "", is_active: "" });
  };

  // DELETE
  const handleDelete = (row) => {
    openModal(async () => {
      showLoader();
      try {
        const response = await user.deleteUser(row.id);
        addMessage(response?.success, response?.message);

        // Refetch users
        const refreshed = await user.getUsers({
          ...filters,
          is_active:
            filters.is_active === ""
              ? undefined
              : filters.is_active === "true"
                ? 1
                : 0,
        });
        setUsers(refreshed?.data || refreshed || []);
      } catch (err) {
        addMessage(false, err.message);
      } finally {
        hideLoader();
      }
    });
  };

  // EDIT
  const handleEdit = async (row) => {
    showLoader();
    try {
      const permResponse = await permission.getPermission(row.id);
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

  // CREATE USER
  const handleCreateUser = () => {
    navigate("/admin/create-user", { state: { isEditMode: false } });
  };

  // Columns for ListingComponent
  const columns = [
    {
      header: "Name",
      accessor: "full_name",
      render: (row) => <span className="fw-bold">{row.full_name}</span>,
    },
    {
      header: "Email",
      accessor: "email",
    },
    {
      header: "Role",
      accessor: "role_id",
      render: (row) => ROLE_MAP[row.role_id] || row.role_name || "—",
    },
    {
      header: "Created",
      accessor: "created_at",
      render: (row) =>
        row.created_at ? new Date(row.created_at).toLocaleDateString() : "—",
    },
  ];

  // Actions for ListingComponent using ACTION_CONFIG types
  const actions = [
    {
      type: "edit", // matches ActionButtons config if you have it in ACTION_CONFIG
      onClick: handleEdit,
    },
    {
      type: "delete",
      onClick: handleDelete,
    },
  ];

  const emptyState = {
    title: "No users found",
    subtitle: "Add users to see them listed here",
  };

  return (
    <div className="dashboard-wraper">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-2">User Management</h2>
          <p className="text-muted mb-0">
            Manage employees, employers, and partners — filter and control
            users.
          </p>
        </div>
        <div>
          <button className="btn btn-main" onClick={handleCreateUser}>
            + Create User
          </button>
        </div>
      </div>

      {/* Filters */}
      <UserFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {/* User Listing using new ListingComponent */}
      <div className="card shadow-sm mb-4">
        <div className="card-body p-0">
          <ListingComponent
            data={users}
            columns={columns}
            actions={actions}
            emptyState={emptyState}
            pagination={null} // Add pagination if needed
          />
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
