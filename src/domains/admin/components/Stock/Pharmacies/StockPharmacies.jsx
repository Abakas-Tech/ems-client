import { useEffect, useState } from "react";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import CreateModal from "../../../../../shared/components/CreateModal/CreateModal";
import { createCustomer, listCustomers } from "../../../api/stockCustomer.api";
import "../stock-theme.css";

const StockPharmacies = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const fetchPharmacies = async () => {
    showLoader();
    try {
      const response = await listCustomers();
      setPharmacies(response?.data || []);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchPharmacies();
    // eslint-disable-next-line
  }, []);

  const handleCreate = async (values) => {
    try {
      const response = await createCustomer(values);
      addMessage(response?.success, response?.message || "Pharmacy added");
      fetchPharmacies();
    } catch (err) {
      addMessage(false, err.message);
    }
  };

  const columns = [
    { header: "Pharmacy Name", accessor: "pharmacy_name" },
    { header: "Phone Number", accessor: "phone_number" },
    { header: "Address", accessor: "address" },
  ];

  return (
    <div className="stock-app">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="fw-bold mb-1">Pharmacies</h2>
          <p className="text-muted mb-0">
            Add a pharmacy once and it will show up as a dropdown on the
            Sales &amp; Delivery page.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          + New Pharmacy
        </button>
      </div>

      <div className="stock-card p-3">
        <ListingComponent
          data={pharmacies}
          columns={columns}
          emptyState={{
            title: "No pharmacies yet",
            subtitle: "Add your first pharmacy to start logging deliveries.",
          }}
        />
      </div>

      <CreateModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreate}
        title="New Pharmacy"
        btnLabel="Add Pharmacy"
        fields={[
          { name: "pharmacy_name", label: "Pharmacy Name", type: "text" },
          { name: "phone_number", label: "Phone Number", type: "text" },
          { name: "address", label: "Address", type: "text" },
        ]}
      />
    </div>
  );
};

export default StockPharmacies;
