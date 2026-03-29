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

const safeDate = (d) => (d ? d.slice(0, 10) : "-");

const CV = () => {
  const { id } = useParams();
  const cvRef = useRef(null); // Create a reference
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const fetchWorkerData = useCallback(async () => {
    showLoader();
    try {
      const { data } = await getWorkerCVData(id);
      setWorker(data);
    } catch (err) {
      console.error(err);
    } finally {
      hideLoader();
    }
  }, [id, showLoader, hideLoader]);

  const handleGenerateAndUpload = async () => {
    if (!cvRef.current) return;

    showLoader();
    try {
      // 1. Capture at a lower scale (1.5 instead of 2)
      const canvas = await html2canvas(cvRef.current, {
        useCORS: true,
        scale: 1.5, // Reduced from 2 to save space
      });

      // 2. Use JPEG instead of PNG (JPEG is much smaller for photos)
      // 0.7 is the quality (70%). Adjust this if it's still too large.
      const imgData = canvas.toDataURL("image/jpeg", 0.7);

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // 3. Use 'FAST' compression in jsPDF
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

      // Check size in console to debug
      console.log(
        "Final PDF Size:",
        (pdfBlob.size / 1024 / 1024).toFixed(2),
        "MB",
      );

      const file = new File([pdfBlob], fileName, { type: "application/pdf" });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("file_name", fileName);
      formData.append("category", "CV");
      formData.append("is_private", 0);
      formData.append("description", `CV for ${worker.full_name} Generated`);
      formData.append("worker_id", worker.id);

      await uploadFile(formData);
      addMessage(true, "CV generated and uploaded successfully!");
    } catch (err) {
      addMessage(false, "Failed to generate PDF");
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchWorkerData();
  }, []);

  if (!worker) return null;

  return (
    <div className="dashboard-wraper">
      <div className="d-flex justify-content-between align-items-center d-print-none">
        <h2 className="text-dark mb-0">Worker CV</h2>
        <BackButton onClick={() => navigate(-1)} />
      </div>
      <div className=" d-flex justify-content-end">
        <button
          className="btn btn-main mt-3 px-2 text-white w-45 d-flex align-items-center justify-content-center "
          onClick={handleGenerateAndUpload}
        >
          Generate & Upload
        </button>
      </div>

      <div ref={cvRef} className="card border-0 shadow-sm overflow-hidden">
        <div className="card-body p-0 pt-4 ">
          {/* HEADER */}
          <div className={styles.header}>
            <img src={worker.photo_3x4_url} className={styles.circularPhoto} />
            <div>
              <h1 className={styles.name}>{worker.full_name}</h1>
              <p className={styles.title}>
                {worker.primary_positions?.join(" • ") || "DOMESTIC WORKER"}
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
                  <h3 className={styles.sectionTitle}>CONTACT</h3>
                  <p>📞 {worker.phone_number || "-"}</p>
                  <p>✉️ {worker.email || "-"}</p>
                  <p>
                    📍 {worker.address || "-"} {worker.city_name || ""}{" "}
                    {worker.region_name || ""}
                  </p>
                </section>

                {/* PERSONAL */}
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>PERSONAL INFO</h3>
                  <p>
                    <strong>DOB:</strong> {safeDate(worker.date_of_birth)}
                  </p>
                  <p>
                    <strong>Place:</strong> {worker.place_of_birth || "-"}
                  </p>
                  <p>
                    <strong>Nationality:</strong> {worker.nationality || "-"}
                  </p>
                  <p>
                    <strong>Sex:</strong> {worker.sex || "-"}
                  </p>
                  <p>
                    <strong>Religion:</strong> {worker.religion || "-"}
                  </p>
                  <p>
                    <strong>Status:</strong> {worker.marital_status || "-"}
                  </p>
                  <p>
                    <strong>Height/Weight:</strong> {worker.height_cm || "-"}cm
                    / {worker.weight_kg || "-"}kg
                  </p>
                </section>
              </div>
              {/* PASSPORT */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>PASSPORT</h3>
                <p>
                  <strong>No:</strong> {worker.passport_number || "-"}
                </p>
                <p>
                  <strong>Issued:</strong>{" "}
                  {safeDate(worker.passport_issue_date)}
                </p>
                <p>
                  <strong>Expires:</strong>{" "}
                  {safeDate(worker.passport_expiry_date)}
                </p>
              </section>

              {/* MEDICAL */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>MEDICAL</h3>
                <p>
                  <strong>Status:</strong> {worker.medical_status || "-"}
                </p>
                <p>
                  <strong>Center:</strong> {worker.medical_center || "-"}
                </p>
                <p>
                  <strong>Date:</strong> {safeDate(worker.medical_issue_date)}
                </p>
              </section>
              {/* COC */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>COC</h3>
                <p>
                  <strong>No:</strong> {worker.coc_number || "-"}
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
                  <strong>No:</strong> {worker.visa_number || "-"}
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
                  <strong>Employer:</strong> {worker.employer_name_en || "-"}
                </p>
                <p>
                  <strong>Arabic:</strong> {worker.employer_name_ar || "-"}
                </p>
                <p>
                  <strong>Salary:</strong> {worker.monthly_salary || "-"}
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
                  <strong>Ticket:</strong> {worker.ticket_number || "-"}
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
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>GUARANTOR</h3>
                <p>
                  <strong>Name:</strong> {worker.guarantor_name || "-"}
                </p>
                <p>
                  <strong>Relation:</strong> {worker.guarantor_relation || "-"}
                </p>
                <p>
                  <strong>Phone:</strong> {worker.guarantor_phone_number || "-"}
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
