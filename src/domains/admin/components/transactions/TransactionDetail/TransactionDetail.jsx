// TransactionDetail.jsx
import React, { useEffect, useState } from "react";
import { fetchTransactionDetails } from "../../../api/finance.api";
import useLoader from "../../../../../context/Loader/UseLoader";
import useResponse from "../../../../../context/response/UseResponse";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
const TransactionDetail = ({ transactionId, onBack }) => {
  const [transaction, setTransaction] = useState(null);
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  useEffect(() => {
    const getDetails = async () => {
      showLoader();
      try {
        const { data } = await fetchTransactionDetails(transactionId);
        setTransaction(data);
      } catch (err) {
        addMessage("error", err.message);
        onBack(); // Go back if fetch fails
      } finally {
        hideLoader();
      }
    };
    if (transactionId) getDetails();
  }, [transactionId]);

  if (!transaction) return null;

  const isIncome =
    transaction.type === "income" || transaction.category === "income";

  return (
    <div className="dashboard-wraper">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Transaction Receipt</h2>
          <p className="text-muted">ID: #{transaction.id}</p>
        </div>
        <BackButton onClick={onBack} />
      </div>

      <div className="card border-0 shadow-sm overflow-hidden">
        {/* Top Status Bar */}
        <div
          style={{
            height: "6px",
            backgroundColor: isIncome ? "#198754" : "#dc3545",
          }}
        />

        <div className="card-body p-4 p-md-5">
          <div className="row mb-5">
            <div className="col-sm-6">
              <h6 className="text-uppercase text-muted small fw-bold mb-3">
                User
              </h6>
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                  style={{ width: "50px", height: "50px" }}
                >
                  <i className="bi bi-person fs-4 text-secondary"></i>
                </div>
                <div>
                  <h5 className="mb-0 fw-bold">
                    {transaction.user?.name || "Unknown User"}
                  </h5>
                  <span className="badge bg-secondary-soft text-secondary text-capitalize">
                    {transaction.user?.role || "Staff"}
                  </span>
                </div>
              </div>
            </div>
            <div className="col-sm-6 text-sm-end mt-4 mt-sm-0">
              <h6 className="text-uppercase text-muted small fw-bold mb-3">
                Transaction Amount
              </h6>
              <h2
                className={`fw-bold ${isIncome ? "text-success" : "text-danger"}`}
              >
                {isIncome ? "+" : "-"} {transaction.amount?.toLocaleString()}{" "}
                Birr
              </h2>
            </div>
          </div>

          <div className="bg-light rounded-4 p-4 mb-4">
            <div className="row g-4">
              <div className="col-md-3 col-6">
                <label className="text-muted d-block small mb-1">
                  Category
                </label>
                <span className="fw-semibold">{transaction.category}</span>
              </div>
              <div className="col-md-3 col-6">
                <label className="text-muted d-block small mb-1">Date</label>
                <span className="fw-semibold">
                  {new Date(
                    transaction.transaction_date || transaction.created_at,
                  ).toLocaleDateString()}
                </span>
              </div>
              <div className="col-md-3 col-6">
                <label className="text-muted d-block small mb-1">
                  Reference
                </label>
                <span className="fw-semibold text-break">
                  {transaction.reference || "---"}
                </span>
              </div>
              <div className="col-md-3 col-6">
                <label className="text-muted d-block small mb-1">Type</label>
                <span
                  className={`badge ${isIncome ? "bg-success" : "bg-danger"}`}
                >
                  {transaction.type || transaction.category}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-0">
            <h6 className="text-uppercase text-muted small fw-bold mb-3">
              Description
            </h6>
            <div className="p-3 border rounded-3 bg-white">
              {transaction.description ||
                "No description provided for this transaction."}
            </div>
          </div>
        </div>

        <div className="card-footer bg-white border-top-0 p-4 text-center">
          <button
            className="btn btn-outline-primary btn-sm px-4 me-2"
            onClick={() => window.print()}
          >
            <i className="bi bi-printer me-2"></i> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;
