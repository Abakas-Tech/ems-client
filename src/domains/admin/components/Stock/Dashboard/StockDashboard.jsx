import { useEffect, useState } from "react";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { getSummary } from "../../../api/stockDashboard.api";
import "../stock-theme.css";

const StockDashboard = () => {
  const [summary, setSummary] = useState(null);
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const fetchSummary = async () => {
    showLoader();
    try {
      const response = await getSummary();
      setSummary(response?.data || null);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line
  }, []);

  const formatBirr = (value) => `${Number(value || 0).toLocaleString()} ETB`;

  return (
    <div className="stock-app">
      <h2 className="fw-bold mb-1">Stock Overview</h2>
      <p className="text-muted mb-4">
        A quick look at imports, warehouse stock, and today's collections.
      </p>

      <div className="row g-3">
        <div className="col-6 col-lg-3">
          <div className="stock-stat">
            <div className="stock-stat-label">Orders In Progress</div>
            <div className="stock-stat-value">
              {summary?.orders_in_progress ?? "—"}
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="stock-stat is-danger">
            <div className="stock-stat-label">Expiring Batches</div>
            <div className="stock-stat-value">
              {summary?.expiring_batches ?? "—"}
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="stock-stat">
            <div className="stock-stat-label">Today's Cash</div>
            <div className="stock-stat-value">
              {summary ? formatBirr(summary.todays_cash) : "—"}
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="stock-stat is-warning">
            <div className="stock-stat-label">Outstanding Credit</div>
            <div className="stock-stat-value">
              {summary ? formatBirr(summary.outstanding_credit) : "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDashboard;
