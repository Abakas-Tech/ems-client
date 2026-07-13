import React, { useState, useEffect, useCallback, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  getWorkerCVData,
  uploadWorkerCvHeader,
} from "../../../../api/worker.api";
import { getUsersLookup } from "../../../../api/user.api";
import BackButton from "../../../../../../shared/components/BackButton/BackButton";
import { useParams, useNavigate } from "react-router-dom";
import useLoader from "../../../../../../context/Loader/useLoader";
import { uploadFile } from "../../../../api/file.api";
import useResponse from "../../../../../../context/Response/useResponse";
import useProfile from "../../../../../../context/Profile/useProfile";
import CreateModal from "../../../../../../shared/components/CreateModal/CreateModal";

const safeDate = (d) => (d ? d.slice(0, 10) : "");

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

const GoldBar = ({ en, ar }) => (
  <div style={css.goldBar}>
    <div style={css.goldLeft}>{en}</div>
    <div style={css.goldRight}>{ar}</div>
  </div>
);

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

  const printableW = pw - marginX * 2;
  const printableH = ph - marginY * 2;

  const ratio = Math.min(printableW / canvasW, printableH / canvasH);
  const imgW = canvasW * ratio;
  const imgH = canvasH * ratio;

  const offsetX = marginX + (printableW - imgW) / 2;
  const offsetY = marginY + (printableH - imgH) / 2;

  pdf.addImage(imgData, "JPEG", offsetX, offsetY, imgW, imgH);
};

const CVThree = ({ templateSwitcher }) => {
  const { id } = useParams();
  const cvRef = useRef(null);
  const passportRef = useRef(null);
  const headerFileInputRef = useRef(null);
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { profile } = useProfile();

  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [remarkOverride, setRemarkOverride] = useState(null);
  const [remarkDateOverride, setRemarkDateOverride] = useState(null);
  const [pendingGenerate, setPendingGenerate] = useState(false);

  // ── Partner (CV_THREE is the only category the user picks a partner for) ──
  const [partners, setPartners] = useState([]);
  const [partnerIdOverride, setPartnerIdOverride] = useState(null);

  // ── Header upload state ──
  const [uploadingHeader, setUploadingHeader] = useState(false);

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
  }, [fetchWorkerData]);

  // ── Fetch partners (role_id 3) for the CV_THREE dropdown ──
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await getUsersLookup({ role_id: 3 });
        setPartners(res?.data || []);
      } catch (e) {
        console.error("fetch partners error:", e);
      }
    };
    fetchPartners();
  }, []);

  // ── Header upload/change handlers ──
  const handleHeaderPickClick = () => headerFileInputRef.current?.click();

  const handleHeaderFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file next time
    if (!file || !worker) return;

    showLoader();
    try {
      const res = await uploadWorkerCvHeader(worker.id, file);
      const headerUrl = res?.data?.cv_three_header_url;

      if (!headerUrl) {
        throw new Error("Upload did not return a header URL");
      }

      setWorker((prev) => ({ ...prev, cv_three_header_url: headerUrl }));
      addMessage(true, "Header image updated successfully!");
    } catch (e) {
      console.error(e);
      addMessage(false, "Failed to update header image");
    } finally {
      hideLoader();
    }
  };

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
        await captureElementToPage(pdf, passportRef.current, 800);
      }

      const blob = pdf.output("blob");
      const name = `${worker.full_name.replace(/\s+/g, "_")}_CV`;
      const file = new File([blob], name + ".pdf", { type: "application/pdf" });
      const fd = new FormData();
      fd.append("file", file);
      fd.append("file_name", name);
      fd.append("category", "CV_THREE");
      fd.append("is_private", 0);
      fd.append("description", `CV for ${worker.full_name}`);
      fd.append("worker_id", worker.id);
      // CV_THREE is the only category where the partner is user-chosen;
      // CV_ONE / CV_TWO are auto-linked server-side and never send this.
      fd.append("partner_id", partnerIdOverride);
      await uploadFile(fd);
      addMessage(
        true,
        "CV " +
          (worker.cv_three_url ? "updated" : "generated") +
          " and uploaded successfully!",
      );
    } catch (e) {
      console.error(e);
      addMessage(false, "Failed to generate PDF");
    } finally {
      hideLoader();
    }
  };

  const handleRemarkSubmit = (inputValues) => {
    const remarkText = inputValues.remark?.trim();
    const partnerId = inputValues.partner_id;

    if (!remarkText) {
      addMessage(false, "Remark is required");
      return;
    }

    if (!partnerId) {
      addMessage(false, "Partner is required");
      return;
    }

    setRemarkOverride(remarkText);
    setRemarkDateOverride(new Date().toISOString().slice(0, 10));
    setPartnerIdOverride(partnerId);
    setShowRemarkModal(false);
    setPendingGenerate(true);
  };

  useEffect(() => {
    if (pendingGenerate) {
      setPendingGenerate(false);
      handleGenerateAndUpload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingGenerate]);

  if (!worker) return null;

  const ref = generateReferenceNumber(worker);
  const post = worker.primary_positions?.[0] ?? "House Maid";
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

  const cvStyle = {
    width: 760,
    minWidth: 760,
    background: "#fff",
    fontFamily: FONT,
    fontSize: 15,
    color: "#000",
    boxSizing: "border-box",
    border: "2px solid #000",
    padding: 6,
  };

  const partnerOptions = partners.map((p) => ({
    value: p.partner_id,
    label: p.full_name || p.email,
  }));

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

        {(profile?.role_id === 1 || profile?.role_id === 2) && (
          <button
            className="btn btn-main mt-3 mt-md-5  text-white w-45 d-flex align-items-center justify-content-center"
            onClick={() => setShowRemarkModal(true)}
          >
            {worker.cv_three_url ? "Update CV" : "Generate CV"}
          </button>
        )}
      </div>
      <div className="mb-3 mt-1"> {templateSwitcher}</div>

      {/* Header controls — outside cvRef so they never end up in the PDF capture */}
      <div className="d-flex align-items-center gap-2 mb-2">
        <input
          ref={headerFileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif"
          style={{ display: "none" }}
          onChange={handleHeaderFileChange}
        />
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={handleHeaderPickClick}
        >
          {worker.cv_three_header_url
            ? "Change Header Image"
            : "Upload Header Image"}
        </button>
      </div>

      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        {/* ── PAGE 1: CV ── */}
        <div ref={cvRef} style={cvStyle}>
          {/* DYNAMIC HEADER IMAGE */}
          {worker.cv_three_header_url ? (
            <img
              src={worker.cv_three_header_url}
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
          ) : (
            <div
              onClick={handleHeaderPickClick}
              style={{
                width: "100%",
                height: 120,
                marginBottom: 8,
                border: "2px dashed #999",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
                fontSize: 13,
                fontStyle: "italic",
                cursor: "pointer",
              }}
            >
              Click "Upload Header Image" above to set this CV's header
            </div>
          )}

          <div style={{ border: "2px solid #000" }}>
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

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                borderBottom: "1px solid #000",
              }}
            >
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

      <CreateModal
        show={showRemarkModal}
        onClose={() => setShowRemarkModal(false)}
        onCreate={handleRemarkSubmit}
        fields={[
          { name: "remark", label: "Remark" },
          {
            name: "partner_id",
            label: "Partner",
            type: "select",
            options: partnerOptions,
          },
        ]}
        title="Add Remark"
      />
    </div>
  );
};

export default CVThree;
