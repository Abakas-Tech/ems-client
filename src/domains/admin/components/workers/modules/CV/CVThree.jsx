import React, { useCallback, useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  getWorkerCVData,
  generateCvForPartner,
  setPartnerCvAccess,
} from "../../../../api/worker.api";
import { getUsersLookup } from "../../../../api/user.api";
import BackButton from "../../../../../../shared/components/BackButton/BackButton";
import { useNavigate, useParams } from "react-router-dom";
import useLoader from "../../../../../../context/Loader/useLoader";
import useResponse from "../../../../../../context/Response/useResponse";
import useProfile from "../../../../../../context/Profile/useProfile";
import cvFooterLogo from "../../../../../../assets/img/cv/cv-footer.png";
import CVToolbox from "./CVToolbox";

const safeDate = (date) => (date ? date.slice(0, 10) : "");

// Formats a Date as "1-Jul-26" (day-Mon-YY), matching the template's
// "Date" field on the Application section.
const formatShortDate = (date) => {
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = String(date.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
};

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
const RED = "#B22222";
const FONT = "Arial, Helvetica, sans-serif";

/* Selectable CV accent colors, shown as small filled circles in the
   toolbox. Extend by adding another { name, value } entry. */
const COLOR_OPTIONS = [
  { name: "Blue", value: BLUE },
  { name: "Red", value: RED },
  { name: "Green", value: "#2E7D32" },
  { name: "Purple", value: "#6A1B9A" },
  { name: "Teal", value: "#00796B" },
  { name: "Navy", value: "#1B2A4A" },
];

/* Fixed capture / preview width. Must stay identical between what the
   user sees and what html2canvas captures. */
const CV_WIDTH = 760;

/* Fallback agency contact info shown on the page-2 header strip.
   Prefer live values from the selected partner when available. */
const AGENCY_CONTACT = {
  email: "alesnadalmasi@hotma.com",
  phone: "837310029",
  addressAr: "طريق الملك عبدالعزيز، المروج، الرياض 4368، الرياض 12282",
};

const css = {
  titleBar: {
    background: "var(--cv-theme-color)",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
    padding: "5px 8px",
    borderBottom: "1px solid #000",
  },
  sectionBar: {
    background: "var(--cv-theme-color)",
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
    background: "var(--cv-theme-color)",
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
    fontSize: 13,
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
    background: "var(--cv-theme-color)",
    color: "#fff",
    borderTop: "1px solid #000",
    borderBottom: "1px solid #000",
  },
  fullNameLabel: {
    padding: "5px 8px",
    fontWeight: "bold",
    fontSize: 13,
    background: "var(--cv-theme-color)",
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
    background: "var(--cv-theme-color)",
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
  /* No-passport layout: plain centered contact footer (phone/email/address),
     matching the sample's simple text strip instead of a bordered box. */
  noPassportFooter: {
    textAlign: "center",
    padding: "10px 12px",
    fontSize: 12,
    fontWeight: "bold",
    color: "var(--cv-theme-color)",
    lineHeight: 1.8,
  },
  /* No-passport layout: a full-width descriptive bar for prior experience,
     styled like the existing "FIRST TIME" row used on page 2. */
  experienceRow: {
    padding: "6px 6px",
    borderBottom: "1px solid #000",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "bold",
    color: "#c0392b",
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

/* PREVIOUS EMPLOYMENT / COUNTRY WORKED BEFORE table. Lives on page 2
   when the passport scan is included, but moves onto the bottom of page 1
   (inside the SKILLS & EXPERIENCES column) when it's excluded - extracted
   so both layouts render the exact same markup. */
const PreviousEmploymentTable = ({ entries }) => (
  <>
    <TitleStack
      en="PREVIOUS EMPLOYMENT"
      ar="العمل السابق"
      sub="COUNTRY WORKED BEFORE"
    />
    {entries.map((entry, index) =>
      entry.isFirstTime ? (
        <div
          key="first-time"
          style={{
            padding: "6px 6px",
            borderBottom: "1px solid #000",
            textAlign: "center",
            fontSize: 12,
            fontWeight: "bold",
            color: "#c0392b",
          }}
        >
          FIRST TIME
        </div>
      ) : (
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
          <div style={{ padding: "3px 6px", borderRight: "1px solid #000" }}>
            {entry.years ?? ""}
          </div>
          <div
            style={{ padding: "3px 6px", fontWeight: "bold", color: "#c0392b" }}
          >
            YEAR
          </div>
        </div>
      ),
    )}
  </>
);

/* LANGUAGES & EDUCATION table - same relocation as PreviousEmploymentTable
   above, and for the same reason (both move to page 1 without the
   passport scan). */
const LanguagesEducationTable = ({ languages, education }) => (
  <>
    <SectionBar en="LANGUAGES & EDUCATION" ar="اللغات والتعليم" />
    {languages.map((language) => (
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
  </>
);

/* Agency contact strip - email / tel on one side, street address (Arabic)
   on the other. Sits above the Previous Employment table on page 2 when
   the passport scan is included, or as the final block on page 1 (right
   under the standing photo) when it's excluded. */
const ContactAddressStrip = ({ email, phone, address }) => (
  <div style={css.contactHeader}>
    <div style={css.contactCellEn}>
      EMAIL
      <br />
      {email || "—"}
      <br />
      Tell
      <br />
      {phone || "—"}
    </div>
    <div style={css.contactCellAr}>
      <div style={css.contactCellArBox}>{address || "—"}</div>
    </div>
  </div>
);

const PhotoBox = ({ url, alt, placeholderLabel }) => (
  <div
    style={{
      position: "relative",
      width: "100%",
      height: "100%",
      minHeight: 140,
      overflow: "hidden",
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
          objectPosition: "center top",
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

/*
 * FIX (content cut off at the page edges + page 2 narrower than page 1):
 *
 * 1. Scroll compensation - html2canvas measures capture position relative
 *    to the page's CURRENT scroll offset. `scrollX: 0, scrollY: 0` assumed
 *    the page is never scrolled, which is wrong the moment the person has
 *    scrolled down (exactly when they'd reach the Download button on a
 *    long form). Since passportRef sits further down the DOM than cvRef,
 *    a wrong scroll assumption skewed its capture differently than the
 *    first element's - that's what made page 2 come out narrower/shifted.
 *    Passing the NEGATIVE of the live scroll position (`-window.scrollX`,
 *    `-window.scrollY`) is the correct, standard compensation so both
 *    captures line up regardless of where the page happens to be scrolled.
 *    `windowHeight` is also set to the element's own full height so
 *    html2canvas's offscreen render frame always has room to lay out the
 *    entire element, not just whatever fits in the current browser window.
 *
 * 2. Full-width pages that never shrink below the preview - the image is
 *    always scaled to fill the printable WIDTH exactly, matching what you
 *    see on screen. Content taller than one A4 page is sliced across
 *    additional pages instead of being shrunk to fit a single page's
 *    height (that shrinking is what made the downloaded CV look narrower
 *    than the preview).
 */
const captureElementToPage = async (
  pdf,
  element,
  waitMs = 500,
  marginX = 1.5,
  marginY = 1.5,
) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const originalWidth = element.style.width;
  element.style.width = "760px";

/* Backend-driven partner header banner, used identically on both page 1
   and page 2 - only the image url, alt text and load handlers differ. */
const HeaderBanner = ({ url, alt, selectedPartnerId, onLoad, onError, emptyLabel }) => (
  <>
    {url ? (
      <img
        src={url}
        alt={alt}
        crossOrigin="anonymous"
        onLoad={onLoad}
        onError={onError}
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
        {selectedPartnerId ? emptyLabel : "Select a partner above to load the CV header"}
      </div>
    )}
  </>
);

/**
 * Capture a DOM node to canvas with the same width the user sees.
 * Waits for fonts + images and uses onclone so the cloned tree keeps
 * the exact fixed width (no reflow differences vs the live preview).
 */
const captureElementCanvas = async (element, waitMs = 600) => {
  await document.fonts.ready;
  await new Promise((resolve) => setTimeout(resolve, waitMs));

  // Ensure every image inside the element has finished loading
  const images = Array.from(element.querySelectorAll("img"));
  await Promise.all(
    images.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          }),
    ),
  );

  const canvas = await html2canvas(element, {
    useCORS: true,
    allowTaint: false,
    scale: 2,
    width: CV_WIDTH,
    windowWidth: CV_WIDTH,
    backgroundColor: "#ffffff",
    logging: false,
    onclone: (_clonedDoc, clonedElement) => {
      clonedElement.style.width = `${CV_WIDTH}px`;
      clonedElement.style.minWidth = `${CV_WIDTH}px`;
      clonedElement.style.maxWidth = `${CV_WIDTH}px`;
      clonedElement.style.boxSizing = "border-box";
      clonedElement.style.transform = "none";
      clonedElement.style.zoom = "1";

      // Kill any residual transforms that can shift layout in the clone
      clonedElement.querySelectorAll("*").forEach((el) => {
        if (el.style) {
          el.style.transform = "none";
        }
      });
    },
  });

  return canvas;
};

const addCanvasToPage = (pdf, canvas, ratio, margin) => {
  const imageWidth = canvas.width * ratio;
  const imageHeight = canvas.height * ratio;
  // PNG keeps text and thin borders sharper than JPEG
  const imageData = canvas.toDataURL("image/png");
  pdf.addImage(imageData, "PNG", margin, margin, imageWidth, imageHeight);
};

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  const printableWidth = pageWidth - marginX * 2;
  const printableHeight = pageHeight - marginY * 2;

  // Always fill the printable WIDTH (1:1 with the preview); the height per
  // page is however many source pixels fit at that width.
  const ratio = printableWidth / canvasWidth;
  const pageCanvasHeight = Math.floor(printableHeight / ratio);

  let renderedHeight = 0;
  let isFirstSlice = true;

  while (renderedHeight < canvasHeight) {
    const sliceHeight = Math.min(
      pageCanvasHeight,
      canvasHeight - renderedHeight,
    );

    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = canvasWidth;
    sliceCanvas.height = sliceHeight;
    sliceCanvas
      .getContext("2d")
      .drawImage(
        canvas,
        0,
        renderedHeight,
        canvasWidth,
        sliceHeight,
        0,
        0,
        canvasWidth,
        sliceHeight,
      );

    const imageData = sliceCanvas.toDataURL("image/jpeg", 0.95);
    const imageHeight = sliceHeight * ratio;

    if (!isFirstSlice) pdf.addPage();
    pdf.addImage(imageData, "JPEG", marginX, marginY, printableWidth, imageHeight);

    renderedHeight += sliceHeight;
    isFirstSlice = false;
  }
};

const CVThree = ({ templateSwitcher }) => {
  const { id } = useParams();
  const cvRef = useRef(null);
  const passportRef = useRef(null);
  /* Counts how many header images (page 1 / page 2) are currently expected
     to load, so the loader stays up until both have resolved. */
  const pendingHeaderCountRef = useRef(0);
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);
  const [partners, setPartners] = useState([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [includePassport, setIncludePassport] = useState(true);

  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { profile } = useProfile();

  const fetchWorkerData = useCallback(async () => {
    const workerId = id ?? profile?.id;
    if (!workerId) return;

    showLoader();

    try {
      // Passing the currently selected partner as a preview so the backend
      // can flag whether this worker's CV has already been shared with them.
      const response = await getWorkerCVData(
        workerId,
        selectedPartnerId || undefined,
      );
      setWorker(response.data);
    } catch (error) {
      console.error("fetch error:", error);
      addMessage(false, "Failed to load CV data");
    } finally {
      hideLoader();
    }
  }, [id, profile?.id, selectedPartnerId]);

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
          phone_number: profile?.phone_number,
          address: profile?.address,
          country: profile?.country,
          partner_id: profile?.partner_id,
          cv_header_url: profile?.cv_header_url,
          cv_header_two_url: profile?.cv_header_two_url,
          cv_template_code: profile?.cv_template_code,
        };

        setPartners([ownPartner]);

        if (ownPartner.partner_id) {
          setSelectedPartnerId(String(ownPartner.partner_id));

          const headersToLoad = [
            ownPartner.cv_header_url,
            ownPartner.cv_header_two_url,
          ].filter(Boolean);

          if (headersToLoad.length) {
            pendingHeaderCountRef.current = headersToLoad.length;
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
  const selectedPartnerHeaderTwoUrl =
    selectedPartner?.cv_header_two_url || null;

  const isJordanPartner =
    String(selectedPartner?.country || "")
      .trim()
      .toLowerCase() === "jordan";

  // Selecting a color in the toolbox overrides the country-based default;
  // until the user picks one, the existing per-country default is kept.
  const themeColor = selectedCvColor || (isJordanPartner ? RED : BLUE);

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
    const nextHeaderTwoUrl = nextPartner?.cv_header_two_url || null;

    setSelectedPartnerId(nextPartnerId);

    if (pendingHeaderCountRef.current > 0) {
      pendingHeaderCountRef.current = 0;
      hideLoader();
    }

    const headersToLoad = [nextHeaderUrl, nextHeaderTwoUrl].filter(Boolean);

    if (headersToLoad.length) {
      pendingHeaderCountRef.current = headersToLoad.length;
      showLoader();
    }
  };

  // Shared by both the page-1 and page-2 header <img> elements - each
  // decrements the pending count independently, so the loader only hides
  // once every expected header image has finished loading (or errored).
  const handleHeaderLoaded = () => {
    if (pendingHeaderCountRef.current > 0) {
      pendingHeaderCountRef.current -= 1;
      if (pendingHeaderCountRef.current <= 0) {
        pendingHeaderCountRef.current = 0;
        hideLoader();
      }
    }
  };

  const handleHeaderLoadError = () => {
    if (pendingHeaderCountRef.current > 0) {
      pendingHeaderCountRef.current -= 1;
      if (pendingHeaderCountRef.current <= 0) {
        pendingHeaderCountRef.current = 0;
        hideLoader();
      }
    }

    addMessage(false, "Failed to load the selected partner header");
  };

  useEffect(() => {
    return () => {
      if (pendingHeaderCountRef.current > 0) {
        pendingHeaderCountRef.current = 0;
        hideLoader();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Backend flags whether this CV currently has access granted to the
  // partner passed as ?partnerId= (the "preview" param) - true only while
  // that access still exists, so this naturally goes back to false if
  // access is ever revoked.
  const alreadySharedWithPartner = Boolean(worker?.already_shared_with_partner);

  // Download only ever builds and saves the PDF - it no longer grants
  // partner access. Still requires a selected partner (for admin/employee)
  // since the CV header image comes from that partner and is part of the
  // rendered PDF.
  const handleDownloadClick = () => {
    if (isPartnerRole) {
      handleDownloadCv();
      return;
    }

    if (!selectedPartnerId) {
      addMessage(false, "Please select a partner");
      return;
    }

    if (!selectedPartnerHeaderUrl) {
      addMessage(false, "The selected partner does not have a CV header");
      return;
    }

    handleDownloadCv();
  };

  const handleDownloadCv = async () => {
    if (!cvRef.current || !worker) return;

    showLoader();

    try {
      const pdf = new jsPDF("p", "mm", "a4");

      // Page 1: application + personal data + skills
      await captureElementToPage(pdf, cvRef.current, 400);

      // Page 2: previous employment, languages/education, passport scan -
      // only rendered (and only ref'd) when includePassport is on, so this
      // is naturally skipped when it's off.
      if (passportRef.current) {
        pdf.addPage();
        addCanvasToPage(pdf, passportCanvas, fitRatio(passportCanvas), margin);
      }

      const name = `${worker.full_name.replace(/\s+/g, "_")}_CV`;

      // Grant the selected partner backend access to this worker's CV
      // (creates/updates the worker_partner_cvs row) — only when an
      // admin/employee is downloading. If the viewer IS the partner, they
      // already have access (that's how they got here), and this route is
      // admin/employee-only server-side, so calling it would 403.
      if (Number(profile?.role_id) !== 3) {
        await generateCvForPartner(worker.id, {
          partnerId: selectedPartnerId,
        });

        // Keep the local state in sync so the "already shared" indicator
        // shows up immediately without needing a full refetch.
        setWorker((previous) => ({
          ...previous,
          already_shared_with_partner: true,
        }));
      }

      // Trigger an actual browser download of the PDF we just built.
      pdf.save(`${name}.pdf`);

      addMessage(true, "CV downloaded!");
    } catch (error) {
      console.error(error);
      addMessage(false, error.message || "Failed to generate PDF");
    } finally {
      hideLoader();
    }
  };

  // Link only grants (or re-grants, un-revoking) partner access - it never
  // touches the PDF at all. Admin/employee only; this hits
  // POST /workers/cv/:id/generate-cv, which the backend restricts to
  // admin/employee - never call this for a partner.
  const handleLinkClick = () => {
    if (!selectedPartnerId) {
      addMessage(false, "Please select a partner");
      return;
    }

    if (!selectedPartnerHeaderUrl) {
      addMessage(false, "The selected partner does not have a CV header");
      return;
    }

    handleLinkCv();
  };

  const handleLinkCv = async () => {
    if (!worker || !selectedPartnerId) return;

    showLoader();

    try {
      await generateCvForPartner(worker.id, {
        partnerId: selectedPartnerId,
      });

      // Keep local state in sync so the "already shared" badge and the
      // revoke toggle reflect the new grant without a full refetch.
      setWorker((previous) => ({
        ...previous,
        shared_with_partner: true,
        access_revoked: false,
      }));

      addMessage(true, "CV linked and shared with the partner!");
    } catch (error) {
      console.error(error);
      addMessage(false, error.message || "Failed to link CV to partner");
    } finally {
      hideLoader();
    }
  };

  // Toggle whether the already-linked partner can currently access this
  // CV, without deleting the underlying grant (so re-linking isn't
  // required to restore access later).
  const handleToggleAccess = async () => {
    if (!worker || !selectedPartnerId) return;

    const nextRevoked = !isAccessRevoked;

    showLoader();

    try {
      await setPartnerCvAccess(worker.id, {
        partnerId: selectedPartnerId,
        revoked: nextRevoked,
      });

      setWorker((previous) => ({
        ...previous,
        access_revoked: nextRevoked,
      }));

      addMessage(
        true,
        nextRevoked ? "Partner access revoked" : "Partner access restored",
      );
    } catch (error) {
      console.error(error);
      addMessage(false, error.message || "Failed to update partner access");
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
  // "CODE" row was removed from the template - no longer read from worker.
  const applicationDate = formatShortDate(new Date());

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
  // Hard-coded per your request - not read from worker data.
  const complexion = "Brown";
  const nearestRelative = "Father";

  const education = (worker.education ?? "").toUpperCase();

  const passportNumber = worker.passport_number ?? "";
  const passportIssueDate = safeDate(worker.passport_issue_date);
  const passportIssuePlace = worker.passport_issuing_country ?? "";
  const passportExpiryDate = safeDate(worker.passport_expiry_date);

  const faceUrl = worker.photo_3x4_url ?? "";
  const bodyUrl = worker.photo_standing_url ?? "";

  // "First time abroad" = no recorded work experience yet. Drives both the
  // Profile Summary wording and the Previous Employment table below.
  const isFirstTimeAbroad =
    !Array.isArray(worker.experience) || worker.experience.length === 0;

  const PROFILE_SUMMARY_BASE =
    "She can do all house hold chores that includes taking care of kids. She is hard working and family oriented.";

  const profileSummary = isFirstTimeAbroad
    ? `First time to work abroad. ${PROFILE_SUMMARY_BASE}`
    : PROFILE_SUMMARY_BASE;

  /* Page-2 contact strip: prefer the selected partner's own details,
     fall back to the agency defaults shown in the sample template. */
  const agencyEmail = selectedPartner?.email ?? AGENCY_CONTACT.email;
  const agencyPhone = selectedPartner?.phone_number ?? AGENCY_CONTACT.phone;
  const agencyAddress = selectedPartner?.address ?? AGENCY_CONTACT.addressAr;

  /* Skills checklist - checked/unchecked based on what's actually
     assigned to this worker (worker_skills.skills SET column). The `key`
     values below match the DB's SET literals exactly - note "other"
     (singular), not "others". Handles the value coming back either as a
     single comma-separated string (typical for a MySQL SET column) or as
     an array. */
  const SKILL_DEFINITIONS = [
    { en: "Baby Sitting", ar: "مجالسة الاطفال", key: "baby sitting" },
    { en: "Children Care", ar: "رعاية الأطفال", key: "children care" },
    { en: "Tutoring", ar: "دروس خصوصية", key: "tutoring" },
    { en: "Disabled Care", ar: "رعاية المعاقين", key: "disabled care" },
    { en: "Cleaning", ar: "تنظيف", key: "cleaning" },
    { en: "Washing", ar: "غسل", key: "washing" },
    { en: "Ironing", ar: "كي الملابس", key: "ironing" },
    { en: "Arabic Cooking", ar: "الطبخ العربي", key: "arabic cooking" },
    { en: "Sewing", ar: "خياطة", key: "sewing" },
    { en: "Computers", ar: "أجهزة الكمبيوتر", key: "computers" },
    { en: "Driving", ar: "القيادة", key: "driving" },
    { en: "Others", ar: "مهارات اخرى", key: "other" },
  ];

  const workerSkillNames = Array.isArray(worker.skills)
    ? worker.skills.map((skill) =>
        (skill.skill_name ?? skill.name ?? skill ?? "")
          .toString()
          .trim()
          .toLowerCase(),
      )
    : (worker.skills ?? "")
        .toString()
        .split(",")
        .map((skill) => skill.trim().toLowerCase())
        .filter(Boolean);

  const skills = SKILL_DEFINITIONS.map((skill) => ({
    en: skill.en,
    ar: skill.ar,
    checked: workerSkillNames.includes(skill.key),
  }));

  /* Languages checklist - only these three are sent from the frontend. */
  const LANGUAGE_DEFINITIONS = [
    { en: "English", ar: "الإنجليزية" },
    { en: "Arabic", ar: "عربى" },
    { en: "Amharic", ar: "أمهرية" },
  ];

  const workerLanguageNames = Array.isArray(worker.languages)
    ? worker.languages.map((language) =>
        (language.language ?? language.name ?? language ?? "")
          .toString()
          .trim()
          .toLowerCase(),
      )
    : (worker.languages ?? "")
        .toString()
        .split(",")
        .map((language) => language.trim().toLowerCase())
        .filter(Boolean);

  const languages = LANGUAGE_DEFINITIONS.map((language) => ({
    en: language.en,
    ar: language.ar,
    checked: workerLanguageNames.includes(language.en.toLowerCase()),
  }));

  /* Previous employment - array of { country, years }. First-time-abroad
     workers get a single "First Time" row instead of country/year data. */
  const previousEmployment = isFirstTimeAbroad
    ? [{ country: "First Time", years: "", isFirstTime: true }]
    : worker.experience;

  /* No-passport layout only: a single descriptive experience line replacing
     the full Previous Employment table (which lives on the removed page 2). */
  const experienceLine = isFirstTimeAbroad
    ? "FIRST TIME TO WORK ABROAD"
    : `EXPERIENCED ${category.toUpperCase()} ${previousEmployment
        .map((entry) => `${(entry.country ?? "").toUpperCase()} ${entry.years ?? ""} YEARS`)
        .join(", ")}`.trim();

  /* No-passport layout only: compact Arabic/English rating rows, in place
     of the full Languages & Education checklist on the removed page 2. */
  const languageRatings = languages
    .filter((language) => language.en === "Arabic" || language.en === "English")
    .map((language) => ({
      ...language,
      rating: language.checked
        ? language.en === "Arabic"
          ? "VERY GOOD"
          : "GOOD"
        : "—",
    }));

  const cvStyle = {
    width: CV_WIDTH,
    minWidth: CV_WIDTH,
    maxWidth: CV_WIDTH,
    background: "#fff",
    fontFamily: FONT,
    color: "#000",
    boxSizing: "border-box",
    border: "2px solid #000",
    padding: 6,
    transform: "none",
    zoom: 1,
    "--cv-theme-color": themeColor,
  };

  const page2Style = {
    width: CV_WIDTH,
    minWidth: CV_WIDTH,
    maxWidth: CV_WIDTH,
    marginTop: 24,
    background: "#fff",
    fontFamily: FONT,
    boxSizing: "border-box",
    transform: "none",
    zoom: 1,
    "--cv-theme-color": themeColor,
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

        {(Number(profile?.role_id) === 1 ||
          Number(profile?.role_id) === 2 ||
          Number(profile?.role_id) === 3) &&
          selectedPartnerId && (
            <div className="d-flex flex-column align-items-md-end mt-2">
              <button
                className="btn btn-main text-white px-4 d-flex align-items-center justify-content-center"
                onClick={handleDownloadClick}
              >
                Download CV
              </button>
              {alreadySharedWithPartner && (
                <span className="text-success small mt-1">
                  ✓ Already shared with this partner
                </span>
              )}
            </div>

            {!isPartnerRole && alreadySharedWithPartner && (
              <>
                <span className="text-success small mt-1">
                  ✓ Already shared with this partner
                </span>

                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="cv-three-revoke-toggle"
                    checked={!isAccessRevoked}
                    onChange={handleToggleAccess}
                  />
                  <label
                    className="form-check-label small"
                    htmlFor="cv-three-revoke-toggle"
                  >
                    {isAccessRevoked ? "Access revoked" : "Partner has access"}
                  </label>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>

      <div className="mb-3 mt-1">{templateSwitcher}</div>

      {Number(profile?.role_id) !== 3 && (
        <div className="mb-2 d-flex align-items-center flex-wrap gap-3">
          <select
            id="cv-three-partner"
            className="form-select form-select-sm d-inline-block w-auto"
            value={selectedPartnerId}
            onChange={handlePartnerChange}
            style={{
              borderRadius: 999,
              fontWeight: 600,
              fontSize: 13,
              paddingTop: 4,
              paddingBottom: 4,
              paddingLeft: 14,
              paddingRight: 30,
              maxWidth: 220,
              cursor: "pointer",
            }}
          >
            <option value="">Select Partner</option>

            {partners.map((partner) => (
              <option key={partner.partner_id} value={partner.partner_id}>
                {getPartnerOptionLabel(partner)}
              </option>
            ))}
          </select>

          <div className="form-check">
            <input
              type="checkbox"
              id="cv-three-include-passport"
              className="form-check-input"
              checked={includePassport}
              onChange={(event) => setIncludePassport(event.target.checked)}
            />
            <label
              className="form-check-label small fw-semibold"
              htmlFor="cv-three-include-passport"
            >
              Include Passport
            </label>
          </div>
        </div>
      )}

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
              <div
                style={{
                  flex: "0 0 260px",
                  borderRight: "1px solid #000",
                  height: detailsColHeight ? `${detailsColHeight}px` : undefined,
                }}
              >
                <PhotoBox
                  url={faceUrl}
                  alt="Headshot"
                  placeholderLabel="Photo"
                />
              </div>

              <div
                ref={detailsColRef}
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

            {/* Personal data + skills (+ profile summary when included) on the
                left / standing photo (right, stretched to match the full
                combined height of the left column) */}
            <div style={{ display: "flex" }}>
              <div
                ref={bodyColRef}
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
                    last={index === skills.length - 1 && !showProfileSummary}
                  />
                ))}

                {includePassport ? (
                  /* PROFILE SUMMARY lives inside this same column, so the
                     standing photo naturally stretches to its bottom edge.
                     Title and text share one uninterrupted blue block, like
                     the template, instead of a separate header bar. */
                  <div style={css.summaryWrap}>
                    <div style={css.summaryTitle}>
                      <span>PROFILE SUMMARY</span>
                      <span style={css.summaryTitleAr}>ملخص الملف</span>
                    </div>
                    <div style={css.summaryText}>{profileSummary || "—"}</div>
                  </div>
                ) : (
                  /* No passport scan page - Previous Employment and
                     Languages & Education move up onto page 1 instead, so
                     the CV still fits on a single page. The standing photo
                     (right column) stretches to match this taller column. */
                  <>
                    <PreviousEmploymentTable entries={previousEmployment} />
                    <LanguagesEducationTable
                      languages={languages}
                      education={education}
                    />
                  </>
                )}
              </div>

              <div
                style={{
                  flex: "0 0 400px",
                  height: bodyColHeight ? `${bodyColHeight}px` : undefined,
                }}
              >
                <PhotoBox
                  url={bodyUrl}
                  alt="Full body"
                  placeholderLabel="Photo"
                />
              </div>
            </div>
          </div>

          {!includePassport && (
            /* Contact/address strip becomes the last thing on the page,
               directly under the SKILLS & EXPERIENCES column - its bottom
               lands right where the standing photo ends. */
            <div style={{ marginTop: 8 }}>
              <ContactAddressStrip
                email={agencyEmail}
                phone={agencyPhone}
                address={agencyAddress}
              />
            </div>
          )}
        </div>

        {/* Page 2: previous employment, languages/education, passport scan -
            only rendered when includePassport is on. */}
        {includePassport && (
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
          <ContactAddressStrip
            email={agencyEmail}
            phone={agencyPhone}
            address={agencyAddress}
          />

          <div style={{ border: "2px solid #000" }}>
            {/* PREVIOUS EMPLOYMENT / العمل السابق / COUNTRY WORKED BEFORE
                is treated as ONE title block - no divider between the two
                lines, matching the template. Both tables below use equal
                thirds so their columns line up with each other. */}
            <PreviousEmploymentTable entries={previousEmployment} />
            <LanguagesEducationTable languages={languages} education={education} />
          </div>

            {/* Toolbox column - UI only, never captured for the PDF. Stacks
                below the preview on narrow screens instead of shrinking the
                CV's own A4 proportions. Hidden entirely for partners - they
                can still view/download their CV, but partner selection,
                color choice and the passport toggle are admin/employee-only
                controls. */}
            {!isPartnerRole && (
              <div className="w-100" style={{ flex: "0 0 260px", maxWidth: 320 }}>
                <CVToolbox
                  isPartnerRole={isPartnerRole}
                  partners={partners}
                  selectedPartnerId={selectedPartnerId}
                  onPartnerChange={handlePartnerChange}
                  getPartnerOptionLabel={getPartnerOptionLabel}
                  colorOptions={COLOR_OPTIONS}
                  selectedColor={themeColor}
                  onColorChange={setSelectedCvColor}
                  includePassport={includePassport}
                  onTogglePassport={setIncludePassport}
                />
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
        )}
      </div>
    </div>
  );
};

export default CVThree;