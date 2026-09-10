import { useEffect, useState } from "react";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import useProfile from "../../../../../context/Profile/useProfile";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import CreateModal from "../../../../../shared/components/CreateModal/CreateModal";
import Badge from "../../../../../shared/components/Badge/Badge";
import { listBatches } from "../../../api/stockInventory.api";
import { createCustomer, listCustomers } from "../../../api/stockCustomer.api";
import { createSale, listSales } from "../../../api/stockSale.api";
import ROLES from "../../../../../config/role.config";
import "../stock-theme.css";

const StockSalesDelivery = () => {
  const { profile } = useProfile();
  const isAdmin = profile?.role_id === ROLES.ADMIN;

  const [batches, setBatches] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [showPharmacyModal, setShowPharmacyModal] = useState(false);

  const [form, setForm] = useState({
    customer_id: "",
    batch_id: "",
    quantity: "",
    amount: "",
    payment_status: "paid",
  });

  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const loadAll = async () => {
    showLoader();
    try {
      const [batchRes, customerRes, saleRes] = await Promise.all([
        listBatches(),
        listCustomers(),
        listSales(),
      ]);
      setBatches(batchRes?.data || []);
      setCustomers(customerRes?.data || []);
      setSales(saleRes?.data || []);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPharmacy = async (values) => {
    try {
      const response = await createCustomer(values);
      addMessage(response?.success, response?.message || "Pharmacy added");
      loadAll();
    } catch (err) {
      addMessage(false, err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.customer_id ||
      !form.batch_id ||
      !form.quantity ||
      !form.amount
    ) {
      addMessage(
        false,
        "Please fill in pharmacy, medicine, quantity and amount",
      );
      return;
    }

    try {
      const response = await createSale({
        customer_id: form.customer_id,
        batch_id: form.batch_id,
        quantity: parseInt(form.quantity, 10),
        amount: parseFloat(form.amount),
        payment_status: form.payment_status,
      });
      addMessage(response?.success, response?.message || "Delivery logged");
      setForm({
        customer_id: "",
        batch_id: "",
        quantity: "",
        amount: "",
        payment_status: "paid",
      });
      loadAll();
    } catch (err) {
      addMessage(false, err.message);
    }
  };

  const columns = [
    {
      header: "Date",
      accessor: "sale_date",
      render: (row) =>
        new Date(row.sale_date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    { header: "Pharmacy", accessor: "pharmacy_name" },
    {
      header: "Medicine",
      accessor: "medicine_name",
      render: (row) => `${row.medicine_name} (${row.batch_number})`,
    },
    { header: "Qty", accessor: "quantity" },
    {
      header: "Amount",
      accessor: "amount",
      render: (row) => `${Number(row.amount).toLocaleString()} ETB`,
    },
    ...(isAdmin ? [{ header: "Rep", accessor: "rep_name" }] : []),
    {
      header: "Payment",
      accessor: "payment_status",
      render: (row) => (
        <Badge
          content={row.payment_status}
          color={row.payment_status === "credit" ? "yellow" : "green"}
          solid
        />
      ),
    },
  ];

  return (
    <div className="stock-app">
      <h2 className="fw-bold mb-1">Sales &amp; Delivery</h2>
      <p className="text-muted mb-4">
        Log every delivery the moment it happens — it updates inventory and
        notifies the team on Telegram automatically.
      </p>

      <div className="stock-card p-3 mb-4">
        <form onSubmit={handleSubmit} className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label">Pharmacy</label>
            <select
              className="form-select"
              name="customer_id"
              value={form.customer_id}
              onChange={handleFormChange}
            >
              <option value="">Select pharmacy</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.pharmacy_name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-link btn-sm px-0 mt-1"
              onClick={() => setShowPharmacyModal(true)}
            >
              + Add new pharmacy
            </button>
          </div>

          <div className="col-md-3">
            <label className="form-label">Medicine / Batch</label>
            <select
              className="form-select"
              name="batch_id"
              value={form.batch_id}
              onChange={handleFormChange}
            >
              <option value="">Select batch</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.medicine_name} ({b.batch_number}) — {b.quantity} left
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label">Quantity</label>
            <input
              type="number"
              min="1"
              className="form-control"
              name="quantity"
              value={form.quantity}
              onChange={handleFormChange}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Amount (ETB)</label>
            <input
              type="number"
              min="0"
              className="form-control"
              name="amount"
              value={form.amount}
              onChange={handleFormChange}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label d-block">Payment</label>
            <div className="btn-group w-100" role="group">
              <input
                type="radio"
                className="btn-check"
                name="payment_status"
                id="payment-paid"
                value="paid"
                checked={form.payment_status === "paid"}
                onChange={handleFormChange}
              />
              <label className="btn btn-outline-success" htmlFor="payment-paid">
                Paid
              </label>

              <input
                type="radio"
                className="btn-check"
                name="payment_status"
                id="payment-credit"
                value="credit"
                checked={form.payment_status === "credit"}
                onChange={handleFormChange}
              />
              <label
                className="btn btn-outline-warning"
                htmlFor="payment-credit"
              >
                Credit
              </label>
            </div>
          </div>

          <div className="col-12">
            <button type="submit" className="btn btn-primary">
              Log Delivery
            </button>
          </div>
        </form>
      </div>

      <div className="stock-card p-3">
        <ListingComponent
          data={sales}
          columns={columns}
          emptyState={{
            title: "No deliveries logged yet",
            subtitle: "Use the form above to log your first delivery.",
          }}
        />
      </div>

      <CreateModal
        show={showPharmacyModal}
        onClose={() => setShowPharmacyModal(false)}
        onCreate={handleAddPharmacy}
        title="Add Pharmacy"
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

export default StockSalesDelivery;
