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
import cvHeader from "../../../../../../assets/img/cv/cv-header.png";

const safeDate = (d) => (d ? d.slice(0, 10) : "");

/* ── shared style tokens ── */
const GOLD = "#7a5c1e";
const FONT = "'Times New Roman', Times, serif";

const css = {
  enLabel: {
    padding: "2px 6px",
    fontWeight: "bold",
    fontStyle: "italic",
    fontSize: 14,
    borderRight: "1px solid #000",
  },
  enValue: {
    padding: "2px 6px",
    fontStyle: "italic",
    fontSize: 12,
    borderRight: "1px solid #000",
  },
  enValueBold: {
    padding: "2px 6px",
    fontWeight: "bold",
    fontStyle: "italic",
    fontSize: 12,
    borderRight: "1px solid #000",
  },
  arLabel: {
    padding: "2px 6px",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "right",
    direction: "rtl",
  },
  arLabelBold: {
    padding: "2px 6px",
    fontWeight: "bold",
    fontStyle: "italic",
    fontSize: 14,
    textAlign: "right",
    direction: "rtl",
  },
  goldBar: {
    background: GOLD,
    color: "#fff",
    fontSize: 15,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    borderBottom: "1px solid #000",
  },
  goldLeft: {
    padding: "2.5px 8px",
    fontWeight: "bold",
    fontStyle: "italic",
    fontSize: 15,
  },
  goldRight: {
    padding: "2.5px 8px",
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "right",
    direction: "rtl",
  },
  td: {
    border: "1px solid #000",
    padding: "3px 7px",
    fontSize: 14,
    fontFamily: FONT,
    fontWeight: "bold",
    verticalAlign: "middle",
  },
  tdGoldHeader: {
    padding: "4px 7px",
    fontSize: 15,
    fontFamily: FONT,
    fontWeight: "bold",
    fontStyle: "italic",
    background: GOLD,
    color: "#fff",
    textAlign: "center",
    verticalAlign: "middle",
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

/**
 * @param {React.ReactNode} [templateSwitcher] - optional toggle control rendered
 *   in the toolbar next to the action button. Passed down by the parent CV page
 *   so the same switcher works for every template without each one knowing
 *   about the others.
 */
const CVOne = ({ templateSwitcher }) => {
  const { id } = useParams();
  const cvRef = useRef(null);
  const passportRef = useRef(null);
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { profile } = useProfile();

  const fetchWorkerData = useCallback(async () => {
    showLoader();
    try {
      const res = await getWorkerCVData(id ?? profile.id);
      console.log("raw res:", res);
      console.log("res.data:", res.data);
      setWorker(res.data);
    } catch (e) {
      console.error("fetch error:", e);
    } finally {
      hideLoader();
    }
  }, [id, profile]);

  useEffect(() => {
    fetchWorkerData();
  }, [profile]);

  const handleGenerateAndUpload = async () => {
    if (!cvRef.current) return;
    showLoader();
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();

      // ── PAGE 1: CV ──
      const el = cvRef.current;
      const ow = el.style.width;
      el.style.width = "760px";
      await new Promise((r) => setTimeout(r, 300));
      const canvas1 = await html2canvas(el, {
        useCORS: true,
        scale: 2,
        windowWidth: 760,
      });
      el.style.width = ow;

      const img1 = canvas1.toDataURL("image/jpeg", 0.95);
      const img1H = (canvas1.height * pw) / canvas1.width;
      if (img1H <= ph) {
        pdf.addImage(img1, "JPEG", 0, 0, pw, img1H);
      } else {
        const scale = ph / img1H;
        const scaledW = pw * scale;
        pdf.addImage(img1, "JPEG", (pw - scaledW) / 2, 0, scaledW, ph);
      }

      // ── PAGE 2: Passport ──
      if (passportRef.current) {
        pdf.addPage();
        const el2 = passportRef.current;
        const ow2 = el2.style.width;
        el2.style.width = "760px";
        await new Promise((r) => setTimeout(r, 300));
        const canvas2 = await html2canvas(el2, {
          useCORS: true,
          scale: 2,
          windowWidth: 760,
        });
        el2.style.width = ow2;

        const img2 = canvas2.toDataURL("image/jpeg", 0.95);
        const img2H = (canvas2.height * pw) / canvas2.width;
        if (img2H <= ph) {
          pdf.addImage(img2, "JPEG", 0, 0, pw, img2H);
        } else {
          const scale = ph / img2H;
          const scaledW = pw * scale;
          pdf.addImage(img2, "JPEG", (pw - scaledW) / 2, 0, scaledW, ph);
        }
      }

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
    } catch (e) {
      console.error(e);
      addMessage(false, "Failed to generate PDF");
    } finally {
      hideLoader();
    }
  };

  console.log("worker state:", worker);
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
  const age = worker.date_of_birth
    ? String(
        new Date().getFullYear() - new Date(worker.date_of_birth).getFullYear(),
      )
    : "";
  const addr = (worker.address ?? "").toUpperCase();
  const marital = worker.marital_status ?? "";
  const children = String(worker.number_of_children ?? "");
  const height = worker.height_cm ? `${worker.height_cm} cm` : "";
  const weight = worker.weight_kg ? `${worker.weight_kg} kg` : "";
  const lang =
    worker.languages?.map((l) => l.language ?? l.name).join(", ") ?? "";
  const edu = (worker.education ?? "").toUpperCase();
  const expP = worker.experience?.[0]?.years
    ? `${worker.experience[0].years} yrs`
    : "";
  const expC = worker.experience?.[0]?.country ?? "";
  const ppNo = worker.passport_number ?? "";
  const ppIssue = safeDate(worker.passport_issue_date);
  const ppPlace = worker.passport_issuing_country ?? "";
  const ppExp = safeDate(worker.passport_expiry_date);
  const faceUrl = worker.photo_3x4_url ?? "";
  const bodyUrl = worker.photo_standing_url ?? "";
  const remarks = worker.remarks ?? "";
  const remDate = safeDate(worker.remarks_date);

  const SKILL_DEFS = [
    { en: "Cooking", ar: "الطبخ", key: "Cooking" },
    { en: "Cleaning", ar: "التنظيف", key: "Cleaning" },
    { en: "Washing", ar: "الغسيل", key: "Washing" },
    { en: "Ironing", ar: "الكوي", key: "Ironing" },
    { en: "Babysitting", ar: "مجا لسه الكفال", key: "Babysitting" },
    { en: "Children Care", ar: "رعايه الطفال", key: "Children Care" },
    { en: "Arabic Cooking", ar: "الطبخ العربي", key: "Arabic Cooking" },
    { en: "Sewing", ar: "الخياطه", key: "Sewing" },
  ];

  const workerSkillNames =
    worker.skills?.map((s) => (s.skill_name ?? s.name ?? s).toLowerCase()) ??
    [];

  const skills = SKILL_DEFS.map((s) => ({
    en: s.en,
    ar: s.ar,
    v: workerSkillNames.includes(s.key.toLowerCase()) ? "YES" : "NO",
  }));

  /* ── root CV style ── */
  const cvStyle = {
    width: 760,
    minWidth: 760,
    background: "#fff",
    fontFamily: FONT,
    fontSize: 15,
    color: "#000",
  };

  return (
    <div className="dashboard-wraper">
      {/* toolbar */}
      <div className="d-flex justify-content-between align-items-center d-print-none pb-2">
        <h2 className="text-dark mb-2">
          {profile?.role_id != 4 ? "Employee" : "My"} CV
        </h2>
        <div className="d-flex align-items-center gap-2">
          {templateSwitcher}
          {profile?.role_id != 4 && <BackButton onClick={() => navigate(-1)} />}
        </div>
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
        {/* ── PAGE 1: CV ── */}
        <div ref={cvRef} style={cvStyle}>
          {/* HEADER IMAGE */}
          <img
            src={cvHeader}
            alt="CV Header"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              marginBottom: 8,
              boxShadow: "0 0 12px 4px rgba(0,0,0,0.25)",
            }}
          />

          <div style={{ border: "2px solid #000" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                borderTop: "none",
              }}
            >
              <thead>
                <tr>
                  <th
                    colSpan={3}
                    style={{
                      ...css.tdGoldHeader,
                      borderLeft: "none",
                      borderRight: "none",
                    }}
                  >
                    Application for Employment &nbsp;|&nbsp; طلب التوظيف
                  </th>
                  <th
                    style={{
                      ...css.tdGoldHeader,
                      borderRight: "none",
                      borderLeft: "none",
                    }}
                  >
                    {name}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    style={{
                      ...css.td,
                      width: "22%",
                      borderLeft: "none",
                      fontWeight: "bold",
                    }}
                  >
                    Reference No.
                  </td>
                  <td style={{ ...css.td, width: "28%" }}>{ref}</td>
                  <td
                    style={{
                      ...css.td,
                      textAlign: "right",
                      direction: "rtl",
                      width: "22%",
                      borderLeft: "none",
                    }}
                  >
                    رقم المرجع
                  </td>
                  {/* Face photo — rowSpan 4 */}
                  <td
                    rowSpan={4}
                    style={{
                      ...css.td,
                      textAlign: "center",
                      verticalAlign: "middle",
                      width: "28%",
                      height: 160,
                      padding: 0,
                      borderRight: "none",
                      borderTop: "none",
                      borderBottom: "none",
                    }}
                  >
                    {faceUrl ? (
                      <img
                        src={faceUrl}
                        alt="Candidate"
                        style={{
                          width: "100%",
                          height: "160px",
                          objectFit: "cover",
                          display: "block",
                          border: "1px solid #999",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: 160,
                          background: "#ddd",
                          border: "1px solid #999",
                        }}
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      ...css.td,
                      fontWeight: "bold",
                      fontStyle: "italic",
                      borderLeft: "none",
                    }}
                  >
                    Post Applied For
                  </td>
                  <td style={css.td}>{post}</td>
                  <td
                    style={{ ...css.td, textAlign: "right", direction: "rtl" }}
                  >
                    وظيفة
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      ...css.td,
                      fontWeight: "bold",
                      fontStyle: "italic",
                      borderLeft: "none",
                    }}
                  >
                    Monthly Salary
                  </td>
                  <td style={css.td}>{salary}</td>
                  <td
                    style={{
                      ...css.td,
                      textAlign: "right",
                      direction: "rtl",
                      borderLeft: "none",
                    }}
                  >
                    راتب شهري
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      ...css.td,
                      fontWeight: "bold",
                      fontStyle: "italic",
                      borderLeft: "none",
                    }}
                  >
                    Contract Period
                  </td>
                  <td style={css.td}>{contract}</td>
                  <td
                    style={{ ...css.td, textAlign: "right", direction: "rtl" }}
                  >
                    مدة العقد
                  </td>
                </tr>
              </tbody>
            </table>

            {/*  PHONE / NAME BAR */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "180px 1fr",
                marginBottom: "3px",
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
                  background: GOLD,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                }}
              >
                <div style={{ fontWeight: "bold", fontSize: 15 }}>{name}</div>
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
              </div>
            </div>

            {/*  MAIN 2-COL: Details LEFT  |  Passport RIGHT */}
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
                <Row3
                  label="Place of Birth"
                  value={pob}
                  arLabel="مكان الولاده"
                />
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

              {/*  RIGHT: Passport Detail + standing photo */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                }}
              >
                <GoldBar en="Passport Detail" ar="تفاصيل جواز" />
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

                {/* Standing / full-body photo — fills remaining space */}
                <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
                  {bodyUrl ? (
                    <img
                      src={bodyUrl}
                      alt="full body"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        border: "1px solid #999",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        minHeight: 200,
                        background: "#ddd",
                        border: "1px solid #999",
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
            {/* end main 2-col */}

            {/*  REMARKS */}
            <div
              style={{
                padding: "3px 10px",
                display: "flex",
                gap: 20,
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontWeight: "bold",
                  fontStyle: "italic",
                  fontSize: 11,
                }}
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
        {/* end PAGE 1 */}

        {/* ── PAGE 2: Passport Scan ── */}
        <div
          ref={passportRef}
          style={{
            width: 760,
            minWidth: 760,
            marginTop: 24,
            background: "#fff",
            fontFamily: FONT,
          }}
        >
          <div
            style={{
              textAlign: "center",
              fontSize: 11,
              color: "#999",
              marginBottom: 6,
              fontStyle: "italic",
            }}
          >
            — Page 2 —
          </div>

          <div
            style={{
              background: "#fff",
              border: "2px solid #000",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: 12,
            }}
          >
            {worker.passport_scan_url ? (
              <img
                src={worker.passport_scan_url}
                alt="Passport Scan"
                crossOrigin="anonymous"
                style={{
                  width: "100%",
                  maxHeight: 500,
                  objectFit: "contain",
                  border: "1px solid #999",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: 400,
                  background: "#ddd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  color: "#999",
                  fontStyle: "italic",
                }}
              >
                No passport scan available
              </div>
            )}
          </div>
        </div>
        {/* end PAGE 2 */}
      </div>
      {/* end scroll wrapper */}
    </div>
  );
};

export default CVOne;
