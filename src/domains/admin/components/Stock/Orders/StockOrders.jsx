import { useEffect, useState } from "react";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import CreateModal from "../../../../../shared/components/CreateModal/CreateModal";
import Badge from "../../../../../shared/components/Badge/Badge";
import { createOrder, listOrders, updateOrder } from "../../../api/stockOrder.api";
import { listSuppliers } from "../../../api/stockSupplier.api";
import ETHIOPIAN_BANKS from "../../../../../config/bank.config";
import "../stock-theme.css";

const STATUS_OPTIONS = [
  { value: "ordered", label: "Ordered" },
  { value: "bank_queue", label: "Waiting for Bank" },
  { value: "shipping", label: "Shipping" },
  { value: "arrived", label: "Arrived" },
];

const STATUS_COLOR = {
  ordered: "gray",
  bank_queue: "yellow",
  shipping: "blue",
  arrived: "green",
};

const StockOrders = () => {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const fetchOrders = async () => {
    showLoader();
    try {
      const response = await listOrders();
      setOrders(response?.data || []);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await listSuppliers();
      setSuppliers(response?.data || []);
    } catch (err) {
      addMessage(false, err.message);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
    // eslint-disable-next-line
  }, []);

  const handleCreate = async (values) => {
    try {
      const response = await createOrder({
        supplier_id: values.supplier_id,
        medicine_name: values.medicine_name,
        amount: parseFloat(values.amount),
      });
      addMessage(response?.success, response?.message || "Order created");
      fetchOrders();
    } catch (err) {
      addMessage(false, err.message);
    }
  };

  const handleStatusChange = async (order, status) => {
    try {
      const response = await updateOrder(order.id, { status });
      addMessage(response?.success, response?.message || "Order updated");
      fetchOrders();
    } catch (err) {
      addMessage(false, err.message);
    }
  };

  const handleEfdaToggle = async (order) => {
    try {
      await updateOrder(order.id, {
        efda_permit_approved: !order.efda_permit_approved,
      });
      fetchOrders();
    } catch (err) {
      addMessage(false, err.message);
    }
  };

  const handleBankChange = async (order, value) => {
    if ((order.bank_name || "") === value) return;
    try {
      await updateOrder(order.id, { bank_name: value });
      fetchOrders();
    } catch (err) {
      addMessage(false, err.message);
    }
  };

  const columns = [
    { header: "Supplier", accessor: "supplier_name" },
    { header: "Medicine", accessor: "medicine_name" },
    {
      header: "Amount",
      accessor: "amount",
      render: (row) =>
        `${Number(row.amount).toLocaleString()} ${row.currency}`,
    },
    {
      header: "EFDA Permit",
      accessor: "efda_permit_approved",
      render: (row) => (
        <div className="form-check form-switch mb-0">
          <input
            className="form-check-input"
            type="checkbox"
            checked={!!row.efda_permit_approved}
            onChange={() => handleEfdaToggle(row)}
          />
        </div>
      ),
    },
    {
      header: "Bank",
      accessor: "bank_name",
      render: (row) => (
        <select
          className="form-select form-select-sm"
          value={row.bank_name || ""}
          onChange={(e) => handleBankChange(row, e.target.value)}
        >
          <option value="">Select bank</option>
          {ETHIOPIAN_BANKS.map((bank) => (
            <option key={bank} value={bank}>
              {bank}
            </option>
          ))}
        </select>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <div className="d-flex align-items-center gap-2">
          <Badge
            content={row.status.replace("_", " ")}
            color={STATUS_COLOR[row.status]}
            solid
          />
          <select
            className="form-select form-select-sm"
            style={{ width: "auto" }}
            value={row.status}
            onChange={(e) => handleStatusChange(row, e.target.value)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ),
    },
  ];

  return (
    <div className="stock-app">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="fw-bold mb-1">Import Orders</h2>
          <p className="text-muted mb-0">
            Track each order from placement through the bank queue to
            arrival.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          + New Order
        </button>
      </div>

      <div className="stock-card p-3">
        <ListingComponent
          data={orders}
          columns={columns}
          emptyState={{
            title: "No import orders yet",
            subtitle: "Create your first order to start tracking it.",
          }}
        />
      </div>

      <CreateModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreate}
        title="New Import Order"
        btnLabel="Create Order"
        fields={[
          {
            name: "supplier_id",
            label: "Supplier",
            type: "select",
            options: suppliers.map((s) => ({
              value: s.id,
              label: s.supplier_name,
            })),
          },
          { name: "medicine_name", label: "Medicine Name", type: "text" },
          { name: "amount", label: "Amount (USD)", type: "number" },
        ]}
      />
    </div>
  );
};

export default StockOrders;
