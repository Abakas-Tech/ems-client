import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTransactionDetails } from "../../../api/finance.api";
import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import Badge from "../../../../../shared/components/Badge/Badge";
import { REPORT_META } from "../../../../../shared/components/Report/Data";

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

// FIXED — financial_periods has no `title` column, only `label` (plus
// period_number) — same bug already fixed in PeriodReport.jsx. This was
// rendering "undefined" both in the on-screen summary heading and, worse,
// in the saved PDF's filename.
const getPeriodLabel = (period) =>
  period?.title ||
  period?.label ||
  (period?.period_number
    ? `Period ${period.period_number}`
    : "Financial Period");

// Same fallback logic as the printed report (PeriodReport.jsx): prefer the
// period's own stored totals, fall back to computing from the transaction
// set when those fields aren't present yet. Net profit/loss accounts for
// commission and VAT too, not just the raw income vs. expense difference.
const computeSummaryTotals = (period, transactions) => {
  const list = transactions || [];
  const computedIncome = list
    .filter((t) => t.category === "income")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const computedExpense = list
    .filter((t) => t.category === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const commission = period.total_commission ?? period.commission ?? null;
  const vat = period.total_vat ?? period.vat ?? null;

  const computedNet =
    computedIncome -
    computedExpense -
    Number(commission || 0) -
    Number(vat || 0);

  return {
    income: period.total_income ?? computedIncome,
    expense: period.total_expense ?? computedExpense,
    commission,
    vat,
    netProfit: period.net_profit ?? computedNet,
    transactionCount: period.transaction_count ?? list.length,
  };
};

// Print-only company header — same org name/logo/confidentiality line as
// the printed period and worker reports (REPORT_META, shared Data.js),
// but only shown on the printed page, never on-screen. Kept deliberately
// compact (small logo, tight padding) — this is a short receipt, not a
// full report page, so it shouldn't read like one.
const CompanyHeader = () => {
  const {
    orgName,
    orgSub,
    logoPath,
    logoInitials,
    logoColor,
    confidentiality,
  } = REPORT_META;

  return (
    <div className="receipt-company-header">
      <div className="d-flex align-items-center gap-2">
        {logoPath ? (
          <img src={logoPath} alt={orgName} className="receipt-company-logo" />
        ) : (
          <div
            className="receipt-company-logo-fallback"
            style={{ background: logoColor }}
          >
            {logoInitials}
          </div>
        )}
        <div>
          <div className="receipt-company-name">{orgName}</div>
          <div className="receipt-company-sub">{orgSub}</div>
        </div>
      </div>
      <div className="receipt-company-confidentiality">{confidentiality}</div>
    </div>
  );
};

// Swaps document.title to a proper name right before printing and puts
// the original back afterward — "Save as PDF" takes its suggested
// filename from the page's real title, not anything inside the printed
// content, so without this the saved file kept picking up whatever the
// app's actual page title happened to be (its SEO title, in this case).
const printWithTitle = (title) => {
  const originalTitle = document.title;
  let restored = false;

  const restore = () => {
    if (restored) return;
    restored = true;
    document.title = originalTitle;
    window.removeEventListener("afterprint", restore);
  };

  document.title = title;
  window.addEventListener("afterprint", restore);
  window.print();

  // Fallback in case "afterprint" doesn't fire in this browser.
  setTimeout(restore, 4000);
};

// NOTE: Generate Report is no longer shown from this page — it now only
// appears in the period transactions view header (see FinancePage).
//
// mode="transaction" (default): fetches and shows a single transaction's
// receipt, exactly as before.
// mode="summary": shows a period's financial summary instead — same page
// shell/flow (back button, card), but the content and the print action
// mirror the printed report generator (PeriodReport.jsx) rather than a
// single transaction's fields.
const TransactionDetail = ({
  transactionId,
  onBack,
  mode = "transaction",
  summaryPeriod,
  summaryTransactions = [],
}) => {
  const [transaction, setTransaction] = useState(null);
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();
  const navigate = useNavigate();

  useEffect(() => {
    if (mode !== "transaction") return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId, mode]);

  const isSummaryMode = mode === "summary";

  if (isSummaryMode && !summaryPeriod) return null;
  if (!isSummaryMode && !transaction) return null;

  // ── Transaction-mode derived values ──
  const isIncome = !isSummaryMode && transaction.category === "income";
  const isCompany = !isSummaryMode && !transaction.user_id;
  const isPeriodClosed =
    !isSummaryMode && transaction.period_status === "closed";

  // ── Summary-mode derived values ──
  const totals = isSummaryMode
    ? computeSummaryTotals(summaryPeriod, summaryTransactions)
    : null;
  const isProfit = isSummaryMode ? Number(totals.netProfit) >= 0 : false;
  const isSummaryPeriodClosed =
    isSummaryMode && summaryPeriod.status === "closed";

  // Drives the header gradient / amount color across both modes.
  const isPositiveAccent = isSummaryMode ? isProfit : isIncome;
  const accent = isPositiveAccent ? "income" : "expense";

  const handlePrintSummary = () =>
    printWithTitle(
      `${REPORT_META.orgName} - Finance ${getPeriodLabel(summaryPeriod)} Summary`,
    );

  const handlePrintReceipt = () =>
    printWithTitle(
      `${REPORT_META.orgName} - Transaction Receipt${transaction?.reference ? ` ${transaction.reference}` : ""}`,
    );

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
        /* Print-only company header — never shown on screen, only when printed. */
        .txn-receipt .receipt-company-header {
          display: none;
        }
        @media print {
          .txn-receipt .receipt-company-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            padding: 0.6rem 1.5rem;
            border-bottom: 2px solid #1a3c6e;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
        .txn-receipt .receipt-company-logo {
          height: 30px;
          max-width: 100px;
          object-fit: contain;
        }
        .txn-receipt .receipt-company-logo-fallback {
          width: 30px;
          height: 30px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 11px;
          font-weight: 800;
          flex-shrink: 0;
        }
        .txn-receipt .receipt-company-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: #1a3c6e;
          line-height: 1.15;
        }
        .txn-receipt .receipt-company-sub {
          font-size: 0.62rem;
          color: var(--muted);
          margin-top: 1px;
        }
        .txn-receipt .receipt-company-confidentiality {
          font-size: 0.62rem;
          color: var(--muted);
          text-align: right;
          white-space: nowrap;
        }
        .txn-receipt .receipt-topbar {
          padding: 2rem 2.25rem;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1.5rem;
          background: ${
            isPositiveAccent
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
        .txn-receipt .receipt-stats-strip.stats-strip-fluid {
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
        .txn-receipt .receipt-people {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          background: var(--soft);
        }
        .txn-receipt .people-item {
          padding: 1.1rem 2.25rem;
          border-right: 1px solid var(--border);
        }
        .txn-receipt .people-item:last-child {
          border-right: none;
        }
        .txn-receipt .people-label {
          display: block;
          text-transform: uppercase;
          font-size: 0.66rem;
          letter-spacing: 0.07em;
          font-weight: 700;
          color: var(--muted);
          margin-bottom: 0.35rem;
        }
        .txn-receipt .people-value {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          font-size: 0.925rem;
          font-weight: 600;
          color: var(--ink);
        }
        .txn-receipt .people-sub {
          font-weight: 500;
          font-size: 0.8rem;
          color: var(--muted);
        }
        .txn-receipt .receipt-section-full {
          padding: 2rem 2.25rem;
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
          .txn-receipt .receipt-section,
          .txn-receipt .receipt-section-full {
            padding: 1.5rem;
          }
          .txn-receipt .receipt-people {
            grid-template-columns: 1fr;
          }
          .txn-receipt .people-item {
            border-right: none;
          }
          .txn-receipt .people-item:first-child {
            border-bottom: 1px solid var(--border);
          }
          .txn-receipt .people-value {
            align-items: flex-start;
          }
        }
        @media print {
          /* No forced page size / min-height here on purpose — a
             receipt is short by nature and should print only as tall
             as its actual content, not stretched to fill an A4 page. */
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
      <div className="mb-3 d-print-none mb-4">
        <BackButton onClick={onBack} />
      </div>

      {isSummaryMode ? (
        <>
          {/* Summary receipt */}
          <div className="receipt-shell" id="printable-receipt">
            <CompanyHeader />

            {/* Summary header */}
            <div className="receipt-topbar">
              <div>
                <div className="d-flex gap-2 mb-3">
                  <Badge
                    content={isSummaryPeriodClosed ? "CLOSED" : "ACTIVE"}
                    color={isSummaryPeriodClosed ? "red" : "green"}
                  />
                </div>
                <p className="receipt-eyebrow">Period Summary</p>
                <h2 className="receipt-title">
                  {getPeriodLabel(summaryPeriod)}
                </h2>
                <p className="receipt-subtext">
                  {formatDate(summaryPeriod.started_at)} –{" "}
                  {summaryPeriod.closed_at
                    ? formatDate(summaryPeriod.closed_at)
                    : "Present"}
                </p>
              </div>

              <div className="receipt-amount-block">
                <p className="receipt-eyebrow" style={{ textAlign: "right" }}>
                  Net {isProfit ? "Profit" : "Loss"}
                </p>
                <div className="receipt-amount">
                  {isProfit ? "+" : "-"}
                  {formatAmount(Math.abs(totals.netProfit))}
                  <span className="receipt-amount-currency">Birr</span>
                </div>
              </div>
            </div>

            {/* Summary stat cards — same figures as the printed report */}
            <div className="receipt-stats-strip stats-strip-fluid">
              <div className="stat-item">
                <span className="stat-label">Total Income</span>
                <span className="stat-value" style={{ color: "var(--income)" }}>
                  + {formatAmount(totals.income)} Birr
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Expenses</span>
                <span
                  className="stat-value"
                  style={{ color: "var(--expense)" }}
                >
                  - {formatAmount(totals.expense)} Birr
                </span>
              </div>
              {totals.commission !== null && (
                <div className="stat-item">
                  <span className="stat-label">Total Commission</span>
                  <span className="stat-value">
                    {formatAmount(totals.commission)} Birr
                  </span>
                </div>
              )}
              {totals.vat !== null && (
                <div className="stat-item">
                  <span className="stat-label">Total VAT</span>
                  <span className="stat-value">
                    {formatAmount(totals.vat)} Birr
                  </span>
                </div>
              )}
              <div className="stat-item">
                <span className="stat-label">Total Transactions</span>
                <span className="stat-value">{totals.transactionCount}</span>
              </div>
            </div>

            {/* Closing note + period details */}
            <div className="receipt-body">
              <div className="receipt-section">
                <h6 className="section-title">Closing Note</h6>
                <p className="description-text">
                  {summaryPeriod.closing_note || "No closing note recorded."}
                </p>
              </div>

              <div className="receipt-section">
                <h6 className="section-title">Details</h6>
                <dl className="detail-grid">
                  <dt>Status</dt>
                  <dd>
                    {isSummaryPeriodClosed ? "Closed" : "Currently Active"}
                  </dd>

                  <dt>Started</dt>
                  <dd>{formatDate(summaryPeriod.started_at)}</dd>

                  <dt>{isSummaryPeriodClosed ? "Closed" : "Open Since"}</dt>
                  <dd>
                    {isSummaryPeriodClosed
                      ? formatDate(summaryPeriod.closed_at)
                      : formatDate(summaryPeriod.started_at)}
                  </dd>

                  {isSummaryPeriodClosed && (
                    <>
                      <dt>Closed By</dt>
                      <dd>{summaryPeriod.closed_by_name || "—"}</dd>
                    </>
                  )}
                </dl>
              </div>
            </div>
          </div>

          <div className="text-center d-print-none mt-4">
            <button
              className="btn btn-outline-primary btn-sm px-4"
              onClick={handlePrintSummary}
            >
              <i className="bi bi-printer me-2"></i> Print Summary Report
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Receipt */}
          <div className="receipt-shell" id="printable-receipt">
            <CompanyHeader />

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

            {/* Who it's for / who recorded it — Category, Date, and
                Reference already live in the topbar above, so they don't
                repeat down here. Just the two things the topbar can't
                show, then the description, full width — no grid. */}
            <div className="receipt-people">
              <div className="people-item">
                <span className="people-label">
                  {isCompany ? "Entity" : "Transaction For"}
                </span>
                {isCompany ? (
                  <span className="people-value">Company Account</span>
                ) : (
                  <span className="people-value">
                    <span className="d-inline-flex align-items-center gap-2">
                      {transaction.target_user_name}
                      <Badge
                        content={
                          ROLE_MAP[transaction.target_user_role] || "User"
                        }
                        color="red"
                      />
                    </span>
                    {transaction.target_user_phone && (
                      <span className="people-sub">
                        {transaction.target_user_phone}
                      </span>
                    )}
                  </span>
                )}
              </div>

              <div className="people-item">
                <span className="people-label">Recorded By</span>
                <span className="people-value">
                  <span className="d-inline-flex align-items-center gap-2">
                    {transaction.creator_name || "System"}
                    <Badge
                      content={ROLE_MAP[transaction.creator_role]}
                      color="green"
                    />
                  </span>
                </span>
              </div>
            </div>

            <div className="receipt-section-full">
              <h6 className="section-title">Description</h6>
              <p className="description-text">
                {transaction.description || "No description provided."}
              </p>
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
                      <span className="stat-value">
                        {transaction.period_title}
                      </span>
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
            {!isSummaryMode && transaction.invoice_id && (
              <button
                className="btn btn-outline-primary btn-sm px-4 me-2"
                onClick={() =>
                  navigate("/admin/invoices", {
                    state: { invoiceId: transaction.invoice_id },
                  })
                }
              >
                <i className="bi bi-receipt me-2"></i> View Invoice
              </button>
            )}
            <button
              className="btn btn-outline-primary btn-sm px-4"
              onClick={handlePrintReceipt}
            >
              <i className="bi bi-printer me-2"></i> Print Receipt
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TransactionDetail;
