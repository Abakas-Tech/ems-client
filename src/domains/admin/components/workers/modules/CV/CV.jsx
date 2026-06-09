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

const safeDate = (d) => (d ? d.slice(0, 10) : "");

/* ── shared style objects (inline = html2canvas safe) ── */
const GOLD = "#7a5c1e";
const FONT = "'Times New Roman', Times, serif";

const css = {
  enLabel: {
    padding: "2px 6px",
    fontWeight: "bold",
    fontStyle: "italic",
    fontSize: 11,
    borderRight: "1px solid #000",
  },
  enValue: {
    padding: "2px 6px",
    fontStyle: "italic",
    fontSize: 11,
    borderRight: "1px solid #000",
  },
  enValueBold: {
    padding: "2px 6px",
    fontWeight: "bold",
    fontStyle: "italic",
    fontSize: 11,
    borderRight: "1px solid #000",
  },
  arLabel: {
    padding: "2px 6px",
    fontSize: 11,
    textAlign: "right",
    direction: "rtl",
  },
  arLabelBold: {
    padding: "2px 6px",
    fontWeight: "bold",
    fontStyle: "italic",
    fontSize: 11,
    textAlign: "right",
    direction: "rtl",
  },
  goldBar: {
    background: GOLD,
    color: "#fff",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    borderBottom: "1px solid #000",
  },
  goldLeft: {
    padding: "2.5px 8px",
    fontWeight: "bold",
    fontStyle: "italic",
    fontSize: 11.5,
    borderRight: "1px solid rgba(255,255,255,0.3)",
  },
  goldRight: {
    padding: "2.5px 8px",
    fontWeight: "bold",
    fontSize: 11.5,
    textAlign: "right",
    direction: "rtl",
  },
};

/* Gold bilingual section bar */
const GoldBar = ({ en, ar }) => (
  <div style={css.goldBar}>
    <div style={css.goldLeft}>{en}</div>
    <div style={css.goldRight}>{ar}</div>
  </div>
);

/* Row: EN-label | EN-value | AR-label  (3 equal columns) */
const Row3 = ({
  label,
  value,
  arLabel,
  boldValue,
  last,
  cols = "110px 100px 1fr",
}) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: cols,
      ...(last ? {} : { borderBottom: "1px solid #000" }),
    }}
  >
    <div style={css.enLabel}>{label}</div>
    <div style={boldValue ? css.enValueBold : css.enValue}>{value ?? ""}</div>
    <div style={css.arLabel}>{arLabel}</div>
  </div>
);

/* Row: EN-label | EN-value | AR-label  for job-info top block (centered value) */
const JobRow = ({ label, value, arLabel, last }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      ...(last ? {} : { borderBottom: "1px solid #000" }),
    }}
  >
    <div style={css.enLabel}>{label}</div>
    <div style={{ ...css.enValueBold, textAlign: "center" }}>{value ?? ""}</div>
    <div style={css.arLabel}>{arLabel}</div>
  </div>
);

/* Skill row: EN | YES/NO | AR  — all bold italic */
const SkillRow = ({ en, value, ar, last }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "110px 80px 1fr",
      ...(last ? {} : { borderBottom: "1px solid #000" }),
    }}
  >
    <div style={css.enLabel}>{en}</div>
    <div style={{ ...css.enValueBold, textAlign: "center" }}>{value}</div>
    <div style={css.arLabelBold}>{ar}</div>
  </div>
);

/* ════════════════════════════════════════════════ */
const CV = () => {
  const { id } = useParams();
  const cvRef = useRef(null);
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { profile } = useProfile();

  const fetchWorkerData = useCallback(async () => {
    showLoader();
    try {
      const { data } = await getWorkerCVData(id ?? profile.id);
      setWorker(data);
    } catch (e) {
      console.error(e);
    } finally {
      hideLoader();
    }
  }, [id || profile]);

  useEffect(() => {
    fetchWorkerData();
  }, [profile]);

  const handleGenerateAndUpload = async () => {
    if (!cvRef.current) return;
    showLoader();
    try {
      const el = cvRef.current;
      const ow = el.style.width;
      el.style.width = "1200px";
      await new Promise((r) => setTimeout(r, 300));
      const canvas = await html2canvas(el, {
        useCORS: true,
        scale: 2,
        windowWidth: 1200,
      });
      el.style.width = ow;

      const pdf = new jsPDF("p", "mm", "a4");
      const pw = pdf.internal.pageSize.getWidth();
      pdf.addImage(
        canvas.toDataURL("image/jpeg", 0.9),
        "JPEG",
        0,
        0,
        pw,
        (canvas.height * pw) / canvas.width,
        undefined,
        "FAST",
      );

      const blob = pdf.output("blob");
      const name = `${worker.full_name.replace(/\s+/g, "_")}_CV`;
      const file = new File([blob], name + ".pdf", { type: "application/pdf" });
      const fd = new FormData();
      fd.append("file", file);
      fd.append("file_name", name);
      fd.append("category", "CV");
      fd.append("is_private", 0);
      fd.append("description", `CV for ${worker.full_name}`);
      fd.append("worker_id", worker.id);
      await uploadFile(fd);
      addMessage(
        true,
        "CV " +
          (worker.cv_url ? "updated" : "generated") +
          " and uploaded successfully!",
      );
    } catch {
      addMessage(false, "Failed to generate PDF");
    } finally {
      hideLoader();
    }
  };

  if (!worker) return null;

  /* ── field mapping ── */
  const ref = worker.reference_number ?? "";
  const post = worker.primary_positions?.[0] ?? "House Maid";
  const postAr = worker.primary_positions_ar?.[0] ?? "عاملة منزلية";
  const salary = worker.monthly_salary ? `${worker.monthly_salary} SR` : "";
  const contract = worker.contract_period ?? "2 Years";
  const phone = worker.phone_number ?? "";
  const name = (worker.full_name ?? "").toUpperCase();
  const nat = worker.nationality ?? "";
  const rel = worker.religion ?? "";
  const dob = safeDate(worker.date_of_birth);
  const pob = (worker.place_of_birth ?? "").toUpperCase();
  const age = String(worker.age ?? "");
  const addr = (worker.address ?? "").toUpperCase();
  const marital = worker.marital_status ?? "";
  const children = String(worker.number_of_children ?? "");
  const height = worker.height_cm ? `${worker.height_cm} cm` : "";
  const weight = worker.weight_kg ? `${worker.weight_kg} kg` : "";
  const lang = worker.languages?.map((l) => l.language).join(", ") ?? "";
  const edu = (worker.education_level ?? "").toUpperCase();
  const expP = worker.experience?.[0]?.years
    ? `${worker.experience[0].years} yrs`
    : "";
  const expC = worker.experience?.[0]?.country ?? "";
  const ppNo = worker.passport_number ?? "";
  const ppIssue = safeDate(worker.passport_issue_date);
  const ppPlace = worker.passport_place_of_issue ?? "";
  const ppExp = safeDate(worker.passport_expiry_date);
  const faceUrl = worker.photo_3x4_url ?? "";
  const bodyUrl = worker.photo_standing_url ?? "";
  const remarks = worker.remarks ?? "";
  const remDate = safeDate(worker.remarks_date);

  const skills = [
    { en: "Cooking", ar: "الطبخ", v: worker.can_cook ? "YES" : "" },
    { en: "Cleaning", ar: "التنظيف", v: worker.can_clean ? "YES" : "NO" },
    { en: "Washing", ar: "الغسيل", v: worker.can_wash ? "YES" : "NO" },
    { en: "Ironing", ar: "الكوي", v: worker.can_iron ? "YES" : "NO" },
    {
      en: "Babysitting",
      ar: "مجا لسه الكفال",
      v: worker.can_babysit ? "YES" : "NO",
    },
    {
      en: "Children Care",
      ar: "رعايه الطفال",
      v: worker.can_childcare ? "YES" : "NO",
    },
    {
      en: "Arabic Cooking",
      ar: "الطبخ العربي",
      v: worker.can_arabic_cook ? "YES" : "NO",
    },
    { en: "Sewing", ar: "الخياطه", v: worker.can_sew ? "YES" : "NO" },
  ];

  /* ── root cv style ── */
  const cvStyle = {
    width: 760,
    minWidth: 760,
    background: "#fff",
    border: "2px solid #000",
    fontFamily: FONT,
    fontSize: 11,
    color: "#000",
  };

  return (
    <div className="dashboard-wraper">
      {/* toolbar */}
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

      {/* horizontal scroll so mobile doesn't break */}
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <div ref={cvRef} style={cvStyle}>
          {/* ════════ HEADER ════════ */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderBottom: "2px solid #000",
              padding: "8px 12px",
              gap: 10,
            }}
          >
            {/* Logo block */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                width: 105,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 85,
                  height: 78,
                  border: "2px solid " + GOLD,
                  borderRadius: 4,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 4,
                }}
              >
                <div style={{ fontSize: 22, color: GOLD }}>🕌</div>
                <div
                  style={{
                    fontSize: 5.5,
                    color: GOLD,
                    fontWeight: "bold",
                    textAlign: "center",
                    lineHeight: 1.35,
                  }}
                >
                  شركة أبو بجاد للإستقدام
                </div>
              </div>
              <div
                style={{
                  fontSize: 6.5,
                  color: GOLD,
                  fontWeight: "bold",
                  textAlign: "center",
                  lineHeight: 1.3,
                }}
              >
                شركة أبو بجاد للإستقدام
                <br />
                Abo Bejad Recuitments Company
              </div>
            </div>

            {/* Titles */}
            <div style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  color: GOLD,
                  lineHeight: 1.1,
                }}
              >
                شركة أبو بجاد للإستقدام
              </div>
              <div style={{ fontSize: 16, fontWeight: "bold", color: GOLD }}>
                Abo Bejad Receuitments Company
              </div>
            </div>

            {/* Face photo */}
            <div style={{ flexShrink: 0 }}>
              {faceUrl ? (
                <img
                  src={faceUrl}
                  alt="face"
                  style={{
                    width: 88,
                    height: 108,
                    objectFit: "cover",
                    border: "1px solid #999",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 88,
                    height: 108,
                    background: "#ddd",
                    border: "1px solid #999",
                  }}
                />
              )}
            </div>
          </div>

          {/* ════════ JOB INFO BLOCK ════════
            Layout: [label | centered-value | AR-label]  in left ~2/3
                    face photo already shown above in header
            The photo in the PDF is actually OUTSIDE the table to the right
            and sits next to rows 1-4. We replicate by having the job block
            take full width (photo is in header above).
        ════════ */}
          <div
            style={{
              borderBottom: "1px solid #000",
              borderTop: "2px solid #000",
            }}
          >
            {/* Gold title spans full width */}
            <div
              style={{
                background: GOLD,
                color: "#fff",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                borderBottom: "1px solid #000",
              }}
            >
              <div
                style={{
                  padding: "3px 10px",
                  fontWeight: "bold",
                  fontStyle: "italic",
                  fontSize: 12,
                  textAlign: "center",
                  borderRight: "1px solid rgba(255,255,255,0.3)",
                }}
              >
                Application for Employment
              </div>
              <div
                style={{
                  padding: "3px 10px",
                  fontWeight: "bold",
                  fontSize: 12,
                  textAlign: "center",
                  direction: "rtl",
                }}
              >
                طلب التوظيف
              </div>
            </div>
            <JobRow label="Reference No." value={ref} arLabel="رقم المرجع" />
            <JobRow label="Post Applied For" value={post} arLabel="وظيفة" />
            <JobRow label="Monthly Salary" value={salary} arLabel="راتب شهري" />
            <JobRow
              label="Contract Period"
              value={contract}
              arLabel="مدة العقد"
              last
            />
          </div>

          {/* ════════ PHONE / NAME ════════ */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "130px 1fr 100px",
              borderBottom: "1px solid #000",
            }}
          >
            <div
              style={{
                padding: "4px 8px",
                fontWeight: "bold",
                fontSize: 12,
                borderRight: "1px solid #000",
                display: "flex",
                alignItems: "center",
              }}
            >
              PHONE NO:
              <span style={{ fontWeight: "normal", marginLeft: 4 }}>
                {phone}
              </span>
            </div>
            <div
              style={{
                padding: "4px 8px",
                borderRight: "1px solid #000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: 12,
                  fontStyle: "italic",
                  direction: "rtl",
                }}
              >
                اسم العامله :
              </div>
              <div style={{ fontWeight: "bold", fontSize: 13 }}>{name}</div>
            </div>
            <div style={{ padding: "4px 8px" }} />
          </div>

          {/* ════════ MAIN 2-COL: Details LEFT  |  Passport RIGHT ════════ */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              borderBottom: "1px solid #000",
            }}
          >
            {/* ── LEFT: Details of Applicant ── */}
            <div style={{ borderRight: "2px solid #000" }}>
              <GoldBar en="Details of Applicant" ar="بيانات الطلب" />
              <Row3 label="Nationality" value={nat} arLabel="الجنسيه" />
              <Row3 label="Religion" value={rel} arLabel="الديانه" />
              <Row3 label="Date of Birth" value={dob} arLabel="التاريخ" />
              <Row3 label="Place of Birth" value={pob} arLabel="مكان الولاده" />
              <Row3 label="Age" value={age} arLabel="العمر" />
              <Row3 label="Address" value={addr} arLabel="العنوان" />
              <Row3 label="Marital Status" value={marital} arLabel="الحاله" />
              <Row3
                label="No. of Children"
                value={children}
                arLabel="عدد الاطفال"
              />
              <Row3 label="Height" value={height} arLabel="ارتفاع" />
              <Row3 label="Weight" value={weight} arLabel="وزن" />

              <GoldBar en="Languages & Education" ar="اللغه & التعليم" />
              {/* Language of worker — split 2-line label */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 130px 1fr",
                  borderBottom: "1px solid #000",
                }}
              >
                <div
                  style={{
                    padding: "2px 6px",
                    fontWeight: "bold",
                    fontStyle: "italic",
                    fontSize: 11,
                    borderRight: "1px solid #000",
                    lineHeight: 1.5,
                  }}
                >
                  Language of
                  <br />
                  worker
                </div>
                <div
                  style={{
                    padding: "2px 6px",
                    fontWeight: "bold",
                    fontStyle: "italic",
                    fontSize: 11,
                    borderRight: "1px solid #000",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {lang}
                </div>
                <div
                  style={{
                    padding: "2px 6px",
                    fontSize: 11,
                    textAlign: "right",
                    direction: "rtl",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  العاملة لغة
                </div>
              </div>
              <Row3
                label="Education"
                value={edu}
                arLabel="المستوي التعليمي"
                boldValue
              />

              <GoldBar en="Work Experience" ar="خبره العمل" />
              <Row3 label="Period" value={expP} arLabel="المده" />
              <Row3 label="Country" value={expC} arLabel="البلد" />

              <GoldBar en="Skills & Experience" ar="الخبره & المهارات" />
              {skills.map((s, i) => (
                <SkillRow
                  key={i}
                  en={s.en}
                  value={s.v}
                  ar={s.ar}
                  last={i === skills.length - 1}
                />
              ))}
            </div>

            {/* ── RIGHT: Passport Detail + standing photo ── */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <GoldBar en="Passport Detail" ar="تفاصيل جواز" />
              {/* passport rows: EN-label | EN-value | AR-label */}
              <Row3
                label="Passport No."
                value={ppNo}
                arLabel="رقيم الجواز"
                boldValue
                cols="100px 110px 1fr"
              />
              <Row3
                label="Issue Date"
                value={ppIssue}
                arLabel="تاريخ الإصدار"
                cols="100px 110px 1fr"
              />
              <Row3
                label="Place of Issue"
                value={ppPlace}
                arLabel="مكان الاصدار"
                cols="100px 110px 1fr"
              />
              <Row3
                label="Expiry Date"
                value={ppExp}
                arLabel="تاريخ الانتهاء"
                cols="100px 110px 1fr"
              />

              {/* Standing / full-body photo */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 10,
                }}
              >
                {bodyUrl ? (
                  <img
                    src={bodyUrl}
                    alt="full body"
                    style={{ width: 160, height: 230, objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: 160,
                      height: 230,
                      background: "#ddd",
                      border: "1px solid #999",
                    }}
                  />
                )}
              </div>
            </div>
          </div>
          {/* end main 2-col */}

          {/* ════════ REMARKS ════════ */}
          <div
            style={{
              padding: "3px 10px",
              display: "flex",
              gap: 20,
              alignItems: "center",
            }}
          >
            <span
              style={{ fontWeight: "bold", fontStyle: "italic", fontSize: 11 }}
            >
              Remarks
            </span>
            <span style={{ color: GOLD, fontWeight: "bold", fontSize: 12 }}>
              {remarks}
            </span>
            <span style={{ color: GOLD, fontWeight: "bold", fontSize: 12 }}>
              {remDate}
            </span>
          </div>
        </div>
      </div>
      {/* end scroll wrapper */}
    </div>
  );
};

export default CV;
