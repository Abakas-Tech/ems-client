import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaFilePdf, FaImage } from "react-icons/fa";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import { getWorkerProfile } from "../../../api/worker.api";

const WorkerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorker();
  }, [id]);

  const fetchWorker = async () => {
    try {
      const response = await getWorkerProfile(id);
      setWorker(response.data);
    } catch (error) {
      console.error("Failed to load worker:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => navigate(-1);

  if (loading) return <div className="dashboard-wraper">Loading...</div>;
  if (!worker) return <div className="dashboard-wraper">No worker found</div>;

  // ────────────────────────────────────────────────
  //  Extract & prepare data with safe defaults
  // ────────────────────────────────────────────────
  const personal = worker.personal_information || {};
  const passport = worker.passport || {};
  const coc = worker.coc || {};
  const medical = worker.medical || {};
  const emergency = worker.emergency || {};
  const visa = worker.visa || {};
  const lmis = worker.lmis || {};

  const fullName = worker.full_name || "—";
  const phone = worker.phone_number || "—";
  const email = worker.email || "—";
  const statusName = worker.status?.name || "—";

  const photoUrl =
    personal.photo_3x4?.url || "https://via.placeholder.com/150?text=No+Photo";

  const badgeClass =
    statusName === "Registered"
      ? "badge bg-success px-3 py-2 fs-6"
      : "badge bg-secondary px-3 py-2 fs-6";

  // ────────────────────────────────────────────────
  //  Render helper – Document link (PDF or image)
  // ────────────────────────────────────────────────
  const DocumentLink = ({ url, label, isImage = false }) => {
    if (!url) return <span className="text-muted">Not available</span>;

    const Icon = isImage ? FaImage : FaFilePdf;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary text-decoration-none d-flex align-items-center gap-2"
      >
        <Icon /> {label || "View Document"}
      </a>
    );
  };

  return (
    <div className="dashboard-wraper">
      <BackButton onClick={goBack} />

      {/* Header – Photo + Name + Phone + Passport + Status */}
      <div className="card-body">
        <div className="row align-items-center">
          <div className="col-md-2 text-center mb-3 mb-md-0">
            <img
              src={photoUrl}
              alt="Worker"
              className="worker-photo img-fluid rounded-circle"
              style={{ width: "140px", height: "140px", objectFit: "cover" }}
            />
          </div>

          <div className="col-md-10">
            <div className="d-flex justify-content-between align-items-center flex-wrap">
              <div>
                <h4 className="mb-1 fw-bold">{fullName}</h4>
                <p className="mb-1 text-muted">
                  <strong>Phone:</strong> {phone}
                </p>
                <p className="mb-1 text-muted">
                  <strong>Passport No:</strong>{" "}
                  {passport.passport_number || "—"}
                </p>
              </div>
              <div className="mt-2 mt-md-0">
                <span className={badgeClass}>{statusName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="container mt-4">
        <div className="row g-4">
          {/* ─── Personal Information ─── */}
          <div className="col-12 col-md-12 ">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header d-flex justify-content-between align-items-center fw-bold">
                <span>Personal Information</span>
                <div>
                  <button className="btn btn-sm btn-outline-primary me-2">
                    <FaEdit />
                  </button>
                  <button className="btn btn-sm btn-outline-danger">
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="card-body">
                <p>
                  <small className="text-muted">Full Name</small>
                  <br />
                  {fullName}
                </p>
                <p>
                  <small className="text-muted">Sex</small>
                  <br />
                  {personal.sex || "—"}
                </p>
                <p>
                  <small className="text-muted">Date of Birth</small>
                  <br />
                  {personal.date_of_birth || "—"}
                </p>
                <p>
                  <small className="text-muted">Marital Status</small>
                  <br />
                  {personal.marital_status || "—"}
                </p>
                <p>
                  <small className="text-muted">Nationality</small>
                  <br />
                  {personal.nationality || "—"}
                </p>
                <p>
                  <small className="text-muted">Education</small>
                  <br />
                  {personal.education || "—"}
                </p>
                <p>
                  <small className="text-muted">Children</small>
                  <br />
                  {personal.number_of_children ?? "—"}
                </p>
                <p>
                  <small className="text-muted">Region / City</small>
                  <br />
                  {personal.region?.name || "—"}{" "}
                  {personal.city?.name ? `/ ${personal.city.name}` : ""}
                </p>
                <p>
                  <small className="text-muted">Height / Weight</small>
                  <br />
                  {personal.height_cm ? `${personal.height_cm} cm` : "—"} /{" "}
                  {personal.weight_kg ? `${personal.weight_kg} kg` : "—"}
                </p>
                {personal.photo_standing?.url && (
                  <p>
                    <small className="text-muted">Standing Photo</small>
                    <br />
                    <DocumentLink
                      url={personal.photo_standing.url}
                      label="View Standing Photo"
                      isImage
                    />
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ─── Passport ─── */}
          <div className="col-12 col-md-6 ">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header d-flex justify-content-between align-items-center fw-bold">
                <span>Passport Information</span>
                <div>
                  <button className="btn btn-sm btn-outline-primary me-2">
                    <FaEdit />
                  </button>
                  <button className="btn btn-sm btn-outline-danger">
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="card-body">
                <p>
                  <small className="text-muted">Passport Number</small>
                  <br />
                  {passport.passport_number || "—"}
                </p>
                <p>
                  <small className="text-muted">Issuing Country</small>
                  <br />
                  {passport.issuing_country || "—"}
                </p>
                <p>
                  <small className="text-muted">Issue Date</small>
                  <br />
                  {passport.issue_date || "—"}
                </p>
                <p>
                  <small className="text-muted">Expiry Date</small>
                  <br />
                  {passport.expiry_date || "—"}
                </p>
                {passport.scan?.url && (
                  <p>
                    <small className="text-muted">Passport Scan</small>
                    <br />
                    <DocumentLink
                      url={passport.scan.url}
                      label="Open Passport (PDF)"
                    />
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ─── COC ─── */}
          <div className="col-12 col-md-6">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header d-flex justify-content-between align-items-center fw-bold">
                <span>COC Information</span>
                <div>
                  <button className="btn btn-sm btn-outline-primary me-2">
                    <FaEdit />
                  </button>
                  <button className="btn btn-sm btn-outline-danger">
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="card-body">
                <p>
                  <small className="text-muted">COC Number</small>
                  <br />
                  {coc.coc_number || "—"}
                </p>
                <p>
                  <small className="text-muted">Assessment Center</small>
                  <br />
                  {coc.assessment_center || "—"}
                </p>
                <p>
                  <small className="text-muted">Assessment Date</small>
                  <br />
                  {coc.assessment_date || "—"}
                </p>
                <p>
                  <small className="text-muted">Issue Date</small>
                  <br />
                  {coc.issue_date || "—"}
                </p>
                <p>
                  <small className="text-muted">Expiry Date</small>
                  <br />
                  {coc.expiry_date || "—"}
                </p>
                {coc.document?.url && (
                  <p>
                    <small className="text-muted">COC Document</small>
                    <br />
                    <DocumentLink
                      url={coc.document.url}
                      label="View COC Document"
                    />
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ─── Medical ─── */}
          <div className="col-12 col-md-6 ">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header d-flex justify-content-between align-items-center fw-bold">
                <span>Medical Information</span>
                <div>
                  <button className="btn btn-sm btn-outline-primary me-2">
                    <FaEdit />
                  </button>
                  <button className="btn btn-sm btn-outline-danger">
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="card-body">
                <p>
                  <small className="text-muted">Medical Center</small>
                  <br />
                  {medical.medical_center || "—"}
                </p>
                <p>
                  <small className="text-muted">Report Number</small>
                  <br />
                  {medical.medical_report_number || "—"}
                </p>
                <p>
                  <small className="text-muted">Issue Date</small>
                  <br />
                  {medical.issue_date || "—"}
                </p>
                <p>
                  <small className="text-muted">Expiry Date</small>
                  <br />
                  {medical.expiry_date || "—"}
                </p>
                <p>
                  <small className="text-muted">Result</small>
                  <br />
                  {medical.medical_status ? (
                    <span
                      className={`badge ${medical.medical_status === "fit" ? "bg-success" : "bg-danger"}`}
                    >
                      {medical.medical_status.toUpperCase()}
                    </span>
                  ) : (
                    "—"
                  )}
                </p>
                {medical.file?.url && (
                  <p>
                    <small className="text-muted">Medical File</small>
                    <br />
                    <DocumentLink
                      url={medical.file.url}
                      label="View Medical Report"
                    />
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ─── Emergency / Guarantor ─── */}
          <div className="col-12 col-md-6 ">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header d-flex justify-content-between align-items-center fw-bold">
                <span>Emergency / Guarantor</span>
                <div>
                  <button className="btn btn-sm btn-outline-primary me-2">
                    <FaEdit />
                  </button>
                  <button className="btn btn-sm btn-outline-danger">
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="card-body">
                <p>
                  <small className="text-muted">Relation</small>
                  <br />
                  {emergency.relation || "—"}
                </p>
                <p>
                  <small className="text-muted">Name</small>
                  <br />
                  {emergency.guarantor_name || "—"}
                </p>
                <p>
                  <small className="text-muted">Phone</small>
                  <br />
                  {emergency.guarantor_phone_number || "—"}
                </p>
                <p>
                  <small className="text-muted">Address</small>
                  <br />
                  {emergency.guarantor_address || "—"}
                </p>
                {emergency.id_scan?.url && (
                  <p>
                    <small className="text-muted">ID Scan</small>
                    <br />
                    <DocumentLink
                      url={emergency.id_scan.url}
                      label="View Guarantor ID"
                    />
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ─── Visa ─── */}
          <div className="col-12 col-md-6">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header d-flex justify-content-between align-items-center fw-bold">
                <span>Visa Information</span>
                <div>
                  <button className="btn btn-sm btn-outline-primary me-2">
                    <FaEdit />
                  </button>
                  <button className="btn btn-sm btn-outline-danger">
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="card-body">
                <p>
                  <small className="text-muted">Visa Number</small>
                  <br />
                  {visa.visa_number || "—"}
                </p>
                <p>
                  <small className="text-muted">Issue Date</small>
                  <br />
                  {visa.issue_date || "—"}
                </p>
                <p>
                  <small className="text-muted">Expiry Date</small>
                  <br />
                  {visa.expiry_date || "—"}
                </p>
                {visa.document?.url && (
                  <p>
                    <small className="text-muted">Visa Document</small>
                    <br />
                    <DocumentLink url={visa.document.url} label="View Visa" />
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ─── LMIS ─── */}
          <div className="col-12 col-md-6">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header d-flex justify-content-between align-items-center fw-bold">
                <span>LMIS Information</span>
                <div>
                  <button className="btn btn-sm btn-outline-primary me-2">
                    <FaEdit />
                  </button>
                  <button className="btn btn-sm btn-outline-danger">
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="card-body">
                <p>
                  <small className="text-muted">Labour ID</small>
                  <br />
                  {lmis.labour_id || "—"}
                </p>
                <p>
                  <small className="text-muted">Approval Date</small>
                  <br />
                  {lmis.approval_date || "—"}
                </p>
                {lmis.qr_code?.url && (
                  <p>
                    <small className="text-muted">LMIS QR Code</small>
                    <br />
                    <DocumentLink
                      url={lmis.qr_code.url}
                      label="View QR Code"
                      isImage
                    />
                    {/* Optional: show image inline */}
                    {/* <img src={lmis.qr_code.url} alt="LMIS QR" style={{maxWidth:"140px", marginTop:"8px"}} /> */}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ─── Travel Records ─── (one card per travel record) */}
          {worker.travel_records?.length > 0 ? (
            worker.travel_records.map((travel, index) => (
              <div key={`travel-${index}`} className="col-12 col-md-6">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-header d-flex justify-content-between align-items-center fw-bold">
                    <span>
                      Travel Record {index + 1}
                      {travel.ticket_number && ` – #${travel.ticket_number}`}
                    </span>
                    <div>
                      <button className="btn btn-sm btn-outline-primary me-2">
                        <FaEdit />
                      </button>
                      <button className="btn btn-sm btn-outline-danger">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    <p>
                      <small className="text-muted">Departure Date</small>
                      <br />
                      {travel.departure_date || "—"} (
                      {travel.departure_location || "—"})
                    </p>
                    <p>
                      <small className="text-muted">Arrival Date</small>
                      <br />
                      {travel.arrival_date || "—"} (
                      {travel.arrival_location || "—"})
                    </p>
                    <p>
                      <small className="text-muted">Agent Name</small>
                      <br />
                      {travel.agent_name || "—"}
                    </p>
                    <p>
                      <small className="text-muted">Agent Phone</small>
                      <br />
                      {travel.agent_phone_number || "—"}
                    </p>
                    <p>
                      <small className="text-muted">Ticket File</small>
                      <br />
                      {travel.ticket_file?.url ? (
                        <DocumentLink
                          url={travel.ticket_file.url}
                          label="View Ticket Document"
                          isImage={travel.ticket_file.resource_type === "image"}
                        />
                      ) : (
                        "—"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 col-md-6">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-header d-flex justify-content-between align-items-center fw-bold">
                  <span>Travel Records</span>
                  <div>
                    <button className="btn btn-sm btn-outline-primary me-2">
                      <FaEdit />
                    </button>
                    <button className="btn btn-sm btn-outline-danger">
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <p className="text-muted">No travel records available.</p>
                </div>
              </div>
            </div>
          )}

          {/* ─── Contracts ─── (one card per contract) */}
          {worker.contracts?.length > 0 ? (
            worker.contracts.map((contract, index) => (
              <div key={`contract-${index}`} className="col-12 col-md-6">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-header d-flex justify-content-between align-items-center fw-bold">
                    <span>
                      Contract {index + 1}
                      {contract.status && ` – ${contract.status.toUpperCase()}`}
                    </span>
                    <div>
                      <button className="btn btn-sm btn-outline-primary me-2">
                        <FaEdit />
                      </button>
                      <button className="btn btn-sm btn-outline-danger">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    <p>
                      <small className="text-muted">Monthly Salary</small>
                      <br />
                      {contract.monthly_salary
                        ? `${contract.monthly_salary} ETB`
                        : "—"}
                    </p>
                    <p>
                      <small className="text-muted">Employer ID</small>
                      <br />
                      {contract.employer_id || "—"}
                    </p>
                    <p>
                      <small className="text-muted">Partner ID</small>
                      <br />
                      {contract.partner_id || "—"}
                    </p>
                    <p>
                      <small className="text-muted">Start Date</small>
                      <br />
                      {contract.contract_start_date || "—"}
                    </p>
                    <p>
                      <small className="text-muted">End Date</small>
                      <br />
                      {contract.contract_end_date || "—"}
                    </p>
                    <p>
                      <small className="text-muted">Contract Document</small>
                      <br />
                      {contract.contract_upload?.url ? (
                        <DocumentLink
                          url={contract.contract_upload.url}
                          label="View Contract"
                          isImage={
                            contract.contract_upload.resource_type === "image"
                          }
                        />
                      ) : (
                        "—"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-header d-flex justify-content-between align-items-center fw-bold">
                  <span>Contracts</span>
                  <div>
                    <button className="btn btn-sm btn-outline-primary me-2">
                      <FaEdit />
                    </button>
                    <button className="btn btn-sm btn-outline-danger">
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <p className="text-muted">No contracts available.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;