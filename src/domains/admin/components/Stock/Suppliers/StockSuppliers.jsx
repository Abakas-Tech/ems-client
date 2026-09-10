import { useEffect, useState } from "react";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import CreateModal from "../../../../../shared/components/CreateModal/CreateModal";
import { createSupplier, listSuppliers } from "../../../api/stockSupplier.api";
import "../stock-theme.css";

const StockSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const fetchSuppliers = async () => {
    showLoader();
    try {
      const response = await listSuppliers();
      setSuppliers(response?.data || []);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchSuppliers();
    // eslint-disable-next-line
  }, []);

  const handleCreate = async (values) => {
    try {
      const response = await createSupplier(values);
      addMessage(response?.success, response?.message || "Supplier added");
      fetchSuppliers();
    } catch (err) {
      addMessage(false, err.message);
    }
  };

  const columns = [
    { header: "Supplier Name", accessor: "supplier_name" },
    {
      header: "Added On",
      accessor: "created_at",
      render: (row) =>
        new Date(row.created_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
  ];

  return (
    <div className="stock-app">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="fw-bold mb-1">Suppliers</h2>
          <p className="text-muted mb-0">
            Add a supplier once and it will show up as a dropdown on every
            import order.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          + New Supplier
        </button>
      </div>

      <div className="stock-card p-3">
        <ListingComponent
          data={suppliers}
          columns={columns}
          emptyState={{
            title: "No suppliers yet",
            subtitle: "Add your first supplier to use it on import orders.",
          }}
        />
      </div>

      <CreateModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreate}
        title="New Supplier"
        btnLabel="Add Supplier"
        fields={[{ name: "supplier_name", label: "Supplier Name", type: "text" }]}
      />
    </div>
  );
};

export default StockSuppliers;
