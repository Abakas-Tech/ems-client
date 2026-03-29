// domains/worker/components/CV.jsx
import React from "react";
import styles from "./CV.module.css";

const mockWorkerData = {
  full_name: "ABAYNESH DESALEW HABTAMU",
  phone_number: "+251 912 345 678",
  email: "abaynesh.desalew@gmail.com",
  address: "LEGAMBO, AMHARA REGION, ETHIOPIA",
  sex: "FEMALE",
  date_of_birth: "27 JUN 2002",
  place_of_birth: "LEGAMBO",
  nationality: "ETHIOPIA",
  religion: "NON-MUSLIM",
  marital_status: "SINGLE",
  education: "HIGH SCHOOL",
  height_cm: 157,
  weight_kg: 55,

  photo_3x4_url:
    "https://res.cloudinary.com/drbwjh79j/image/upload/v1774706877/yqf6pstlojfrtqucm7db.png",
  photo_standing_url:
    "https://res.cloudinary.com/drbwjh79j/image/upload/v1774706802/workers/9_standing.png.png",

  passport_number: "EQ1122874",
  passport_issue_date: "15 NOV 24",
  passport_expiry_date: "14 NOV 29",

  visa_number: "VS-2026-001",
  visa_issue_date: "10 JAN 26",
  visa_expiry_date: "10 JAN 28",

  medical_status: "FIT",
  medical_center: "ADDIS MEDICAL CENTER",
  medical_issue_date: "01 FEB 25",

  coc_number: "COC-2025-001",
  coc_issue_date: "10 JAN 25",

  guarantor_name: "WALE TEREFE",
  guarantor_relation: "FATHER",
  guarantor_phone_number: "+251 974 095 543",

  employer_name_en: "MOHAMMED AL-KHALID",
  employer_name_ar: "محمد الخالد",
  monthly_salary: "1000 SR",
  contract_start_date: "01 APR 2026",
  contract_end_date: "31 MAR 2028",

  ticket_number: "ET-123456",
  departure_date: "15 MAR 2026",

  skills: ["COOKING", "BABY SITTING", "CLEANING", "WASHING", "SEWING"],
  languages: [
    { name: "ENGLISH", level: "BASIC" },
    { name: "ARABIC", level: "POOR" },
    { name: "AMHARIC", level: "NATIVE" },
  ],
};

const CV = ({ worker = mockWorkerData, onBack }) => {
  const handlePrint = () => window.print();

  return (
    <div className="dashboard-wraper">
      {/* Top Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4 d-print-none">
        <h2 className="text-dark mb-0">Worker CV</h2>
        {onBack && <BackButton onClick={onBack} />}
      </div>

      <div
        className="card border-0 shadow-sm overflow-hidden"
        id="printable-cv"
      >
        <div className="card-body p-0">
          {/* ===== HEADER ===== */}
          <header className={styles.header}>
            <img
              src={worker.photo_3x4_url}
              alt="Profile"
              className={styles.circularPhoto}
            />
            <div>
              <h1 className={styles.name}>{worker.full_name}</h1>
              <p className={styles.title}>DOMESTIC WORKER • HOUSE MAID</p>
            </div>
          </header>

          {/* ===== MAIN CONTENT ===== */}
          <div className={styles.mainContent}>
            {/* LEFT */}
            <div className={styles.leftColumn}>
              <div className={`${styles.section} ${styles.highlightSection}`}>
                <h3 className={styles.sectionTitle}>CONTACT</h3>
                <p>📞 {worker.phone_number}</p>
                <p>✉️ {worker.email}</p>
                <p>📍 {worker.address}</p>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>PERSONAL INFORMATION</h3>
                <p>
                  <strong>Date of Birth:</strong> {worker.date_of_birth}
                </p>
                <p>
                  <strong>Place of Birth:</strong> {worker.place_of_birth}
                </p>
                <p>
                  <strong>Nationality:</strong> {worker.nationality}
                </p>
                <p>
                  <strong>Sex:</strong> {worker.sex}
                </p>
                <p>
                  <strong>Marital Status:</strong> {worker.marital_status}
                </p>
                <p>
                  <strong>Religion:</strong> {worker.religion}
                </p>
                <p>
                  <strong>Height / Weight:</strong> {worker.height_cm} cm /{" "}
                  {worker.weight_kg} kg
                </p>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>SKILLS</h3>
                <ul className={styles.list}>
                  {worker.skills.map((skill, i) => (
                    <li key={i}>{skill}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>LANGUAGES</h3>
                <ul className={styles.list}>
                  {worker.languages.map((lang) => (
                    <li key={lang.name}>
                      {lang.name} —{" "}
                      <span className={styles.level}>{lang.level}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>PASSPORT</h3>
                <p>
                  <strong>Number:</strong> {worker.passport_number}
                </p>
                <p>
                  <strong>Issued:</strong> {worker.passport_issue_date}
                </p>
                <p>
                  <strong>Expires:</strong> {worker.passport_expiry_date}
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div className={styles.rightColumn}>
              {/* ✅ PHOTO ON TOP */}
              <div className={styles.photoWrapper}>
                <img
                  src={worker.photo_standing_url}
                  alt="Standing"
                  className={styles.standingPhoto}
                />
              </div>

            

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>MEDICAL & COC</h3>
                <p>
                  <strong>Status:</strong> {worker.medical_status}
                </p>
                <p>
                  <strong>Center:</strong> {worker.medical_center}
                </p>
                <p>
                  <strong>COC:</strong> {worker.coc_number}
                </p>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>CONTRACT</h3>
                <p>
                  <strong>Employer:</strong> {worker.employer_name_en}
                </p>
                <p>
                  <strong>Arabic:</strong> {worker.employer_name_ar}
                </p>
                <p>
                  <strong>Salary:</strong> {worker.monthly_salary}
                </p>
                <p>
                  <strong>Period:</strong> {worker.contract_start_date} —{" "}
                  {worker.contract_end_date}
                </p>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>TRAVEL</h3>
                <p>
                  <strong>Ticket:</strong> {worker.ticket_number}
                </p>
                <p>
                  <strong>Departure:</strong> {worker.departure_date}
                </p>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>GUARANTOR</h3>
                <p>
                  <strong>Name:</strong> {worker.guarantor_name}
                </p>
                <p>
                  <strong>Relation:</strong> {worker.guarantor_relation}
                </p>
                <p>
                  <strong>Phone:</strong> {worker.guarantor_phone_number}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="card-footer bg-white border-top-0 p-4 text-center d-print-none">
          <button
            className="btn btn-outline-primary btn-sm px-5"
            onClick={handlePrint}
          >
            <i className="bi bi-printer me-2"></i>
            Print / Download CV as PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default CV;
