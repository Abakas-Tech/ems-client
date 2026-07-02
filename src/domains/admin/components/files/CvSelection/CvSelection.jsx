import React from "react";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import partnerALogo from "../../../../../assets/img/cv/cv-header.png";
import partnerBLogo from "../../../../../assets/img/logo/brand-header.png";

// ─────────────────────────────────────────────────────────────────
// CV Partner Slots — replace logoPlaceholder with real image paths
// ─────────────────────────────────────────────────────────────────
const CV_PARTNER_SLOTS = [
  {
    key: "partner_a",
    logoPlaceholder: partnerALogo, // Replace with actual logo path
  },
  {
    key: "partner_b",
    logoPlaceholder: partnerBLogo, // Replace with actual logo path
  },
];

// ─────────────────────────────────────────────────────────────────
// Helper: download a file by URL
// ─────────────────────────────────────────────────────────────────
const handleDownload = async (file) => {
  if (!file?.url && !file?.file_url) return;

  const url = file.url || file.file_url;
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const localUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = localUrl;
    link.download = file.file_name || "cv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(localUrl);
  } catch {
    window.open(url, "_blank");
  }
};

// ─────────────────────────────────────────────────────────────────
// Partner Card
// ─────────────────────────────────────────────────────────────────
const PartnerCard = ({ slot, cvFile }) => {
  const hasCv = !!(cvFile?.url || cvFile?.file_url);

  return (
    <div
      className="card border-0 h-100"
      style={{
        borderRadius: "16px",
        boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.10)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.06)";
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          height: "4px",
          background: hasCv
            ? "linear-gradient(90deg, #10b981, #34d399)"
            : "linear-gradient(90deg, #f59e0b, #fbbf24)",
          borderRadius: "16px 16px 0 0",
        }}
      />

      <div className="card-body p-4 d-flex flex-column">
        {/* ── Partner Logo Placeholder ── */}
        <div
          className="d-flex align-items-center justify-content-center mb-4"
          style={{
            width: "100%",
            height: "130px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            border: "2px dashed #cbd5e1",
          }}
        >
          <div className="text-center">
            <img
              src={slot.logoPlaceholder}
              alt={slot.label}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="d-flex gap-2 mt-auto">
          <button
            className="btn btn-main flex-grow-1 py-2 rounded-3 fw-semibold text-white"
            style={{ fontSize: "13px" }}
            onClick={() => {
              if (hasCv) {
                const url = cvFile.url || cvFile.file_url;
                window.open(url, "_blank");
              }
            }}
            disabled={!hasCv}
          >
            <i className="bi bi-eye me-2" />
            View CV
          </button>
          <button
            className="btn btn-outline-secondary py-2 rounded-3"
            style={{ fontSize: "13px", minWidth: "44px" }}
            onClick={() => handleDownload(cvFile)}
            disabled={!hasCv}
            title="Download CV"
          >
            <i className="bi bi-download" />
          </button>
        </div>

        {/* ── Status badge ── */}
        <div className="mt-3">
          {hasCv ? (
            <span
              style={{
                fontSize: "11px",
                background: "#d1fae5",
                color: "#065f46",
                padding: "3px 10px",
                borderRadius: "20px",
                fontWeight: 600,
              }}
            >
              <i className="bi bi-check-circle me-1" />
              CV Available
            </span>
          ) : (
            <span
              style={{
                fontSize: "11px",
                background: "#fef3c7",
                color: "#92400e",
                padding: "3px 10px",
                borderRadius: "20px",
                fontWeight: 600,
              }}
            >
              <i className="bi bi-exclamation-circle me-1" />
              CV Not Uploaded
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// MAIN — CvSelection
// ─────────────────────────────────────────────────────────────────
const CvSelection = ({ workerId, worker, cvFile, onBack }) => {
  return (
    <div>
      {/* ── Header ── */}
      <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <BackButton onClick={onBack} />
          <div>
            <h4 className="fw-bold text-dark mb-2">
              {worker?.full_name || "Employee"} — CV
            </h4>
            <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
              Choose which CV format to view or download for this worker.
            </p>
          </div>
        </div>
      </div>

      {/* ── CV Partner Cards ── */}
      <div className="container px-0">
        <div className="row g-4">
          {CV_PARTNER_SLOTS.map((slot) => (
            <div key={slot.key} className="col-xl-6 col-lg-6 col-md-12">
              <PartnerCard slot={slot} cvFile={cvFile} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CvSelection;
