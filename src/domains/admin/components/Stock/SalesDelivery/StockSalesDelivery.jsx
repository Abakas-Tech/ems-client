import { useEffect, useState } from "react";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import useProfile from "../../../../../context/Profile/useProfile";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import CreateModal from "../../../../../shared/components/CreateModal/CreateModal";
import Badge from "../../../../../shared/components/Badge/Badge";
import { listBatches } from "../../../api/stockInventory.api";
import { listCustomers } from "../../../api/stockCustomer.api";
import { createSale, listSales } from "../../../api/stockSale.api";
import { getUsers } from "../../../api/user.api";
import ROLES from "../../../../../config/role.config";
import "../stock-theme.css";

const PAYMENT_OPTIONS = [
  { value: "paid", label: "Paid" },
  { value: "credit", label: "Credit" },
];

const StockSalesDelivery = () => {
  const { profile } = useProfile();
  const isAdmin = profile?.role_id === ROLES.ADMIN;

  const [batches, setBatches] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [reps, setReps] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const loadAll = async () => {
    showLoader();
    try {
      const [batchRes, customerRes, saleRes, repRes] = await Promise.all([
        listBatches(),
        listCustomers(),
        listSales(),
        isAdmin
          ? getUsers({ role_id: ROLES.SALES_REP })
          : Promise.resolve(null),
      ]);
      setBatches(batchRes?.data || []);
      setCustomers(customerRes?.data || []);
      setSales(saleRes?.data || []);
      setReps(repRes?.data || []);
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

  const handleCreate = async (values) => {
    try {
      const payload = {
        customer_id: values.customer_id,
        batch_id: values.batch_id,
        quantity: parseInt(values.quantity, 10),
        amount: parseFloat(values.amount),
        payment_status: values.payment_status,
      };

      if (isAdmin && values.rep_user_id) {
        payload.rep_user_id = values.rep_user_id;
      }

      const response = await createSale(payload);
      addMessage(response?.success, response?.message || "Delivery logged");
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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="fw-bold mb-1">Sales &amp; Delivery</h2>
          <p className="text-muted mb-0">
            Log every delivery the moment it happens — it updates inventory
            and notifies the team on Telegram automatically.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          + New Sale
        </button>
      </div>

      <div className="stock-card p-3">
        <ListingComponent
          data={sales}
          columns={columns}
          emptyState={{
            title: "No deliveries logged yet",
            subtitle: "Use the New Sale button to log your first delivery.",
          }}
        />
      </div>

      <CreateModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreate}
        title="New Sale"
        btnLabel="Log Delivery"
        fields={[
          {
            name: "customer_id",
            label: "Pharmacy",
            type: "select",
            options: customers.map((c) => ({
              value: c.id,
              label: c.pharmacy_name,
            })),
          },
          {
            name: "batch_id",
            label: "Medicine / Batch",
            type: "select",
            options: batches.map((b) => ({
              value: b.id,
              label: `${b.medicine_name} (${b.batch_number}) — ${b.quantity} left`,
            })),
          },
          {
            name: "payment_status",
            label: "Payment",
            type: "select",
            options: PAYMENT_OPTIONS,
            initialValue: "paid",
          },
          ...(isAdmin
            ? [
                {
                  name: "rep_user_id",
                  label: "Sales Rep",
                  type: "select",
                  options: reps.map((r) => ({
                    value: r.id,
                    label: r.full_name,
                  })),
                },
              ]
            : []),
          { name: "quantity", label: "Quantity", type: "number", half: true },
          {
            name: "amount",
            label: "Amount (ETB)",
            type: "number",
            half: true,
          },
        ]}
      />
    </div>
  );
};

export default StockSalesDelivery;
