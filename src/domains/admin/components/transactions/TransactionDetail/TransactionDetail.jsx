import { useEffect, useState } from "react";
import { fetchTransactionDetails } from "../../../api/finance.api";
import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import ProfileCell from "../../../../../shared/components/ProfileCell/ProfileCell";
import Badge from "../../../../../shared/components/Badge/Badge";

const ROLE_MAP = {
  1: "Admin",
  2: "Staff",
  3: "Partner",
  4: "Employee",
  5: "Employer",
};

const formatDate = (value, withTime = false) => {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    ...(withTime && { hour: "2-digit", minute: "2-digit" }),
  });
};

const formatAmount = (value) =>
  Number(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// NOTE: Generate Report is no longer shown from this page — it now only
// appears in the period transactions view header (see FinancePage).
const TransactionDetail = ({ transactionId, onBack }) => {
  const [transaction, setTransaction] = useState(null);
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();

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
  const isPeriodClosed = transaction.period_status === "closed";

  return (
    <div className="dashboard-wraper">
      {/* Page header action — Back only. Hidden from print output. */}
      <div className="mb-3 d-print-none">
        <BackButton onClick={onBack} />
      </div>

      {/* Hero card */}
      <div
        className="card border-0 rounded-4 shadow-sm mb-4 overflow-hidden"
        id="printable-receipt"
        style={{
          background: isIncome
            ? "linear-gradient(135deg, #e9fbf0 0%, #ffffff 60%)"
            : "linear-gradient(135deg, #fdeeee 0%, #ffffff 60%)",
        }}
      >
        <div className="card-body p-4 p-md-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <div className="d-flex gap-2 mb-3">
                <Badge
                  content={transaction.category?.toUpperCase()}
                  color={isIncome ? "green" : "red"}
                />
                {transaction.period_title && (
                  <Badge
                    content={transaction.period_title}
                    color={isPeriodClosed ? "gray" : "cyan"}
                  />
                )}
              </div>
              <h2 className="fw-bold text-dark mb-1">Receipt</h2>
              <p className="text-muted mb-0">
                {formatDate(
                  transaction.transaction_date || transaction.created_at,
                )}
                {transaction.reference && <> · {transaction.reference}</>}
              </p>
            </div>

            <div className="text-md-end">
              <div
                className={`fw-bold ${isIncome ? "text-success" : "text-danger"}`}
                style={{ fontSize: "2.25rem", lineHeight: 1 }}
              >
                {isIncome ? "+" : "-"} {formatAmount(transaction.amount)} Birr
              </div>
              <div className="text-muted small mt-1">
                {isCompany ? (
                  "Company Account"
                ) : (
                  <>
                    For{" "}
                    <span className="fw-semibold">
                      {transaction.target_user_name}
                    </span>{" "}
                    <Badge
                      content={ROLE_MAP[transaction.target_user_role] || "User"}
                      color="red"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card border rounded-4 h-100">
            <div className="card-body p-4">
              <h6 className="text-uppercase text-muted small fw-bold mb-3">
                Details
              </h6>

              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-muted">Category</span>
                <span className="fw-semibold text-capitalize">
                  {transaction.category}
                </span>
              </div>
              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-muted">Date</span>
                <span className="fw-semibold">
                  {formatDate(
                    transaction.transaction_date || transaction.created_at,
                  )}
                </span>
              </div>
              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-muted">Reference</span>
                <span className="fw-semibold text-break">
                  {transaction.reference || "—"}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span className="text-muted">
                  {isCompany ? "Entity" : "Transaction For"}
                </span>
                {isCompany ? (
                  <span className="fw-semibold">Company Account</span>
                ) : (
                  <span className="d-flex align-items-center gap-2 fw-semibold">
                    {transaction.target_user_name}
                    <Badge
                      content={ROLE_MAP[transaction.target_user_role]}
                      color="red"
                    />
                  </span>
                )}
              </div>
              <div className="d-flex justify-content-between py-2">
                <span className="text-muted">Recorded By</span>
                <span className="fw-semibold">
                  {transaction.creator_name || "System"}{" "}
                  <Badge
                    content={ROLE_MAP[transaction.creator_role]}
                    color="green"
                  />
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border rounded-4 h-100">
            <div className="card-body p-4">
              <h6 className="text-uppercase text-muted small fw-bold mb-3">
                Description
              </h6>
              <p
                className="mb-4"
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxHeight: "100px",
                  overflowY: "auto",
                }}
              >
                {transaction.description || "No description provided."}
              </p>

              <h6 className="text-uppercase text-muted small fw-bold mb-3">
                Period
              </h6>
              {transaction.period_title ? (
                <>
                  <div className="d-flex justify-content-between align-items-start py-2 border-bottom">
                    <span className="text-muted">Title</span>
                    <span className="fw-semibold text-end">
                      {transaction.period_title}
                    </span>
                  </div>
                  {transaction.period_description && (
                    <div className="py-2 border-bottom">
                      <span className="text-muted d-block small mb-1">
                        Description
                      </span>
                      <span>{transaction.period_description}</span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted">Status</span>
                    <Badge
                      content={transaction.period_status?.toUpperCase()}
                      color={isPeriodClosed ? "red" : "green"}
                    />
                  </div>
                  {isPeriodClosed ? (
                    <>
                      <div className="d-flex justify-content-between py-2 border-bottom">
                        <span className="text-muted">Closed By</span>
                        <span className="fw-semibold text-end">
                          {transaction.period_closed_by_name || "—"}
                          <span className="text-muted d-block small">
                            {formatDate(transaction.period_closed_at, true)}
                          </span>
                        </span>
                      </div>
                      {transaction.period_closing_note && (
                        <div className="py-2">
                          <span className="text-muted d-block small mb-1">
                            Closing Note
                          </span>
                          <span>{transaction.period_closing_note}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="d-flex justify-content-between py-2">
                      <span className="text-muted">Open Since</span>
                      <span className="fw-semibold">
                        {formatDate(transaction.period_started_at)}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted mb-0">No period information.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center d-print-none">
        <button
          className="btn btn-outline-primary btn-sm px-4"
          onClick={() => window.print()}
        >
          <i className="bi bi-printer me-2"></i> Print Receipt
        </button>
      </div>
    </div>
  );
};

export default TransactionDetail;
