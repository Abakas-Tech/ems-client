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
import CreateModal from "../../../../../../shared/components/CreateModal/CreateModal";

const safeDate = (d) => (d ? d.slice(0, 10) : "");

/* System-generated reference number. Same worker → same ID across both CV
   templates (since both derive it from the same worker.id); different
   worker → different ID. Prefers a pre-existing saved value so older CVs
   don't get a new ID on re-generation. */
const REFERENCE_PREFIX = "CV";

const generateReferenceNumber = (worker) => {
  const existing = worker?.reference_number ?? worker?.reference_no;
  if (existing) return existing;

  const workerId = worker?.id ?? worker?.worker_id;
  if (!workerId) return "";

  return `${REFERENCE_PREFIX}-${String(workerId).padStart(6, "0")}`;
};

const subtractDate = (d1, d2) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  const diff = date1.getTime() - date2.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  return years > 0 ? `${years} years` : `${months} months`;
};

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
  minHeight,
}) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: cols,
      minHeight,
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

/* Helper: capture a DOM element to a jsPDF page with proper aspect-ratio scaling.
   marginX/marginY (in mm) define a SHARED printable box used for every page,
   so different-aspect-ratio pages (e.g. tall CV table vs. wide passport scan)
   still end up with matching margins / aligned borders on the printed page. */
const captureElementToPage = async (
  pdf,
  el,
  waitMs = 500,
  marginX = 8,
  marginY = 8,
) => {
  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();

  const ow = el.style.width;
  el.style.width = "760px";
  await new Promise((r) => setTimeout(r, waitMs));

  const canvas = await html2canvas(el, {
    useCORS: true,
    allowTaint: false,
    scale: 2,
    windowWidth: 760,
  });

  el.style.width = ow;

  const imgData = canvas.toDataURL("image/jpeg", 0.95);
  const canvasW = canvas.width;
  const canvasH = canvas.height;

  // Printable area shared by every page (page size minus the fixed margins)
  const printableW = pw - marginX * 2;
  const printableH = ph - marginY * 2;

  // Uniform scale to fit inside the printable area while preserving aspect ratio
  const ratio = Math.min(printableW / canvasW, printableH / canvasH);
  const imgW = canvasW * ratio;
  const imgH = canvasH * ratio;

  // Center within the printable area (not the raw page), so both axes get margin
  const offsetX = marginX + (printableW - imgW) / 2;
  const offsetY = marginY + (printableH - imgH) / 2;

  pdf.addImage(imgData, "JPEG", offsetX, offsetY, imgW, imgH);
};

const CVOne = ({ templateSwitcher }) => {
  const { id } = useParams();
  const cvRef = useRef(null);
  const passportRef = useRef(null);
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { profile } = useProfile();

  // ── Remark modal state ──
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [remarkOverride, setRemarkOverride] = useState(null);
  const [remarkDateOverride, setRemarkDateOverride] = useState(null);
  const [pendingGenerate, setPendingGenerate] = useState(false);

  const fetchWorkerData = useCallback(async () => {
    showLoader();
    try {
      const res = await getWorkerCVData(id ?? profile.id);
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

      // ── PAGE 1: CV ──
      await captureElementToPage(pdf, cvRef.current, 400);

      // ── PAGE 2: Passport ──
      if (passportRef.current) {
        pdf.addPage();
        // Give remote passport scan image extra time to fully load
        await captureElementToPage(pdf, passportRef.current, 800);
      }

      const blob = pdf.output("blob");
      const name = `${worker.full_name.replace(/\s+/g, "_")}_CV`;
      const file = new File([blob], name + ".pdf", { type: "application/pdf" });
      const fd = new FormData();
      fd.append("file", file);
      fd.append("file_name", name);
      fd.append("category", "CV_ONE");
      fd.append("is_private", 0);
      fd.append("description", `CV for ${worker.full_name}`);
      fd.append("worker_id", worker.id);
      await uploadFile(fd);
      addMessage(
        true,
        "CV " +
          (worker.cv_one_url ? "updated" : "generated") +
          " and uploaded successfully!",
      );
    } catch (e) {
      console.error(e);
      addMessage(false, "Failed to generate PDF");
    } finally {
      hideLoader();
    }
  };

  // ── Remark modal handlers ──
  const handleRemarkSubmit = (inputValues) => {
    const remarkText = inputValues.remark?.trim();

    if (!remarkText) {
      addMessage(false, "Remark is required");
      return;
    }

    setRemarkOverride(remarkText);
    setRemarkDateOverride(new Date().toISOString().slice(0, 10));
    setShowRemarkModal(false);
    setPendingGenerate(true);
  };

  // Waits for the remark state to actually render into the DOM before
  // capturing — setState inside handleRemarkSubmit is async, so calling
  // handleGenerateAndUpload() directly there would capture the OLD remark.
  useEffect(() => {
    if (pendingGenerate) {
      setPendingGenerate(false);
      handleGenerateAndUpload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingGenerate]);

  if (!worker) return null;

  /* ── field mapping ── */
  const ref = generateReferenceNumber(worker);
  const post = worker.primary_positions?.[0] ?? "House Maid";
  const postAr = worker.primary_positions_ar?.[0] ?? "عاملة منزلية";
  const salary = worker.monthly_salary ? `${worker.monthly_salary} SR` : "";
  const contract =
    worker.contract_start_date && worker.contract_end_date
      ? subtractDate(worker.contract_end_date, worker.contract_start_date)
      : (worker.contract_period ?? "2 Years");
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
  const expP = worker.experience?.length
    ? worker.experience
        .map((e) => (e.years ? `${e.years} yrs` : ""))
        .join(" / ")
    : "";
  const expC = worker.experience?.length
    ? worker.experience.map((e) => e.country ?? "").join(" / ")
    : "";
  const ppNo = worker.passport_number ?? "";
  const ppIssue = safeDate(worker.passport_issue_date);
  const ppPlace = worker.passport_issuing_country ?? "";
  const ppExp = safeDate(worker.passport_expiry_date);
  const faceUrl = worker.photo_3x4_url ?? "";
  const bodyUrl = worker.photo_standing_url ?? "";

  // Remark + its date now prefer the value entered in the modal for this
  // generation run, falling back to whatever was previously saved on the
  // worker record.
  const remarks = remarkOverride ?? worker.remarks ?? "";
  const remDate = remarkDateOverride ?? safeDate(worker.remarks_date);

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
    boxSizing: "border-box",
    border: "2px solid #000", // outer line of the double border (page 1 only)
    padding: 6, // small gap between the outer and existing inner border
  };

  return (
    <div className="dashboard-wraper">
      {/* toolbar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3">
        <div className="mt-0">
          <h2 className="fw-bold text-dark mb-2">CV</h2>
          <p className="text-muted mb-0">Generate and upload CV</p>
        </div>

        <div className="position-absolute top-0 end-0 mt-4 pt-2">
          {profile?.role_id != 4 && <BackButton onClick={() => navigate(-1)} />}
        </div>

        {profile?.role_id != 4 && (
          <button
            className="btn btn-main mt-3 mt-md-5  text-white w-45 d-flex align-items-center justify-content-center"
            onClick={() => setShowRemarkModal(true)}
          >
            {worker.cv_one_url ? "Update CV" : "Generate CV"}
          </button>
        )}
      </div>
      <div className="mb-3 mt-1"> {templateSwitcher}</div>
      {/* horizontal scroll so mobile doesn't break */}
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        {/* ── PAGE 1: CV ── */}
        <div ref={cvRef} style={cvStyle}>
          {/* HEADER IMAGE */}
          <img
            src={cvHeader}
            alt="CV Header"
            crossOrigin="anonymous"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              marginBottom: 8,
              boxShadow: "0 0 12px 4px rgba(0,0,0,0.25)",
            }}
          />

          <div style={{ border: "2px solid #000" }}>
            {/* Gold title bar — same visual bar as before, just no longer a <table> row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 220px",
                borderBottom: "1px solid #000",
              }}
            >
              <div style={css.tdGoldHeader}>
                Application for Employment &nbsp;|&nbsp; طلب التوظيف
              </div>
              <div style={css.tdGoldHeader}>{name}</div>
            </div>

            {/* Reference No. / Post Applied For / Monthly Salary / Contract
                Period — same Row3 component & styling as Nationality below.
                gridTemplateRows guarantees a real minimum height (160px) up
                front, so the photo column has something definite to stretch
                against — this avoids the earlier bug where an img with
                height:100% inside an auto-height grid row collapsed/distorted
                because the height was circular (unresolved until the image
                itself rendered). */}
            <div
              style={{
                display: "flex",
                alignItems: "stretch",
                minHeight: 160,
                borderBottom: "1px solid #000",
              }}
            >
              <div
                style={{
                  flex: "1 1 auto",
                  display: "flex",
                  flexDirection: "column",
                  borderRight: "1px solid #000",
                }}
              >
                <Row3
                  label="Reference No."
                  value={ref}
                  minHeight={40}
                  arLabel="رقم المرجع"
                  cols="150px 130px 1fr"
                />
                <Row3
                  label="Post Applied For"
                  value={post}
                  minHeight={40}
                  arLabel="وظيفة"
                  cols="150px 130px 1fr"
                />
                <Row3
                  label="Monthly Salary"
                  value={salary}
                  minHeight={40}
                  arLabel="راتب شهري"
                  cols="150px 130px 1fr"
                />
                <Row3
                  label="Contract Period"
                  value={contract}
                  minHeight={40}
                  arLabel="مدة العقد"
                  last
                  cols="150px 130px 1fr"
                />
              </div>

              {/* flex-basis 220px + stretch instead of a CSS Grid row — html2canvas
      handles implicit grid "align-items: stretch" unreliably, which was
      causing the left column's border to stop short of the row's bottom
      border instead of connecting to it. */}
              <div style={{ position: "relative", flex: "0 0 220px" }}>
                {faceUrl ? (
                  <img
                    src={faceUrl}
                    alt="Candidate"
                    crossOrigin="anonymous"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: "#ddd",
                    }}
                  />
                )}
              </div>
            </div>

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
                      crossOrigin="anonymous"
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
              /* Fixed-size wrapper so html2canvas captures exact dimensions.
                 The img is centered via absolute positioning so objectFit: contain
                 works correctly without stretching. */
              <div
                style={{
                  width: "100%",
                  border: "1px solid #999",
                }}
              >
                <img
                  src={worker.passport_scan_url}
                  alt="Passport Scan"
                  crossOrigin="anonymous"
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: "100%",
                  height: 500,
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

      {/* Remark collection modal — shown before generation starts */}
      <CreateModal
        show={showRemarkModal}
        onClose={() => setShowRemarkModal(false)}
        onCreate={handleRemarkSubmit}
        fields={[{ name: "remark", label: "Remark" }]}
        title="Add Remark"
      />
    </div>
  );
};

export default CVOne;
