import { useEffect, useState } from "react";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import CreateModal from "../../../../../shared/components/CreateModal/CreateModal";
import Badge from "../../../../../shared/components/Badge/Badge";
import { getUsers, createUser } from "../../../api/user.api";
import ROLES from "../../../../../config/role.config";
import "../stock-theme.css";

const StockSalesReps = () => {
  const [reps, setReps] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const fetchReps = async () => {
    showLoader();
    try {
      const response = await getUsers({ role_id: ROLES.SALES_REP });
      setReps(response?.data || []);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchReps();
    // eslint-disable-next-line
  }, []);

  const handleCreate = async (values) => {
    try {
      const response = await createUser({
        full_name: values.full_name,
        phone_number: values.phone_number,
        email: values.email,
        role_id: ROLES.SALES_REP,
      });

      const tempPassword = response?.data?.temporary_password;
      addMessage(
        response?.success,
        tempPassword
          ? `Sales rep added. Temporary password: ${tempPassword} — share this with them so they can log in.`
          : response?.message || "Sales rep added",
      );
      fetchReps();
    } catch (err) {
      addMessage(false, err.message);
    }
  };

  const columns = [
    { header: "Full Name", accessor: "full_name" },
    { header: "Phone Number", accessor: "phone_number" },
    { header: "Email", accessor: "email" },
    {
      header: "Status",
      accessor: "is_active",
      render: (row) => (
        <Badge
          content={row.is_active ? "Active" : "Inactive"}
          color={row.is_active ? "green" : "gray"}
          solid
        />
      ),
    },
  ];

  return (
    <div className="stock-app">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="fw-bold mb-1">Sales Team</h2>
          <p className="text-muted mb-0">
            Register a sales rep once — they'll be able to log in and will
            show up in the Sales &amp; Delivery dropdown.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          + New Sales Rep
        </button>
      </div>

      <div className="stock-card p-3">
        <ListingComponent
          data={reps}
          columns={columns}
          emptyState={{
            title: "No sales reps yet",
            subtitle:
              "Register your first sales rep to start assigning deliveries.",
          }}
        />
      </div>

      <CreateModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreate}
        title="Register Sales Rep"
        btnLabel="Register"
        fields={[
          { name: "full_name", label: "Full Name", type: "text" },
          { name: "phone_number", label: "Phone Number", type: "text" },
          { name: "email", label: "Email", type: "text" },
        ]}
      />
    </div>
  );
};

export default StockSalesReps;
