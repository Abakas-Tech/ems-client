// TransactionDetail.jsx
import { useEffect, useState } from "react";
import { fetchTransactionDetails } from "../../../api/finance.api";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/response/useResponse";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import ProfileCell from "../../../../../shared/components/ProfileCell/ProfileCell";
import Badge from "../../../../../shared/components/Badge/Badge";
const TransactionDetail = ({ transactionId, onBack }) => {
  const [transaction, setTransaction] = useState(null);
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const ROLE_MAP = {
    1: "Admin",
    2: "Employee",
    3: "Partner",
    4: "Worker",
    5: "Employer",
  };

  useEffect(() => {
    const getDetails = async () => {
      showLoader();
      try {
        const response = await fetchTransactionDetails(transactionId);
        setTransaction(response.data);
      } catch (err) {
        addMessage(false, err.message);
        onBack(); // Go back if fetch fails
      } finally {
        hideLoader();
      }
    };
    if (transactionId) getDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  if (!transaction) return null;

  const isIncome =
    transaction.type === "income" || transaction.category === "income";

  return (
    <div className="dashboard-wraper">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Transaction Receipt</h3>
        </div>
        <BackButton onClick={onBack} />
      </div>

      <div
        className="card border-0 shadow-sm overflow-hidden"
        id="printable-receipt"
      >
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
                <ProfileCell
                  profile={{
                    firstName: transaction?.user_name,
                    image: transaction?.profile_photo_url,
                  }}
                />
                <div>
                  <h5 className="mb-0 fw-bold">
                    {transaction?.user_name || "Unknown User"}
                  </h5>
                  <span className="badge bg-secondary-soft text-secondary text-capitalize">
                    {ROLE_MAP[transaction?.user_role] || "Unknown Role"}
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
                <span className="fw-semibold">
                  {transaction.category === "income" ? "Income" : "Expense"}
                </span>
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
                <Badge
                  content={transaction.category}
                  color={transaction.category === "income" ? "green" : "red"}
                />
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
