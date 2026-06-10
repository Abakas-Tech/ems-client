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
    // borderRight: "1px solid rgba(255,255,255,0.3)",
  },
  goldRight: {
    padding: "2.5px 8px",
    fontWeight: "bold",
    fontSize: 11.5,
    textAlign: "right",
    direction: "rtl",
  },
  /* table cell base for the top info table */
  td: {
    border: "1px solid #000",
    padding: "3px 7px",
    fontSize: 11,
    fontFamily: FONT,
    verticalAlign: "middle",
  },
  tdGoldHeader: {
    border: "1px solid #000",
    padding: "4px 7px",
    fontSize: 12,
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
  }, [id, profile]);

  useEffect(() => {
    fetchWorkerData();
  }, [profile]);

  const handleGenerateAndUpload = async () => {
    if (!cvRef.current) return;
    showLoader();
    try {
      const el = cvRef.current;
      const ow = el.style.width;
      el.style.width = "760px";
      await new Promise((r) => setTimeout(r, 300));
      const canvas = await html2canvas(el, {
        useCORS: true,
        scale: 2,
        windowWidth: 760,
      });
      el.style.width = ow;

      const pdf = new jsPDF("p", "mm", "a4");
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const imgData = canvas.toDataURL("image/jpeg", 0.9);
      const imgH = (canvas.height * pw) / canvas.width;

      if (imgH <= ph) {
        pdf.addImage(imgData, "JPEG", 0, 0, pw, imgH);
      } else {
        let y = 0;
        while (y < imgH) {
          if (y > 0) pdf.addPage();
          pdf.addImage(imgData, "JPEG", 0, -y, pw, imgH);
          y += ph;
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
    { en: "Cooking", ar: "الطبخ", v: worker.can_cook ? "YES" : "NO" },
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

  /* ── root CV style ── */
  const cvStyle = {
    width: 760,
    minWidth: 760,
    background: "#fff",
    // border: "2px solid #000",
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
          {/* ════════ HEADER IMAGE ════════ */}
          <img
            src={cvHeader}
            alt="CV Header"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              marginBottom: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            }}
          />

          {/* ════════ TOP INFO TABLE ════════
              Layout:
              | Application for Employment  طلب التوظيف  |  Worker Name  |
              | Reference No  | value | رقم المرجع       | [photo ×4]    |
              | Post Applied  | value | وظيفة            |               |
              | Monthly Salary| value | راتب شهري        |               |
              | Contract Period| value| مدة العقد        |               |
          ════════ */}
          <div style={{ border: "2px solid #000" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: 4,
              }}
            >
              <thead>
                <tr>
                  {/* Bilingual title spanning 3 cols */}
                  <th
                    colSpan={3}
                    style={{
                      ...css.tdGoldHeader,
                      // borderRight: "1px solid rgba(255,255,255,0.3)",
                    }}
                  >
                    Application for Employment &nbsp;|&nbsp; طلب التوظيف
                  </th>
                  {/* Worker name header */}
                  <th style={css.tdGoldHeader}>{name}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    style={{
                      ...css.td,
                      fontWeight: "bold",
                      fontStyle: "italic",
                      width: "22%",
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
                    }}
                  >
                    {faceUrl ? (
                      <img
                        src={faceUrl}
                        alt="Candidate"
                        style={{
                          width: 120,
                          height: 150,
                          objectFit: "cover",
                          display: "block",
                          margin: "0 auto",
                          border: "1px solid #999",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 120,
                          height: 150,
                          background: "#ddd",
                          border: "1px solid #999",
                          margin: "0 auto",
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
                    }}
                  >
                    Monthly Salary
                  </td>
                  <td style={css.td}>{salary}</td>
                  <td
                    style={{ ...css.td, textAlign: "right", direction: "rtl" }}
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

            {/* ════════ PHONE / NAME BAR ════════ */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "180px 1fr",
                marginBottom: "3px",

                // borderBottom: "0px solid #000",
                // borderTop: "0px solid #000",
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
                <div style={{ fontWeight: "bold", fontSize: 13 }}>{name}</div>
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

              {/* ── RIGHT: Passport Detail + standing photo ── */}
              <div style={{ display: "flex", flexDirection: "column" }}>
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
                      style={{
                        width: 160,
                        height: 230,
                        objectFit: "cover",
                        border: "1px solid #999",
                      }}
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
        {/* end scroll wrapper */}
      </div>
    </div>
  );
};

export default CV;
