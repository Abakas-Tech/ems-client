import { useEffect, useState } from "react";
import { fetchTransactionDetails } from "../../../api/finance.api";
import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import ProfileCell from "../../../../../shared/components/ProfileCell/ProfileCell";
import Badge from "../../../../../shared/components/Badge/Badge";

const TransactionDetail = ({ transactionId, onBack }) => {
  const [transaction, setTransaction] = useState(null);
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();

  const ROLE_MAP = {
    1: "Admin",
    2: "Staff",
    3: "Partner",
    4: "Employee",
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
        onBack();
      } finally {
        hideLoader();
      }
    };
    if (transactionId) getDetails();
  }, [transactionId]);

  if (!transaction) return null;

  const isIncome = transaction.category === "income";
  const isCompany = !transaction.user_id;

  return (
    <div className="dashboard-wraper">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
        <div className="mb-4">
          <BackButton onClick={onBack} />
          <h2 className="fw-bold text-dark mb-2">Receipt</h2>
        </div>
      </div>

      <div
        className="card border-0 shadow-sm overflow-hidden"
        id="printable-receipt"
      >
        {/* Top Status Bar (Green for Income, Red for Expense) */}
        <div
          style={{
            height: "6px",
            backgroundColor: isIncome ? "#198754" : "#dc3545",
          }}
        />

        <div className="card-body p-4 p-md-5">
          {/* Section 1: Parties Involved */}
          <div className="row mb-5 align-items-center">
            <div className="col-sm-6">
              <h6 className="text-uppercase text-muted small fw-bold mb-3">
                {isCompany ? "Entity" : "Transaction For"}
              </h6>

              <div className="d-flex align-items-center gap-3">
                {isCompany ? (
                  <>
                    <div
                      className="rounded-circle bg-primary-soft d-flex align-items-center justify-content-center"
                      style={{ width: "50px", height: "50px" }}
                    >
                      <i className="fa-solid fa-building text-primary fs-5"></i>
                    </div>
                    <div>
                      <h5 className="mb-0 fw-bold">Company Related</h5>
                      <span className="text-primary small fw-semibold">
                        Agency Account
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <ProfileCell
                      profile={{
                        firstName: transaction.target_user_name,
                        image: transaction.target_profile_photo,
                      }}
                    />
                    <div>
                      <h5 className="mb-0 fw-bold">
                        {transaction.target_user_name}
                      </h5>
                      <span className="badge bg-secondary-soft text-secondary text-capitalize">
                        {ROLE_MAP[transaction.target_user_role] || "User"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="col-sm-6 text-sm-end mt-4 mt-sm-0">
              <h6 className="text-uppercase text-muted small fw-bold mb-2">
                Total Amount
              </h6>
              <h2
                className={`fw-bold ${isIncome ? "text-success" : "text-danger"}`}
              >
                {isIncome ? "+" : "-"} {transaction.amount?.toLocaleString()}{" "}
                Birr
              </h2>
            </div>
          </div>

          {/* Section 2: Key Metadata */}
          <div className="bg-light rounded-4 p-4 mb-5">
            <div className="row g-4">
              <div className="col-md-3 col-6">
                <label className="text-muted d-block small mb-1">
                  Category
                </label>
                <span className="fw-semibold text-capitalize">
                  {transaction.category}
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
                  {transaction.reference || "N/A"}
                </span>
              </div>
              <div className="col-md-3 col-6">
                <label className="text-muted d-block small mb-1">Status</label>
                <Badge
                  content={isIncome ? "Income" : "Expense"}
                  color={isIncome ? "green" : "red"}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Description */}
          <div className="mb-5">
            <h6 className="text-uppercase text-muted small fw-bold mb-3">
              Description
            </h6>
            <div className="p-3 border rounded-3 bg-white min-vh-10">
              {transaction.description ||
                "No description provided for this transaction."}
            </div>
          </div>

          {/* Section 4: Audit Trail (The "Creator" Info) */}
          <div className="mt-5 pt-4 border-top">
            <div className="row align-items-center">
              <div className="col-md-6">
                <p className=" mb-0">
                  Recorded by:{" "}
                  <strong>{transaction.creator_name || "System"}</strong>
                  <span className="ms-1">
                    ({ROLE_MAP[transaction.creator_role] || "Staff"})
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="card-footer bg-white border-top-0 p-4 text-center d-print-none">
          <button
            className="btn btn-outline-primary btn-sm px-4"
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
