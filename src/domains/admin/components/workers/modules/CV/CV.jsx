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
  { name: "Green", value: "#9BBA58" },
  { name: "Purple", value: "#6A1B9A" },
  { name: "Teal", value: "#00796B" },
  { name: "Navy", value: "#001F5F" },
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
    padding: "4px 8px",
    borderBottom: "1px solid #000",
  },
  sectionBar: {
    background: "var(--cv-theme-color)",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
    fontSize: 13,
    padding: "3px 8px",
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
    padding: "3px 8px 5px",
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
    marginTop: 2,
  },
  rowLabel: {
    padding: "2px 5px",
    fontWeight: "bold",
    fontSize: 12,
    borderRight: "1px solid #000",
  },
  rowValue: {
    padding: "2px 5px",
    fontSize: 12,
    borderRight: "1px solid #000",
    display: "flex",
    alignItems: "center",
  },
  rowValueBold: {
    padding: "2px 5px",
    fontSize: 12,
    fontWeight: "bold",
    color: "#c0392b",
    borderRight: "1px solid #000",
    display: "flex",
    alignItems: "center",
  },
  rowAr: {
    padding: "2px 5px",
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
    padding: "3px 8px",
    fontWeight: "bold",
    fontSize: 13,
    background: "var(--cv-theme-color)",
    color: "#fff",
    borderRight: "1px solid #000",
  },
  fullNameValue: {
    padding: "3px 8px",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
    color: "#000",
    background: "#fff",
    borderRight: "1px solid #000",
  },
  fullNameAr: {
    padding: "3px 8px",
    fontWeight: "bold",
    fontSize: 13,
    textAlign: "right",
    direction: "rtl",
  },
  summaryWrap: {
    background: "var(--cv-theme-color)",
    color: "#fff",
    textAlign: "center",
    padding: "7px 14px 10px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 6,
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
    lineHeight: 1.5,
  },
  /* No-passport layout: plain centered contact footer (phone/email/address),
     matching the sample's simple text strip instead of a bordered box. */
  noPassportFooter: {
    textAlign: "center",
    padding: "7px 10px",
    fontSize: 12,
    fontWeight: "bold",
    color: "var(--cv-theme-color)",
    lineHeight: 1.5,
  },
  /* No-passport layout: a full-width descriptive bar for prior experience,
     styled like the existing "FIRST TIME" row used on page 2. */
  experienceRow: {
    padding: "4px 5px",
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
        padding: "2px 5px",
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 13,
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

/* Language row: EN label | rating | AR label - same 3-column grid as
   Row3/CheckRow so divider lines stay aligned with the tables above it. */
const LanguageRow = ({ en, ar, rating, last, cols = "125px 1fr 140px" }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: cols,
      ...(last ? {} : { borderBottom: "1px solid #000" }),
    }}
  >
    <div style={css.rowLabel}>{en}</div>
    <div style={css.rowValueBold}>{rating || "—"}</div>
    <div style={css.rowAr}>{ar}</div>
  </div>
);

/* Backend-driven partner header banner, used identically on both page 1
   and page 2 - only the image url, alt text and load handlers differ. */
const HeaderBanner = ({
  url,
  alt,
  selectedPartnerId,
  onLoad,
  onError,
  emptyLabel,
}) => (
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
          maxHeight: 120,
          objectFit: "contain",
          display: "block",
          margin: "0 auto 4px",
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
          ? emptyLabel
          : "Select a partner above to load the CV header"}
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

/* Adds a captured CV page to the PDF so that EVERY page is filled edge to
   edge at FULL printable width - the same width the preview shows. If the
   capture is taller than one A4 page, the overflow continues on an extra
   page. Exception: when the overflow is just a small trailing sliver (a CV
   page is often only a few percent taller than A4, which used to spill onto
   a nearly-empty trailing page), the capture is squeezed VERTICALLY - never
   narrowed - by that small percentage, spread evenly across the pages, so
   no page ends up with an empty strip on the right and no near-empty
   trailing page is emitted. The squeeze is bounded by
   OVERFLOW_ABSORB_TOLERANCE; anything larger is real overflow and is sliced
   onto extra pages at exact full width instead. */
const OVERFLOW_ABSORB_TOLERANCE = 0.22; // absorb last-page overflow up to 22% of a page

const addCanvasToPages = (pdf, canvas, margin) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const printableWidth = pageWidth - margin * 2;
  const printableHeight = pageHeight - margin * 2;

  // Scale where the captured width exactly fills the printable width. This
  // never changes, so the PDF always uses the full page width.
  const fullWidthScale = printableWidth / canvas.width;
  // How many canvas pixels fit on one PDF page at that scale.
  const fullPageCapacity = printableHeight / fullWidthScale;

  let pageCount = Math.ceil(canvas.height / fullPageCapacity);

  // Canvas pixels consumed by each page's band. Normally exactly one page's
  // worth; while absorbing, the same content is spread over one page fewer
  // and each band is drawn slightly vertically compressed into the full
  // page height instead.
  let bandCapacity = fullPageCapacity;

  if (pageCount > 1) {
    const lastPageFraction =
      (canvas.height - (pageCount - 1) * fullPageCapacity) / fullPageCapacity;
    if (lastPageFraction <= OVERFLOW_ABSORB_TOLERANCE) {
      pageCount -= 1;
      bandCapacity = canvas.height / pageCount;
    }
  }

  for (let page = 0; page < pageCount; page++) {
    if (page > 0) pdf.addPage();

    const offset = page * bandCapacity;
    const sourceSliceHeight = Math.min(bandCapacity, canvas.height - offset);
    // Each band is drawn into the FULL page height (a slight vertical
    // compression while absorbing; a no-op 1:1 draw otherwise).
    const destSliceHeight = Math.min(
      fullPageCapacity,
      sourceSliceHeight * (fullPageCapacity / bandCapacity),
    );

    // Slice just this page's band out of the full capture (white-filled so
    // a short final page has no transparent strip).
    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = Math.ceil(destSliceHeight);
    const context = slice.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, slice.width, slice.height);
    context.drawImage(
      canvas,
      0,
      offset,
      canvas.width,
      sourceSliceHeight,
      0,
      0,
      canvas.width,
      destSliceHeight,
    );

    // PNG keeps text and thin borders sharper than JPEG. The drawn width is
    // ALWAYS the full printable width, on every page, in every case.
    pdf.addImage(
      slice.toDataURL("image/png"),
      "PNG",
      margin,
      margin,
      canvas.width * fullWidthScale,
      destSliceHeight * fullWidthScale,
    );
  }
};

/**
 * Measures a DOM node's live rendered height via ResizeObserver.
 *
 * Why this exists: the headshot/standing-photo columns are stretched by
 * flexbox to match their sibling text column's height. Real browsers do
 * this correctly, but html2canvas's internal re-layout of the cloned tree
 * does not reliably replicate flex "stretch" for children sized with
 * percentage heights - the photo column was rendering at its own
 * (much taller) natural size instead of being cropped to match, which is
 * exactly the distortion seen in the downloaded PDF. Reading the already-
 * correct height straight from the live DOM and baking it in as a fixed
 * pixel value sidesteps html2canvas's flex recalculation entirely, since
 * captureElementCanvas clones the DOM (inline styles and all) only after
 * this value has been committed.
 */
const useMeasuredHeight = (deps) => {
  const ref = useRef(null);
  const [height, setHeight] = useState(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setHeight(entry.contentRect.height);
      }
    });

    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return [ref, height];
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
  const [selectedCvColor, setSelectedCvColor] = useState(null);
  const [includePassport, setIncludePassport] = useState(true);

  // See useMeasuredHeight's comment for why this exists - matches the
  // photo columns' height to their sibling text columns explicitly, so
  // html2canvas's PDF capture doesn't distort the layout.
  const [detailsColRef, detailsColHeight] = useMeasuredHeight([
    worker,
    includePassport,
    selectedCvColor,
  ]);
  const [bodyColRef, bodyColHeight] = useMeasuredHeight([
    worker,
    includePassport,
    selectedCvColor,
  ]);

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

  // Backend now returns the real share/revoke status for the worker+partner
  // pair being previewed (see workerCV.service.js getWorkerCV), replacing
  // the old best-guess field chain.
  const alreadySharedWithPartner = Boolean(worker?.shared_with_partner);
  const isAccessRevoked = Boolean(worker?.access_revoked);

  const isPartnerRole = Number(profile?.role_id) === 3;

  // Action cluster (download/link buttons + share status) - shown for
  // admin/employee with a selected partner, and for partners themselves.
  const showActionCluster =
    ((Number(profile?.role_id) === 1 || Number(profile?.role_id) === 2) &&
      selectedPartnerId) ||
    isPartnerRole;

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
      const margin = 4;

      // Every captured page is added at FULL printable width - the same
      // width the preview shows. When a captured page is taller than one
      // A4 page, the overflow continues on an extra PDF page instead of
      // shrinking the CV below full width.
      // Page 1: application + personal data + skills (+ profile summary
      // when passport is included, or experience/language/address when it
      // is not - see the two layouts rendered below).
      const cvCanvas = await captureElementCanvas(cvRef.current, 400);
      addCanvasToPages(pdf, cvCanvas, margin);

      // Next page(s) only exist in the passport-included layout: previous
      // employment, languages/education, passport scan.
      if (includePassport && passportRef.current) {
        const passportCanvas = await captureElementCanvas(
          passportRef.current,
          800,
        );
        pdf.addPage();
        addCanvasToPages(pdf, passportCanvas, margin);
      }

      const name = `${worker.full_name.replace(/\s+/g, "_")}_CV`;

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
        .map(
          (entry) =>
            `${(entry.country ?? "").toUpperCase()} ${entry.years ?? ""} YEARS`,
        )
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
    padding: 4,
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
      </div>

      {/* Shared bordered "application" block (headshot + application/passport
          details, full name, personal data + skills + standing photo).
          Reused by both layouts below - only the profile summary differs. */}
      {(() => {
        const renderApplicationBlock = (
          showProfileSummary,
          extraColumnContent,
        ) => (
          <div style={{ border: "2px solid #000" }}>
            {/* APPLICATION FOR EMPLOYMENT title */}
            <div style={css.titleBar}>APPLICATION FOR EMPLOYMENT</div>

            {/* Headshot photo (left) + Application/Passport details (right) */}
            <div style={{ display: "flex", borderBottom: "1px solid #000" }}>
              <div
                style={{
                  flex: "0 0 260px",
                  borderRight: "1px solid #000",
                  height: detailsColHeight
                    ? `${detailsColHeight}px`
                    : undefined,
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
                    last={
                      index === skills.length - 1 &&
                      !showProfileSummary &&
                      !extraColumnContent
                    }
                  />
                ))}

                {/* PROFILE SUMMARY lives inside this same column, so the
                    standing photo naturally stretches to its bottom edge.
                    Title and text share one uninterrupted blue block, like
                    the template, instead of a separate header bar. Only
                    rendered in the passport-included layout - the
                    passport-excluded layout replaces it with the
                    EXPERIENCE / LANGUAGE section below instead. */}
                {showProfileSummary && (
                  <div style={css.summaryWrap}>
                    <div style={css.summaryTitle}>
                      <span>PROFILE SUMMARY</span>
                      <span style={css.summaryTitleAr}>ملخص الملف</span>
                    </div>
                    <div style={css.summaryText}>{profileSummary || "—"}</div>
                  </div>
                )}

                {/* Passport-excluded layout: EXPERIENCE / LANGUAGE / contact
                    address stack here, at the bottom of this column, so the
                    standing photo (stretched to this column's height) ends
                    exactly at the address's last line. */}
                {extraColumnContent}
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
        );

        return (
          <div
            className="d-flex flex-column flex-lg-row align-items-start gap-3"
            style={{ marginTop: -30 }}
          >
            {/* CV preview column - only this column (via cvRef / passportRef)
                is ever captured for the PDF. The toolbox next to it is UI
                only and is never captured. */}
            <div
              style={{
                // flex-grow: 0 - the column hugs the CV's actual (fixed)
                // width instead of stretching to fill all remaining row
                // space, which was pushing the toolbox far to the right
                // and leaving a large empty gap between them on desktop.
                // flex-shrink: 1 (with minWidth: 0) still lets it shrink
                // and scroll horizontally on narrower viewports.
                flex: "0 1 auto",
                minWidth: 0,
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {/* Action cluster lives directly above the CV instead of in
                  the page header, so it never stretches the header row and
                  leaves a large empty gap above the preview. When it is
                  hidden the CV simply sits at the normal position. */}
              {showActionCluster && (
                <div className="d-flex flex-column align-items-end gap-2 mb-2">
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-main text-white px-4 d-flex align-items-center justify-content-center"
                      onClick={handleDownloadClick}
                    >
                      Download CV
                    </button>

                    {!isPartnerRole && !alreadySharedWithPartner && (
                      <button
                        className="btn btn-outline-main px-4 d-flex align-items-center justify-content-center"
                        onClick={handleLinkClick}
                      >
                        Link Partner
                      </button>
                    )}
                  </div>

                  {!isPartnerRole && alreadySharedWithPartner && (
                    <>
                      {/* Only shown while the partner actually has access -
                          when access is revoked only the toggle below stays
                          visible so access can be restored. */}
                      {!isAccessRevoked && (
                        <span className="text-success small">
                          ✓ Already shared with this partner
                        </span>
                      )}

                      <div className="form-check form-switch mb-0">
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
                          {isAccessRevoked
                            ? "Access revoked"
                            : "Partner has access"}
                        </label>
                      </div>
                    </>
                  )}
                </div>
              )}

              {includePassport ? (
                <>
                  {/* Page 1: application, passport, personal data, skills, summary */}
                  <div ref={cvRef} data-cv-capture style={cvStyle}>
                    <HeaderBanner
                      url={selectedPartnerHeaderUrl}
                      alt={`${selectedPartner?.full_name || "Partner"} CV Header`}
                      selectedPartnerId={selectedPartnerId}
                      onLoad={handleHeaderLoaded}
                      onError={handleHeaderLoadError}
                      emptyLabel="The selected partner does not have a CV header"
                    />
                    {renderApplicationBlock(true)}
                  </div>

                  {/* Page 2: partner header, previous employment,
                      languages/education, passport scan */}
                  <div ref={passportRef} data-cv-capture style={page2Style}>
                    <HeaderBanner
                      url={selectedPartnerHeaderTwoUrl}
                      alt={`${selectedPartner?.full_name || "Partner"} CV Header (Page 2)`}
                      selectedPartnerId={selectedPartnerId}
                      onLoad={handleHeaderLoaded}
                      onError={handleHeaderLoadError}
                      emptyLabel="The selected partner does not have a second CV header"
                    />

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
                      {previousEmployment.map((entry, index) =>
                        entry.isFirstTime ? (
                          <div key="first-time" style={css.experienceRow}>
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
                                padding: "2px 5px",
                                fontWeight: "bold",
                                color: "#c0392b",
                                borderRight: "1px solid #000",
                              }}
                            >
                              {(entry.country ?? "").toUpperCase()}
                            </div>
                            <div
                              style={{
                                padding: "2px 5px",
                                borderRight: "1px solid #000",
                              }}
                            >
                              {entry.years ?? ""}
                            </div>
                            <div
                              style={{
                                padding: "2px 5px",
                                fontWeight: "bold",
                                color: "#c0392b",
                              }}
                            >
                              YEAR
                            </div>
                          </div>
                        ),
                      )}

                      <SectionBar
                        en="LANGUAGES & EDUCATION"
                        ar="اللغات والتعليم"
                      />
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
                    <div
                      style={{
                        border: "2px solid #000",
                        padding: 10,
                        marginTop: 12,
                      }}
                    >
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
                            height: 200,
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
                        are drawn here. ~0.8cm tall, same width as the boxes above
                        and below so everything stays aligned. Holds the agency's
                        hard-coded contact email, centered. */}
                    <div
                      style={{
                        borderLeft: "2px solid #000",
                        borderRight: "2px solid #000",
                        height: "0.8cm",
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
                        padding: 8,
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
                </>
              ) : (
                /* Passport-excluded layout: a single A4 page - application,
                   personal data, skills and standing photo (shared block
                   above), followed by a compact EXPERIENCE line and a
                   LANGUAGE rating table, and a plain contact footer, instead
                   of the profile summary / previous employment / passport
                   scan / footer logo used in the passport-included layout. */
                <div ref={cvRef} data-cv-capture style={cvStyle}>
                  <HeaderBanner
                    url={selectedPartnerHeaderUrl}
                    alt={`${selectedPartner?.full_name || "Partner"} CV Header`}
                    selectedPartnerId={selectedPartnerId}
                    onLoad={handleHeaderLoaded}
                    onError={handleHeaderLoadError}
                    emptyLabel="The selected partner does not have a CV header"
                  />
                  {renderApplicationBlock(
                    false,
                    <>
                      <SectionBar en="EXPERIENCE" ar="الخبرة" />
                      <div style={css.experienceRow}>{experienceLine}</div>

                      <SectionBar en="LANGUAGE" ar="اللغة" />
                      {languageRatings.map((language, index) => (
                        <LanguageRow
                          key={language.en}
                          en={language.en}
                          ar={language.ar}
                          rating={language.rating}
                          last={index === languageRatings.length - 1}
                        />
                      ))}

                      {/* Contact / address block - the last element of the
                          column, so its final line aligns with the bottom
                          edge of the standing photo next to it. */}
                      <div
                        style={{
                          ...css.noPassportFooter,
                          borderTop: "1px solid #000",
                        }}
                      >
                        {agencyPhone && <div>{agencyPhone}</div>}
                        {agencyEmail && <div>{agencyEmail}</div>}
                        {agencyAddress && (
                          <div style={{ direction: "rtl" }}>
                            {agencyAddress}
                          </div>
                        )}
                      </div>
                    </>,
                  )}
                </div>
              )}
            </div>

            {/* Toolbox column - UI only, never captured for the PDF. Stacks
                below the preview on narrow screens instead of shrinking the
                CV's own A4 proportions. Hidden entirely for partners - they
                can still view/download their CV, but partner selection,
                color choice and the passport toggle are admin/employee-only
                controls. */}
            {!isPartnerRole && (
              <div
                className="w-100"
                style={{ flex: "0 0 260px", maxWidth: 320 }}
              >
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
        );
      })()}
    </div>
  );
};

export default CVThree;
