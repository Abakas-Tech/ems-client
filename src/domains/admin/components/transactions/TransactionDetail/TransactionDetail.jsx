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
  const accent = isIncome ? "income" : "expense";

  return (
    <div className="txn-receipt dashboard-wraper">
      <style>{`
        .txn-receipt {
          --ink: #101828;
          --muted: #667085;
          --border: #e4e7ec;
          --surface: #ffffff;
          --soft: #f9fafb;
          --income: #059669;
          --income-soft: #ecfdf5;
          --expense: #dc2626;
          --expense-soft: #fef2f2;
        }
        .txn-receipt .receipt-shell {
          border: 1px solid var(--border);
          border-radius: 18px;
          background: var(--surface);
          box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04), 0 4px 12px rgba(16, 24, 40, 0.05);
          overflow: hidden;
        }
        .txn-receipt .receipt-topbar {
          padding: 2rem 2.25rem;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1.5rem;
          background: ${
            isIncome
              ? "linear-gradient(135deg, #e9fbf0 0%, #ffffff 60%)"
              : "linear-gradient(135deg, #fdeeee 0%, #ffffff 60%)"
          };
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .txn-receipt .receipt-eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--muted);
          margin-bottom: 0.6rem;
        }
        .txn-receipt .receipt-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--ink);
          margin: 0 0 0.35rem;
          letter-spacing: -0.01em;
        }
        .txn-receipt .receipt-subtext {
          color: var(--muted);
          font-size: 0.875rem;
          margin: 0;
        }
        .txn-receipt .receipt-amount-block {
          text-align: right;
        }
        .txn-receipt .receipt-amount {
          font-size: 2.6rem;
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
          color: var(--${accent});
          white-space: nowrap;
        }
        .txn-receipt .receipt-amount-currency {
          font-size: 1rem;
          font-weight: 600;
          color: var(--muted);
          margin-left: 0.35rem;
        }
        .txn-receipt .receipt-stats-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          background: var(--soft);
        }
        .txn-receipt .stat-item {
          padding: 1.1rem 1.6rem;
          border-right: 1px solid var(--border);
          min-width: 0;
        }
        .txn-receipt .stat-item:last-child {
          border-right: none;
        }
        .txn-receipt .stat-label {
          display: block;
          text-transform: uppercase;
          font-size: 0.66rem;
          letter-spacing: 0.07em;
          font-weight: 700;
          color: var(--muted);
          margin-bottom: 0.35rem;
        }
        .txn-receipt .stat-value {
          display: block;
          font-size: 0.925rem;
          font-weight: 600;
          color: var(--ink);
          overflow-wrap: break-word;
        }
        .txn-receipt .stat-value.is-flex {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .txn-receipt .receipt-body {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        }
        .txn-receipt .receipt-body > .receipt-section:first-child {
          border-right: 1px solid var(--border);
        }
        .txn-receipt .receipt-section {
          padding: 2rem 2.25rem;
        }
        .txn-receipt .section-title {
          text-transform: uppercase;
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          font-weight: 700;
          color: var(--muted);
          margin: 0 0 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid var(--border);
        }
        .txn-receipt .detail-grid {
          margin: 0;
          display: grid;
          grid-template-columns: auto 1fr;
          row-gap: 1.1rem;
          column-gap: 1rem;
        }
        .txn-receipt .detail-grid dt {
          color: var(--muted);
          font-size: 0.85rem;
          font-weight: 500;
          align-self: center;
        }
        .txn-receipt .detail-grid dd {
          margin: 0;
          text-align: right;
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--ink);
        }
        .txn-receipt .description-text {
          font-size: 0.95rem;
          line-height: 1.75;
          color: var(--ink);
          white-space: pre-wrap;
          word-break: break-word;
          max-height: 230px;
          overflow-y: auto;
          padding-right: 0.5rem;
          margin: 0;
        }
        .txn-receipt .period-strip {
          border-top: 1px solid var(--border);
          background: var(--soft);
          padding: 1.75rem 2.25rem 2rem;
        }
        .txn-receipt .period-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }
        .txn-receipt .period-note-label {
          text-transform: uppercase;
          font-size: 0.66rem;
          letter-spacing: 0.07em;
          font-weight: 700;
          color: var(--muted);
          display: block;
          margin-bottom: 0.35rem;
        }
        .txn-receipt .period-note-text {
          font-size: 0.9rem;
          line-height: 1.6;
          margin: 0;
          color: var(--ink);
        }
        @media (max-width: 767px) {
          .txn-receipt .receipt-body {
            grid-template-columns: 1fr;
          }
          .txn-receipt .receipt-body > .receipt-section:first-child {
            border-right: none;
            border-bottom: 1px solid var(--border);
          }
          .txn-receipt .receipt-stats-strip {
            grid-template-columns: repeat(2, 1fr);
          }
          .txn-receipt .stat-item:nth-child(2) {
            border-right: none;
          }
          .txn-receipt .stat-item:nth-child(3),
          .txn-receipt .stat-item:nth-child(4) {
            border-top: 1px solid var(--border);
          }
          .txn-receipt .receipt-amount-block {
            text-align: left;
          }
          .txn-receipt .receipt-topbar,
          .txn-receipt .receipt-section {
            padding: 1.5rem;
          }
        }
        @media print {
          .txn-receipt .receipt-shell {
            box-shadow: none;
            border-radius: 0;
          }
          .txn-receipt .receipt-body {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          }
          .txn-receipt .description-text,
          .txn-receipt .period-note-text {
            max-height: none;
            overflow: visible;
            padding-right: 0;
          }
          .txn-receipt .stat-item .text-muted.small {
            margin: 0;
          }
        }
      `}</style>

      {/* Page header action — Back only. */}
      <div className="mb-3 d-print-none">
        <BackButton onClick={onBack} />
      </div>

      {/* Receipt */}
      <div className="receipt-shell" id="printable-receipt">
        {/* Summary header */}
        <div className="receipt-topbar">
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
            <p className="receipt-eyebrow">Transaction Receipt</p>
            <h2 className="receipt-title">
              {isIncome ? "Income" : "Expense"} Transaction
            </h2>
            <p className="receipt-subtext">
              {formatDate(
                transaction.transaction_date || transaction.created_at,
              )}
              {transaction.reference && <> · {transaction.reference}</>}
            </p>
          </div>

          <div className="receipt-amount-block">
            <div className="receipt-amount">
              {isIncome ? "+" : "-"}
              {formatAmount(transaction.amount)}
              <span className="receipt-amount-currency">Birr</span>
            </div>
          </div>
        </div>

        {/* Quick facts strip */}
        <div className="receipt-stats-strip">
          <div className="stat-item">
            <span className="stat-label">Date</span>
            <span className="stat-value">
              {formatDate(
                transaction.transaction_date || transaction.created_at,
              )}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Reference</span>
            <span className="stat-value">{transaction.reference || "—"}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">
              {isCompany ? "Entity" : "Transaction For"}
            </span>
            {isCompany ? (
              <span className="stat-value">Company Account</span>
            ) : (
              <span className="stat-value is-flex">
                {transaction.target_user_name}
                <Badge
                  content={ROLE_MAP[transaction.target_user_role] || "User"}
                  color="red"
                />
              </span>
            )}
          </div>
          <div className="stat-item">
            <span className="stat-label">Recorded By</span>
            <span className="stat-value is-flex">
              {transaction.creator_name || "System"}
              <Badge
                content={ROLE_MAP[transaction.creator_role]}
                color="green"
              />
            </span>
          </div>
        </div>

        {/* Details + Description */}
        <div className="receipt-body">
          <div className="receipt-section">
            <h6 className="section-title">Details</h6>
            <dl className="detail-grid">
              <dt>Category</dt>
              <dd className="text-capitalize">{transaction.category}</dd>

              <dt>Date</dt>
              <dd>
                {formatDate(
                  transaction.transaction_date || transaction.created_at,
                )}
              </dd>

              <dt>Reference</dt>
              <dd>{transaction.reference || "—"}</dd>

              <dt>{isCompany ? "Entity" : "Transaction For"}</dt>
              <dd>
                {isCompany ? (
                  "Company Account"
                ) : (
                  <span className="d-inline-flex align-items-center gap-2">
                    {transaction.target_user_name}
                    <Badge
                      content={ROLE_MAP[transaction.target_user_role]}
                      color="red"
                    />
                  </span>
                )}
              </dd>

              <dt>Recorded By</dt>
              <dd>
                <span className="d-inline-flex align-items-center gap-2">
                  {transaction.creator_name || "System"}
                  <Badge
                    content={ROLE_MAP[transaction.creator_role]}
                    color="green"
                  />
                </span>
              </dd>
            </dl>
          </div>

          <div className="receipt-section">
            <h6 className="section-title">Description</h6>
            <p className="description-text">
              {transaction.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* Period */}
        <div className="period-strip">
          <h6 className="section-title" style={{ marginBottom: "1.25rem" }}>
            Period
          </h6>

          {transaction.period_title ? (
            <div className="period-card">
              <div
                className="receipt-stats-strip"
                style={{ border: "none" }}
              >
                <div className="stat-item">
                  <span className="stat-label">Title</span>
                  <span className="stat-value">{transaction.period_title}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Status</span>
                  <Badge
                    content={transaction.period_status?.toUpperCase()}
                    color={isPeriodClosed ? "red" : "green"}
                  />
                </div>
                {isPeriodClosed ? (
                  <div className="stat-item">
                    <span className="stat-label">Closed By</span>
                    <span className="stat-value">
                      {transaction.period_closed_by_name || "—"}
                    </span>
                    <span className="text-muted small">
                      {formatDate(transaction.period_closed_at, true)}
                    </span>
                  </div>
                ) : (
                  <div className="stat-item">
                    <span className="stat-label">Open Since</span>
                    <span className="stat-value">
                      {formatDate(transaction.period_started_at)}
                    </span>
                  </div>
                )}
                <div className="stat-item">
                  {transaction.period_description ? (
                    <>
                      <span className="period-note-label">Description</span>
                      <p className="period-note-text">
                        {transaction.period_description}
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="stat-label">Description</span>
                      <span className="stat-value text-muted">—</span>
                    </>
                  )}
                </div>
              </div>

              {isPeriodClosed && transaction.period_closing_note && (
                <div
                  style={{
                    borderTop: "1px solid var(--border)",
                    padding: "1.1rem 1.6rem",
                  }}
                >
                  <span className="period-note-label">Closing Note</span>
                  <p className="period-note-text">
                    {transaction.period_closing_note}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted mb-0">No period information.</p>
          )}
        </div>
      </div>

      <div className="text-center d-print-none mt-4">
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
