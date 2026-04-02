import { useEffect, useState } from "react";
import { fetchFinanceSummary } from "../../../api/finance.api";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import BackButton from "../../../../../shared/components/BackButton/BackButton";

// Move the helper outside the component so it's reusable
const formatNumber = (num) => {
  if (!num) return "0";
  const n = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (n >= 1000000)
    return sign + (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return sign + (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";

  return sign + n.toLocaleString();
};

const FinanceReportSummary = ({ filters, onBack }) => {
  const [report, setReport] = useState(null);
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  useEffect(() => {
    const getSummary = async () => {
      showLoader();
      try {
        const response = await fetchFinanceSummary(filters);
        setReport(response.data.reportData);
      } catch (err) {
        addMessage(false, err.message);
        onBack();
      } finally {
        hideLoader();
      }
    };
    getSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  if (!report) return null;

  const isPositive = report.net_balance >= 0;

  return (
    <div className="dashboard-wraper">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark mb-0">Financial Summary Report</h2>
        <BackButton onClick={onBack} />
      </div>

      <div
        className="card border-0 shadow-sm overflow-hidden"
        id="printable-report"
      >
        <div style={{ height: "6px", backgroundColor: "#0d6efd" }} />

        <div className="card-body p-4 p-md-5">
          {/* Main Net Balance Section */}
          <div className="text-center mb-5">
            <h6 className="text-uppercase text-muted small fw-bold mb-2">
              Net Balance
            </h6>
            <h1
              className={`display-4 fw-bold ${isPositive ? "text-success" : "text-danger"}`}
            >
              {/* Keep the full amount here for the main header, or use formatNumber if you prefer it short */}
              {report.net_balance?.toLocaleString()}{" "}
              <span className="h4">Birr</span>
            </h1>
            <span className="badge bg-light text-dark border mt-2 px-3 py-2">
              {report.total_transactions} Total Transactions
            </span>
          </div>

          {/* Summary Grid - Using formatNumber here */}
          <div className="row g-4 mb-4">
            <SummaryCard
              title="Total Income"
              amount={report.total_income}
              color="success"
            />
            <SummaryCard
              title="Total Expense"
              amount={report.total_expense}
              color="danger"
            />
            <SummaryCard
              title="Total VAT"
              amount={report.total_vat}
              color="warning"
            />
            <SummaryCard
              title="Total Commission"
              amount={report.total_commission}
              color="info"
            />
          </div>

          <div className="bg-light rounded-3 p-3 text-center">
            <small className="text-muted italic">
              Report generated on {new Date().toLocaleString()}.
            </small>
          </div>
        </div>

        <div className="card-footer bg-white border-top-0 p-4 text-center">
          <button
            className="btn btn-outline-primary btn-sm px-4"
            onClick={() => window.print()}
          >
            <i className="bi bi-printer me-2"></i> Print Report
          </button>
        </div>
      </div>
    </div>
  );
};

// SummaryCard now uses formatNumber internaly
const SummaryCard = ({ title, amount, color }) => (
  <div className="col-md-6 col-lg-3">
    {" "}
    {/* Added col-lg-3 to fit 4 in a row on large screens */}
    <div
      className={`p-4 rounded-4 border-start border-4 border-${color} bg-white shadow-sm border h-100`}
    >
      <h6 className="text-uppercase text-muted small fw-bold mb-2">{title}</h6>
      <h3 className={`fw-bold text-${color} mb-0`}>
        {formatNumber(amount)} <span className="h6 text-muted">Birr</span>
      </h3>
    </div>
  </div>
);

export default FinanceReportSummary;
