import { useEffect, useState } from "react";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import CreateModal from "../../../../../shared/components/CreateModal/CreateModal";
import Badge from "../../../../../shared/components/Badge/Badge";
import { createBatch, listBatches } from "../../../api/stockInventory.api";
import "../stock-theme.css";

const StockInventory = () => {
  const [batches, setBatches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const fetchBatches = async () => {
    showLoader();
    try {
      const response = await listBatches();
      setBatches(response?.data || []);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchBatches();
    // eslint-disable-next-line
  }, []);

  const handleCreate = async (values) => {
    try {
      const response = await createBatch({
        medicine_name: values.medicine_name,
        batch_number: values.batch_number,
        quantity: parseInt(values.quantity, 10),
        expiry_date: values.expiry_date,
      });
      addMessage(response?.success, response?.message || "Batch added");
      fetchBatches();
    } catch (err) {
      addMessage(false, err.message);
    }
  };

  const columns = [
    { header: "Medicine", accessor: "medicine_name" },
    { header: "Batch #", accessor: "batch_number" },
    { header: "Quantity", accessor: "quantity" },
    {
      header: "Expiry Date",
      accessor: "expiry_date",
      render: (row) => (
        <div className="d-flex align-items-center gap-2">
          <span className={row.expiring_soon ? "text-danger fw-semibold" : ""}>
            {new Date(row.expiry_date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
          {row.expiring_soon && (
            <Badge content="Expiring Soon" color="red" solid />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="stock-app">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="fw-bold mb-1">Warehouse Inventory</h2>
          <p className="text-muted mb-0">
            Batches ready to sell. Anything expiring within 6 months is
            flagged in red.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          + Add Batch
        </button>
      </div>

      <div className="stock-card p-3">
        <ListingComponent
          data={batches}
          columns={columns}
          emptyState={{
            title: "No stock yet",
            subtitle: "Add a batch once a shipment arrives at the warehouse.",
          }}
        />
      </div>

      <CreateModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreate}
        title="Add Batch to Inventory"
        btnLabel="Add Batch"
        fields={[
          { name: "medicine_name", label: "Medicine Name", type: "text" },
          { name: "batch_number", label: "Batch Number", type: "text" },
          { name: "quantity", label: "Quantity", type: "number" },
          { name: "expiry_date", label: "Expiry Date", type: "date" },
        ]}
      />
    </div>
  );
};

export default StockInventory;
