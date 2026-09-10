import { useEffect, useState } from "react";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { getYearlyReport } from "../../../api/stockDashboard.api";
import "../stock-theme.css";

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [currentYear, currentYear - 1, currentYear - 2];

const StockReports = () => {
  const [year, setYear] = useState(currentYear);
  const [report, setReport] = useState(null);
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const fetchReport = async (selectedYear) => {
    showLoader();
    try {
      const response = await getYearlyReport(selectedYear);
      setReport(response?.data || null);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchReport(year);
    // eslint-disable-next-line
  }, [year]);

  const formatBirr = (value) => `${Number(value || 0).toLocaleString()} ETB`;

  return (
    <div className="stock-app">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Yearly Report</h2>
          <p className="text-muted mb-0">
            A simple summary for tax filing and license renewal.
          </p>
        </div>
        <select
          className="form-select"
          style={{ width: "auto" }}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {YEAR_OPTIONS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="row g-3">
        <div className="col-6 col-lg-3">
          <div className="stock-stat">
            <div className="stock-stat-label">Total Imported</div>
            <div className="stock-stat-value">
              {report ? formatBirr(report.total_imported) : "—"}
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="stock-stat">
            <div className="stock-stat-label">Total Sold</div>
            <div className="stock-stat-value">
              {report ? formatBirr(report.total_sold) : "—"}
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="stock-stat">
            <div className="stock-stat-label">Total Revenue (Paid)</div>
            <div className="stock-stat-value">
              {report ? formatBirr(report.total_revenue) : "—"}
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="stock-stat is-warning">
            <div className="stock-stat-label">Credit Issued</div>
            <div className="stock-stat-value">
              {report ? formatBirr(report.total_credit_issued) : "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockReports;
