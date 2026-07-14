import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getComplaintById } from "../../../api/complaint.api";
import useloader from "../../../../../context/Loader/useLoader";
import BackButton from "./../../../../../shared/components/BackButton/BackButton";
import useResponse from "../../../../../context/Response/useResponse";

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



const reliabilityBadgeClass = (level) => {
  switch (level) {
    case "confirmed":
      return "badge bg-success";
    case "high":
      return "badge bg-primary";
    case "medium":
      return "badge bg-warning text-dark";
    case "low":
      return "badge bg-secondary";
    default:
      return "badge bg-secondary";
  }
};

// Small reusable "label above value" field, used throughout every card below
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

  const handleEdit = () => {
    navigate(`/complaints/${id}/edit`, {
      state: { isEditMode: true, complaintData: complaint },
    });
  };

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
            <BackButton onClick={handleBack} />
          </div>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="dashboard-wraper">
        <div className="form-submit">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <BackButton onClick={handleBack} />
          </div>
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

  return (
    <div className="dashboard-wraper">
      <div className="form-submit">
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-2">
              Complaint 
            </h2>
            <p className="text-muted mb-0">
              Full details of this complaint, complainants, and resolution
              history.
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-main"
              onClick={handleEdit}
            >
              Edit
            </button>
            <BackButton onClick={handleBack} />
          </div>
        </div>

        {/* Complaint Intake */}
        <div className="card  mb-3">
          <div className="card-header bg-white">
            <h6 className="fw-bold mb-0">Complaint Intake</h6>
          </div>
          <div className="card-body">
            <div className="row">
              <Field label="Date Received" className="col-md-4">
                {formatDate(complaint.received_date)}
              </Field>
              <Field label="Created At" className="col-md-4">
                {formatDateTime(complaint.created_at)}
              </Field>
              <Field label="Last Updated" className="col-md-4">
                {formatDateTime(complaint.updated_at)}
              </Field>
            </div>
          </div>
        </div>

        {/* Employee Information */}
        <div className="card  mb-3">
          <div className="card-header bg-white">
            <h6 className="fw-bold mb-0">Worker Information</h6>
          </div>
          <div className="card-body">
            <div className="row">
              <Field label="Employee Full Name" className="col-md-3">
                {complaint.employee_full_name || "—"}
              </Field>
         
              <Field label="Departure Date" className="col-md-3">
                {formatDate(complaint.departure_date)}
              </Field>
              <Field label="Destination Country" className="col-md-3">
                {complaint.destination_country_name ||
                  complaint.destination_country?.name ||
                  (complaint.destination_country_id
                    ? `#${complaint.destination_country_id}`
                    : "—")}
              </Field>
            </div>
          </div>
        </div>

        {/* Complaint Information */}
        <div className="card  mb-3">
          <div className="card-header bg-white ">
            <h6 className="fw-bold mb-0">Complaint Information</h6>
          </div>
          <div className="card-body">
            <div className="row">
              <Field
                label="Detailed Description of the Incident"
                className="col-md-12"
              >
                <div style={{ whiteSpace: "pre-wrap" }}>
                  {complaint.incident_description || "—"}
                </div>
              </Field>
              <Field label="Information Source" className="col-md-6">
                {complaint.information_source || "—"}
              </Field>
              <Field label="Information Reliability" className="col-md-6">
                {complaint.information_reliability ? (
                  <span
                    className={reliabilityBadgeClass(
                      complaint.information_reliability,
                    )}
                  >
                    {RELIABILITY_LABELS[complaint.information_reliability] ||
                      complaint.information_reliability}
                  </span>
                ) : (
                  "—"
                )}
              </Field>
            </div>
          </div>
        </div>

        {/* Complainant Information */}
        <div className="card mb-3">
          <div className="card-header bg-white">
            <h6 className="fw-bold mb-0">Complainant Information</h6>
          </div>
          <div className="card-body">
            {complainants.length === 0 ? (
              <p className="text-muted mb-0">No complainants recorded.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Full Name</th>
                      <th>Relationship</th>
                      <th>Phone Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complainants.map((c, index) => (
                      <tr key={c.id || index}>
                        <td>{c.complainant_full_name || c.full_name || "—"}</td>
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

        {/* Employer Information */}
        <div className="card mb-3">
          <div className="card-header bg-white ">
            <h6 className="fw-bold mb-0">Employer Information</h6>
          </div>
          <div className="card-body">
            <div className="row">
              <Field label="Employer Full Name" className="col-md-4">
                {complaint.employer_full_name || "—"}
              </Field>
              <Field label="Employer Phone Number" className="col-md-4">
                {complaint.employer_phone_number || "—"}
              </Field>
              <Field label="Employer Full Address" className="col-md-4">
                {complaint.employer_full_address || "—"}
              </Field>
            </div>
          </div>
        </div>

        {/* Resolution Information */}
        <div className="card  mb-3">
          <div className="card-header bg-white ">
            <h6 className="fw-bold mb-0">Resolution Information</h6>
          </div>
          <div className="card-body">
            {attempts.length === 0 ? (
              <p className="text-muted mb-0">
                No resolution attempts recorded.
              </p>
            ) : (
              <div className="table-responsive mb-3">
                <table className="table table-bordered align-middle mb-0">
                  <thead className="table-light">
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
                        <td>
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

            <hr className="my-3" />

            <Field label="Complaint Outcome" className="col-md-12">
              <div style={{ whiteSpace: "pre-wrap" }}>
                {complaint.complaint_outcome || (
                  <span className="text-muted fw-normal">
                    No outcome recorded yet.
                  </span>
                )}
              </div>
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
