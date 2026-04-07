import React, { useState, useEffect, useCallback } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import styles from "./CV.module.css";
import { getWorkerCVData } from "../../../../api/worker.api";
import BackButton from "../../../../../../shared/components/BackButton/BackButton";
import { useParams, useNavigate } from "react-router-dom";
import useLoader from "../../../../../../context/Loader/useLoader";
import { uploadFile } from "../../../../api/file.api";
import { useRef } from "react";
import useResponse from "../../../../../../context/Response/useResponse";
import useProfile from "../../../../../../context/Profile/useProfile";
const safeDate = (d) => (d ? d.slice(0, 10) : "—");

const CV = () => {
  const { id } = useParams();
  const cvRef = useRef(null); // Create a reference
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { profile } = useProfile();

  const fetchWorkerData = useCallback(async () => {
    showLoader();
    try {
      const workerId = id ? id : profile.id;
      const { data } = await getWorkerCVData(workerId);
      setWorker(data);
    } catch (err) {
      console.error(err);
    } finally {
      hideLoader();
    }
  }, [id || profile]);

  const handleGenerateAndUpload = async () => {
    if (!cvRef.current) return;

    showLoader();
    try {
      const element = cvRef.current;

      /* 1. FORCE DESKTOP WIDTH */
      const originalWidth = element.style.width;
      element.style.width = "1200px"; // force desktop layout

      /* 2. WAIT FOR RENDER */
      await new Promise((resolve) => setTimeout(resolve, 300));

      /* 3. CAPTURE */
      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: 1.5,
        windowWidth: 1200,
      });

      /* 4. RESTORE WIDTH */
      element.style.width = originalWidth;

      const imgData = canvas.toDataURL("image/jpeg", 0.7);

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(
        imgData,
        "JPEG",
        0,
        0,
        pdfWidth,
        pdfHeight,
        undefined,
        "FAST",
      );

      const pdfBlob = pdf.output("blob");

      const fileName = `${worker.full_name.replace(/\s+/g, "_")}_CV.pdf`;

      const file = new File([pdfBlob], fileName, {
        type: "application/pdf",
      });

      const originalName = `${worker.full_name.replace(/\s+/g, "_")}_CV`;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("file_name", originalName);
      formData.append("category", "CV");
      formData.append("is_private", 0);
      formData.append("description", `CV for ${worker.full_name}`);
      formData.append("worker_id", worker.id);

      await uploadFile(formData);

      const response = worker.cv_url ? "updated" : "generated";

      addMessage(true, "CV " + response + " and uploaded successfully!");
    } catch (err) {
      addMessage(false, "Failed to generate PDF");
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchWorkerData();
  }, [profile]);

  if (!worker) return null;

  return (
    <div className="dashboard-wraper">
      <div className="d-flex justify-content-between align-items-center d-print-none pb-2">
        <h2 className="text-dark mb-2">
          {" "}
          {profile?.role_id != 4 ? "Employee" : "My"} CV
        </h2>
        {profile?.role_id != 4 && <BackButton onClick={() => navigate(-1)} />}
      </div>
      {profile?.role_id != 4 && (
        <div className="mb-3">
          <button
            className="btn btn-main mt-3 px-4  text-white w-auto d-flex align-items-center justify-content-center "
            onClick={handleGenerateAndUpload}
          >
            {worker.cv_url ? "Update CV" : "Generate & Upload CV"}
          </button>
        </div>
      )}

      <div ref={cvRef} className="card border-0 shadow-sm overflow-hidden">
        <div className="card-body p-0 ">
          {/* HEADER */}
          <div className={styles.header}>
            <img src={worker.photo_3x4_url} className={styles.circularPhoto} />
            <div>
              <h1 className={styles.name}>{worker.full_name}</h1>
              <p className={`{styles.title} fw-bold`}>
                {worker.primary_positions?.join(" • ") || "DOMESTIC EMPLOYEE"}
              </p>
            </div>
          </div>

          <div className={styles.mainContent}>
            {/* LEFT */}
            <div className={styles.leftColumn}>
              <div className={styles.topLeftGroup}>
                {/* CONTACT */}
                <section
                  className={`${styles.section} ${styles.highlightSection}`}
                >
                  <h3
                    className={`${styles.sectionTitle} ${styles.highlightContactTitle}`}
                  >
                    CONTACT
                  </h3>
                  <p>
                    <i className="bi bi-telephone me-2"></i>
                    {worker.phone_number}
                  </p>
                  <p>
                    <i className="bi bi-envelope me-2"></i>
                    {worker.email}
                  </p>
                  <p>
                    <i className="bi bi-geo-alt me-2"></i>
                    {worker.address}
                  </p>
                </section>

                {/* PERSONAL */}
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>PERSONAL INFO</h3>
                  <p>
                    <strong>DOB:</strong> {safeDate(worker.date_of_birth)}
                  </p>
                  <p>
                    <strong>Place:</strong> {worker.place_of_birth || "—"}
                  </p>
                  <p>
                    <strong>Nationality:</strong> {worker.nationality || "—"}
                  </p>
                  <p>
                    <strong>Sex:</strong> {worker.sex || "—"}
                  </p>
                  <p>
                    <strong>Religion:</strong> {worker.religion || "—"}
                  </p>
                  <p>
                    <strong>Status:</strong> {worker.marital_status || "—"}
                  </p>
                  <p>
                    <strong>Height/Weight:</strong> {worker.height_cm || "—"}cm
                    / {worker.weight_kg || "—"}kg
                  </p>
                </section>
              </div>
              {/* PASSPORT */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>PASSPORT</h3>

                <p>
                  <strong>No:</strong> {worker.passport_number || "—"}
                </p>
                <p>
                  <strong>Issued:</strong>{" "}
                  {safeDate(worker.passport_issue_date)}
                </p>
                <p>
                  <strong>Expires:</strong>{" "}
                  {safeDate(worker.passport_expiry_date)}
                </p>

                {/* Passport Scan Image */}
                {worker.passport_scan_url && (
                  <div className={styles.passportImageWrapper}>
                    <img
                      src={worker.passport_scan_url}
                      alt="Passport Scan"
                      className={styles.passportImage}
                    />
                  </div>
                )}
              </section>

              {/* MEDICAL */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>MEDICAL</h3>
                <p>
                  <strong>Status:</strong> {worker.medical_status || "—"}
                </p>
                <p>
                  <strong>Center:</strong> {worker.medical_center || "—"}
                </p>
                <p>
                  <strong>Date:</strong> {safeDate(worker.medical_issue_date)}
                </p>
              </section>
              {/* COC */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>COC</h3>
                <p>
                  <strong>No:</strong> {worker.coc_number || "—"}
                </p>
                <p>
                  <strong>Issued:</strong> {safeDate(worker.coc_issue_date)}
                </p>
                <p>
                  <strong>Expires:</strong> {safeDate(worker.coc_expiry_date)}
                </p>
              </section>
              {/* LANGUAGES */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>LANGUAGES</h3>
                <ul className={styles.list}>
                  {worker.languages?.map((l, i) => (
                    <li key={i}>
                      {l.language} —{" "}
                      <span className={styles.level}>{l.level}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* SKILLS */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>SKILLS</h3>
                <ul className={styles.list}>
                  {worker.skills?.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </section>
            </div>

            {/* RIGHT */}
            <div className={styles.rightColumn}>
              <div className={styles.topLeftGroup}>
                <div className={styles.photoWrapper}>
                  <img
                    src={worker.photo_standing_url}
                    className={styles.standingPhoto}
                  />
                </div>
              </div>
              {/* VISA */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>VISA</h3>
                <p>
                  <strong>No:</strong> {worker.visa_number || "—"}
                </p>
                <p>
                  <strong>Issued:</strong> {safeDate(worker.visa_issue_date)}
                </p>
                <p>
                  <strong>Expires:</strong> {safeDate(worker.visa_expiry_date)}
                </p>
              </section>

              {/* CONTRACT */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>CONTRACT</h3>
                <p>
                  <strong>Employer:</strong> {worker.employer_name_en || "—"}
                </p>
                <p>
                  <strong>Arabic:</strong> {worker.employer_name_ar || "—"}
                </p>
                <p>
                  <strong>Salary:</strong> {worker.monthly_salary || "—"}
                </p>
                <p>
                  <strong>Period:</strong>{" "}
                  {safeDate(worker.contract_start_date)} -{" "}
                  {safeDate(worker.contract_end_date)}
                </p>
              </section>

              {/* TRAVEL */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>TRAVEL</h3>
                <p>
                  <strong>Ticket:</strong> {worker.ticket_number || "—"}
                </p>
                <p>
                  <strong>Date:</strong> {safeDate(worker.departure_date)}
                </p>
              </section>

              {/* EXPERIENCE */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>EXPERIENCE</h3>
                {worker.experience?.map((exp, i) => (
                  <p key={i}>
                    {exp.job_title} - {exp.country} ({exp.years} yrs)
                  </p>
                ))}
              </section>

              {/* GUARANTOR */}
              <section className={`mb-2 ${styles.section}`}>
                <h3 className={styles.sectionTitle}>EMERGENCY CONTACT</h3>
                <p>
                  <strong>Name:</strong> {worker.guarantor_name || "—"}
                </p>
                <p>
                  <strong>Relation:</strong> {worker.guarantor_relation || "—"}
                </p>
                <p>
                  <strong>Phone:</strong> {worker.guarantor_phone_number || "—"}
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CV;
