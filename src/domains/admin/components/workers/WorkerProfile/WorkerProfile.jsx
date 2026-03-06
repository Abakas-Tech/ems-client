import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaFilePdf, FaImage } from "react-icons/fa";

import BackButton from "../../../../../shared/components/BackButton/BackButton";
import Badge from "../../../../../shared/components/Badge/Badge";
import ActionButtons from "../../../../../shared/components/ActionButtons/ActionButtons";

import { getWorkerProfile } from "../../../api/worker.api";
import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";

/* helpers */

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
      className="text-primary text-decoration-none d-flex align-items-center gap-2"
    >
      <Icon />
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

  const fetchWorker = async () => {
    try {
      showLoader();
      const { data } = await getWorkerProfile(id);
      setWorker(data);
    } catch (err) {
      addMessage(false, err.message || "Failed to load worker profile");
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    if (id) fetchWorker();
  }, [id]);

  if (!worker) return null;

  /* data extraction */

  const {
    full_name: fullName = "—",
    phone_number: phone = "—",
    status,
    personal_information,
    passport,
    coc,
    medical,
    emergency,
    visa,
    lmis,
    travel_records,
    contracts,
  } = worker;

  const statusObj = status || {};
  const personal = personal_information || {};
  const passportObj = passport || {};
  const cocObj = coc || {};
  const medicalObj = medical || {};
  const emergencyObj = emergency || {};
  const visaObj = visa || {};
  const lmisObj = lmis || {};
  const travelRecords = travel_records || [];
  const contractsList = contracts || [];

  const statusName = statusObj?.name ?? "—";

  const photoUrl =
    personal?.photo_3x4?.url || "https://placehold.co/600x400?text=No+Photo";

  /* Personal */
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

  /* Passport */
  const passportInfo = {
    number: fallback(passportObj.passport_number),
    issuingCountry: fallback(passportObj.issuing_country),
    issueDate: niceDate(passportObj.issue_date),
    expiryDate: niceDate(passportObj.expiry_date),
    scanUrl: passportObj.scan?.url || null,
  };

  /* COC */
  const cocInfo = {
    number: fallback(cocObj.coc_number),
    assessmentCenter: fallback(cocObj.assessment_center),
    assessmentDate: niceDate(cocObj.assessment_date),
    issueDate: niceDate(cocObj.issue_date),
    expiryDate: niceDate(cocObj.expiry_date),
    documentUrl: cocObj.document?.url || null,
  };

  /* Emergency */
  const emergencyInfo = {
    relation: fallback(emergencyObj.relation),
    name: fallback(emergencyObj.guarantor_name),
    phone: fallback(emergencyObj.guarantor_phone_number),
    address: fallback(emergencyObj.guarantor_address),
    idScanUrl: emergencyObj.id_scan?.url || null,
  };

  /* Medical */
  const medicalInfo = {
    center: fallback(medicalObj.medical_center),
    reportNumber: fallback(medicalObj.medical_report_number),
    issueDate: niceDate(medicalObj.issue_date),
    expiryDate: niceDate(medicalObj.expiry_date),
    status: String(medicalObj.medical_status || "").toLowerCase(),
    fileUrl: medicalObj.file?.url || null,
  };

  medicalInfo.statusText = medicalInfo.status
    ? medicalInfo.status.toUpperCase()
    : "—";

  /* Visa */
  const visaInfo = {
    number: fallback(visaObj.visa_number),
    issueDate: niceDate(visaObj.issue_date),
    expiryDate: niceDate(visaObj.expiry_date),
    referenceNumber: fallback(visaObj.reference_number),
    referenceDate: niceDate(visaObj.reference_date),
    documentUrl: visaObj.document?.url || null,
  };

  /* LMIS */
  const lmisInfo = {
    labourId: fallback(lmisObj.labour_id),
    approvalDate: niceDate(lmisObj.approval_date),
    qrCodeUrl: lmisObj.qr_code?.url || null,
  };

  /* Travel */
  const preparedTravel = travelRecords.map((rec, idx) => ({
    key: `travel-${idx + 1}`,
    ticketNumber: rec.ticket_number ? String(rec.ticket_number) : "—",
    departureDate: niceDate(rec.departure_date),
    departureLocation: fallback(rec.departure_location),
    arrivalDate: niceDate(rec.arrival_date),
    arrivalLocation: fallback(rec.arrival_location),
    destination: fallback(rec.destination || rec.arrival_location),
    agentName: fallback(rec.agent_name),
    agentEmail: fallback(rec.agent_email),
    agentPhone: fallback(rec.agent_phone_number),
    ticketUrl: rec.ticket_file?.url || null,
    isImage: rec.ticket_file?.resource_type === "image",
  }));

  /* Contracts */
  const preparedContracts = contractsList.map((con, idx) => {
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
      partnerName: fallback(con.partner_name),
      employerName: fallback(con.employer_name),
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
      <div className="mb-4 border-0">
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

      {/* Cards */}
      <div className="container">
        <div className="row g-4">
          {/* PERSONAL */}
          <div className="col-12">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header d-flex justify-content-between align-items-center pb-0">
                <h3 className="fw-bold">Personal Information</h3>
                <ActionButtons
                  actions={[
                    { type: "edit", onClick: (row) => editPersonal(row) },
                    {
                      type: "delete",
                      onClick: (row) => deletePersonal(row.id),
                    },
                  ]}
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
                    {personalInfo.standingPhoto ? (
                      <p>
                        <small className="text-muted">Standing Photo</small>
                        <br />
                        <DocumentLink
                          url={personalInfo.standingPhoto}
                          label="View Standing Photo"
                          isImage
                        />
                      </p>
                    ) : (
                      <p>
                        <small className="text-muted">Standing Photo</small>
                        <br />
                        <span className="text-muted">Not available</span>
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

          {/* PASSPORT */}
          <div className="col-12 col-md-6">
            <div className="card h-100 shadow-sm border-0 ">
              <div className="card-header d-flex justify-content-between align-items-center pb-0">
                <h3 className="fw-bold">Passport Information</h3>
                <ActionButtons
                  actions={[
                    { type: "edit", onClick: (row) => editPassport(row) },
                    {
                      type: "delete",
                      onClick: (row) => deletePassport(row.id),
                    },
                  ]}
                />
              </div>
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
                {passportInfo.scanUrl ? (
                  <p>
                    <small className="text-muted">Passport Scan</small>
                    <br />
                    <DocumentLink
                      url={passportInfo.scanUrl}
                      label="View Passport Scan"
                    />
                  </p>
                ) : (
                  <p>
                    <small className="text-muted">Passport Scan</small>
                    <br />
                    <span className="text-muted">Not available</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* COC */}
          <div className="col-12 col-md-6">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header d-flex justify-content-between align-items-center pb-0">
                <h3 className="fw-bold">COC Information</h3>
                <ActionButtons
                  actions={[
                    { type: "edit", onClick: (row) => editCoc(row) },
                    { type: "delete", onClick: (row) => deleteCoc(row.id) },
                  ]}
                />
              </div>
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
                {cocInfo.documentUrl ? (
                  <p>
                    <small className="text-muted">COC Document</small>
                    <br />
                    <DocumentLink
                      url={cocInfo.documentUrl}
                      label="View COC Document"
                    />
                  </p>
                ) : (
                  <p>
                    <small className="text-muted">COC Document</small>
                    <br />
                    <span className="text-muted">Not available</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="col-12 col-md-6">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header d-flex justify-content-between align-items-center pb-0">
                <h3 className="fw-bold">Emergency Contact</h3>
                <ActionButtons
                  actions={[
                    { type: "edit", onClick: (row) => editEmergency(row) },
                    {
                      type: "delete",
                      onClick: (row) => deleteEmergency(row.id),
                    },
                  ]}
                />
              </div>
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
                {emergencyInfo.idScanUrl ? (
                  <p>
                    <small className="text-muted">ID Scan</small>
                    <br />
                    <DocumentLink
                      url={emergencyInfo.idScanUrl}
                      label="View Guarantor ID"
                    />
                  </p>
                ) : (
                  <p>
                    <small className="text-muted">ID Scan</small>
                    <br />
                    <span className="text-muted">Not available</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Medical */}
          <div className="col-12 col-md-6">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header d-flex justify-content-between align-items-center pb-0">
                <h3 className="fw-bold">Medical Information</h3>
                <ActionButtons
                  actions={[
                    { type: "edit", onClick: (row) => editMedical(row) },
                    { type: "delete", onClick: (row) => deleteMedical(row.id) },
                  ]}
                />
              </div>
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
                  <span
                    className={`badge ${
                      medicalInfo.status === "fit"
                        ? "bg-success"
                        : medicalInfo.status === "unfit"
                          ? "bg-danger"
                          : medicalInfo.status === "pending"
                            ? "bg-warning"
                            : "bg-secondary"
                    }`}
                  >
                    {medicalInfo.statusText}
                  </span>
                </p>
                {medicalInfo.fileUrl ? (
                  <p>
                    <small className="text-muted">Medical Report</small>
                    <br />
                    <DocumentLink
                      url={medicalInfo.fileUrl}
                      label="View Medical Report"
                    />
                  </p>
                ) : (
                  <p>
                    <small className="text-muted">Medical Report</small>
                    <br />
                    <span className="text-muted">Not available</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Visa */}
          <div className="col-12 col-md-6">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header d-flex justify-content-between align-items-center pb-0">
                <h3 className="fw-bold">Visa Information</h3>
                <ActionButtons
                  actions={[
                    { type: "edit", onClick: (row) => editVisa(row) },
                    { type: "delete", onClick: (row) => deleteVisa(row.id) },
                  ]}
                />
              </div>
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
                {visaInfo.documentUrl ? (
                  <p>
                    <small className="text-muted">Visa Document</small>
                    <br />
                    <DocumentLink
                      url={visaInfo.documentUrl}
                      label="View Visa"
                    />
                  </p>
                ) : (
                  <p>
                    <small className="text-muted">Visa Document</small>
                    <br />
                    <span className="text-muted">Not available</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* LMIS */}
          <div className="col-12 col-md-6">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header d-flex justify-content-between align-items-center pb-0">
                <h3 className="fw-bold">LMIS Information</h3>
                <ActionButtons
                  actions={[
                    { type: "edit", onClick: (row) => editLmis(row) },
                    { type: "delete", onClick: (row) => deleteLmis(row.id) },
                  ]}
                />
              </div>
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
                {lmisInfo.qrCodeUrl ? (
                  <p>
                    <small className="text-muted">QR Code</small>
                    <br />
                    <DocumentLink
                      url={lmisInfo.qrCodeUrl}
                      label="View LMIS QR Code"
                      isImage
                    />
                  </p>
                ) : (
                  <p>
                    <small className="text-muted">QR Code</small>
                    <br />
                    <span className="text-muted">Not available</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Travel Records */}
          <div className="col-12 col-md-6">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header d-flex justify-content-between align-items-center pb-0">
                <h3 className="fw-bold">Travel Records</h3>
                <ActionButtons
                  actions={[
                    { type: "edit", onClick: (row) => editTravel(row) },
                    { type: "delete", onClick: (row) => deleteTravel(row.id) },
                  ]}
                />
              </div>
              <div className="card-body">
                {preparedTravel.length > 0 ? (
                  preparedTravel.map((travel, index) => (
                    <div
                      key={travel.key}
                      className={index > 0 ? "mt-5 pt-4 border-top" : ""}
                    >
                      <p>
                        <small className="text-muted">Ticket Number</small>
                        <br />
                        {travel.ticketNumber}
                      </p>
                      <p>
                        <small className="text-muted">Destination</small>
                        <br />
                        {travel.destination}
                      </p>
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
                        <small className="text-muted">Agent Name</small>
                        <br />
                        {travel.agentName}
                      </p>
                      <p>
                        <small className="text-muted">Agent Phone</small>
                        <br />
                        {travel.agentPhone}
                      </p>
                      <p>
                        <small className="text-muted">Agent Email</small>
                        <br />
                        {travel.agentEmail}
                      </p>
                      <p>
                        <small className="text-muted">Ticket Document</small>
                        <br />
                        {travel.ticketUrl ? (
                          <DocumentLink
                            url={travel.ticketUrl}
                            label="View Ticket"
                            isImage={travel.isImage}
                          />
                        ) : (
                          <span className="text-muted">Not available</span>
                        )}
                      </p>
                    </div>
                  ))
                ) : (
                  <div>
                    <p>
                      <small className="text-muted">Ticket Number</small>
                      <br />
                      {"—"}
                    </p>
                    <p>
                      <small className="text-muted">Destination</small>
                      <br />
                      {"—"}
                    </p>
                    <p>
                      <small className="text-muted">Departure</small>
                      <br />
                      {"—"}
                    </p>
                    <p>
                      <small className="text-muted">Arrival</small>
                      <br />
                      {"—"}
                    </p>
                    <p>
                      <small className="text-muted">Agent Name</small>
                      <br />
                      {"—"}
                    </p>
                    <p>
                      <small className="text-muted">Agent Phone</small>
                      <br />
                      {"—"}
                    </p>
                    <p>
                      <small className="text-muted">Agent Email</small>
                      <br />
                      {"—"}
                    </p>
                    <p>
                      <small className="text-muted">Ticket Document</small>
                      <br />
                      <span className="text-muted">Not available</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contracts */}
          <div className="col-12 col-md-6">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header d-flex justify-content-between align-items-center pb-0">
                <h3 className="fw-bold">Contracts</h3>
                <ActionButtons
                  actions={[
                    { type: "edit", onClick: (row) => editContract(row) },
                    {
                      type: "delete",
                      onClick: (row) => deleteContract(row.id),
                    },
                  ]}
                />
              </div>
              <div className="card-body">
                {preparedContracts.length > 0 ? (
                  preparedContracts.map((contract, index) => (
                    <div
                      key={contract.key}
                      className={index > 0 ? "mt-5 pt-4 border-top" : ""}
                    >
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
                        <small className="text-muted">Partner</small>
                        <br />
                        {contract.partnerName}
                      </p>

                      <p>
                        <small className="text-muted">Employer</small>
                        <br />
                        {contract.employerName}
                      </p>

                      <p>
                        <small className="text-muted">Contract Document</small>
                        <br />
                        {contract.fileUrl ? (
                          <DocumentLink
                            url={contract.fileUrl}
                            label="View Contract"
                            isImage={contract.isImage}
                          />
                        ) : (
                          <span className="text-muted">Not available</span>
                        )}
                      </p>
                    </div>
                  ))
                ) : (
                  <div>
                    <p>
                      <small className="text-muted">Start Date</small>
                      <br />
                      {"—"}
                    </p>
                    <p>
                      <small className="text-muted">End Date</small>
                      <br />
                      {"—"}
                    </p>
                    <p>
                      <small className="text-muted">Status</small>
                      <br />
                      <span className="badge bg-secondary">—</span>
                    </p>
                    <p>
                      <small className="text-muted">Monthly Salary</small>
                      <br />
                      {"—"}
                    </p>
                    <p>
                      <small className="text-muted">Partner</small>
                      <br />
                      {"—"}
                    </p>
                    <p>
                      <small className="text-muted">Employer</small>
                      <br />
                      {"—"}
                    </p>
                    <p>
                      <small className="text-muted">Contract Document</small>
                      <br />
                      <span className="text-muted">Not available</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;
