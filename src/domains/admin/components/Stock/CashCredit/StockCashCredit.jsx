import { useEffect, useState } from "react";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import CreateModal from "../../../../../shared/components/CreateModal/CreateModal";
import Badge from "../../../../../shared/components/Badge/Badge";
import { getCashSummary } from "../../../api/stockSale.api";
import { getLedger, recordPayment } from "../../../api/stockCustomer.api";
import "../stock-theme.css";

const StockCashCredit = () => {
  const [cashByRep, setCashByRep] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [paymentTarget, setPaymentTarget] = useState(null);

  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const loadAll = async () => {
    showLoader();
    try {
      const [cashRes, ledgerRes] = await Promise.all([
        getCashSummary(),
        getLedger(),
      ]);
      setCashByRep(cashRes?.data || []);
      setLedger(ledgerRes?.data || []);
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

  const handleRecordPayment = async (values) => {
    try {
      const response = await recordPayment(
        paymentTarget.id,
        parseFloat(values.amount),
      );
      addMessage(response?.success, response?.message || "Payment recorded");
      setPaymentTarget(null);
      loadAll();
    } catch (err) {
      addMessage(false, err.message);
    }
  };

  const totalCashToday = cashByRep.reduce(
    (sum, r) => sum + Number(r.total_cash),
    0,
  );

  const cashColumns = [
    { header: "Rep", accessor: "rep_name" },
    {
      header: "Cash Collected Today",
      accessor: "total_cash",
      render: (row) => `${Number(row.total_cash).toLocaleString()} ETB`,
    },
  ];

  const ledgerColumns = [
    { header: "Pharmacy", accessor: "pharmacy_name" },
    { header: "Phone", accessor: "phone_number" },
    {
      header: "Balance Owed",
      accessor: "balance_owed",
      render: (row) => (
        <span
          className={row.balance_owed > 0 ? "text-danger fw-semibold" : ""}
        >
          {Number(row.balance_owed).toLocaleString()} ETB
        </span>
      ),
    },
    {
      header: "Last Payment",
      accessor: "last_payment_date",
      render: (row) =>
        row.last_payment_date
          ? new Date(row.last_payment_date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "—",
    },
    {
      header: "",
      accessor: "actions",
      render: (row) =>
        row.balance_owed > 0 ? (
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => setPaymentTarget(row)}
          >
            Record Payment
          </button>
        ) : (
          <Badge content="Settled" color="green" />
        ),
    },
  ];

  return (
    <div className="stock-app">
      <h2 className="fw-bold mb-1">Cash &amp; Credit</h2>
      <p className="text-muted mb-4">
        Today's cash collections by rep, and which pharmacies still owe you
        money.
      </p>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="stock-stat">
            <div className="stock-stat-label">Total Cash Today</div>
            <div className="stock-stat-value">
              {totalCashToday.toLocaleString()} ETB
            </div>
          </div>
        </div>
      </div>

      <div className="stock-card p-3 mb-4">
        <h5 className="fw-semibold mb-3">Cash by Rep</h5>
        <ListingComponent
          data={cashByRep}
          columns={cashColumns}
          emptyState={{ title: "No cash collected today yet" }}
        />
      </div>

      <div className="stock-card p-3">
        <h5 className="fw-semibold mb-3">Pharmacy Credit Ledger</h5>
        <ListingComponent
          data={ledger}
          columns={ledgerColumns}
          emptyState={{ title: "No pharmacies yet" }}
        />
      </div>

      <CreateModal
        show={!!paymentTarget}
        onClose={() => setPaymentTarget(null)}
        onCreate={handleRecordPayment}
        title={`Record Payment — ${paymentTarget?.pharmacy_name || ""}`}
        btnLabel="Record Payment"
        fields={[
          { name: "amount", label: "Amount Paid (ETB)", type: "number" },
        ]}
      />
    </div>
  );
};

export default StockCashCredit;
