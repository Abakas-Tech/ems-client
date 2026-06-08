import React, { useState, useEffect, useCallback, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { getWorkerCVData } from "../../../../api/worker.api";
import BackButton from "../../../../../../shared/components/BackButton/BackButton";
import { useParams, useNavigate } from "react-router-dom";
import useLoader from "../../../../../../context/Loader/useLoader";
import { uploadFile } from "../../../../api/file.api";
import useResponse from "../../../../../../context/Response/useResponse";
import useProfile from "../../../../../../context/Profile/useProfile";
import styles from "./CV.module.css";

/* ─── helpers ─── */
const safeDate = (d) => (d ? d.slice(0, 10) : "");
const yesNo = (val) => (val ? "YES" : "NO");

/* ─── Sub-components (keep outside CV to avoid re-mount) ─── */
const KVRow = ({ label, value, noBorder }) => (
  <div className={`${styles.innerRow} ${noBorder ? "" : styles.bb}`}>
    <div className={`${styles.cell} ${styles.br} ${styles.label}`}>{label}</div>
    <div className={`${styles.cell} ${styles.value}`}>{value ?? ""}</div>
  </div>
);

const KVRowAr = ({ label, value, noBorder }) => (
  <div
    className={`${styles.innerRow} ${styles.rtl} ${noBorder ? "" : styles.bb}`}
  >
    <div className={`${styles.cell} ${styles.bl} ${styles.labelAr}`}>
      {label}
    </div>
    <div className={`${styles.cell} ${styles.valueAr}`}>{value ?? ""}</div>
  </div>
);

/* ─── Main Component ─── */
const CV = () => {
  const { id } = useParams();
  const cvRef = useRef(null);
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { profile } = useProfile();

  /* ── fetch ── */
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

  useEffect(() => {
    fetchWorkerData();
  }, [profile]);

  /* ── generate → PDF → upload ── */
  const handleGenerateAndUpload = async () => {
    if (!cvRef.current) return;
    showLoader();
    try {
      const element = cvRef.current;
      const originalWidth = element.style.width;
      element.style.width = "1200px";
      await new Promise((r) => setTimeout(r, 300));

      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: 1.5,
        windowWidth: 1200,
      });

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
      const file = new File([pdfBlob], fileName, { type: "application/pdf" });

      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "file_name",
        `${worker.full_name.replace(/\s+/g, "_")}_CV`,
      );
      formData.append("category", "CV");
      formData.append("is_private", 0);
      formData.append("description", `CV for ${worker.full_name}`);
      formData.append("worker_id", worker.id);

      await uploadFile(formData);
      addMessage(
        true,
        "CV " +
          (worker.cv_url ? "updated" : "generated") +
          " and uploaded successfully!",
      );
    } catch (err) {
      addMessage(false, "Failed to generate PDF");
    } finally {
      hideLoader();
    }
  };

  if (!worker) return null;

  /* ── map worker fields → CV fields ── */
  const refNo = worker.reference_number ?? "—";
  const post = worker.primary_positions?.[0] ?? "House Maid";
  const postAr = worker.primary_positions_ar?.[0] ?? "عاملة منزلية";
  const salary = worker.monthly_salary ? `${worker.monthly_salary} SR` : "—";
  const salaryAr = worker.monthly_salary
    ? `${worker.monthly_salary} ريال`
    : "—";
  const contract = worker.contract_period ?? "2 Years";
  const phone = worker.phone_number ?? "";
  const fullName = worker.full_name ?? "";
  const nationality = worker.nationality ?? "—";
  const religion = worker.religion ?? "—";
  const dob = safeDate(worker.date_of_birth);
  const pob = worker.place_of_birth ?? "—";
  const age = worker.age ?? "—";
  const address = worker.address ?? "—";
  const marital = worker.marital_status ?? "—";
  const children = worker.number_of_children ?? "";
  const height = worker.height_cm ? `${worker.height_cm} cm` : "";
  const weight = worker.weight_kg ? `${worker.weight_kg} kg` : "";
  const language = worker.languages?.map((l) => l.language).join(", ") ?? "—";
  const education = worker.education_level ?? "—";
  const expPeriod = worker.experience?.[0]?.years
    ? `${worker.experience[0].years} yrs`
    : "";
  const expCountry = worker.experience?.[0]?.country ?? "";
  const passportNo = worker.passport_number ?? "—";
  const issueDate = safeDate(worker.passport_issue_date);
  const placeIssue = worker.passport_place_of_issue ?? "—";
  const expiryDate = safeDate(worker.passport_expiry_date);
  const photoUrl = worker.photo_3x4_url ?? "";
  const photoBodyUrl = worker.photo_standing_url ?? "";
  const remarks = worker.remarks ?? "";
  const remarksDate = safeDate(worker.remarks_date);

  /* Fixed skills list — values come from worker fields */
  const skills = [
    { en: "Cooking", ar: "الطبخ", value: worker.can_cook ? "YES" : "NO" },
    { en: "Cleaning", ar: "التنظيف", value: worker.can_clean ? "YES" : "NO" },
    { en: "Washing", ar: "الغسيل", value: worker.can_wash ? "YES" : "NO" },
    { en: "Ironing", ar: "الكوي", value: worker.can_iron ? "YES" : "NO" },
    {
      en: "Babysitting",
      ar: "مجا لسه الكفال",
      value: worker.can_babysit ? "YES" : "NO",
    },
    {
      en: "Children Care",
      ar: "رعايه الطفال",
      value: worker.can_childcare ? "YES" : "NO",
    },
    {
      en: "Arabic Cooking",
      ar: "الطبخ العربي",
      value: worker.can_arabic_cook ? "YES" : "NO",
    },
    { en: "Sewing", ar: "الخياطه", value: worker.can_sew ? "YES" : "NO" },
  ];

  /* Arabic labels that mirror the left column row-for-row */
  const arLabels = [
    "الجنسيه",
    "الديانه",
    "التاريخ",
    "مكان الولاده",
    "العمر",
    "العنوان",
    "الحاله",
    "عدد الاطفال",
    "ارتفاع",
    "وزن",
  ];

  return (
    <div className="dashboard-wraper">
      {/* ── Top bar ── */}
      <div className="d-flex justify-content-between align-items-center d-print-none pb-2">
        <h2 className="text-dark mb-2">
          {profile?.role_id != 4 ? "Employee" : "My"} CV
        </h2>
        {profile?.role_id != 4 && <BackButton onClick={() => navigate(-1)} />}
      </div>

      {profile?.role_id != 4 && (
        <div className="mb-3">
          <button
            className="btn btn-main mt-3 px-4 text-white w-auto d-flex align-items-center justify-content-center"
            onClick={handleGenerateAndUpload}
          >
            {worker.cv_url ? "Update CV" : "Generate & Upload CV"}
          </button>
        </div>
      )}

      {/* ── CV Document ── */}
      <div ref={cvRef} className={styles.cv}>
        {/* HEADER */}
        <div className={styles.cvHeader}>
          <div className={styles.headerLogoLeft}>
            <div className={styles.logoCircle}>
              <span>
                شركة أبو بجاد للإستقدام
                <br />
                <small>Abo Bejad Recuitments Company</small>
              </span>
            </div>
            <div className={styles.logoName}>Abo Bejad Recuitments Company</div>
          </div>
          <div className={styles.headerCenter}>
            <div className={styles.arabicTitle}>شركة أبو بجاد للإستقدام</div>
            <div className={styles.englishTitle}>
              Abo Bejad Receuitments Company
            </div>
          </div>
          <div className={styles.headerPhoto}>
            <img src={photoUrl} alt="Candidate" />
          </div>
        </div>

        {/* APPLICATION TITLE BAR */}
        <div className={`${styles.row2col} ${styles.bb} ${styles.bt}`}>
          <div className={`${styles.col} ${styles.br}`}>
            <div className={styles.sectionTitle}>
              <span>Application for Employment</span>
              <span>طلب التوظيف</span>
            </div>
          </div>
          <div className={styles.col}>
            <div className={`${styles.innerRow} ${styles.metaLabel}`}>
              <div className={`${styles.cell} ${styles.br}`}>رقم المرجع</div>
              <div className={styles.cell}>Reference No.</div>
            </div>
          </div>
        </div>

        {/* REF / POST / SALARY / CONTRACT */}
        <div className={`${styles.row2col} ${styles.bb}`}>
          <div className={`${styles.col} ${styles.br}`}>
            <KVRow label="Reference No." value={refNo} />
            <KVRow label="Post Applied For" value={post} />
            <KVRow label="Monthly Salary" value={salary} />
            <KVRow label="Contract Period" value={contract} noBorder />
          </div>
          <div className={styles.col}>
            <KVRowAr label="رقم المرجع" value={refNo} />
            <KVRowAr label="وظيفة" value={postAr} />
            <KVRowAr label="راتب شهري" value={salaryAr} />
            <KVRowAr label="مدة العقد" value={contract} noBorder />
          </div>
        </div>

        {/* PHONE / NAME */}
        <div className={`${styles.phoneNameRow} ${styles.bb}`}>
          <div className={`${styles.phoneCell} ${styles.br}`}>
            PHONE NO: <span className={styles.phoneValue}>{phone}</span>
          </div>
          <div className={`${styles.nameCell} ${styles.br}`}>
            <div>{fullName}</div>
            <div className={styles.nameAr}>: العامله اسم</div>
          </div>
          <div className={styles.phoneCellAr}>رقم الهاتف</div>
        </div>

        {/* MAIN 3-COLUMN BLOCK */}
        <div className={`${styles.main3col} ${styles.bb}`}>
          {/* ── LEFT: Details of Applicant ── */}
          <div className={`${styles.col} ${styles.br}`}>
            <div className={styles.sectionTitle}>
              <span>Details of Applicant</span>
              <span>بيانات الطلب</span>
            </div>
            <KVRow label="Nationality" value={nationality} />
            <KVRow label="Religion" value={religion} />
            <KVRow label="Date of Birth" value={dob} />
            <KVRow label="Place of Birth" value={pob} />
            <KVRow label="Age" value={age} />
            <KVRow label="Address" value={address} />
            <KVRow label="Marital Status" value={marital} />
            <KVRow label="No. of Children" value={children} />
            <KVRow label="Height" value={height} />
            <KVRow label="Weight" value={weight} />

            <div className={styles.sectionTitle}>
              <span>Languages & Education</span>
              <span>اللغه & التعليم</span>
            </div>
            <div
              className={`${styles.innerRow} ${styles.bb} ${styles.langRow}`}
            >
              <div
                className={`${styles.cell} ${styles.br} ${styles.label}`}
                style={{ lineHeight: 1.4 }}
              >
                Language of
                <br />
                worker
              </div>
              <div className={`${styles.cell} ${styles.value}`}>{language}</div>
            </div>
            <KVRow label="Education" value={education} />

            <div className={styles.sectionTitle}>
              <span>Work Experience</span>
              <span>خبره العمل</span>
            </div>
            <KVRow label="Period" value={expPeriod} />
            <KVRow label="Country" value={expCountry} />

            <div className={styles.sectionTitle}>
              <span>Skills & Experience</span>
              <span>الخبره & المهارات</span>
            </div>
            {skills.map((s, i) => (
              <div
                key={i}
                className={`${styles.skillRow} ${i < skills.length - 1 ? styles.bb : ""}`}
              >
                <div className={styles.skillEn}>{s.en}</div>
                <div className={styles.skillVal}>{s.value}</div>
                <div className={styles.skillArEmpty} />
              </div>
            ))}
          </div>

          {/* ── MIDDLE: Passport + Body Photo ── */}
          <div className={`${styles.col} ${styles.br}`}>
            <div className={styles.sectionTitle}>
              <span>Passport Detail</span>
              <span>تفاصيل جواز</span>
            </div>
            <KVRow label="Passport No." value={passportNo} />
            <KVRow label="Issue Date" value={issueDate} />
            <KVRow label="Place of Issue" value={placeIssue} />
            <KVRow label="Expiry Date" value={expiryDate} noBorder />

            <div className={`${styles.passportArBlock} ${styles.bb}`}>
              <KVRowAr label="رقيم الجواز" value={passportNo} />
              <KVRowAr label="تاريخ الإصدار" value={issueDate} />
              <KVRowAr label="مكان الاصدار" value={placeIssue} />
              <KVRowAr label="تاريخ الانتهاء" value={expiryDate} noBorder />
            </div>

            <div className={styles.bodyPhotoWrap}>
              <img
                src={photoBodyUrl}
                alt="Full body"
                className={styles.bodyPhoto}
              />
            </div>
          </div>

          {/* ── RIGHT: Arabic labels column ── */}
          <div className={`${styles.col} ${styles.arLabelsCol}`}>
            <div className={styles.sectionTitleAr}>بيانات الطلب</div>
            {arLabels.map((ar, i) => (
              <div key={i} className={`${styles.arLabelCell} ${styles.bb}`}>
                {ar}
              </div>
            ))}
            <div className={styles.sectionTitleAr}>اللغه & التعليم</div>
            <div
              className={`${styles.arLabelCell} ${styles.bb} ${styles.arLangCell}`}
            >
              العاملة لغة
            </div>
            <div className={`${styles.arLabelCell} ${styles.bb}`}>
              المستوي التعليمي
            </div>
            <div className={styles.sectionTitleAr}>خبره العمل</div>
            <div className={`${styles.arLabelCell} ${styles.bb}`}>المده</div>
            <div className={`${styles.arLabelCell} ${styles.bb}`}>البلد</div>
            <div className={styles.sectionTitleAr}>الخبره & المهارات</div>
            {skills.map((s, i) => (
              <div
                key={i}
                className={`${styles.arLabelCell} ${i < skills.length - 1 ? styles.bb : ""}`}
              >
                {s.ar}
              </div>
            ))}
          </div>
        </div>

        {/* REMARKS */}
        <div className={styles.remarksRow}>
          <span className={styles.remarksLabel}>Remarks</span>
          <span className={styles.remarksValue}>{remarks}</span>
          <span className={styles.remarksDate}>{remarksDate}</span>
        </div>
      </div>
    </div>
  );
};

export default CV;
