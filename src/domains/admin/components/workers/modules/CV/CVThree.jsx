import React, { useCallback, useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { getWorkerCVData } from "../../../../api/worker.api";
import { getUsersLookup } from "../../../../api/user.api";
import BackButton from "../../../../../../shared/components/BackButton/BackButton";
import { useNavigate, useParams } from "react-router-dom";
import useLoader from "../../../../../../context/Loader/useLoader";
import useResponse from "../../../../../../context/Response/useResponse";
import useProfile from "../../../../../../context/Profile/useProfile";
import cvFooterLogo from "../../../../../../assets/img/cv/cv-footer.png";

const safeDate = (date) => (date ? date.slice(0, 10) : "");

const REFERENCE_PREFIX = "CV";

const generateReferenceNumber = (worker) => {
  const existing = worker?.reference_number ?? worker?.reference_no;
  if (existing) return existing;

  const workerId = worker?.id ?? worker?.worker_id;
  if (!workerId) return "";

  return `${REFERENCE_PREFIX}-${String(workerId).padStart(6, "0")}`;
};

const subtractDate = (firstDate, secondDate) => {
  const date1 = new Date(firstDate);
  const date2 = new Date(secondDate);
  const diff = date1.getTime() - date2.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);

  return years > 0 ? `${years} years` : `${months} months`;
};

/* ------------------------------------------------------------------ */
/*  THEME - matches the Musaned / Al Esnad Almasi blue paper template  */
/* ------------------------------------------------------------------ */
const BLUE = "#3D6DA6";
const FONT = "Arial, Helvetica, sans-serif";

/* Fallback agency contact info shown on the page-2 header strip.
   Prefer live values from the selected partner when available. */
const AGENCY_CONTACT = {
  email: "alesnadalmasi@hotma.com",
  phone: "837310029",
  addressAr: "طريق الملك عبدالعزيز، المروج، الرياض 4368، الرياض 12282",
};

const css = {
  titleBar: {
    background: BLUE,
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
    padding: "5px 8px",
    borderBottom: "1px solid #000",
  },
  sectionBar: {
    background: BLUE,
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 22,
    fontSize: 13,
    padding: "4px 8px",
    borderTop: "1px solid #000",
    borderBottom: "1px solid #000",
    textAlign: "center",
  },
  sectionBarEn: { fontWeight: "bold" },
  sectionBarAr: { fontWeight: "bold", direction: "rtl" },
  titleStack: {
    background: BLUE,
    color: "#fff",
    textAlign: "center",
    padding: "4px 8px 6px",
    borderTop: "1px solid #000",
    borderBottom: "1px solid #000",
  },
  titleStackMain: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 22,
    fontSize: 13,
    fontWeight: "bold",
  },
  titleStackSub: {
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 3,
  },
  rowLabel: {
    padding: "3px 6px",
    fontWeight: "bold",
    fontSize: 12,
    borderRight: "1px solid #000",
  },
  rowValue: {
    padding: "3px 6px",
    fontSize: 12,
    borderRight: "1px solid #000",
    display: "flex",
    alignItems: "center",
  },
  rowValueBold: {
    padding: "3px 6px",
    fontSize: 12,
    fontWeight: "bold",
    color: "#c0392b",
    borderRight: "1px solid #000",
    display: "flex",
    alignItems: "center",
  },
  rowAr: {
    padding: "3px 6px",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right",
    direction: "rtl",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  fullNameRow: {
    display: "grid",
    gridTemplateColumns: "150px 1fr 200px",
    background: BLUE,
    color: "#fff",
    borderTop: "1px solid #000",
    borderBottom: "1px solid #000",
  },
  fullNameLabel: {
    padding: "5px 8px",
    fontWeight: "bold",
    fontSize: 13,
    background: BLUE,
    color: "#fff",
    borderRight: "1px solid #000",
  },
  fullNameValue: {
    padding: "5px 8px",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
    color: "#000",
    background: "#fff",
    borderRight: "1px solid #000",
  },
  fullNameAr: {
    padding: "5px 8px",
    fontWeight: "bold",
    fontSize: 13,
    textAlign: "right",
    direction: "rtl",
  },
  summaryWrap: {
    background: BLUE,
    color: "#fff",
    textAlign: "center",
    padding: "10px 18px 16px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 8,
    borderTop: "1px solid #000",
  },
  summaryTitle: {
    fontWeight: "bold",
    fontSize: 14,
    display: "flex",
    justifyContent: "center",
    gap: 10,
  },
  summaryTitleAr: { direction: "rtl" },
  summaryText: {
    fontWeight: "bold",
    fontSize: 13,
    lineHeight: 1.7,
  },
  contactHeader: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    border: "2px solid #000",
    borderBottom: "none",
  },
  contactCellEn: {
    padding: "10px 12px",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 12,
    lineHeight: 1.8,
    borderRight: "1px solid #000",
  },
  contactCellAr: {
    padding: "10px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  contactCellArBox: {
    background: BLUE,
    color: "#fff",
    border: "1px solid #000",
    borderRadius: 2,
    padding: "8px 14px",
    margin: "2px",
    fontWeight: "bold",
    fontSize: 12,
    lineHeight: 1.8,
    textAlign: "center",
    direction: "rtl",
  },
};

const SectionBar = ({ en, ar }) => (
  <div style={css.sectionBar}>
    <div style={css.sectionBarEn}>{en}</div>
    {ar ? <div style={css.sectionBarAr}>{ar}</div> : null}
  </div>
);

/* A title bar with a subheading stacked directly beneath it, both inside
   the SAME blue block with no divider between them - used where the
   template treats the title and the subheading as one continuous title
   (e.g. "PREVIOUS EMPLOYMENT / العمل السابق" + "COUNTRY WORKED BEFORE"). */
const TitleStack = ({ en, ar, sub }) => (
  <div style={css.titleStack}>
    <div style={css.titleStackMain}>
      <span>{en}</span>
      {ar ? <span style={{ direction: "rtl" }}>{ar}</span> : null}
    </div>
    {sub ? <div style={css.titleStackSub}>{sub}</div> : null}
  </div>
);

/* Data row: EN label | value | AR label - mirrors the template.
   Always renders the same 3 fixed-width columns (even when arLabel is
   empty) so the vertical divider lines stay connected from row to row
   instead of jumping around when a row happens to skip the Arabic cell. */
const Row3 = ({
  label,
  value,
  arLabel,
  boldValue,
  last,
  cols = "125px 1fr 140px",
}) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: cols,
      ...(last ? {} : { borderBottom: "1px solid #000" }),
    }}
  >
    <div style={css.rowLabel}>{label}</div>
    <div style={boldValue ? css.rowValueBold : css.rowValue}>{value ?? ""}</div>
    <div style={css.rowAr}>{arLabel ?? ""}</div>
  </div>
);

/* Checklist row with a ✓ / ✗ mark, used for Skills & Languages.
   Defaults to the SAME column widths as Row3 so the divider lines run
   straight through from Personal Data into Skills, but a table can pass
   its own `cols` (e.g. equal thirds) when it needs to match a neighbouring
   table instead. */
const CheckRow = ({ en, checked, ar, last, cols = "125px 1fr 140px" }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: cols,
      ...(last ? {} : { borderBottom: "1px solid #000" }),
    }}
  >
    <div style={css.rowLabel}>{en}</div>
    <div
      style={{
        padding: "3px 6px",
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 14,
        color: checked ? "#1f7a3d" : "#b5231b",
        borderRight: "1px solid #000",
      }}
    >
      {checked ? "✓" : "✗"}
    </div>
    <div style={css.rowAr}>{ar}</div>
  </div>
);

const PhotoBox = ({ url, alt, placeholderLabel }) => (
  <div
    style={{
      position: "relative",
      width: "100%",
      height: "100%",
      minHeight: 140,
    }}
  >
    {url ? (
      <img
        src={url}
        alt={alt}
        crossOrigin="anonymous"
        style={{
          position: "absolute",
          inset: 0,
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
          inset: 0,
          background: "#e2e2e2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#999",
          fontSize: 11,
          textAlign: "center",
          padding: 6,
        }}
      >
        {placeholderLabel}
      </div>
    )}
  </div>
);

const captureElementToPage = async (
  pdf,
  element,
  waitMs = 500,
  marginX = 8,
  marginY = 8,
) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const originalWidth = element.style.width;
  element.style.width = "760px";

  await new Promise((resolve) => setTimeout(resolve, waitMs));

  const canvas = await html2canvas(element, {
    useCORS: true,
    allowTaint: false,
    scale: 2,
    windowWidth: 760,
  });

  element.style.width = originalWidth;

  const imageData = canvas.toDataURL("image/jpeg", 0.95);
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  const printableWidth = pageWidth - marginX * 2;
  const printableHeight = pageHeight - marginY * 2;
  const ratio = Math.min(
    printableWidth / canvasWidth,
    printableHeight / canvasHeight,
  );

  const imageWidth = canvasWidth * ratio;
  const imageHeight = canvasHeight * ratio;
  const offsetX = marginX + (printableWidth - imageWidth) / 2;
  const offsetY = marginY + (printableHeight - imageHeight) / 2;

  pdf.addImage(imageData, "JPEG", offsetX, offsetY, imageWidth, imageHeight);
};

const CVThree = ({ templateSwitcher }) => {
  const { id } = useParams();
  const cvRef = useRef(null);
  const passportRef = useRef(null);
  const headerLoadingUrlRef = useRef(null);
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);
  const [partners, setPartners] = useState([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");

  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { profile } = useProfile();

  const fetchWorkerData = useCallback(async () => {
    const workerId = id ?? profile?.id;
    if (!workerId) return;

    showLoader();

    try {
      const response = await getWorkerCVData(workerId);
      setWorker(response.data);
    } catch (error) {
      console.error("fetch error:", error);
      addMessage(false, "Failed to load CV data");
    } finally {
      hideLoader();
    }
  }, [id, profile?.id]);

  useEffect(() => {
    fetchWorkerData();
  }, [fetchWorkerData]);

  useEffect(() => {
    const fetchPartners = async () => {
      /*
       * A logged-in partner should only use their own account. Admin and
       * employee users continue to receive the existing partner lookup.
       */
      if (Number(profile?.role_id) === 3) {
        /* Fixed CV_ONE/CV_TWO partners are not New Partner CV choices. */
        if (profile?.cv_template_code) {
          setPartners([]);
          setSelectedPartnerId("");
          return;
        }

        const ownPartner = {
          id: profile?.id,
          full_name: profile?.full_name,
          email: profile?.email,
          partner_id: profile?.partner_id,
          cv_header_url: profile?.cv_header_url,
          cv_template_code: profile?.cv_template_code,
        };

        setPartners([ownPartner]);

        if (ownPartner.partner_id) {
          setSelectedPartnerId(String(ownPartner.partner_id));

          if (ownPartner.cv_header_url) {
            headerLoadingUrlRef.current = ownPartner.cv_header_url;
            showLoader();
          }
        }

        return;
      }

      try {
        const response = await getUsersLookup({ role_id: 3 });
        const allPartners = Array.isArray(response?.data) ? response.data : [];

        /* New Partner CV only uses partners without a fixed CV template. */
        setPartners(allPartners.filter((partner) => !partner.cv_template_code));
      } catch (error) {
        console.error("fetch partners error:", error);
        addMessage(false, "Failed to load partners");
      }
    };

    if (profile) {
      fetchPartners();
    }
  }, [profile]);

  const selectedPartner = partners.find(
    (partner) => String(partner.partner_id) === String(selectedPartnerId),
  );

  const selectedPartnerHeaderUrl = selectedPartner?.cv_header_url || null;

  const getPartnerOptionLabel = (partner) => {
    const fullLabel =
      partner.full_name || partner.email || `Partner ${partner.partner_id}`;

    const shortLabel =
      fullLabel.length > 32 ? `${fullLabel.slice(0, 29)}...` : fullLabel;

    return partner.cv_header_url ? shortLabel : `${shortLabel} (No header)`;
  };

  const handlePartnerChange = (event) => {
    const nextPartnerId = event.target.value;
    const nextPartner = partners.find(
      (partner) => String(partner.partner_id) === String(nextPartnerId),
    );
    const nextHeaderUrl = nextPartner?.cv_header_url || null;

    setSelectedPartnerId(nextPartnerId);

    if (headerLoadingUrlRef.current) {
      headerLoadingUrlRef.current = null;
      hideLoader();
    }

    if (nextHeaderUrl) {
      headerLoadingUrlRef.current = nextHeaderUrl;
      showLoader();
    }
  };

  const handleHeaderLoaded = () => {
    if (headerLoadingUrlRef.current === selectedPartnerHeaderUrl) {
      headerLoadingUrlRef.current = null;
      hideLoader();
    }
  };

  const handleHeaderLoadError = () => {
    if (headerLoadingUrlRef.current) {
      headerLoadingUrlRef.current = null;
      hideLoader();
    }

    addMessage(false, "Failed to load the selected partner header");
  };

  useEffect(() => {
    return () => {
      if (headerLoadingUrlRef.current) {
        headerLoadingUrlRef.current = null;
        hideLoader();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const existingSelectedPartnerCv = Array.isArray(worker?.generated_cvs)
    ? worker.generated_cvs.find(
        (cv) =>
          cv.category === "CV_THREE" &&
          String(cv.partner_id) === String(selectedPartnerId),
      ) || null
    : null;

  const hasSelectedPartnerCv = Boolean(existingSelectedPartnerCv);

  const handleGenerateClick = () => {
    if (!selectedPartnerId) {
      addMessage(false, "Please select a partner");
      return;
    }

    if (!selectedPartnerHeaderUrl) {
      addMessage(false, "The selected partner does not have a CV header");
      return;
    }

    handleGenerateAndUpload();
  };

  const handleGenerateAndUpload = async () => {
    if (!cvRef.current || !worker) return;

    if (!selectedPartnerId || !selectedPartnerHeaderUrl) {
      addMessage(false, "Please select a partner with a CV header");
      return;
    }

    showLoader();

    try {
      const pdf = new jsPDF("p", "mm", "a4");

      // Page 1: application + personal data + skills
      await captureElementToPage(pdf, cvRef.current, 400);

      // Page 2: previous employment, languages/education, passport scan
      if (passportRef.current) {
        pdf.addPage();
        await captureElementToPage(pdf, passportRef.current, 800);
      }

      const blob = pdf.output("blob");
      const name = `${worker.full_name.replace(/\s+/g, "_")}_CV`;
      const file = new File([blob], `${name}.pdf`, {
        type: "application/pdf",
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("file_name", name);
      formData.append("category", "CV_THREE");
      formData.append("is_private", 0);
      formData.append("description", `CV for ${worker.full_name}`);
      formData.append("worker_id", worker.id);
      formData.append("partner_id", selectedPartnerId);

      // await uploadFile(formData);

      /*
       * Keep the local state in sync so the button immediately changes from
       * "Generate CV" to "Update CV" for this selected partner.
       */
      setWorker((previous) => {
        const previousCvs = Array.isArray(previous?.generated_cvs)
          ? previous.generated_cvs
          : [];

        const otherCvs = previousCvs.filter(
          (cv) =>
            !(
              cv.category === "CV_THREE" &&
              String(cv.partner_id) === String(selectedPartnerId)
            ),
        );

        return {
          ...previous,
          generated_cvs: [
            {
              ...existingSelectedPartnerCv,
              category: "CV_THREE",
              partner_id: Number(selectedPartnerId),
            },
            ...otherCvs,
          ],
        };
      });

      addMessage(
        true,
        `CV ${hasSelectedPartnerCv ? "updated" : "generated"} and uploaded successfully!`,
      );
    } catch (error) {
      console.error(error);
      addMessage(false, "Failed to generate PDF");
    } finally {
      hideLoader();
    }
  };

  if (!worker) return null;

  /* ---------------------------------------------------------------- */
  /*  Field mapping (worker -> template fields)                       */
  /* ---------------------------------------------------------------- */
  const ref = generateReferenceNumber(worker);
  const category = worker.primary_positions?.[0] ?? "House Maid";
  const salary = worker.monthly_salary ? `${worker.monthly_salary} S.R` : "";
  const contract =
    worker.contract_start_date && worker.contract_end_date
      ? subtractDate(worker.contract_end_date, worker.contract_start_date)
      : (worker.contract_period ?? "2 Years");
  const code = worker.agency_code ?? worker.code ?? "";
  const applicationDate =
    safeDate(worker.application_date) || safeDate(worker.created_at);

  const phone = worker.phone_number ?? "";
  const name = (worker.full_name ?? "").toUpperCase();
  const nationality = worker.nationality ?? "";
  const religion = worker.religion ?? "";
  const dateOfBirth = safeDate(worker.date_of_birth);
  const placeOfBirth = (worker.place_of_birth ?? "").toUpperCase();
  const livingTown = (worker.living_town ?? worker.address ?? "").toUpperCase();
  const age = worker.date_of_birth
    ? String(
        new Date().getFullYear() - new Date(worker.date_of_birth).getFullYear(),
      )
    : "";
  const maritalStatus = worker.marital_status ?? "";
  const numberOfChildren = String(worker.number_of_children ?? "");
  const height = worker.height_cm ? `${worker.height_cm} cm` : "";
  const weight = worker.weight_kg ? `${worker.weight_kg} kg` : "";
  const complexion = worker.complexion ?? "";
  const nearestRelative = worker.nearest_relative ?? "";

  const education = (worker.education ?? "").toUpperCase();

  const passportNumber = worker.passport_number ?? "";
  const passportIssueDate = safeDate(worker.passport_issue_date);
  const passportIssuePlace = worker.passport_issuing_country ?? "";
  const passportExpiryDate = safeDate(worker.passport_expiry_date);

  const faceUrl = worker.photo_3x4_url ?? "";
  const bodyUrl = worker.photo_standing_url ?? "";

  const profileSummary = worker.profile_summary ?? worker.summary ?? "";

  /* Page-2 contact strip: prefer the selected partner's own details,
     fall back to the agency defaults shown in the sample template. */
  const agencyEmail = selectedPartner?.email ?? AGENCY_CONTACT.email;
  const agencyPhone =
    selectedPartner?.phone ?? selectedPartner?.tel ?? AGENCY_CONTACT.phone;
  const agencyAddress =
    selectedPartner?.address_ar ??
    selectedPartner?.address ??
    AGENCY_CONTACT.addressAr;

  /* Skills checklist - matches the template's tick list exactly.
     HARD-CODED for now per your request: checked through "Arabic Cooking",
     unchecked from "Sewing" onward. Swap back to the worker.skills lookup
     (kept below, commented out) once skill data is wired up per worker. */
  const SKILL_DEFINITIONS = [
    {
      en: "Baby Sitting",
      ar: "مجالسة الاطفال",
      key: "Baby Sitting",
      checked: true,
    },
    {
      en: "Children Care",
      ar: "رعاية الأطفال",
      key: "Children Care",
      checked: true,
    },
    { en: "Tutoring", ar: "دروس خصوصية", key: "Tutoring", checked: true },
    {
      en: "Disabled Care",
      ar: "رعاية المعاقين",
      key: "Disabled Care",
      checked: true,
    },
    { en: "Cleaning", ar: "تنظيف", key: "Cleaning", checked: true },
    { en: "Washing", ar: "غسل", key: "Washing", checked: true },
    { en: "Ironing", ar: "كي الملابس", key: "Ironing", checked: true },
    {
      en: "Arabic Cooking",
      ar: "الطبخ العربي",
      key: "Arabic Cooking",
      checked: true,
    },
    { en: "Sewing", ar: "خياطة", key: "Sewing", checked: false },
    {
      en: "Computers",
      ar: "أجهزة الكمبيوتر",
      key: "Computers",
      checked: false,
    },
    { en: "Driving", ar: "القيادة", key: "Driving", checked: false },
    { en: "Others", ar: "مهارات اخرى", key: "Others", checked: false },
  ];

  // const workerSkillNames =
  //   worker.skills?.map((skill) =>
  //     (skill.skill_name ?? skill.name ?? skill).toLowerCase(),
  //   ) ?? [];

  const skills = SKILL_DEFINITIONS.map((skill) => ({
    en: skill.en,
    ar: skill.ar,
    checked: skill.checked,
    // checked: workerSkillNames.includes(skill.key.toLowerCase()), // <- switch to this later
  }));

  /* Languages checklist */
  const LANGUAGE_DEFINITIONS = [
    { en: "English", ar: "الإنجليزية" },
    { en: "Arabic", ar: "عربى" },
  ];

  const workerLanguageNames =
    worker.languages?.map((language) =>
      (language.language ?? language.name ?? language).toLowerCase(),
    ) ?? [];

  const languages = LANGUAGE_DEFINITIONS.map((language) => ({
    en: language.en,
    ar: language.ar,
    checked: workerLanguageNames.includes(language.en.toLowerCase()),
  }));

  /* Previous employment - array of { country, years } */
  const previousEmployment =
    Array.isArray(worker.experience) && worker.experience.length
      ? worker.experience
      : [
          { country: "", years: "" },
          { country: "", years: "" },
        ];

  const cvStyle = {
    width: 760,
    minWidth: 760,
    background: "#fff",
    fontFamily: FONT,
    color: "#000",
    boxSizing: "border-box",
    border: "2px solid #000",
    padding: 6,
  };

  return (
    <div className="dashboard-wraper">
      {/* Toolbar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3">
        <div className="mt-0">
          <h2 className="fw-bold text-dark mb-2">CV</h2>
          <p className="text-muted mb-0">Generate and upload CV</p>
        </div>

        <div className="position-absolute top-0 end-0 mt-4 pt-2">
          {Number(profile?.role_id) !== 4 && (
            <BackButton onClick={() => navigate(-1)} />
          )}
        </div>

        {(Number(profile?.role_id) === 1 || Number(profile?.role_id) === 2) && (
          <button
            className="btn btn-main mt-3 mt-md-5  text-white w-45 d-flex align-items-center justify-content-center"
            onClick={handleGenerateClick}
          >
            {hasSelectedPartnerCv ? "Update CV" : "Generate CV"}
          </button>
        )}
      </div>

      <div className="mb-3 mt-1">{templateSwitcher}</div>

      {/* Partner control remains outside cvRef, so it is not captured in the PDF. */}
      <div className="mb-2">
        <select
          id="cv-three-partner"
          className="form-select form-select-sm d-inline-block w-auto"
          value={selectedPartnerId}
          onChange={handlePartnerChange}
          disabled={Number(profile?.role_id) === 3}
          style={{
            borderRadius: 999,
            fontWeight: 600,
            fontSize: 13,
            paddingTop: 4,
            paddingBottom: 4,
            paddingLeft: 14,
            paddingRight: 30,
            maxWidth: 220,
            cursor: Number(profile?.role_id) === 3 ? "default" : "pointer",
          }}
        >
          <option value="">Select Partner</option>

          {partners.map((partner) => (
            <option key={partner.partner_id} value={partner.partner_id}>
              {getPartnerOptionLabel(partner)}
            </option>
          ))}
        </select>
      </div>

      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        {/* Page 1: application, passport, personal data, skills, summary */}
        <div ref={cvRef} style={cvStyle}>
          {/* Agency banner (Musaned / Al Esnad Almasi logo strip) */}
          {selectedPartnerHeaderUrl ? (
            <img
              src={selectedPartnerHeaderUrl}
              alt={`${selectedPartner?.full_name || "Partner"} CV Header`}
              crossOrigin="anonymous"
              onLoad={handleHeaderLoaded}
              onError={handleHeaderLoadError}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                marginBottom: 6,
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: 90,
                marginBottom: 6,
                border: "2px dashed #999",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
                fontSize: 12,
              }}
            >
              {selectedPartnerId
                ? "The selected partner does not have a CV header"
                : "Select a partner above to load the CV header"}
            </div>
          )}

          <div style={{ border: "2px solid #000" }}>
            {/* APPLICATION FOR EMPLOYMENT title */}
            <div style={css.titleBar}>APPLICATION FOR EMPLOYMENT</div>

            {/* Headshot photo (left) + Application/Passport details (right) */}
            <div style={{ display: "flex", borderBottom: "1px solid #000" }}>
              <div style={{ flex: "0 0 260px", borderRight: "1px solid #000" }}>
                <PhotoBox
                  url={faceUrl}
                  alt="Headshot"
                  placeholderLabel="Photo"
                />
              </div>

              <div
                style={{ flex: 1, display: "flex", flexDirection: "column" }}
              >
                <Row3 label="Category" value={category} />
                <Row3
                  label="Monthly Salary"
                  value={salary}
                  arLabel="راتب شهري"
                />
                <Row3
                  label="Contract Period"
                  value={contract}
                  arLabel="مدة العقد"
                />
                <Row3 label="CODE" value={code} />
                <Row3 label="Date" value={applicationDate} last />

                <SectionBar en="PASSPORT DETAILS" ar="تفاصيل جواز السفر" />
                <Row3
                  label="Number"
                  value={passportNumber}
                  arLabel="رقم الجواز"
                  boldValue
                />
                <Row3
                  label="Date of Issue"
                  value={passportIssueDate}
                  arLabel="تاريخ الجواز"
                />
                <Row3
                  label="Date of Expiry"
                  value={passportExpiryDate}
                  arLabel="انتهاء الصلاحية"
                />
                <Row3
                  label="Place of Issue"
                  value={passportIssuePlace}
                  arLabel="مكان صدوره"
                  last
                />
              </div>
            </div>

            {/* FULL NAME */}
            <div style={css.fullNameRow}>
              <div style={css.fullNameLabel}>FULL NAME</div>
              <div style={css.fullNameValue}>{name}</div>
              <div style={css.fullNameAr}>الاسم بالكامل</div>
            </div>

            {/* Personal data + skills + profile summary (left) / standing photo (right,
                stretched to match the full combined height of the left column) */}
            <div style={{ display: "flex" }}>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  borderRight: "1px solid #000",
                }}
              >
                <SectionBar en="PERSONAL DATA" ar="البيانات الشخصية" />
                <Row3
                  label="Nationality"
                  value={nationality}
                  arLabel="الجنسية"
                />
                <Row3 label="Religion" value={religion} arLabel="الديانة" />
                <Row3 label="Age" value={age} arLabel="السن" />
                <Row3
                  label="Date of Birth"
                  value={dateOfBirth}
                  arLabel="تاريخ الميلاد"
                />
                <Row3
                  label="Place of Birth"
                  value={placeOfBirth}
                  arLabel="مكان الميلاد"
                />
                <Row3
                  label="Living Town"
                  value={livingTown}
                  arLabel="المدينة"
                />
                <Row3
                  label="Marital Status"
                  value={maritalStatus}
                  arLabel="الحالة الاجتماعية"
                />
                <Row3
                  label="No. of Children"
                  value={numberOfChildren}
                  arLabel="عدد الاطفال"
                />
                <Row3 label="Weight" value={weight} arLabel="الوزن" />
                <Row3 label="Height" value={height} arLabel="الارتفاع" />
                <Row3
                  label="Complexion"
                  value={complexion}
                  arLabel="لون البشرة"
                />
                <Row3
                  label="Nearest relative"
                  value={nearestRelative}
                  arLabel="اسم قريب"
                />
                <Row3
                  label="Mobile No"
                  value={phone}
                  arLabel="رقم الجوال"
                  last
                />

                <SectionBar en="SKILLS & EXPERIENCES" ar="المهارات والخبرات" />
                {skills.map((skill, index) => (
                  <CheckRow
                    key={skill.en}
                    en={skill.en}
                    checked={skill.checked}
                    ar={skill.ar}
                    last={index === skills.length - 1}
                  />
                ))}

                {/* PROFILE SUMMARY lives inside this same column, so the
                    standing photo naturally stretches to its bottom edge.
                    Title and text share one uninterrupted blue block, like
                    the template, instead of a separate header bar. */}
                <div style={css.summaryWrap}>
                  <div style={css.summaryTitle}>
                    <span>PROFILE SUMMARY</span>
                    <span style={css.summaryTitleAr}>ملخص الملف</span>
                  </div>
                  <div style={css.summaryText}>{profileSummary || "—"}</div>
                </div>
              </div>

              <div style={{ flex: "0 0 400px" }}>
                <PhotoBox
                  url={bodyUrl}
                  alt="Full body"
                  placeholderLabel="Photo"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Page 2: previous employment, languages/education, passport scan */}
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
          {/* Agency contact strip - email / tel on the left, street address
              (Arabic) on the right, as its own bordered box above the
              Previous Employment table. */}
          <div style={css.contactHeader}>
            <div style={css.contactCellEn}>
              EMAIL
              <br />
              {agencyEmail || "—"}
              <br />
              Tell
              <br />
              {agencyPhone || "—"}
            </div>
            <div style={css.contactCellAr}>
              <div style={css.contactCellArBox}>{agencyAddress || "—"}</div>
            </div>
          </div>

          <div style={{ border: "2px solid #000" }}>
            {/* PREVIOUS EMPLOYMENT / العمل السابق / COUNTRY WORKED BEFORE
                is treated as ONE title block - no divider between the two
                lines, matching the template. Both tables below use equal
                thirds so their columns line up with each other. */}
            <TitleStack
              en="PREVIOUS EMPLOYMENT"
              ar="العمل السابق"
              sub="COUNTRY WORKED BEFORE"
            />
            {previousEmployment.map((entry, index) => (
              <div
                key={`${entry.country}-${index}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  borderBottom: "1px solid #000",
                  textAlign: "center",
                  fontSize: 12,
                }}
              >
                <div
                  style={{
                    padding: "3px 6px",
                    fontWeight: "bold",
                    color: "#c0392b",
                    borderRight: "1px solid #000",
                  }}
                >
                  {(entry.country ?? "").toUpperCase()}
                </div>
                <div
                  style={{ padding: "3px 6px", borderRight: "1px solid #000" }}
                >
                  {entry.years ?? ""}
                </div>
                <div
                  style={{
                    padding: "3px 6px",
                    fontWeight: "bold",
                    color: "#c0392b",
                  }}
                >
                  YEAR
                </div>
              </div>
            ))}

            <SectionBar en="LANGUAGES & EDUCATION" ar="اللغات والتعليم" />
            {languages.map((language, index) => (
              <CheckRow
                key={language.en}
                en={language.en}
                checked={language.checked}
                ar={language.ar}
                last={false}
                cols="1fr 1fr 1fr"
              />
            ))}
            <Row3
              label="Education (Course)"
              value={education}
              arLabel="دورة تعليم"
              boldValue
              last
              cols="1fr 1fr 1fr"
            />
          </div>

          {/* Passport scan - its own bordered box, separate from the
              Previous Employment / Languages table above it */}
          <div style={{ border: "2px solid #000", padding: 10, marginTop: 12 }}>
            {worker.passport_scan_url ? (
              <img
                src={worker.passport_scan_url}
                alt="Passport Scan"
                crossOrigin="anonymous"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  border: "1px solid #999",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: 300,
                  background: "#ddd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  color: "#999",
                }}
              >
                No passport scan available
              </div>
            )}
          </div>

          {/* Spacer row between the passport scan and the footer logo.
              It has no top/bottom border of its own - the passport box's
              bottom border above and the footer box's top border below
              serve as its top/bottom edges, so only the left/right sides
              are drawn here. ~1.5cm tall, same width as the boxes above
              and below so everything stays aligned. Holds the agency's
              hard-coded contact email, centered. */}
          <div
            style={{
              borderLeft: "2px solid #000",
              borderRight: "2px solid #000",
              height: "1.5cm",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                color: "#1a56db",
                textDecoration: "underline",
                fontWeight: "bold",
                fontSize: 13,
              }}
            >
              aletesalat.eth.agency@gmail.com
            </span>
          </div>

          {/* CV footer - the agency's ALETESALAT logo strip, imported as a
              static asset (not per-worker/per-partner data). Same border
              treatment as the passport box above, sitting flush against
              the spacer row. */}
          <div
            style={{
              border: "2px solid #000",
              padding: 10,
              textAlign: "center",
            }}
          >
            <img
              src={cvFooterLogo}
              alt="Agency footer"
              style={{
                maxWidth: "100%",
                height: "auto",
                display: "inline-block",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVThree;
