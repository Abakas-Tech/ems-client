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

/* ─── helpers ─── */
const safeDate = (d) => (d ? d.slice(0, 10) : "");

/* ─── Main Component ─── */
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
      const workerId = id ? id : profile.id;
      const { data } = await getWorkerCVData(workerId);
      setWorker(data);
    } catch (err) {
      console.error(err);
    } finally {
      hideLoader();
    }
  }, [id || profile]);

  useEffect(() => { fetchWorkerData(); }, [profile]);

  const handleGenerateAndUpload = async () => {
    if (!cvRef.current) return;
    showLoader();
    try {
      const el = cvRef.current;
      const orig = el.style.width;
      el.style.width = "1200px";
      await new Promise((r) => setTimeout(r, 300));
      const canvas = await html2canvas(el, { useCORS: true, scale: 2, windowWidth: 1200 });
      el.style.width = orig;

      const imgData = canvas.toDataURL("image/jpeg", 0.85);
      const pdf = new jsPDF("p", "mm", "a4");
      const pw = pdf.internal.pageSize.getWidth();
      pdf.addImage(imgData, "JPEG", 0, 0, pw, (canvas.height * pw) / canvas.width, undefined, "FAST");
      const pdfBlob = pdf.output("blob");

      const fileName = `${worker.full_name.replace(/\s+/g, "_")}_CV.pdf`;
      const file = new File([pdfBlob], fileName, { type: "application/pdf" });
      const formData = new FormData();
      formData.append("file", file);
      formData.append("file_name", `${worker.full_name.replace(/\s+/g, "_")}_CV`);
      formData.append("category", "CV");
      formData.append("is_private", 0);
      formData.append("description", `CV for ${worker.full_name}`);
      formData.append("worker_id", worker.id);
      await uploadFile(formData);
      addMessage(true, "CV " + (worker.cv_url ? "updated" : "generated") + " and uploaded successfully!");
    } catch (err) {
      addMessage(false, "Failed to generate PDF");
    } finally {
      hideLoader();
    }
  };

  if (!worker) return null;

  /* ── field mapping ── */
  const refNo        = worker.reference_number ?? "—";
  const post         = worker.primary_positions?.[0] ?? "House Maid";
  const postAr       = worker.primary_positions_ar?.[0] ?? "عاملة منزلية";
  const salary       = worker.monthly_salary ? `${worker.monthly_salary} SR` : "—";
  const contract     = worker.contract_period ?? "2 Years";
  const phone        = worker.phone_number ?? "";
  const fullName     = (worker.full_name ?? "").toUpperCase();
  const nationality  = worker.nationality ?? "";
  const religion     = worker.religion ?? "";
  const dob          = safeDate(worker.date_of_birth);
  const pob          = (worker.place_of_birth ?? "").toUpperCase();
  const age          = worker.age ?? "";
  const address      = (worker.address ?? "").toUpperCase();
  const marital      = worker.marital_status ?? "";
  const children     = worker.number_of_children ?? "";
  const height       = worker.height_cm ? `${worker.height_cm} cm` : "";
  const weight       = worker.weight_kg ? `${worker.weight_kg} kg` : "";
  const language     = worker.languages?.map((l) => l.language).join(", ") ?? "";
  const education    = (worker.education_level ?? "").toUpperCase();
  const expPeriod    = worker.experience?.[0]?.years ? `${worker.experience[0].years} yrs` : "";
  const expCountry   = worker.experience?.[0]?.country ?? "";
  const passportNo   = worker.passport_number ?? "";
  const issueDate    = safeDate(worker.passport_issue_date);
  const placeIssue   = worker.passport_place_of_issue ?? "";
  const expiryDate   = safeDate(worker.passport_expiry_date);
  const photoUrl     = worker.photo_3x4_url ?? "";
  const photoBodyUrl = worker.photo_standing_url ?? "";
  const remarks      = worker.remarks ?? "";
  const remarksDate  = safeDate(worker.remarks_date);

  const skills = [
    { en: "Cooking",        ar: "الطبخ",           value: worker.can_cook        ? "YES" : "" },
    { en: "Cleaning",       ar: "التنظيف",         value: worker.can_clean       ? "YES" : "NO" },
    { en: "Washing",        ar: "الغسيل",          value: worker.can_wash        ? "YES" : "NO" },
    { en: "Ironing",        ar: "الكوي",           value: worker.can_iron        ? "YES" : "NO" },
    { en: "Children Care",  ar: "رعايه الطفال",    value: worker.can_childcare   ? "YES" : "NO" },
    { en: "Babysitting",    ar: "مجا لسه الكفال",  value: worker.can_babysit     ? "YES" : "NO" },
    { en: "Arabic Cooking", ar: "الطبخ العربي",    value: worker.can_arabic_cook ? "YES" : "NO" },
    { en: "Sewing",         ar: "الخياطه",         value: worker.can_sew         ? "YES" : "NO" },
  ];

  /* ─────────────────────────────────────────────
     INLINE STYLES — pixel-perfect, no CSS file
     needed for the CV table itself so html2canvas
     captures everything correctly
  ───────────────────────────────────────────── */
  const T = {
    cv: {
      width: 780,
      border: "2px solid #000",
      fontFamily: "'Times New Roman', Times, serif",
      fontSize: 12,
      background: "#fff",
      color: "#000",
      tableLayout: "fixed",
    },
    gold: { background: "#8B6914" },
    bb:   { borderBottom: "1px solid #000" },
    br:   { borderRight:  "1px solid #000" },
    bl:   { borderLeft:   "1px solid #000" },
    bt:   { borderTop:    "2px solid #000" },
    pad:  { padding: "3px 7px" },
    bold: { fontWeight: "bold" },
    italic: { fontStyle: "italic" },
    boldItalic: { fontWeight: "bold", fontStyle: "italic" },
    right: { textAlign: "right", direction: "rtl" },
    center: { textAlign: "center" },
    white: { color: "#fff" },
    goldText: { color: "#8B6914" },
    fs11: { fontSize: 11 },
    fs12: { fontSize: 12 },
    fs13: { fontSize: 13 },
    fs28: { fontSize: 28 },
    fs14: { fontSize: 14 },
    noWrap: { whiteSpace: "nowrap" },
  };

  const goldHeader = {
    ...T.gold, ...T.white, ...T.boldItalic, ...T.pad, ...T.fs11,
    ...T.bb, display: "flex", justifyContent: "space-between", alignItems: "center",
  };

  /* small helper: a bilingual gold section bar */
  const SectionBar = ({ en, ar }) => (
    <div style={goldHeader}>
      <span style={T.italic}>{en}</span>
      <span style={{ direction: "rtl" }}>{ar}</span>
    </div>
  );

  /* EN key-value row */
  const Row = ({ label, value, last }) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", ...(last ? {} : T.bb) }}>
      <div style={{ ...T.pad, ...T.boldItalic, ...T.fs11, ...T.br }}>{label}</div>
      <div style={{ ...T.pad, ...T.italic, ...T.fs11 }}>{value ?? ""}</div>
    </div>
  );

  /* AR key-value row (mirrored) */
  const RowAr = ({ label, value, last }) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", direction: "rtl", ...(last ? {} : T.bb) }}>
      <div style={{ ...T.pad, ...T.bold, ...T.fs11, borderLeft: "1px solid #000" }}>{label}</div>
      <div style={{ ...T.pad, ...T.fs11 }}>{value ?? ""}</div>
    </div>
  );

  return (
    <div className="dashboard-wraper">
      {/* ── toolbar ── */}
      <div className="d-flex justify-content-between align-items-center d-print-none pb-2">
        <h2 className="text-dark mb-2">{profile?.role_id != 4 ? "Employee" : "My"} CV</h2>
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

      {/* scroll wrapper so CV doesn't break page on mobile */}
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <div ref={cvRef} style={{ width: 780, minWidth: 780 }}>

          {/* ═══════════════════════════════════════
              CV TABLE
          ═══════════════════════════════════════ */}
          <div style={T.cv}>

            {/* ── HEADER ── */}
            <div style={{
              display: "flex", alignItems: "center", padding: "8px 12px",
              borderBottom: "2px solid #000", gap: 10,
            }}>
              {/* Logo */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 95, flexShrink: 0 }}>
                <div style={{
                  width: 68, height: 68, border: "2px solid #8B6914", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  textAlign: "center", padding: 4,
                }}>
                  <span style={{ fontSize: 6.5, fontWeight: "bold", color: "#8B6914", lineHeight: 1.3 }}>
                    شركة أبو بجاد للإستقدام<br />
                    <span style={{ fontSize: 5.5, color: "#555" }}>Abo Bejad Recuitments Company</span>
                  </span>
                </div>
                <div style={{ fontSize: 7, fontWeight: "bold", color: "#8B6914", textAlign: "center", marginTop: 2 }}>
                  Abo Bejad Recuitments Company
                </div>
              </div>

              {/* Center titles */}
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: "bold", color: "#8B6914" }}>شركة أبو بجاد للإستقدام</div>
                <div style={{ fontSize: 15, fontWeight: "bold", color: "#8B6914", letterSpacing: 0.5 }}>
                  Abo Bejad Receuitments Company
                </div>
              </div>

              {/* Top-right photo (face/3x4) */}
              <div style={{ flexShrink: 0 }}>
                {photoUrl
                  ? <img src={photoUrl} alt="Candidate" style={{ width: 88, height: 108, objectFit: "cover", border: "1px solid #ccc", display: "block" }} />
                  : <div style={{ width: 88, height: 108, background: "#eee", border: "1px solid #ccc" }} />
                }
              </div>
            </div>

            {/* ── APPLICATION TITLE ROW ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", ...T.bb, borderTop: "2px solid #000" }}>
              <div style={{ ...T.br }}>
                <div style={goldHeader}>
                  <span>Application for Employment</span>
                  <span style={{ direction: "rtl" }}>طلب التوظيف</span>
                </div>
              </div>
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                  <div style={{ ...T.pad, ...T.boldItalic, ...T.fs11, ...T.br }}>رقم المرجع</div>
                  <div style={{ ...T.pad, ...T.boldItalic, ...T.fs11 }}>Reference No.</div>
                </div>
              </div>
            </div>

            {/* ── JOB INFO ROW ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", ...T.bb }}>
              {/* EN side */}
              <div style={T.br}>
                <Row label="Reference No."   value={refNo}   />
                <Row label="Post Applied For" value={post}    />
                <Row label="Monthly Salary"  value={salary}  />
                <Row label="Contract Period" value={contract} last />
              </div>
              {/* AR side */}
              <div>
                <RowAr label="رقم المرجع"  value={refNo}   />
                <RowAr label="وظيفة"       value={postAr}  />
                <RowAr label="راتب شهري"   value={salary}  />
                <RowAr label="مدة العقد"   value={contract} last />
              </div>
            </div>

            {/* ── PHONE / NAME ROW ── */}
            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 120px", ...T.bb }}>
              <div style={{ ...T.pad, ...T.boldItalic, ...T.fs12, ...T.br, display: "flex", alignItems: "center" }}>
                PHONE NO:&nbsp;<span style={{ fontWeight: "normal" }}>{phone}</span>
              </div>
              <div style={{
                ...T.pad, ...T.br, textAlign: "center",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{ ...T.boldItalic, fontSize: 13 }}>{fullName}</div>
                <div style={{ fontSize: 11, direction: "rtl" }}>: العامله اسم</div>
              </div>
              <div style={{ ...T.pad, ...T.fs11, direction: "rtl", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                رقم الهاتف
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════
                MAIN BLOCK — 3 columns:
                  Col A (flex ~2): EN applicant details + skills
                  Col B (flex ~2): EN passport + passport AR mirror + standing photo
                  Col C (fixed 160px): AR labels column
            ══════════════════════════════════════════════════════ */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 160px", ...T.bb }}>

              {/* ── COL A: Details of Applicant ── */}
              <div style={T.br}>
                <SectionBar en="Details of Applicant" ar="بيانات الطلب" />
                <Row label="Nationality"     value={nationality} />
                <Row label="Religion"        value={religion}    />
                <Row label="Date of Birth"   value={dob}         />
                <Row label="Place of Birth"  value={pob}         />
                <Row label="Age"             value={age}         />
                <Row label="Address"         value={address}     />
                <Row label="Marital Status"  value={marital}     />
                <Row label="No. of Children" value={children}    />
                <Row label="Height"          value={height}      />
                <Row label="Weight"          value={weight}      />

                <SectionBar en="Languages & Education" ar="اللغه & التعليم" />
                {/* Language row — split label */}
                <div style={{ display: "grid", gridTemplateColumns: "85px 1fr", ...T.bb }}>
                  <div style={{ ...T.pad, ...T.boldItalic, ...T.fs11, ...T.br, lineHeight: 1.45 }}>
                    Language of<br />worker
                  </div>
                  <div style={{ ...T.pad, ...T.italic, ...T.fs11 }}>{language}</div>
                </div>
                <Row label="Education" value={education} />

                <SectionBar en="Work Experience" ar="خبره العمل" />
                <Row label="Period"  value={expPeriod}  />
                <Row label="Country" value={expCountry} />

                <SectionBar en="Skills & Experience" ar="الخبره & المهارات" />
                {skills.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: "grid", gridTemplateColumns: "1fr auto 1fr",
                      ...(i < skills.length - 1 ? T.bb : {}),
                    }}
                  >
                    <div style={{ ...T.pad, ...T.boldItalic, ...T.fs11 }}>{s.en}</div>
                    <div style={{
                      ...T.pad, ...T.boldItalic, ...T.fs11, textAlign: "center",
                      borderLeft: "1px solid #000", borderRight: "1px solid #000", minWidth: 48,
                    }}>
                      {s.value}
                    </div>
                    <div style={{ ...T.pad, ...T.fs11, textAlign: "right", direction: "rtl" }} />
                  </div>
                ))}
              </div>

              {/* ── COL B: Passport + Body Photo ── */}
              <div style={{ ...T.br, display: "flex", flexDirection: "column" }}>
                <SectionBar en="Passport Detail" ar="تفاصيل جواز" />
                <Row label="Passport No."   value={passportNo} />
                <Row label="Issue Date"     value={issueDate}  />
                <Row label="Place of Issue" value={placeIssue} />
                <Row label="Expiry Date"    value={expiryDate} />

                {/* AR mirror of passport */}
                <div style={{ borderBottom: "1px solid #000" }}>
                  <RowAr label="رقيم الجواز"    value={passportNo} />
                  <RowAr label="تاريخ الإصدار"  value={issueDate}  />
                  <RowAr label="مكان الاصدار"   value={placeIssue} />
                  <RowAr label="تاريخ الانتهاء" value={expiryDate} last />
                </div>

                {/* Standing / full-body photo */}
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }}>
                  {photoBodyUrl
                    ? <img src={photoBodyUrl} alt="Full body" style={{ width: 148, height: 210, objectFit: "cover" }} />
                    : <div style={{ width: 148, height: 210, background: "#eee", border: "1px solid #ccc" }} />
                  }
                </div>
              </div>

              {/* ── COL C: Arabic labels (mirrors Col A row-for-row) ── */}
              <div style={{ direction: "rtl", fontSize: 11 }}>
                {/* Section bar */}
                <div style={{ ...T.gold, ...T.white, ...T.bold, ...T.pad, ...T.bb, textAlign: "center", fontSize: 11 }}>
                  بيانات الطلب
                </div>
                {[
                  "الجنسيه", "الديانه", "التاريخ", "مكان الولاده",
                  "العمر", "العنوان", "الحاله", "عدد الاطفال", "ارتفاع", "وزن",
                ].map((ar, i) => (
                  <div key={i} style={{ ...T.pad, ...T.bb, textAlign: "right", fontSize: 11 }}>{ar}</div>
                ))}

                <div style={{ ...T.gold, ...T.white, ...T.bold, ...T.pad, ...T.bb, textAlign: "center", fontSize: 11 }}>
                  اللغه & التعليم
                </div>
                {/* Language cell — same height as the split-label row in Col A */}
                <div style={{ ...T.pad, ...T.bb, textAlign: "right", minHeight: 34, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                  العاملة لغة
                </div>
                <div style={{ ...T.pad, ...T.bb, textAlign: "right" }}>المستوي التعليمي</div>

                <div style={{ ...T.gold, ...T.white, ...T.bold, ...T.pad, ...T.bb, textAlign: "center", fontSize: 11 }}>
                  خبره العمل
                </div>
                <div style={{ ...T.pad, ...T.bb, textAlign: "right" }}>المده</div>
                <div style={{ ...T.pad, ...T.bb, textAlign: "right" }}>البلد</div>

                <div style={{ ...T.gold, ...T.white, ...T.bold, ...T.pad, ...T.bb, textAlign: "center", fontSize: 11 }}>
                  الخبره & المهارات
                </div>
                {skills.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      ...T.pad, textAlign: "right",
                      ...(i < skills.length - 1 ? T.bb : {}),
                    }}
                  >
                    {s.ar}
                  </div>
                ))}
              </div>

            </div>{/* end main 3col */}

            {/* ── REMARKS ── */}
            <div style={{ display: "flex", alignItems: "center", padding: "3px 10px", gap: 16 }}>
              <span style={{ ...T.boldItalic, ...T.fs11 }}>Remarks</span>
              <span style={{ ...T.goldText, fontWeight: "bold", fontSize: 12 }}>{remarks}</span>
              <span style={{ ...T.goldText, fontWeight: "bold", fontSize: 12 }}>{remarksDate}</span>
            </div>

          </div>{/* end .cv */}
        </div>
      </div>

    </div>
  );
};

export default CV;