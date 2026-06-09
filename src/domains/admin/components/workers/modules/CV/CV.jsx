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

/* ─────────────────────────────────────────────────────────────
   STYLE CONSTANTS  (all inline so html2canvas never misses them)
───────────────────────────────────────────────────────────── */
const S = {
  /* borders */
  bb: { borderBottom: "1px solid #000" },
  br: { borderRight:  "1px solid #000" },
  bl: { borderLeft:   "1px solid #000" },
  bt2:{ borderTop:    "1.5px solid #000" },

  /* text */
  boldItalic: { fontWeight:"bold", fontStyle:"italic" },
  bold:       { fontWeight:"bold" },
  italic:     { fontStyle:"italic" },
  rtl:        { direction:"rtl" },

  /* colours */
  gold:     { background:"#8B6914" },
  white:    { color:"#fff" },
  goldText: { color:"#8B6914" },

  /* misc */
  pad: { padding:"2.5px 7px" },
};

/* gold bilingual section bar */
const GoldBar = ({ en, ar }) => (
  <div style={{
    ...S.gold, ...S.white, ...S.boldItalic, ...S.pad, ...S.bb,
    fontSize:10.5, display:"flex", justifyContent:"space-between", alignItems:"center",
  }}>
    <span style={S.italic}>{en}</span>
    <span style={S.rtl}>{ar}</span>
  </div>
);

/* gold arabic-only bar */
const GoldBarAr = ({ text }) => (
  <div style={{
    ...S.gold, ...S.white, ...S.bold, ...S.pad, ...S.bb,
    fontSize:10.5, textAlign:"center", direction:"rtl",
  }}>
    {text}
  </div>
);

/* EN key-value row */
const KV = ({ k, v, last }) => (
  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", ...(last?{}:S.bb) }}>
    <div style={{ ...S.pad, ...S.boldItalic, ...S.bb, fontSize:10.5, borderRight:"1px solid #000", ...(last?{borderBottom:"none"}:{}) }}>{k}</div>
    <div style={{ ...S.pad, ...S.italic, fontSize:10.5, ...(last?{}:S.bb) }}>{v ?? ""}</div>
  </div>
);

/* AR key-value row */
const KVAr = ({ k, v, last }) => (
  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", direction:"rtl", ...(last?{}:S.bb) }}>
    <div style={{ ...S.pad, ...S.bold, fontSize:10.5, borderLeft:"1px solid #000", ...(last?{borderBottom:"none"}:{}) }}>{k}</div>
    <div style={{ ...S.pad, fontSize:10.5 }}>{v ?? ""}</div>
  </div>
);

/* AR label cell (Col C) */
const ArCell = ({ text, last, minH }) => (
  <div style={{
    ...S.pad, textAlign:"right", direction:"rtl", fontSize:10.5,
    ...(last?{}:S.bb),
    ...(minH?{ minHeight:33, display:"flex", alignItems:"center", justifyContent:"flex-end" }:{}),
  }}>
    {text}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const CV = () => {
  const { id } = useParams();
  const cvRef  = useRef(null);
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { profile } = useProfile();

  const fetchWorkerData = useCallback(async () => {
    showLoader();
    try {
      const workerId = id ?? profile.id;
      const { data } = await getWorkerCVData(workerId);
      setWorker(data);
    } catch (err) { console.error(err); }
    finally { hideLoader(); }
  }, [id || profile]);

  useEffect(() => { fetchWorkerData(); }, [profile]);

  /* ── generate → PDF → upload ── */
  const handleGenerateAndUpload = async () => {
    if (!cvRef.current) return;
    showLoader();
    try {
      const el   = cvRef.current;
      const orig = el.style.width;
      el.style.width = "1200px";
      await new Promise(r => setTimeout(r, 300));

      const canvas = await html2canvas(el, { useCORS:true, scale:2, windowWidth:1200 });
      el.style.width = orig;

      const pdf = new jsPDF("p","mm","a4");
      const pw  = pdf.internal.pageSize.getWidth();
      pdf.addImage(
        canvas.toDataURL("image/jpeg", 0.88),
        "JPEG", 0, 0, pw, (canvas.height * pw) / canvas.width,
        undefined, "FAST"
      );

      const file = new File(
        [pdf.output("blob")],
        `${worker.full_name.replace(/\s+/g,"_")}_CV.pdf`,
        { type:"application/pdf" }
      );
      const fd = new FormData();
      fd.append("file",        file);
      fd.append("file_name",   `${worker.full_name.replace(/\s+/g,"_")}_CV`);
      fd.append("category",    "CV");
      fd.append("is_private",  0);
      fd.append("description", `CV for ${worker.full_name}`);
      fd.append("worker_id",   worker.id);
      await uploadFile(fd);
      addMessage(true, "CV " + (worker.cv_url ? "updated" : "generated") + " and uploaded successfully!");
    } catch { addMessage(false, "Failed to generate PDF"); }
    finally  { hideLoader(); }
  };

  if (!worker) return null;

  /* ── field mapping ── */
  const refNo       = worker.reference_number ?? "";
  const post        = worker.primary_positions?.[0] ?? "House Maid";
  const postAr      = worker.primary_positions_ar?.[0] ?? "عاملة منزلية";
  const salary      = worker.monthly_salary ? `${worker.monthly_salary} SR` : "";
  const contract    = worker.contract_period ?? "2 Years";
  const phone       = worker.phone_number ?? "";
  const fullName    = (worker.full_name ?? "").toUpperCase();
  const nationality = worker.nationality ?? "";
  const religion    = worker.religion ?? "";
  const dob         = safeDate(worker.date_of_birth);
  const pob         = (worker.place_of_birth ?? "").toUpperCase();
  const age         = worker.age ?? "";
  const address     = (worker.address ?? "").toUpperCase();
  const marital     = worker.marital_status ?? "";
  const children    = worker.number_of_children ?? "";
  const height      = worker.height_cm ? `${worker.height_cm} cm` : "";
  const weight      = worker.weight_kg ? `${worker.weight_kg} kg` : "";
  const language    = worker.languages?.map(l => l.language).join(", ") ?? "";
  const education   = (worker.education_level ?? "").toUpperCase();
  const expPeriod   = worker.experience?.[0]?.years ? `${worker.experience[0].years} yrs` : "";
  const expCountry  = worker.experience?.[0]?.country ?? "";
  const passportNo  = worker.passport_number ?? "";
  const issueDate   = safeDate(worker.passport_issue_date);
  const placeIssue  = worker.passport_place_of_issue ?? "";
  const expiryDate  = safeDate(worker.passport_expiry_date);
  const photoUrl    = worker.photo_3x4_url ?? "";
  const bodyUrl     = worker.photo_standing_url ?? "";
  const remarks     = worker.remarks ?? "";
  const remarksDate = safeDate(worker.remarks_date);

  const skills = [
    { en:"Cooking",        ar:"الطبخ",           v: worker.can_cook        ? "YES" : ""    },
    { en:"Cleaning",       ar:"التنظيف",         v: worker.can_clean       ? "YES" : "NO"  },
    { en:"Washing",        ar:"الغسيل",          v: worker.can_wash        ? "YES" : "NO"  },
    { en:"Ironing",        ar:"الكوي",           v: worker.can_iron        ? "YES" : "NO"  },
    { en:"Babysitting",    ar:"مجا لسه الكفال",  v: worker.can_babysit     ? "YES" : "NO"  },
    { en:"Children Care",  ar:"رعايه الطفال",    v: worker.can_childcare   ? "YES" : "NO"  },
    { en:"Arabic Cooking", ar:"الطبخ العربي",    v: worker.can_arabic_cook ? "YES" : "NO"  },
    { en:"Sewing",         ar:"الخياطه",         v: worker.can_sew         ? "YES" : "NO"  },
  ];

  /* shared cell style for job-info block */
  const jk = { ...S.pad, ...S.boldItalic, fontSize:10.5, borderRight:"1px solid #000" };
  const jv = { ...S.pad, ...S.italic, fontSize:10.5 };

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

      {/* ── horizontal scroll wrapper (mobile safe) ── */}
      <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch" }}>

        {/* ══════════════════════════════════════════════
            CV DOCUMENT  (794 px = A4 at 96 dpi)
        ══════════════════════════════════════════════ */}
        <div ref={cvRef} style={{
          width:794, minWidth:794,
          background:"#fff", border:"1.5px solid #000",
          fontFamily:"'Times New Roman',Times,serif",
          fontSize:11, color:"#000",
        }}>

          {/* ── HEADER ── */}
          <div style={{
            display:"flex", alignItems:"center",
            borderBottom:"1.5px solid #000",
            padding:"6px 10px", gap:8,
          }}>
            {/* Logo */}
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", width:90, flexShrink:0 }}>
              <div style={{
                width:64, height:64, borderRadius:"50%",
                border:"2px solid #8B6914",
                display:"flex", alignItems:"center", justifyContent:"center",
                textAlign:"center", padding:5,
              }}>
                <span style={{ fontSize:6, fontWeight:"bold", color:"#8B6914", lineHeight:1.4 }}>
                  شركة أبو بجاد للإستقدام<br />
                  <span style={{ fontSize:5, color:"#666" }}>Abo Bejad Recuitments Company</span>
                </span>
              </div>
              <div style={{ fontSize:6.5, fontWeight:"bold", color:"#8B6914", textAlign:"center", marginTop:2 }}>
                Abo Bejad Recuitments Company
              </div>
            </div>

            {/* Titles */}
            <div style={{ flex:1, textAlign:"center" }}>
              <div style={{ fontSize:26, fontWeight:"bold", color:"#8B6914" }}>شركة أبو بجاد للإستقدام</div>
              <div style={{ fontSize:14, fontWeight:"bold", color:"#8B6914", letterSpacing:0.5 }}>
                Abo Bejad Receuitments Company
              </div>
            </div>

            {/* Face photo (top-right) */}
            <div style={{ flexShrink:0 }}>
              {photoUrl
                ? <img src={photoUrl} alt="photo" style={{ width:86, height:106, objectFit:"cover", border:"1px solid #aaa", display:"block" }} />
                : <div style={{ width:86, height:106, background:"#ddd", border:"1px solid #aaa" }} />
              }
            </div>
          </div>

          {/* ── APPLICATION TITLE ROW ── */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", borderBottom:"1px solid #000", borderTop:"1.5px solid #000" }}>
            <div style={S.br}>
              <GoldBar en="Application for Employment" ar="طلب التوظيف" />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr" }}>
              <div style={{ ...S.pad, ...S.boldItalic, fontSize:10.5, ...S.br, direction:"rtl", display:"flex", alignItems:"center" }}>رقم المرجع</div>
              <div style={{ ...S.pad, ...S.boldItalic, fontSize:10.5, display:"flex", alignItems:"center" }}>Reference No.</div>
            </div>
          </div>

          {/* ── JOB INFO ── */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", ...S.bb }}>
            {/* EN side */}
            <div style={S.br}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", ...S.bb }}><div style={jk}>Reference No.</div><div style={jv}>{refNo}</div></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", ...S.bb }}><div style={jk}>Post Applied For</div><div style={jv}>{post}</div></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", ...S.bb }}><div style={jk}>Monthly Salary</div><div style={jv}>{salary}</div></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr"           }}><div style={jk}>Contract Period</div><div style={jv}>{contract}</div></div>
            </div>
            {/* AR side */}
            <div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", direction:"rtl", ...S.bb }}><div style={{ ...S.pad, ...S.bold, fontSize:10.5, ...S.bl }}>رقم المرجع</div><div style={{ ...S.pad, fontSize:10.5 }}>{refNo}</div></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", direction:"rtl", ...S.bb }}><div style={{ ...S.pad, ...S.bold, fontSize:10.5, ...S.bl }}>وظيفة</div><div style={{ ...S.pad, fontSize:10.5 }}>{postAr}</div></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", direction:"rtl", ...S.bb }}><div style={{ ...S.pad, ...S.bold, fontSize:10.5, ...S.bl }}>راتب شهري</div><div style={{ ...S.pad, fontSize:10.5 }}>{salary}</div></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", direction:"rtl"           }}><div style={{ ...S.pad, ...S.bold, fontSize:10.5, ...S.bl }}>مدة العقد</div><div style={{ ...S.pad, fontSize:10.5 }}>{contract}</div></div>
            </div>
          </div>

          {/* ── PHONE / NAME ── */}
          <div style={{ display:"grid", gridTemplateColumns:"138px 1fr 118px", ...S.bb }}>
            <div style={{ ...S.pad, ...S.boldItalic, fontSize:11, ...S.br, display:"flex", alignItems:"center" }}>
              PHONE NO:&nbsp;<span style={{ fontWeight:"normal" }}>{phone}</span>
            </div>
            <div style={{ ...S.pad, ...S.br, textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <div style={{ fontWeight:"bold", fontStyle:"italic", fontSize:12 }}>{fullName}</div>
              <div style={{ fontSize:10, direction:"rtl" }}>: العامله اسم</div>
            </div>
            <div style={{ ...S.pad, fontSize:10.5, direction:"rtl", display:"flex", alignItems:"center", justifyContent:"flex-end" }}>
              رقم الهاتف
            </div>
          </div>

          {/* ══════════════════════════════════════════════
              MAIN 3-COLUMN BLOCK
              Col A : EN applicant details + skills
              Col B : EN passport + AR passport + body photo
              Col C : AR label column (155 px)
          ══════════════════════════════════════════════ */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 155px", ...S.bb }}>

            {/* ── COL A ── */}
            <div style={S.br}>
              <GoldBar en="Details of Applicant" ar="بيانات الطلب" />
              <KV k="Nationality"     v={nationality} />
              <KV k="Religion"        v={religion}    />
              <KV k="Date of Birth"   v={dob}         />
              <KV k="Place of Birth"  v={pob}         />
              <KV k="Age"             v={age}         />
              <KV k="Address"         v={address}     />
              <KV k="Marital Status"  v={marital}     />
              <KV k="No. of Children" v={children}    />
              <KV k="Height"          v={height}      />
              <KV k="Weight"          v={weight}      />

              <GoldBar en="Languages & Education" ar="اللغه & التعليم" />
              {/* Language of worker — split label */}
              <div style={{ display:"grid", gridTemplateColumns:"82px 1fr", ...S.bb }}>
                <div style={{ ...S.pad, ...S.boldItalic, fontSize:10.5, borderRight:"1px solid #000", lineHeight:1.5 }}>
                  Language of<br />worker
                </div>
                <div style={{ ...S.pad, ...S.italic, fontSize:10.5, display:"flex", alignItems:"center" }}>{language}</div>
              </div>
              <KV k="Education" v={education} />

              <GoldBar en="Work Experience" ar="خبره العمل" />
              <KV k="Period"  v={expPeriod}  />
              <KV k="Country" v={expCountry} last />

              <GoldBar en="Skills & Experience" ar="الخبره & المهارات" />
              {skills.map((s, i) => (
                <div key={i} style={{
                  display:"grid", gridTemplateColumns:"1fr 50px 1fr",
                  ...(i < skills.length - 1 ? S.bb : {}),
                }}>
                  <div style={{ ...S.pad, ...S.boldItalic, fontSize:10.5 }}>{s.en}</div>
                  <div style={{ ...S.pad, ...S.boldItalic, fontSize:10.5, textAlign:"center", borderLeft:"1px solid #000", borderRight:"1px solid #000" }}>{s.v}</div>
                  <div style={{ ...S.pad, fontSize:10.5 }} />
                </div>
              ))}
            </div>

            {/* ── COL B ── */}
            <div style={{ ...S.br, display:"flex", flexDirection:"column" }}>
              <GoldBar en="Passport Detail" ar="تفاصيل جواز" />
              <KV k="Passport No."   v={passportNo} />
              <KV k="Issue Date"     v={issueDate}  />
              <KV k="Place of Issue" v={placeIssue} />
              <KV k="Expiry Date"    v={expiryDate} />

              {/* AR passport mirror */}
              <div style={S.bb}>
                <KVAr k="رقيم الجواز"    v={passportNo} />
                <KVAr k="تاريخ الإصدار"  v={issueDate}  />
                <KVAr k="مكان الاصدار"   v={placeIssue} />
                <KVAr k="تاريخ الانتهاء" v={expiryDate} last />
              </div>

              {/* Full-body / standing photo */}
              <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:8 }}>
                {bodyUrl
                  ? <img src={bodyUrl} alt="full body" style={{ width:145, height:200, objectFit:"cover" }} />
                  : <div style={{ width:145, height:200, background:"#ddd", border:"1px solid #aaa" }} />
                }
              </div>
            </div>

            {/* ── COL C — Arabic labels ── */}
            <div style={{ direction:"rtl", fontSize:10.5 }}>
              <GoldBarAr text="بيانات الطلب" />
              {["الجنسيه","الديانه","التاريخ","مكان الولاده","العمر","العنوان","الحاله","عدد الاطفال","ارتفاع","وزن"]
                .map((ar,i) => <ArCell key={i} text={ar} />)}

              <GoldBarAr text="اللغه & التعليم" />
              <ArCell text="العاملة لغة" minH />
              <ArCell text="المستوي التعليمي" />

              <GoldBarAr text="خبره العمل" />
              <ArCell text="المده" />
              <ArCell text="البلد" />

              <GoldBarAr text="الخبره & المهارات" />
              {skills.map((s,i) => <ArCell key={i} text={s.ar} last={i===skills.length-1} />)}
            </div>

          </div>{/* end main3col */}

          {/* ── REMARKS ── */}
          <div style={{ display:"flex", alignItems:"center", padding:"3px 10px", gap:14 }}>
            <span style={{ fontWeight:"bold", fontStyle:"italic", fontSize:10.5 }}>Remarks</span>
            <span style={{ color:"#8B6914", fontWeight:"bold", fontSize:11 }}>{remarks}</span>
            <span style={{ color:"#8B6914", fontWeight:"bold", fontSize:11 }}>{remarksDate}</span>
          </div>

        </div>{/* end CV */}
      </div>{/* end scroll wrapper */}
    </div>
  );
};

export default CV;