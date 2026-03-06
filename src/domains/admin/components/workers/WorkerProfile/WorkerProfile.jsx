import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaFilePdf, FaImage } from "react-icons/fa";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import { getWorkerProfile } from "../../../api/worker.api";
import useloader from "../../../../../context/Loader/useLoader";
import ActionButtons from "../../../../../shared/components/ActionButtons/ActionButtons";
import useResponse from "../../../../../context/Response/useResponse";
import Badge from "../../../../../shared/components/Badge/Badge";

// Helpers
const fallback = (value) => value ?? "—";

const niceDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

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

const CARD_ACTIONS = [
  {
    type: "edit",
    onClick: (row) => console.log("Edit", row),
  },
  {
    type: "delete",
    onClick: (row) => console.log("Delete", row),
  },
];

const WorkerProfile = () => {
  const { addMessage } = useResponse();
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [error, setError] = useState(null);
  const { showLoader, hideLoader } = useloader();

  const fetchWorker = async () => {
    try {
      showLoader();
      setError(null);
      const response = await getWorkerProfile(id);
      setWorker(response.data);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchWorker();
  }, [id]);

  const goBack = () => navigate(-1);

  if (error) {
    return (
      <div className="dashboard-wraper text-danger text-center py-5">
        {error}
        <button className="btn btn-primary mt-3" onClick={fetchWorker}>
          Retry
        </button>
      </div>
    );
  }

  // Extracted fields for easier access
  const personal = worker?.personal_information || null;
  const passport = worker?.passport || null;
  const coc = worker?.coc || null;
  const medical = worker?.medical || null;
  const emergency = worker?.emergency || null;
  const visa = worker?.visa || null;
  const lmis = worker?.lmis || null;
  const travelRecords = worker?.travel_records || [];
  const contracts = worker?.contracts || [];

  // Header fields
  const fullName = fallback(worker?.full_name);
  const phone = fallback(worker?.phone_number);
  const statusName = fallback(worker?.status?.name);
  const photoUrl =
    personal?.photo_3x4?.url || "https://via.placeholder.com/150?text=No+Photo";
  const badgeClass =
    statusName === "Registered"
      ? "badge bg-success px-3 py-2 fs-6"
      : "badge bg-secondary px-3 py-2 fs-6";

  // Personal
  const personalSex = fallback(personal?.sex);
  const personalDob = niceDate(personal?.date_of_birth);
  const personalMaritalStatus = fallback(personal?.marital_status);
  const personalNationality = fallback(personal?.nationality);
  const personalEducation = fallback(personal?.education);
  const personalChildren = fallback(personal?.number_of_children);
  const personalRegionCity =
    `${fallback(personal?.region?.name)}${personal?.city?.name ? ` / ${personal.city.name}` : ""}`.trim() ||
    "—";
  const personalHeightWeight = `${personal?.height_cm ? `${personal.height_cm} cm` : "—"} / ${personal?.weight_kg ? `${personal.weight_kg} kg` : "—"}`;
  const personalStandingPhotoUrl = personal?.photo_standing?.url;

  // Passport
  const passportNumber = fallback(passport?.passport_number);
  const passportIssuingCountry = fallback(passport?.issuing_country);
  const passportIssueDate = niceDate(passport?.issue_date);
  const passportExpiryDate = niceDate(passport?.expiry_date);
  const passportScanUrl = passport?.scan?.url;

  // COC
  const cocNumber = fallback(coc?.coc_number);
  const cocAssessmentCenter = fallback(coc?.assessment_center);
  const cocAssessmentDate = niceDate(coc?.assessment_date);
  const cocIssueDate = niceDate(coc?.issue_date);
  const cocExpiryDate = niceDate(coc?.expiry_date);
  const cocDocumentUrl = coc?.document?.url;

  // Emergency
  const emergencyRelation = fallback(emergency?.relation);
  const emergencyGuarantorName = fallback(emergency?.guarantor_name);
  const emergencyGuarantorPhone = fallback(emergency?.guarantor_phone_number);
  const emergencyGuarantorAddress = fallback(emergency?.guarantor_address);
  const emergencyIdScanUrl = emergency?.id_scan?.url;

  // Medical
  const medicalCenter = fallback(medical?.medical_center);
  const medicalReportNumber = fallback(medical?.medical_report_number);
  const medicalIssueDate = niceDate(medical?.issue_date);
  const medicalExpiryDate = niceDate(medical?.expiry_date);
  const medicalStatus = medical?.medical_status?.toLowerCase() || null;
  const medicalStatusBadge =
    medicalStatus === "fit"
      ? "badge bg-success"
      : medicalStatus
        ? "badge bg-danger"
        : "badge bg-secondary";
  const medicalStatusText = medicalStatus ? medicalStatus.toUpperCase() : "—";
  const medicalFileUrl = medical?.file?.url;

  // Visa
  const visaNumber = fallback(visa?.visa_number);
  const visaIssueDate = niceDate(visa?.issue_date);
  const visaExpiryDate = niceDate(visa?.expiry_date);
  const visaDocumentUrl = visa?.document?.url;

  // LMIS
  const lmisLabourId = fallback(lmis?.labour_id);
  const lmisApprovalDate = niceDate(lmis?.approval_date);
  const lmisQrCodeUrl = lmis?.qr_code?.url;

  // Travel Records
  const preparedTravel = travelRecords.map((rec, idx) => ({
    key: `travel-${idx}`,
    titleSuffix: rec.ticket_number ? ` – #${rec.ticket_number}` : "",
    departureDate: niceDate(rec.departure_date),
    departureLocation: fallback(rec.departure_location),
    arrivalDate: niceDate(rec.arrival_date),
    arrivalLocation: fallback(rec.arrival_location),
    destination: fallback(rec.destination || rec.arrival_location),
    agentName: fallback(rec.agent_name),
    agentPhone: fallback(rec.agent_phone_number),
    ticketFileUrl: rec.ticket_file?.url,
    isImage: rec.ticket_file?.resource_type === "image",
  }));

  // Contracts
  const preparedContracts = contracts.map((con, idx) => ({
    key: `contract-${idx}`,
    number: fallback(con.contract_number),
    startDate: niceDate(con.contract_start_date || con.start_date),
    endDate: niceDate(con.contract_end_date || con.end_date),
    status: fallback(con.status),
    statusBadge:
      con.status === "active"
        ? "bg-success"
        : con.status === "pending"
          ? "bg-warning"
          : "bg-secondary",
    monthlySalary:
      con.monthly_salary != null ? `${con.monthly_salary} SAR` : "—",
    partnerId: fallback(con.partner_id),
    employerId: fallback(con.employer_id),
    fileUrl: con.contract_upload?.url || con.file?.url,
    isImage:
      (con.contract_upload?.resource_type || con.file?.resource_type) ===
      "image",
  }));

  return (
    <div className="dashboard-wraper">
      <BackButton onClick={goBack} />

      {/* Header */}
      <div className="card-body">
        <div className="row align-items-center">
          <div className="col-md-2 text-center mb-3 mb-md-0">
            <img
              src={photoUrl}
              alt={`${fullName}'s photo`}
              className="worker-photo img-fluid rounded-circle"
              // style={{ width: "140px", height: "140px", objectFit: "cover" }}
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/150?text=Photo+Error";
                e.target.alt = "Photo failed to load";
              }}
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
                  <strong>Passport No:</strong> {passportNumber}
                </p>
                <Badge content={statusName} color="green" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="container mt-4">
        <div className="row g-4">
          {/* Personal Information */}
          <div className="col-12">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header d-flex justify-content-between align-items-center fw-bold">
                <span>Personal Information</span>
                <ActionButtons actions={CARD_ACTIONS} row={personal} />
              </div>
              <div className="card-body">
                {personal ? (
                  <>
                    <p>
                      <small className="text-muted">Full Name</small>
                      <br />
                      {fullName}
                    </p>
                    <p>
                      <small className="text-muted">Sex</small>
                      <br />
                      {personalSex}
                    </p>
                    <p>
                      <small className="text-muted">Date of Birth</small>
                      <br />
                      {personalDob}
                    </p>
                    <p>
                      <small className="text-muted">Marital Status</small>
                      <br />
                      {personalMaritalStatus}
                    </p>
                    <p>
                      <small className="text-muted">Nationality</small>
                      <br />
                      {personalNationality}
                    </p>
                    <p>
                      <small className="text-muted">Education</small>
                      <br />
                      {personalEducation}
                    </p>
                    <p>
                      <small className="text-muted">Children</small>
                      <br />
                      {personalChildren}
                    </p>
                    <p>
                      <small className="text-muted">Region / City</small>
                      <br />
                      {personalRegionCity}
                    </p>
                    <p>
                      <small className="text-muted">Height / Weight</small>
                      <br />
                      {personalHeightWeight}
                    </p>
                    {personalStandingPhotoUrl && (
                      <p>
                        <small className="text-muted">Standing Photo</small>
                        <br />
                        <DocumentLink
                          url={personalStandingPhotoUrl}
                          label="View Standing Photo"
                          isImage
                        />
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-muted">No personal data available.</p>
                )}
              </div>
            </div>
          </div>

          {/* Passport */}
          <div className="col-12 col-md-6">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header d-flex justify-content-between align-items-center fw-bold">
                <span>Passport Information</span>
                <ActionButtons actions={CARD_ACTIONS} row={personal} />
              </div>
              <div className="card-body">
                {passport ? (
                  <>
                    <p>
                      <small className="text-muted">Passport Number</small>
                      <br />
                      {passportNumber}
                    </p>
                    <p>
                      <small className="text-muted">Issuing Country</small>
                      <br />
                      {passportIssuingCountry}
                    </p>
                    <p>
                      <small className="text-muted">Issue Date</small>
                      <br />
                      {passportIssueDate}
                    </p>
                    <p>
                      <small className="text-muted">Expiry Date</small>
                      <br />
                      {passportExpiryDate}
                    </p>
                    {passportScanUrl && (
                      <p>
                        <small className="text-muted">Passport Scan</small>
                        <br />
                        <DocumentLink
                          url={passportScanUrl}
                          label="Open Passport (PDF)"
                        />
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-muted">No passport data available.</p>
                )}
              </div>
            </div>
          </div>

          {/* COC */}
          <div className="col-12 col-md-6">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header d-flex justify-content-between align-items-center fw-bold">
                <span>COC Information</span>
                <ActionButtons actions={CARD_ACTIONS} row={personal} />
              </div>
              <div className="card-body">
                {coc ? (
                  <>
                    <p>
                      <small className="text-muted">COC Number</small>
                      <br />
                      {cocNumber}
                    </p>
                    <p>
                      <small className="text-muted">Assessment Center</small>
                      <br />
                      {cocAssessmentCenter}
                    </p>
                    <p>
                      <small className="text-muted">Assessment Date</small>
                      <br />
                      {cocAssessmentDate}
                    </p>
                    <p>
                      <small className="text-muted">Issue Date</small>
                      <br />
                      {cocIssueDate}
                    </p>
                    <p>
                      <small className="text-muted">Expiry Date</small>
                      <br />
                      {cocExpiryDate}
                    </p>
                    {cocDocumentUrl && (
                      <p>
                        <small className="text-muted">COC Document</small>
                        <br />
                        <DocumentLink
                          url={cocDocumentUrl}
                          label="View COC Document"
                        />
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-muted">No COC data available.</p>
                )}
              </div>
            </div>
          </div>

          {/* Emergency / Guarantor */}
          <div className="col-12 col-md-6">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header d-flex justify-content-between align-items-center fw-bold">
                <span>Emergency Contact</span>
                <ActionButtons actions={CARD_ACTIONS} row={personal} />
              </div>
              <div className="card-body">
                {emergency ? (
                  <>
                    <p>
                      <small className="text-muted">Relation</small>
                      <br />
                      {emergencyRelation}
                    </p>
                    <p>
                      <small className="text-muted">Name</small>
                      <br />
                      {emergencyGuarantorName}
                    </p>
                    <p>
                      <small className="text-muted">Phone</small>
                      <br />
                      {emergencyGuarantorPhone}
                    </p>
                    <p>
                      <small className="text-muted">Address</small>
                      <br />
                      {emergencyGuarantorAddress}
                    </p>
                    {emergencyIdScanUrl && (
                      <p>
                        <small className="text-muted">ID Scan</small>
                        <br />
                        <DocumentLink
                          url={emergencyIdScanUrl}
                          label="View Guarantor ID"
                        />
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-muted">
                    No emergency / guarantor data available.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Medical */}
          <div className="col-12 col-md-6">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header d-flex justify-content-between align-items-center fw-bold">
                <span>Medical Information</span>
                <ActionButtons actions={CARD_ACTIONS} row={personal} />
              </div>
              <div className="card-body">
                {medical ? (
                  <>
                    <p>
                      <small className="text-muted">Medical Center</small>
                      <br />
                      {medicalCenter}
                    </p>
                    <p>
                      <small className="text-muted">Report Number</small>
                      <br />
                      {medicalReportNumber}
                    </p>
                    <p>
                      <small className="text-muted">Issue Date</small>
                      <br />
                      {medicalIssueDate}
                    </p>
                    <p>
                      <small className="text-muted">Expiry Date</small>
                      <br />
                      {medicalExpiryDate}
                    </p>
                    <p>
                      <small className="text-muted">Result</small>
                      <br />
                      <span className={medicalStatusBadge}>
                        {medicalStatusText}
                      </span>
                    </p>
                    {medicalFileUrl && (
                      <p>
                        <small className="text-muted">Medical File</small>
                        <br />
                        <DocumentLink
                          url={medicalFileUrl}
                          label="View Medical Report"
                        />
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-muted">No medical data available.</p>
                )}
              </div>
            </div>
          </div>

          {/* Visa */}
          <div className="col-12 col-md-6">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header d-flex justify-content-between align-items-center fw-bold">
                <span>Visa Information</span>
                <ActionButtons actions={CARD_ACTIONS} row={personal} />
              </div>
              <div className="card-body">
                {visa ? (
                  <>
                    <p>
                      <small className="text-muted">Visa Number</small>
                      <br />
                      {visaNumber}
                    </p>
                    <p>
                      <small className="text-muted">Issue Date</small>
                      <br />
                      {visaIssueDate}
                    </p>
                    <p>
                      <small className="text-muted">Expiry Date</small>
                      <br />
                      {visaExpiryDate}
                    </p>
                    {visaDocumentUrl && (
                      <p>
                        <small className="text-muted">Visa Document</small>
                        <br />
                        <DocumentLink url={visaDocumentUrl} label="View Visa" />
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-muted">No visa data available.</p>
                )}
              </div>
            </div>
          </div>

          {/* LMIS */}
          <div className="col-12 col-md-6">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header d-flex justify-content-between align-items-center fw-bold">
                <span>LMIS Information</span>
                <ActionButtons actions={CARD_ACTIONS} row={personal} />
              </div>
              <div className="card-body">
                {lmis ? (
                  <>
                    <p>
                      <small className="text-muted">Labour ID</small>
                      <br />
                      {lmisLabourId}
                    </p>
                    <p>
                      <small className="text-muted">Approval Date</small>
                      <br />
                      {lmisApprovalDate}
                    </p>
                    {lmisQrCodeUrl && (
                      <p>
                        <small className="text-muted">LMIS QR Code</small>
                        <br />
                        <DocumentLink
                          url={lmisQrCodeUrl}
                          label="View QR Code"
                          isImage
                        />
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-muted">No LMIS data available.</p>
                )}
              </div>
            </div>
          </div>

          {/* Travel Records – now showing ALL fields */}
          {preparedTravel.length > 0 ? (
            preparedTravel.map((travel) => (
              <div key={travel.key} className="col-12 col-md-6">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-header d-flex justify-content-between align-items-center fw-bold">
                    <span>
                      Travel Record {travel.key.split("-")[1] + 1}
                      {travel.titleSuffix}
                    </span>
                    <ActionButtons actions={CARD_ACTIONS} row={personal} />
                  </div>
                  <div className="card-body">
                    <p>
                      <small className="text-muted">Departure</small>
                      <br />
                      {travel.departureDate}{" "}
                      {travel.departureLocation !== "—" &&
                        `(${travel.departureLocation})`}
                    </p>
                    <p>
                      <small className="text-muted">Arrival</small>
                      <br />
                      {travel.arrivalDate}{" "}
                      {travel.arrivalLocation !== "—" &&
                        `(${travel.arrivalLocation})`}
                    </p>
                    <p>
                      <small className="text-muted">Destination</small>
                      <br />
                      {travel.destination}
                    </p>
                    <p>
                      <small className="text-muted">Agent</small>
                      <br />
                      {travel.agentName}{" "}
                      {travel.agentPhone !== "—" && `(${travel.agentPhone})`}
                    </p>
                    {travel.ticketFileUrl && (
                      <p>
                        <small className="text-muted">Ticket Document</small>
                        <br />
                        <DocumentLink
                          url={travel.ticketFileUrl}
                          label="View Ticket"
                          isImage={travel.isImage}
                        />
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 col-md-6">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-header fw-bold">Travel Records</div>
                <div className="card-body">
                  <p className="text-muted">No travel records available.</p>
                </div>
              </div>
            </div>
          )}

          {/* Contracts – now showing ALL fields */}
          {preparedContracts.length > 0 ? (
            preparedContracts.map((contract) => (
              <div key={contract.key} className="col-12 col-md-6">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-header d-flex justify-content-between align-items-center fw-bold">
                    <span>Contract {contract.key.split("-")[1] + 1}</span>
                    <ActionButtons actions={CARD_ACTIONS} row={personal} />
                  </div>
                  <div className="card-body">
                    {contract.number !== "—" && (
                      <p>
                        <small className="text-muted">Contract Number</small>
                        <br />
                        {contract.number}
                      </p>
                    )}
                    <p>
                      <small className="text-muted">Start Date</small>
                      <br />
                      {contract.startDate}
                    </p>
                    <p>
                      <small className="text-muted">End Date</small>
                      <br />
                      {contract.endDate}
                    </p>
                    <p>
                      <small className="text-muted">Status</small>
                      <br />
                      <span className={`badge ${contract.statusBadge}`}>
                        {contract.status.toUpperCase()}
                      </span>
                    </p>
                    <p>
                      <small className="text-muted">Monthly Salary</small>
                      <br />
                      {contract.monthlySalary}
                    </p>
                    <p>
                      <small className="text-muted">Partners</small>
                      <br />
                      Partner: {contract.partnerId} • Employer:{" "}
                      {contract.employerId}
                    </p>
                    {contract.fileUrl && (
                      <p>
                        <small className="text-muted">Contract Document</small>
                        <br />
                        <DocumentLink
                          url={contract.fileUrl}
                          label="View Contract"
                          isImage={contract.isImage}
                        />
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 col-md-6">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-header fw-bold">Contracts</div>
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
