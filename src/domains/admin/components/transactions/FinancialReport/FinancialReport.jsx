import { useEffect, useState } from "react";
import { fetchFinanceSummary } from "../../../api/finance.api"; // Update this API call
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import BackButton from "../../../../../shared/components/BackButton/BackButton";

const FinanceReportSummary = ({ filters, onBack }) => {
  const [report, setReport] = useState(null);
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  useEffect(() => {
    const getSummary = async () => {
      showLoader();
      try {
        // This calls the node function we wrote in the previous step
        const response = await fetchFinanceSummary(filters);
        setReport(response.data.reportData); // Accessing the single row from SQL
      } catch (err) {
        addMessage(false, err.message);
      } finally {
        hideLoader();
      }
    };
    getSummary();
  }, [filters]);
  if (!report) return null;

  const isPositive = report.net_balance >= 0;

  return (
    <div className="dashboard-wraper">
      <div className="d-flex justify-content-between align-items-center mb-4"></div>

      <div
        className="card border-0 shadow-sm overflow-hidden"
        id="printable-report"
      >
        <div>
          <h3 className="fw-bold text-dark mb-4">Financial Summary Report</h3>
        </div>
        <BackButton onClick={onBack} />
        <div style={{ height: "6px", backgroundColor: "#0d6efd" }} />

        <div className="card-body p-4 p-md-5">
          {/* Main Net Balance Header */}
          <div className="text-center mb-5">
            <h6 className="text-uppercase text-muted small fw-bold mb-2">
              Net Balance
            </h6>
            <h1
              className={`display-4 fw-bold ${isPositive ? "text-success" : "text-danger"}`}
            >
              {report.net_balance?.toLocaleString()}{" "}
              <span className="h4">Birr</span>
            </h1>
            <span className="badge bg-light text-dark border mt-2">
              {report.total_transactions} Total Transactions
            </span>
          </div>

          {/* Summary Grid */}
          <div className="row g-4 mb-5">
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
              title="Commissions"
              amount={report.total_commission}
              color="primary"
            />
            <SummaryCard
              title="VAT Collected"
              amount={report.total_vat}
              color="warning"
            />
          </div>

          {/* Footer Info */}
          <div className="p-3 border rounded-3 bg-light text-center">
            <small className="text-muted">
              Report generated on {new Date().toLocaleString()} • Database
              Reference:{" "}
              {report.total_transactions > 0 ? "Verified" : "No Data"}
            </small>
          </div>
        </div>

        <div className="card-footer bg-white border-top-0 p-4 text-center">
          <button
            className="btn btn-primary px-4"
            onClick={() => window.print()}
          >
            <i className="bi bi-file-earmark-pdf me-2"></i> Print Full Report
          </button>
        </div>
      </div>
    </div>
  );
};

// Sub-component for clean cards
const SummaryCard = ({ title, amount, color }) => (
  <div className="col-md-3 col-sm-6">
    <div
      className={`p-3 border-start border-${color} border-4 bg-white shadow-sm rounded`}
    >
      <label className="text-muted d-block small mb-1 fw-bold text-uppercase">
        {title}
      </label>
      <h4 className={`mb-0 fw-bold text-${color}`}>
        {amount?.toLocaleString()} <small className="fs-6">ETB</small>
      </h4>
    </div>
  </div>
);

export default FinanceReportSummary;
