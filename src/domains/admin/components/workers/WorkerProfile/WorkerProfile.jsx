import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaFilePdf, FaImage } from "react-icons/fa";

import BackButton from "../../../../../shared/components/BackButton/BackButton";
import Badge from "../../../../../shared/components/Badge/Badge";
import ActionButtons from "../../../../../shared/components/ActionButtons/ActionButtons";

import { getWorkerProfile } from "../../../api/worker.api";
import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";

// helper functions

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
    return String(dateStr);
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
      className="text-primary text-decoration-none d-flex align-items-center gap-2 hover:underline"
    >
      <Icon className="text-lg" />
      {label || (isImage ? "View Image" : "View PDF")}
    </a>
  );
};

const WorkerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();

  const [worker, setWorker] = useState(null);
  const [error, setError] = useState(null);

  const fetchWorker = async () => {
    try {
      showLoader();
      setError(null);
      const { data } = await getWorkerProfile(id);
      setWorker(data);
    } catch (err) {
      const msg = err.message || "Failed to load worker profile";
      addMessage(false, msg);
      setError(msg);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    if (id) fetchWorker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (error) {
    return (
      <div className="dashboard-wraper text-danger text-center py-5">
        <p>{error}</p>
        <button className="btn btn-primary mt-3" onClick={fetchWorker}>
          Retry
        </button>
      </div>
    );
  }

  if (!worker) return null;

  // data extraction and preparation

  const {
    full_name: fullName = "—",
    phone_number: phone = "—",
    status = {},
    personal_information: personal = {},
    passport = {},
    coc = {},
    medical = {},
    emergency = {},
    visa = {},
    lmis = {},
    travel_records: travelRecords = [],
    contracts = [],
  } = worker;

  const statusName = status?.name ?? "—";
  const photoUrl =
    personal?.photo_3x4?.url || "https://via.placeholder.com/150?text=No+Photo";

  // Personal
  const personalInfo = {
    sex: fallback(personal.sex),
    dob: niceDate(personal.date_of_birth),
    placeOfBirth: fallback(personal.place_of_birth),
    address: fallback(personal.address),
    maritalStatus: fallback(personal.marital_status),
    nationality: fallback(personal.nationality),
    education: fallback(personal.education),
    children: fallback(personal.number_of_children),
    region: fallback(personal.region?.name),
    city: fallback(personal.city?.name),
    height: personal.height_cm ? `${personal.height_cm} cm` : "—",
    weight: personal.weight_kg ? `${personal.weight_kg} kg` : "—",
    religion: fallback(personal.religion),
    standingPhoto: personal.photo_standing?.url || null,
  };

  // Passport
  const passportInfo = {
    number: fallback(passport.passport_number),
    issuingCountry: fallback(passport.issuing_country),
    issueDate: niceDate(passport.issue_date),
    expiryDate: niceDate(passport.expiry_date),
    scanUrl: passport.scan?.url || null,
  };

  // COC
  const cocInfo = {
    number: fallback(coc.coc_number),
    assessmentCenter: fallback(coc.assessment_center),
    assessmentDate: niceDate(coc.assessment_date),
    issueDate: niceDate(coc.issue_date),
    expiryDate: niceDate(coc.expiry_date),
    documentUrl: coc.document?.url || null,
  };

  // Emergency
  const emergencyInfo = {
    relation: fallback(emergency.relation),
    name: fallback(emergency.guarantor_name),
    phone: fallback(emergency.guarantor_phone_number),
    address: fallback(emergency.guarantor_address),
    idScanUrl: emergency.id_scan?.url || null,
  };

  // Medical
  const medicalInfo = {
    center: fallback(medical.medical_center),
    reportNumber: fallback(medical.medical_report_number),
    issueDate: niceDate(medical.issue_date),
    expiryDate: niceDate(medical.expiry_date),
    status: (medical.medical_status || "").toLowerCase(),
    fileUrl: medical.file?.url || null,
  };
  medicalInfo.badgeClass =
    medicalInfo.status === "fit"
      ? "badge bg-success"
      : medicalInfo.status
        ? "badge bg-danger"
        : "badge bg-secondary";
  medicalInfo.statusText = medicalInfo.status
    ? medicalInfo.status.toUpperCase()
    : "—";

  // Visa
  const visaInfo = {
    number: fallback(visa.visa_number),
    issueDate: niceDate(visa.issue_date),
    expiryDate: niceDate(visa.expiry_date),
    referenceNumber: fallback(visa.reference_number),
    referenceDate: niceDate(visa.reference_date),
    documentUrl: visa.document?.url || null,
  };

  // LMIS
  const lmisInfo = {
    labourId: fallback(lmis.labour_id),
    approvalDate: niceDate(lmis.approval_date),
    qrCodeUrl: lmis.qr_code?.url || null,
  };

  // Travel Records
  const preparedTravel = travelRecords.map((rec, idx) => ({
    key: `travel-${idx + 1}`,
    titleSuffix: rec.ticket_number ? ` – #${rec.ticket_number}` : "",
    departureDate: niceDate(rec.departure_date),
    departureLocation: fallback(rec.departure_location),
    arrivalDate: niceDate(rec.arrival_date),
    arrivalLocation: fallback(rec.arrival_location),
    destination: fallback(rec.destination || rec.arrival_location),
    agentName: fallback(rec.agent_name),
    agentPhone: fallback(rec.agent_phone_number),
    ticketUrl: rec.ticket_file?.url || null,
    isImage: rec.ticket_file?.resource_type === "image",
  }));

  // Contracts
  const preparedContracts = contracts.map((con, idx) => {
    const status = fallback(con.status);
    return {
      key: `contract-${idx + 1}`,
      number: fallback(con.contract_number),
      startDate: niceDate(con.contract_start_date || con.start_date),
      endDate: niceDate(con.contract_end_date || con.end_date),
      status,
      statusBadge:
        status === "active"
          ? "bg-success"
          : status === "pending"
            ? "bg-warning"
            : "bg-secondary",
      monthlySalary:
        con.monthly_salary != null ? `${con.monthly_salary} SAR` : "—",
      partnerId: fallback(con.partner_id),
      employerId: fallback(con.employer_id),
      fileUrl: con.contract_upload?.url || con.file?.url || null,
      isImage:
        (con.contract_upload?.resource_type || con.file?.resource_type) ===
        "image",
    };
  });

  return (
    <div className="dashboard-wraper">
      <BackButton onClick={() => navigate(-1)} />

      {/* Header */}
      <div className=" mb-4 border-0">
        <div className="row align-items-center">
          <div className="col-md-2 text-center mb-4 mb-md-0">
            <img
              src={photoUrl}
              alt={`${fullName} photo`}
              className="img-fluid rounded-circle worker-photo"
              style={{ width: "140px", height: "140px", objectFit: "cover" }}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/150?text=Error";
              }}
            />
          </div>

          <div className="col-md-10">
            <h4 className="fw-bold mb-1">{fullName}</h4>
            <p className="text-muted mb-1">
              <strong>Phone:</strong> {phone}
            </p>
            <p className="text-muted mb-2">
              <strong>Passport No:</strong> {passportInfo.number}
            </p>
            <Badge content={statusName} color="green" />
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="container">
        <div className="row g-4">
          {/* Personal Information */}
          <div className="col-12">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header d-flex justify-content-between align-items-center fw-bold">
                <h3 className="fw-bold text-dark">Personal Information</h3>
                <ActionButtons
                  actions={[
                    {
                      type: "edit",
                      // onClick: (row) => handleEdit(row.id),
                    },
                    {
                      type: "delete",
                      // onClick: (row) => handleDelete(row.id),
                    },
                  ]}
                  row={worker} // pass the row data here
                />
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <p>
                      <small className="text-muted">Sex</small>
                      <br />
                      {personalInfo.sex}
                    </p>
                    <p>
                      <small className="text-muted">Date of Birth</small>
                      <br />
                      {personalInfo.dob}
                    </p>
                    <p>
                      <small className="text-muted">Place of Birth</small>
                      <br />
                      {personalInfo.placeOfBirth}
                    </p>
                    <p>
                      <small className="text-muted">Marital Status</small>
                      <br />
                      {personalInfo.maritalStatus}
                    </p>
                    <p>
                      <small className="text-muted">Nationality</small>
                      <br />
                      {personalInfo.nationality}
                    </p>

                    {personalInfo.standingPhoto && (
                      <p>
                        <small className="text-muted">Standing Photo</small>
                        <br />
                        <DocumentLink
                          url={personalInfo.standingPhoto}
                          label="View Standing Photo"
                          isImage
                        />
                      </p>
                    )}
                  </div>
                  <div className="col-md-6">
                    <p>
                      <small className="text-muted">Education</small>
                      <br />
                      {personalInfo.education}
                    </p>
                    <p>
                      <small className="text-muted">Number of Children</small>
                      <br />
                      {personalInfo.children}
                    </p>
                    <p>
                      <small className="text-muted">Region / City</small>
                      <br />
                      {personalInfo.region}
                      {personalInfo.city !== "—"
                        ? ` / ${personalInfo.city}`
                        : ""}
                    </p>
                    <p>
                      <small className="text-muted">Height / Weight</small>
                      <br />
                      {personalInfo.height} / {personalInfo.weight}
                    </p>
                    <p>
                      <small className="text-muted">Religion</small>
                      <br />
                      {personalInfo.religion}
                    </p>
                    <p>
                      <small className="text-muted">Address</small>
                      <br />
                      {personalInfo.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Passport */}
          <div className="col-12 col-md-6">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header fw-bold">Passport Information</div>
              <div className="card-body">
                <p>
                  <small className="text-muted">Passport Number</small>
                  <br />
                  {passportInfo.number}
                </p>
                <p>
                  <small className="text-muted">Issuing Country</small>
                  <br />
                  {passportInfo.issuingCountry}
                </p>
                <p>
                  <small className="text-muted">Issue Date</small>
                  <br />
                  {passportInfo.issueDate}
                </p>
                <p>
                  <small className="text-muted">Expiry Date</small>
                  <br />
                  {passportInfo.expiryDate}
                </p>
                {passportInfo.scanUrl && (
                  <p>
                    <small className="text-muted">Passport Scan</small>
                    <br />
                    <DocumentLink
                      url={passportInfo.scanUrl}
                      label="View Passport Scan"
                    />
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* COC */}
          <div className="col-12 col-md-6">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header fw-bold">COC Information</div>
              <div className="card-body">
                <p>
                  <small className="text-muted">COC Number</small>
                  <br />
                  {cocInfo.number}
                </p>
                <p>
                  <small className="text-muted">Assessment Center</small>
                  <br />
                  {cocInfo.assessmentCenter}
                </p>
                <p>
                  <small className="text-muted">Assessment Date</small>
                  <br />
                  {cocInfo.assessmentDate}
                </p>
                <p>
                  <small className="text-muted">Issue Date</small>
                  <br />
                  {cocInfo.issueDate}
                </p>
                <p>
                  <small className="text-muted">Expiry Date</small>
                  <br />
                  {cocInfo.expiryDate}
                </p>
                {cocInfo.documentUrl && (
                  <p>
                    <small className="text-muted">COC Document</small>
                    <br />
                    <DocumentLink
                      url={cocInfo.documentUrl}
                      label="View COC Document"
                    />
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="col-12 col-md-6">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header fw-bold">Emergency / Guarantor</div>
              <div className="card-body">
                <p>
                  <small className="text-muted">Relation</small>
                  <br />
                  {emergencyInfo.relation}
                </p>
                <p>
                  <small className="text-muted">Name</small>
                  <br />
                  {emergencyInfo.name}
                </p>
                <p>
                  <small className="text-muted">Phone</small>
                  <br />
                  {emergencyInfo.phone}
                </p>
                <p>
                  <small className="text-muted">Address</small>
                  <br />
                  {emergencyInfo.address}
                </p>
                {emergencyInfo.idScanUrl && (
                  <p>
                    <small className="text-muted">ID Scan</small>
                    <br />
                    <DocumentLink
                      url={emergencyInfo.idScanUrl}
                      label="View Guarantor ID"
                    />
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Medical */}
          <div className="col-12 col-md-6">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header fw-bold">Medical Information</div>
              <div className="card-body">
                <p>
                  <small className="text-muted">Medical Center</small>
                  <br />
                  {medicalInfo.center}
                </p>
                <p>
                  <small className="text-muted">Report Number</small>
                  <br />
                  {medicalInfo.reportNumber}
                </p>
                <p>
                  <small className="text-muted">Issue Date</small>
                  <br />
                  {medicalInfo.issueDate}
                </p>
                <p>
                  <small className="text-muted">Expiry Date</small>
                  <br />
                  {medicalInfo.expiryDate}
                </p>
                <p>
                  <small className="text-muted">Result</small>
                  <br />
                  <span className={medicalInfo.badgeClass}>
                    {medicalInfo.statusText}
                  </span>
                </p>
                {medicalInfo.fileUrl && (
                  <p>
                    <small className="text-muted">Medical Report</small>
                    <br />
                    <DocumentLink
                      url={medicalInfo.fileUrl}
                      label="View Medical Report"
                    />
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Visa */}
          <div className="col-12 col-md-6">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header fw-bold">Visa Information</div>
              <div className="card-body">
                <p>
                  <small className="text-muted">Visa Number</small>
                  <br />
                  {visaInfo.number}
                </p>
                <p>
                  <small className="text-muted">Issue Date</small>
                  <br />
                  {visaInfo.issueDate}
                </p>
                <p>
                  <small className="text-muted">Expiry Date</small>
                  <br />
                  {visaInfo.expiryDate}
                </p>
                <p>
                  <small className="text-muted">Reference Number</small>
                  <br />
                  {visaInfo.referenceNumber}
                </p>
                <p>
                  <small className="text-muted">Reference Date</small>
                  <br />
                  {visaInfo.referenceDate}
                </p>
                {visaInfo.documentUrl && (
                  <p>
                    <small className="text-muted">Visa Document</small>
                    <br />
                    <DocumentLink
                      url={visaInfo.documentUrl}
                      label="View Visa"
                    />
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* LMIS */}
          <div className="col-12 col-md-6">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header fw-bold">LMIS Information</div>
              <div className="card-body">
                <p>
                  <small className="text-muted">Labour ID</small>
                  <br />
                  {lmisInfo.labourId}
                </p>
                <p>
                  <small className="text-muted">Approval Date</small>
                  <br />
                  {lmisInfo.approvalDate}
                </p>
                {lmisInfo.qrCodeUrl && (
                  <p>
                    <small className="text-muted">QR Code</small>
                    <br />
                    <DocumentLink
                      url={lmisInfo.qrCodeUrl}
                      label="View LMIS QR Code"
                      isImage
                    />
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Travel Records */}
          {preparedTravel.length > 0 ? (
            preparedTravel.map((travel) => (
              <div key={travel.key} className="col-12 col-md-6">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-header fw-bold">
                    Travel Record {travel.key.split("-")[1]}
                    {travel.titleSuffix}
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
                    {travel.ticketUrl && (
                      <p>
                        <small className="text-muted">Ticket</small>
                        <br />
                        <DocumentLink
                          url={travel.ticketUrl}
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

          {/* Contracts */}
          {preparedContracts.length > 0 ? (
            preparedContracts.map((contract) => (
              <div key={contract.key} className="col-12 col-md-6">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-header fw-bold">
                    Contract {contract.key.split("-")[1]}
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
