import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getComplaintById } from "../../../api/complaint.api";
import useloader from "../../../../../context/Loader/useLoader";
import BackButton from "./../../../../../shared/components/BackButton/BackButton";
import useResponse from "../../../../../context/Response/useResponse";
import Badge from "../../../../../shared/components/Badge/Badge";

const RESOLUTION_METHOD_LABELS = {
  phone: "Phone",
  email: "Email",
  social_media: "Social Media",
  other: "Other",
};

const SOCIAL_PLATFORM_LABELS = {
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  imo: "Imo",
  facebook: "Facebook",
  instagram: "Instagram",
  other: "Other",
};

const RELIABILITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
  confirmed: "Confirmed",
};

const RELIABILITY_COLOR = {
  low: "gray",
  medium: "yellow",
  high: "blue",
  confirmed: "green",
};

// Same status labels/colors used in ListComplaint, so a complaint's status
// reads identically whether seen in the list or on this detail page.
const STATUS_LABELS = {
  open: "Open",
  investigating: "Investigating",
  resolved: "Resolved",
};
const STATUS_COLOR = {
  open: "yellow",
  investigating: "blue",
  resolved: "green",
};

// Same "unwrap whatever shape the endpoint returns" pattern used in ComplaintForm
const unwrap = (res) => res?.data?.data || res?.data || res;

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Small reusable "label above value" field, used throughout every section below
const Field = ({ label, children, className = "col-md-4" }) => (
  <div className={`mb-3 ${className}`}>
    <label className="d-block text-muted small mb-1">{label}</label>
    <div className="fw-medium">{children}</div>
  </div>
);

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();

  const [complaint, setComplaint] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const handleBack = () => navigate(-1);

  const fetchComplaint = useCallback(async () => {
    showLoader();
    try {
      const res = await getComplaintById(id);
      const data = unwrap(res);
      if (!data) {
        setNotFound(true);
        return;
      }
      setComplaint(data);
    } catch (err) {
      addMessage(false, err.message || "Failed to load complaint");
      setNotFound(true);
    } finally {
      hideLoader();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    fetchComplaint();
  }, [fetchComplaint]);

  if (notFound) {
    return (
      <div className="dashboard-wraper">
        <div className="form-submit">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h2 className="fw-bold text-dark mb-2">Complaint Not Found</h2>
              <p className="text-muted">
                This complaint may have been deleted or the link is invalid.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="dashboard-wraper">
        <div className="form-submit">
          <div className="d-flex justify-content-between align-items-start mb-3"></div>
        </div>
      </div>
    );
  }

  const complainants = Array.isArray(complaint.complainants)
    ? complaint.complainants
    : [];
  const attempts = Array.isArray(complaint.resolution_attempts)
    ? complaint.resolution_attempts
    : [];

  const status = complaint.status || "open";
  // Drives the header gradient / accent color, the same way TransactionDetail's
  // accent follows income-vs-expense: resolved reads as a "good" outcome
  // (green/positive), investigating as attention-needed (amber), open as
  // neutral/new (blue) — matching STATUS_COLOR used across the app.
  const accent =
    status === "resolved"
      ? "income"
      : status === "investigating"
        ? "expense"
        : "neutral";

  const destinationCountry = complaint.destination_country || "—";

  return (
    <div className="complaint-receipt dashboard-wraper">
      <style>{`
        .complaint-receipt {
          --ink: #101828;
          --muted: #667085;
          --border: #e4e7ec;
          --surface: #ffffff;
          --soft: #f9fafb;
          --income: #059669;
          --income-soft: #ecfdf5;
          --expense: #dc2626;
          --expense-soft: #fef2f2;
          --neutral: #2563eb;
          --neutral-soft: #eff6ff;
        }
        .complaint-receipt .receipt-shell {
          background: var(--surface);
          overflow: hidden;
        }
        .complaint-receipt .receipt-topbar {
          padding: 2rem 2.25rem;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1.5rem;
          background: ${
            accent === "income"
              ? "linear-gradient(135deg, #e9fbf0 0%, #ffffff 60%)"
              : accent === "expense"
                ? "linear-gradient(135deg, #fdeeee 0%, #ffffff 60%)"
                : "linear-gradient(135deg, #eaf1fd 0%, #ffffff 60%)"
          };
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .complaint-receipt .receipt-eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--muted);
          margin-bottom: 0.6rem;
        }
        .complaint-receipt .receipt-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--ink);
          margin: 0 0 0.35rem;
          letter-spacing: -0.01em;
        }
        .complaint-receipt .receipt-subtext {
          color: var(--muted);
          font-size: 0.875rem;
          margin: 0;
        }
        .complaint-receipt .receipt-amount-block {
          text-align: right;
        }
        .complaint-receipt .receipt-amount {
          font-size: 2rem;
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
          color: var(--${accent});
          white-space: nowrap;
        }
        .complaint-receipt .receipt-id-tag {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--muted);
          margin-top: 0.5rem;
        }
        .complaint-receipt .receipt-stats-strip {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          background: var(--soft);
        }
        .complaint-receipt .stat-item {
          padding: 1.1rem 1.6rem;
          border-right: 1px solid var(--border);
          min-width: 0;
        }
        .complaint-receipt .stat-item:last-child {
          border-right: none;
        }
        .complaint-receipt .stat-label {
          display: block;
          text-transform: uppercase;
          font-size: 0.66rem;
          letter-spacing: 0.07em;
          font-weight: 700;
          color: var(--muted);
          margin-bottom: 0.35rem;
        }
        .complaint-receipt .stat-value {
          display: block;
          font-size: 0.925rem;
          font-weight: 600;
          color: var(--ink);
          overflow-wrap: break-word;
        }
        .complaint-receipt .receipt-body {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        }
        .complaint-receipt .receipt-body > .receipt-section:first-child {
          border-right: 1px solid var(--border);
        }
        .complaint-receipt .receipt-section {
          padding: 2rem 2.25rem;
        }
        .complaint-receipt .section-title {
          text-transform: uppercase;
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          font-weight: 700;
          color: var(--muted);
          margin: 0 0 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid var(--border);
        }
        .complaint-receipt .detail-grid {
          margin: 0;
          display: grid;
          grid-template-columns: auto 1fr;
          row-gap: 1.1rem;
          column-gap: 1rem;
        }
        .complaint-receipt .detail-grid dt {
          color: var(--muted);
          font-size: 0.85rem;
          font-weight: 500;
          align-self: center;
        }
        .complaint-receipt .detail-grid dd {
          margin: 0;
          text-align: right;
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--ink);
        }
        .complaint-receipt .description-text {
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
        .complaint-receipt .section-strip {
          border-top: 1px solid var(--border);
          background: var(--soft);
          padding: 1.75rem 2.25rem 2rem;
        }
        .complaint-receipt .section-strip:first-of-type {
          border-top: 1px solid var(--border);
        }
        .complaint-receipt .info-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }
        .complaint-receipt .info-card .table {
          margin-bottom: 0;
        }
        .complaint-receipt .info-card .table th {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--muted);
          font-weight: 700;
          border-top: none;
        }
        .complaint-receipt .info-card .table td {
          font-size: 0.88rem;
          vertical-align: middle;
        }
        .complaint-receipt .empty-note {
          font-size: 0.88rem;
          color: var(--muted);
          margin: 0;
          padding: 1rem 1.4rem;
        }
        @media (max-width: 767px) {
          .complaint-receipt .receipt-body {
            grid-template-columns: 1fr;
          }
          .complaint-receipt .receipt-body > .receipt-section:first-child {
            border-right: none;
            border-bottom: 1px solid var(--border);
          }
          .complaint-receipt .receipt-stats-strip {
            grid-template-columns: repeat(2, 1fr);
          }
          .complaint-receipt .stat-item:nth-child(2n) {
            border-right: none;
          }
          .complaint-receipt .receipt-amount-block {
            text-align: left;
          }
          .complaint-receipt .receipt-topbar,
          .complaint-receipt .receipt-section,
          .complaint-receipt .section-strip {
            padding: 1.5rem;
          }
        }
        @media print {
          .complaint-receipt .receipt-body {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          }
          .complaint-receipt .description-text {
            max-height: none;
            overflow: visible;
            padding-right: 0;
          }
        }
      `}</style>

      {/* Page header actions — Edit + Back, matches TransactionDetail's
          d-print-none top action row. */}
      <div className="d-flex justify-content-end align-items-center gap-2 mb-3 d-print-none">
        <BackButton onClick={handleBack} />
      </div>

      <div className="receipt-shell" id="printable-complaint">
        {/* Header */}
        <div className="receipt-topbar">
          <div>
            <div className="d-flex flex-wrap gap-2 mb-3">
              <Badge
                content={(STATUS_LABELS[status] || status).toUpperCase()}
                color={STATUS_COLOR[status] || "gray"}
              />
              {complaint.information_reliability && (
                <Badge
                  content={(
                    RELIABILITY_LABELS[complaint.information_reliability] ||
                    complaint.information_reliability
                  ).toUpperCase()}
                  color={
                    RELIABILITY_COLOR[complaint.information_reliability] ||
                    "gray"
                  }
                />
              )}
            </div>
            <p className="receipt-eyebrow">Complaint Record</p>
            <h2 className="receipt-title">
              {complaint.employee_full_name || "Unnamed Worker"}
            </h2>
            <p className="receipt-subtext">
              {complaint.employer_full_name
                ? `Against ${complaint.employer_full_name} · `
                : ""}
              {destinationCountry !== "—"
                ? `Destination: ${destinationCountry}`
                : "No destination on file"}
            </p>
          </div>

          <div className="receipt-amount-block">
            <p className="receipt-eyebrow" style={{ textAlign: "right" }}>
              Received
            </p>
            <div className="receipt-amount">
              {formatDate(complaint.received_date)}
            </div>
            <div className="receipt-id-tag">Complaint #{complaint.id}</div>
          </div>
        </div>

        {/* Quick facts strip */}
        <div className="receipt-stats-strip">
          <div className="stat-item">
            <span className="stat-label">Destination Country</span>
            <span className="stat-value">{destinationCountry}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Departure Date</span>
            <span className="stat-value">
              {formatDate(complaint.departure_date)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Complainants</span>
            <span className="stat-value">{complainants.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Resolution Attempts</span>
            <span className="stat-value">{attempts.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Last Updated</span>
            <span className="stat-value">
              {formatDateTime(complaint.updated_at)}
            </span>
          </div>
        </div>

        {/* Incident description + core details */}
        <div className="receipt-body">
          <div className="receipt-section">
            <h6 className="section-title">Incident Description</h6>
            <p className="description-text">
              {complaint.incident_description || "No description provided."}
            </p>
          </div>

          <div className="receipt-section">
            <h6 className="section-title">Details</h6>
            <dl className="detail-grid">
              <dt>Status</dt>
              <dd>
                <Badge
                  content={STATUS_LABELS[status] || status}
                  color={STATUS_COLOR[status] || "gray"}
                />
              </dd>

              <dt>Information Source</dt>
              <dd>{complaint.information_source || "—"}</dd>

              <dt>Information Reliability</dt>
              <dd>
                {complaint.information_reliability ? (
                  <Badge
                    content={
                      RELIABILITY_LABELS[complaint.information_reliability] ||
                      complaint.information_reliability
                    }
                    color={
                      RELIABILITY_COLOR[complaint.information_reliability] ||
                      "gray"
                    }
                  />
                ) : (
                  "—"
                )}
              </dd>

              <dt>Created At</dt>
              <dd>{formatDateTime(complaint.created_at)}</dd>

              <dt>Last Updated</dt>
              <dd>{formatDateTime(complaint.updated_at)}</dd>
            </dl>
          </div>
        </div>

        {/* Employer Information */}
        <div className="section-strip">
          <h6 className="section-title" style={{ marginBottom: "1.25rem" }}>
            Employer Information
          </h6>
          <div className="info-card">
            <div className="receipt-stats-strip" style={{ border: "none" }}>
              <div className="stat-item">
                <span className="stat-label">Employer Full Name</span>
                <span className="stat-value">
                  {complaint.employer_full_name || "—"}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Employer Phone Number</span>
                <span className="stat-value">
                  {complaint.employer_phone_number || "—"}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Employer Full Address</span>
                <span className="stat-value">
                  {complaint.employer_full_address || "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Complainant Information */}
        <div className="section-strip">
          <h6 className="section-title" style={{ marginBottom: "1.25rem" }}>
            Complainant Information
          </h6>
          <div className="info-card">
            {complainants.length === 0 ? (
              <p className="empty-note mb-0">No complainants recorded.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-borderless align-middle">
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Relationship</th>
                      <th>Phone Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complainants.map((c, index) => (
                      <tr key={c.id || index}>
                        <td className="fw-semibold">
                          {c.complainant_full_name || c.full_name || "—"}
                        </td>
                        <td>
                          {c.complainant_relationship || c.relationship || "—"}
                        </td>
                        <td>
                          {c.complainant_phone_number || c.phone_number || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Resolution Information */}
        <div className="section-strip">
          <h6 className="section-title" style={{ marginBottom: "1.25rem" }}>
            Resolution Information
          </h6>
          <div className="info-card mb-3">
            {attempts.length === 0 ? (
              <p className="empty-note mb-0">
                No resolution attempts recorded.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table table-borderless align-middle">
                  <thead>
                    <tr>
                      <th>Method</th>
                      <th>Platform</th>
                      <th>Notes</th>
                      <th>Logged At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((a, index) => (
                      <tr key={a.id || index}>
                        <td className="fw-semibold">
                          {RESOLUTION_METHOD_LABELS[a.method] ||
                            a.method ||
                            "—"}
                        </td>
                        <td>
                          {a.method === "social_media"
                            ? SOCIAL_PLATFORM_LABELS[a.social_platform] ||
                              a.social_platform ||
                              "—"
                            : "—"}
                        </td>
                        <td>{a.notes || "—"}</td>
                        <td>{formatDateTime(a.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="info-card">
            <div style={{ padding: "1.1rem 1.6rem" }}>
              <span className="stat-label d-block mb-2">Complaint Outcome</span>
              <p className="description-text mb-0">
                {complaint.complaint_outcome || (
                  <span className="text-muted fw-normal">
                    No outcome recorded yet.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
