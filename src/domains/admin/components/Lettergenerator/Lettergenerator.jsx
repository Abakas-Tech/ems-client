import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import { getWorkerProfile } from "../../api/worker.api";
import useLoader from "../../../../context/Loader/useLoader";
import useResponse from "../../../../context/Response/useResponse";
// TODO: point this at the exact module the Finance/period report imports
// REPORT_META from, so the letter header is guaranteed to be the same
// logo/company name/confidentiality line as every other printed report.
import { REPORT_META } from "../../../../shared/components/Report/Data";

// Predefined options (ለ / ጉዳዩ / default incident text)

const TO_OPTIONS = [
  "ለ፡ የኢፌድሪ ስራና ክህሎት ሚኒስቴር ለሲስተም ክፍል አዲስ አበባ",
  "ለ፡ ኢትዮጵያ ንግድ ባንክ ኮልፌ ዲስትሪክት ዳይሬክተር አዲስ አበባ",
  "ለ፡ ስራና ክህሎት ሚኒስቴር ሲስተም ክፍል አዲስ አበባ",
];

const SUBJECT_OPTIONS = [
  "ጉዳዩ፡ ከሲስተም ላይ እንዲለቀቅልን ስለመጠየቅ",
  "ጉዳዩ፡ የውጭ ምንዛሪ ተመንዝሮ ገቢ እንዲሆን ስለመጠየቅ",
  "ጉዳዩ፡ የስም ስህተት እንዲስተካከልልን ስለመጠየቅ",
];

// Always the starting value of the (unlabeled) incident/content textarea.
// The user keeps typing after it — never reset or cleared automatically.
const DEFAULT_INCIDENT_TEXT =
  "ድርጅታችን አል-ኢቲሳላት በዉጭ ሀገር ሰራተኛ አገናኝ እውቅና በኢፌድሪ ስራና ክህሎት ሚኒስቴር በቁጥር PEA/948/2021 ህጋዊ ፍቃድ የተሰጠው መሆኑ ይታወቃል";

// Default value for the "ቁጥር" field when the page first loads. Remains
// fully editable — this only seeds the input, it does not lock it.
const DEFAULT_REFERENCE_NUMBER = "ALA/A170/26";

// "ቁጥር" may only contain letters (Latin or Ethiopic), digits, slashes,
// spaces and dashes — e.g. "PEA/948/2021".
const sanitizeReferenceNumber = (value) =>
  (value || "").replace(/[^A-Za-z0-9/\u1200-\u137F\s-]/g, "");

// --- Ethiopian calendar conversion -------------------------------------
// The ቀን: line is shown in the Ethiopian calendar rather than Gregorian.
// Conversion is done via Julian Day Number (JDN), the standard way to
// go between the two calendars — 1723856 is the JDN of Ethiopian New
// Year 1 (the "Amete Mihret" epoch), the constant used throughout
// published Ethiopian-calendar conversion algorithms.
const ETHIOPIAN_MONTHS = [
  "መስከረም",
  "ጥቅምት",
  "ኅዳር",
  "ታኅሳስ",
  "ጥር",
  "የካቲት",
  "መጋቢት",
  "ሚያዝያ",
  "ግንቦት",
  "ሰኔ",
  "ሐምሌ",
  "ነሐሴ",
  "ጳጉሜ",
];

const JD_EPOCH_OFFSET_AMETE_MIHRET = 1723856;

const gregorianToJDN = (year, month, day) => {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
};

const jdnToEthiopian = (jdn) => {
  const offsetDays = jdn - JD_EPOCH_OFFSET_AMETE_MIHRET;
  const r = ((offsetDays % 1461) + 1461) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const year =
    4 * Math.floor(offsetDays / 1461) +
    Math.floor(r / 365) -
    Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;
  return { year, month, day };
};

const gregorianToEthiopian = (date) =>
  jdnToEthiopian(
    gregorianToJDN(date.getFullYear(), date.getMonth() + 1, date.getDate()),
  );

const fmtDate = (val) => {
  const { year, month, day } = gregorianToEthiopian(new Date(val));
  const monthName = ETHIOPIAN_MONTHS[month - 1] || "";
  return `${day} ${monthName} ${year}`;
};

const LETTER_CACHE_KEY = "letterGenerator:cachedLetter";

const readCachedLetter = () => {
  try {
    const raw = localStorage.getItem(LETTER_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeCachedLetter = (data) => {
  try {
    localStorage.setItem(LETTER_CACHE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
};

const clearCachedLetter = () => {
  try {
    localStorage.removeItem(LETTER_CACHE_KEY);
  } catch {
    /* best-effort — nothing to do if storage isn't available */
  }
};

// Shared muted input styling — a light fill only, no border/shadow chrome
// of its own beyond the standard form-control outline.

const FIELD_STYLE = {
  backgroundColor: "#f5f7fa",
};

const buildLetterHeader = (title, subtitle) => {
  const { orgName, orgSub, logoPath, logoInitials, logoColor } = REPORT_META;
  const logoHtml = logoPath
    ? `<img src="${logoPath}" alt="${orgName}" style="height:48px;max-width:130px;object-fit:contain;" />`
    : `<div style="width:48px;height:48px;background:${logoColor};border-radius:9px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;font-weight:800;flex-shrink:0;">${logoInitials}</div>`;

  return `
    <div class="ph">
      <div class="logo-block">${logoHtml}
        <div>
          <div class="org-name">${orgName}</div>
          <div class="org-sub">${orgSub}</div>
        </div>
      </div>
      <div class="title-block">
        <div class="report-title">${title}</div>
        <div class="report-sub">${subtitle || ""}</div>
      </div>
    <div class="meta-r contact-block">
  <div>${REPORT_META.contactEmail || "contact@aletisalatjobs.com"}</div>
  <div>${REPORT_META.contactPhone || "+251 97 300 9003 / +251 97 603 2303"}</div>
</div>
    </div>`;
};

const buildLetterFooter = (pageLabel) => `
  <div class="pf">
    <span >${REPORT_META.orgName} — ${REPORT_META.confidentiality}</span>
    <span>Powered by Abakas Technologies</span>
    <span>${pageLabel}</span>
  </div>`;

const LETTER_STYLES = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  @page{size:A4 portrait;margin:15mm 16mm;}
  html{scrollbar-width:none;}
  html::-webkit-scrollbar{width:0;height:0;}
  /* On a narrow screen the iframe's own rendered box is narrower than
     the fixed-width .page below, so the page overflows it — this makes
     that overflow explicitly scrollable (smoothly, on touch too) rather
     than relying on default/implicit overflow handling, which some
     mobile browsers otherwise skip. The scrollbar itself stays hidden
     per the rules above; scrolling still works. */
  html,body{overflow:auto;-webkit-overflow-scrolling:touch;}
  body{
    font-family:"Nyala","Segoe UI",Tahoma,sans-serif;font-size:11pt;color:#1a2640;
    background:#fff;print-color-adjust:exact;-webkit-print-color-adjust:exact;
    display:block;padding:0;
  }
  /* Centering an overflowing child with flex's align-items:center leaves
     its left-side overflow unreachable (scrollLeft can't go negative).
     margin:0 auto still centers .page whenever it fits, but gracefully
     collapses to flush-left once it's wider than the viewport, so the
     whole page becomes reachable by scrolling right instead of some of
     it being permanently stuck off-screen to the left. */
  .page{
    position:relative;padding:5px 10px;min-height:200mm;width:210mm;max-width:100%;
    min-width:210mm;margin:0 auto 20px;
    background:#fff;;
  }
  .page:last-child{margin-bottom:0;}
  @media print{
    body{background:#fff;padding:0;}
    .page{box-shadow:none;width:auto;min-width:0;margin:0;padding:0 0 26px;}
  }
    .meta-r{min-width:190px;}
.contact-block{text-align:right;font-size:9.5pt;font-weight:700;color:#3a4a65;line-height:1.6;}
  .pb{page-break-after:always;}
  .ph{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #1a3c6e;padding-bottom:8px;margin-bottom:18px;}
  .logo-block{display:flex;align-items:center;gap:9px;min-width:190px;}
  .org-name{font-size:12.5pt;font-weight:700;color:#1a3c6e;line-height:1.15;}
  .org-sub{font-size:7.5pt;color:#5a6a85;margin-top:2px;}
  .title-block{text-align:center;}
  .report-title{font-size:12pt;font-weight:700;color:#1a3c6e;text-transform:uppercase;letter-spacing:1px;}
  .report-sub{font-size:7.5pt;color:#5a6a85;margin-top:3px;}
  .meta-r{min-width:190px;}
   .pf{position:absolute;bottom:0;left:0;right:0;padding-top:5px;border-top:1.5px solid #c8d8f0;display:flex;justify-content:space-between;font-size:9pt;font-weight:700;color:#5a6a85;background:#fff;}
  /* ለ on the left, ቀን/ቁጥር stacked on the right — same horizontal band,
     never side by side with each other. Preview/Print only; has no
     bearing on the input form above. */
  .letter-info-row{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;margin-bottom:18px;}
  .letter-to{font-size:11.5pt;font-weight:600;text-align:left;}
  .letter-meta-col{display:flex;flex-direction:column;gap:6px;font-size:10.5pt;text-align:right;white-space:nowrap;}
  .letter-meta-col b{color:#1a3c6e;}

  .letter-subject{text-align:center;font-weight:700;font-size:11.5pt;margin-bottom:16px;text-decoration:underline;}
  .letter-body{text-align:left;font-size:11pt;line-height:1.9;white-space:pre-wrap;min-height:40mm;}

  /* The whole letter-content area (everything below the letterhead and
     above the footer) becomes ONE seamless writing surface at runtime
     (see handleIframeLoad) — a single contenteditable root with no
     inner sub-regions, so there are no dead zones: every gap, margin,
     and space between the generated ለ/ቁጥር/ጉዳዩ/body content is part of
     the same editable flow. Purely a visual affordance; stripped for
     print. */
  .letter-canvas{cursor:text;outline:none;border-radius:4px;min-height:190mm;padding:14px 16px;}
  .letter-canvas:hover{background:rgba(26,60,110,0.04);}
  .letter-canvas:focus{background:rgba(26,60,110,0.06);box-shadow:0 0 0 2px rgba(26,60,110,0.2);}
  .letter-body:empty::before{content:"Click anywhere to start writing…";color:#9aa5b8;}
  @media print{
    .letter-canvas{background:none !important;box-shadow:none !important;}
  }

  .image-page{display:flex;flex-direction:column;align-items:center;justify-content:center;height:220mm;}
  .image-page img{max-width:100%;max-height:100%;object-fit:contain;border:1px solid #dde5f5;}
  .image-caption{margin-top:10px;font-size:8.5pt;color:#5a6a85;}
`;

const TO_LABEL = "ለ:";
const SUBJECT_LABEL = "ጉዳዩ:";

const textToBrHtml = (text) => (text || "").split("\n").join("<br/>");

const buildLetterHtml = ({
  to,
  date,
  referenceNumber,
  subject,
  incidentText,
  screenshots = [],
  passportScan,

  canvasHtmlOverride,
}) => {
  const totalPages = 1 + screenshots.length + (passportScan ? 1 : 0);

  const canvasHtml =
    canvasHtmlOverride ??
    `<div class="letter-canvas" data-canvas="true">
      <div class="letter-info-row">
        <div class="letter-to"><span data-field="to">${to ? textToBrHtml(to) : TO_LABEL}</span></div>
        <div class="letter-meta-col">
          <div><b>ቀን:</b> ${date}</div>
          <div><b>ቁጥር:</b> <span data-field="reference">${referenceNumber || ""}</span></div>
        </div>
      </div>
      <div class="letter-subject"><span data-field="subject">${subject ? textToBrHtml(subject) : SUBJECT_LABEL}</span></div>
      <div class="letter-body" data-field="body">${incidentText || ""}</div>
    </div>`;

  const letterPage = `<div class="page${totalPages > 1 ? " pb" : ""}">
    ${buildLetterHeader("Official Letter", "ደብዳቤ")}
    ${canvasHtml}
    ${buildLetterFooter(`Page 1 of ${totalPages}`)}
  </div>`;

  let pageNum = 1;
  const screenshotPages = screenshots
    .map((s, i) => {
      pageNum += 1;
      const isLast = pageNum === totalPages;
      return `<div class="page${isLast ? "" : " pb"}">
        ${buildLetterHeader("Official Letter", "Attachment")}
        <div class="image-page">
          <img src="${s.dataUrl}" alt="${s.name || `attachment-${i + 1}`}" />
          <div class="image-caption">${s.name || ""}</div>
        </div>
        ${buildLetterFooter(`Page ${pageNum} of ${totalPages}`)}
      </div>`;
    })
    .join("\n");

  const passportPage = passportScan
    ? `<div class="page">
        ${buildLetterHeader("Official Letter", "Passport Scan")}
        <div class="image-page">
          <img src="${passportScan}" alt="Passport scan" />
          <div class="image-caption">Passport Scan</div>
        </div>
        ${buildLetterFooter(`Page ${totalPages} of ${totalPages}`)}
      </div>`
    : "";

  return `<!DOCTYPE html><html lang="am"><head><meta charset="UTF-8"/>
<title>Letter</title>
<style>${LETTER_STYLES}</style>
</head><body>${letterPage}${screenshotPages}${passportPage}</body></html>`;
};

// Same off-screen-iframe print trick the Finance report uses: no new
// tab/window opens, and the iframe cleans itself up after printing.
const printLetter = (html, printTitle = "Letter") => {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";

  const originalTitle = document.title;
  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    document.title = originalTitle;
  };

  iframe.onload = () => {
    const win = iframe.contentWindow;
    if (!win) return;

    document.title = printTitle;
    win.focus();
    win.addEventListener("afterprint", cleanup);

    setTimeout(() => {
      try {
        win.print();
      } catch {
        cleanup();
      }
    }, 150);

    setTimeout(cleanup, 4000);
  };

  iframe.srcdoc = html;
  document.body.appendChild(iframe);
};

const elementToText = (el) => {
  const clone = el.cloneNode(true);
  clone.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
  clone.querySelectorAll("div, p").forEach((block) => {
    block.insertAdjacentText("beforebegin", "\n");
    block.replaceWith(...block.childNodes);
  });
  return clone.textContent.replace(/^\n+/, "").trimEnd();
};

const toDataUri = async (url) => {
  if (!url) return null;
  try {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn("Could not inline image for the letter print:", err);
    return url;
  }
};

const CopyField = ({ label, value }) => {
  const [status, setStatus] = useState(null); // null | "copied" | "failed"

  const handleClick = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(String(value));
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    setTimeout(() => setStatus(null), 1500);
  };

  const icon =
    status === "copied"
      ? "bi-clipboard-check-fill text-success"
      : status === "failed"
        ? "bi-clipboard-x text-danger"
        : "bi-clipboard";

  const displayText =
    status === "copied"
      ? "Copied"
      : status === "failed"
        ? "Copy failed"
        : value || "—";

  return (
    <button
      type="button"
      className="btn btn-sm d-flex align-items-center gap-2 py-1 px-2 w-100"
      style={{
        ...FIELD_STYLE,
        fontSize: "0.78rem",
        textAlign: "left",
        justifyContent: "flex-start",
      }}
      disabled={!value}
      onClick={handleClick}
    >
      <i className={`bi ${icon}`}></i>
      <span className="text-truncate">
        <span className="fw-semibold">{label}:</span> {displayText}
      </span>
    </button>
  );
};

// LetterToolkit — compact, plain (no card/border/shadow) panel: worker
// field copy rows, passport scan + print side by side, screenshot
// manager. Everything explicitly left-aligned.

const LetterToolkit = ({
  worker,
  passportAttached,
  onTogglePassportAttach,
  screenshots,
  onAddScreenshots,
  onRemoveScreenshot,
  onPrint,
  isCached,
  onToggleCache,
}) => {
  // TODO: confirm these field paths against the real worker profile shape.
  const workerFields = worker
    ? [
        { label: "Name", value: worker.full_name },
        { label: "Passport No.", value: worker.passport?.passport_number },
        {
          label: "Labour ID",
          value:
            worker.personal_information?.labour_id ||
            worker.contracts?.[0]?.labour_id,
        },
        {
          label: "Ticket Date",
          value: worker.travel_records?.[0]?.departure_date,
        },
      ]
    : [];

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                id: `${file.name}-${Date.now()}-${Math.random()}`,
                name: file.name,
                dataUrl: reader.result,
              });
            reader.readAsDataURL(file);
          }),
      ),
    ).then((newShots) => {
      onAddScreenshots(newShots);
      e.target.value = "";
    });
  };

  return (
    <div style={{ textAlign: "left" }}>
      <h6
        className="fw-bold small text-uppercase text-muted mb-2"
        style={{ textAlign: "left" }}
      >
        Toolkit
      </h6>

      <div className="mb-3">
        <label className="small mb-1 d-block" style={{ textAlign: "left" }}>
          Cache
        </label>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className={`btn btn-sm flex-fill ${
              isCached ? "btn-outline-danger" : "btn-outline-success"
            }`}
            onClick={onToggleCache}
          >
            <i className={`bi ${isCached ? "bi-trash" : "bi-save"} me-1`}></i>
            {isCached ? "Remove from Cache" : "Save to Cache"}
          </button>
        </div>
        <p
          className="small mb-0 mt-1"
          style={{
            textAlign: "left",
            color: isCached ? "#1a7f4b" : "#8a97b0",
          }}
        >
          <i
            className={`bi ${
              isCached ? "bi-check-circle-fill" : "bi-circle"
            } me-1`}
          ></i>
          {isCached ? "Saved in cache" : "Not saved"}
        </p>
      </div>

      {worker ? (
        <div className="d-flex flex-column gap-1 mb-3">
          {workerFields.map((f) => (
            <CopyField key={f.label} label={f.label} value={f.value} />
          ))}
        </div>
      ) : (
        <p className="text-muted small mb-3" style={{ textAlign: "left" }}>
          No worker selected.
        </p>
      )}

      <div className="mb-3">
        <label className="small mb-1 d-block" style={{ textAlign: "left" }}>
          Screenshots
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          className="form-control form-control-sm"
          style={FIELD_STYLE}
          onChange={handleFilesSelected}
        />
        {screenshots.length > 0 && (
          <ul
            className="list-unstyled mt-2 mb-0"
            style={{ fontSize: "0.75rem" }}
          >
            {screenshots.map((s) => (
              <li
                key={s.id}
                className="d-flex justify-content-between align-items-center border-bottom py-1"
              >
                <span className="text-truncate" style={{ maxWidth: "120px" }}>
                  {s.name}
                </span>
                <button
                  type="button"
                  className="btn btn-link btn-sm text-danger p-0"
                  onClick={() => onRemoveScreenshot(s.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Side by side, not stacked */}
      <div className="d-flex gap-2">
        <button
          type="button"
          className="btn btn-sm btn-outline-primary flex-fill"
          disabled={!worker?.passportScanUrl}
          onClick={onTogglePassportAttach}
        >
          {passportAttached ? "Remove Scan" : "Attach Scan"}
        </button>
        <button
          type="button"
          className="btn btn-main btn-sm flex-fill"
          onClick={onPrint}
        >
          <i className="bi bi-printer me-1"></i> Print
        </button>
      </div>
    </div>
  );
};

// Main component

const LetterGenerator = () => {
  const location = useLocation();
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  // Passed in from Active Workers' "Create Letter" bulk action:
  // navigate("/admin/letter-generator", { state: { workerId } }).
  // Entirely optional — the page works with no worker at all.
  const workerId = location.state?.workerId || null;

  const [worker, setWorker] = useState(null);

  // Restored once, on mount, from the persistent local cache (if the
  // user has one) — a refresh never loses a saved letter.
  const initialCache = useMemo(() => readCachedLetter(), []);

  const [to, setTo] = useState(() => initialCache?.to ?? "");
  // Seeded with DEFAULT_REFERENCE_NUMBER so ቁጥር is never blank on load,
  // but the field stays a normal controlled input the user can edit.
  const [referenceNumber, setReferenceNumber] = useState(
    () => initialCache?.referenceNumber ?? DEFAULT_REFERENCE_NUMBER,
  );
  const [subject, setSubject] = useState(() => initialCache?.subject ?? "");
  const [incidentText, setIncidentText] = useState(
    () => initialCache?.incidentText ?? DEFAULT_INCIDENT_TEXT,
  );

  // Whether the letter currently has a saved copy sitting in the local
  // cache. Once true, further edits keep that saved copy up to date
  // automatically (see the autosave effect below); "Remove from Cache"
  // turns this back off.
  const [isCached, setIsCached] = useState(() => initialCache !== null);

  const [screenshots, setScreenshots] = useState([]);
  const [passportAttached, setPassportAttached] = useState(false);
  const [passportDataUri, setPassportDataUri] = useState(null);

  // Purely visual: highlights the console's own border/shadow while the
  // user is actively writing in it, so switching into "writing mode"
  // reads as a clear, natural transition rather than a static box.
  const [isConsoleFocused, setIsConsoleFocused] = useState(false);

  const today = useMemo(() => fmtDate(new Date()), []);

  // Keeps a saved letter's cache entry fresh as the user keeps editing,
  // so "Save to Cache" doesn't have to be clicked again after every
  // change. Does nothing until the letter has been saved at least once.
  useEffect(() => {
    if (!isCached) return;
    writeCachedLetter({
      to,
      subject,
      referenceNumber,
      incidentText,
      savedAt: Date.now(),
    });
  }, [isCached, to, subject, referenceNumber, incidentText]);

  // A ref (not just a function) so the always-current save logic can be
  // called from event listeners that were attached once — the global
  // Ctrl+S handler below and the one attached inside the iframe on load
  // — without either of them closing over stale field values.
  const saveToCacheRef = useRef(() => {});
  useEffect(() => {
    saveToCacheRef.current = () => {
      writeCachedLetter({
        to,
        subject,
        referenceNumber,
        incidentText,
        savedAt: Date.now(),
      });
      setIsCached(true);
      addMessage(true, "Letter saved to cache.");
    };
  }, [to, subject, referenceNumber, incidentText, addMessage]);

  // Ctrl+S / Cmd+S saves the letter instead of triggering the browser's
  // own "Save Page" dialog. Covers focus anywhere outside the iframe;
  // the matching in-console case is wired up in handleIframeLoad below.
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isSaveShortcut =
        (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s";
      if (!isSaveShortcut) return;
      e.preventDefault();
      saveToCacheRef.current();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleToggleCache = () => {
    if (isCached) {
      clearCachedLetter();
      setIsCached(false);
    } else {
      saveToCacheRef.current();
    }
  };

  const handleRemoveFromCache = () => {
    clearCachedLetter();
    setIsCached(false);
  };

  // Contextual, autocomplete-style suggestions — nothing is permanently
  // rendered; this holds the dropdown's current contents/position, or
  // null when hidden. Recomputed on every cursor move inside the
  // console (see the selectionchange handler in handleIframeLoad).
  const [suggestionState, setSuggestionState] = useState(null);
  // Mirrors suggestionState for the iframe's own keydown listener
  // (attached once per load) to read without going stale.
  const suggestionRef = useRef(null);
  useEffect(() => {
    suggestionRef.current = suggestionState;
  }, [suggestionState]);

  const commitSuggestion = (field, value) => {
    pendingFocusFieldRef.current = field;
    if (field === "to") setTo(value);
    else if (field === "subject") setSubject(value);
    setSuggestionState(null);
  };

  useEffect(() => {
    if (!workerId) return;

    let cancelled = false;
    showLoader();

    getWorkerProfile(workerId)
      .then((res) => {
        if (cancelled) return;
        const profile = res?.data;
        // TODO: confirm the real field name for the passport scan image.
        const passportScanUrl = profile?.passport?.scan.url || null;
        setWorker({ ...profile, passportScanUrl });
      })
      .catch((err) => {
        addMessage(false, err.message || "Failed to load worker profile");
      })
      .finally(() => {
        if (!cancelled) hideLoader();
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerId]);

  const handleTogglePassportAttach = async () => {
    if (!worker?.passportScanUrl) return;

    if (passportAttached) {
      setPassportAttached(false);
      return;
    }

    if (!passportDataUri) {
      showLoader();
      const uri = await toDataUri(worker.passportScanUrl);
      hideLoader();
      setPassportDataUri(uri);
    }
    setPassportAttached(true);
  };

  const handleAddScreenshots = (newShots) => {
    setScreenshots((prev) => [...prev, ...newShots]);
  };

  const handleRemoveScreenshot = (id) => {
    setScreenshots((prev) => prev.filter((s) => s.id !== id));
  };

  const iframeRef = useRef(null);
  // The bordered wrapper around the iframe and the floating suggestion
  // dropdown — used only to tell "clicked inside the console/dropdown"
  // apart from "clicked elsewhere on the page" below.
  const consoleWrapperRef = useRef(null);
  const suggestionDropdownRef = useRef(null);
  // Set right before a suggestion commits its value; consumed on the
  // next iframe load to land the caret at the end of that field so
  // typing can continue immediately, instead of leaving focus nowhere.
  const pendingFocusFieldRef = useRef(null);
  // Mirrors the canvas's actual live HTML — including any bold/underline
  // formatting applied via Ctrl+B/Ctrl+U, and any line breaks in ለ/ጉዳዩ
  // or the body — so Print always has the true displayed content to
  // work from. Kept fresh on every edit and, as a safety margin,
  // refreshed first thing on blur (see handleIframeLoad) before the
  // plain-text state sync there would otherwise regenerate the canvas
  // and lose that formatting.
  const lastCanvasHtmlRef = useRef(null);

  // Belt-and-braces close: clicks inside the iframe are handled by the
  // selectionchange/blur logic below (a different document, so they
  // never reach this listener), but a click on some other part of the
  // outer page — with focus never actually leaving the console — needs
  // its own check.
  useEffect(() => {
    if (!suggestionState) return undefined;
    const handleOutsideClick = (e) => {
      if (suggestionDropdownRef.current?.contains(e.target)) return;
      if (consoleWrapperRef.current?.contains(e.target)) return;
      setSuggestionState(null);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [suggestionState]);

  // Turns the whole letter-content area into ONE seamless writing
  // surface: click anywhere in it — before the salutation, between the
  // subject and the body, past the last line, wherever — and start
  // typing right there, same as an ordinary document editor. There are
  // no inner sub-fields to bump into; it's a single contenteditable
  // root, so every gap between the generated ለ/ቁጥር/ጉዳዩ/body content is
  // just as writable as the content itself. Re-run every time the
  // iframe (re)loads, since a fresh srcDoc means fresh DOM.
  const handleIframeLoad = () => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;

    const canvas = doc.querySelector('[data-canvas="true"]');
    if (!canvas) return;

    canvas.setAttribute("contenteditable", "true");
    canvas.spellcheck = false;

    // A suggestion was just picked from the floating dropdown — land the
    // caret at the end of that field so the user can keep typing right
    // away.
    if (pendingFocusFieldRef.current) {
      const target = canvas.querySelector(
        `[data-field="${pendingFocusFieldRef.current}"]`,
      );
      pendingFocusFieldRef.current = null;
      if (target) {
        const range = doc.createRange();
        range.selectNodeContents(target);
        range.collapse(false);
        const sel = doc.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        canvas.focus();
      }
    }

    canvas.addEventListener("focus", () => setIsConsoleFocused(true));

    // Keeps a live snapshot of the canvas's actual HTML — formatting
    // and line breaks included — independent of the plain-text state
    // sync below, so Print always has the true displayed content
    // regardless of when (or whether) a blur has happened relative to
    // clicking Print.
    const captureCanvasSnapshot = () => {
      const clone = canvas.cloneNode(true);
      clone.removeAttribute("contenteditable");
      lastCanvasHtmlRef.current = clone.outerHTML;
    };
    captureCanvasSnapshot();
    canvas.addEventListener("input", captureCanvasSnapshot);

    // Resolves which data-field (if any) the current caret sits inside.
    // Shared by the suggestion trigger and the Enter-key handler, so
    // both agree on "am I in the ለ/ጉዳዩ line" the same way.
    const resolveCurrentField = () => {
      const sel = doc.getSelection();
      if (!sel || sel.rangeCount === 0) return null;
      const node = sel.anchorNode;
      return node?.nodeType === 3
        ? node.parentElement?.closest("[data-field]") || null
        : node?.closest?.("[data-field]") || null;
    };

    const updateSuggestionsFromCursor = () => {
      const sel = doc.getSelection();
      if (!sel || sel.rangeCount === 0 || doc.activeElement !== canvas) {
        setSuggestionState(null);
        return;
      }

      const fieldEl = resolveCurrentField();
      const field = fieldEl?.getAttribute("data-field");

      if (field !== "to" && field !== "subject") {
        setSuggestionState(null);
        return;
      }

      const defaultLabel = field === "to" ? TO_LABEL : SUBJECT_LABEL;
      const content = fieldEl.textContent.trim();
      const isEmptyOrDefault = content === "" || content === defaultLabel;

      if (!isEmptyOrDefault) {
        setSuggestionState(null);
        return;
      }

      const options = field === "to" ? TO_OPTIONS : SUBJECT_OPTIONS;

      let caretRect;
      try {
        const range = sel.getRangeAt(0).cloneRange();
        range.collapse(true);
        caretRect = range.getClientRects()[0] || range.getBoundingClientRect();
      } catch {
        caretRect = null;
      }
      const fallbackRect = fieldEl.getBoundingClientRect();
      const rect =
        caretRect && (caretRect.width || caretRect.height)
          ? caretRect
          : fallbackRect;

      const iframeRect = iframeRef.current?.getBoundingClientRect();
      if (!iframeRect || !rect) {
        setSuggestionState(null);
        return;
      }

      setSuggestionState({
        field,
        options,
        activeIndex: 0,
        top: iframeRect.top + rect.bottom + 6,
        left: iframeRect.left + rect.left,
      });
    };
    doc.addEventListener("selectionchange", updateSuggestionsFromCursor);
    canvas.addEventListener("input", updateSuggestionsFromCursor);

    // Keydown inside the iframe's own document never reaches the outer
    // window, so both Ctrl+S/Cmd+S and the suggestion dropdown's
    // keyboard navigation need their own listener here.
    doc.addEventListener("keydown", (e) => {
      const isSaveShortcut =
        (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s";
      if (isSaveShortcut) {
        e.preventDefault();
        saveToCacheRef.current();
        return;
      }

      const suggestion = suggestionRef.current;
      if (suggestion) {
        if (e.key === "Escape") {
          e.preventDefault();
          setSuggestionState(null);
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSuggestionState({
            ...suggestion,
            activeIndex:
              (suggestion.activeIndex + 1) % suggestion.options.length,
          });
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSuggestionState({
            ...suggestion,
            activeIndex:
              (suggestion.activeIndex - 1 + suggestion.options.length) %
              suggestion.options.length,
          });
          return;
        }
        if (e.key === "Enter") {
          e.preventDefault();
          commitSuggestion(
            suggestion.field,
            suggestion.options[suggestion.activeIndex],
          );
          return;
        }
      }

      // Preserve line breaks typed inside the ለ/ጉዳዩ fields, instead of
      // letting them escape the field. Previously Enter here was
      // redirected to a brand-new line *after* the whole info-row /
      // subject section — which visually detached the break from ለ/ጉዳዩ
      // and let it drift back into whatever content followed once the
      // canvas next resynced. Now a <br> is inserted right at the
      // caret, staying inside the same data-field span, so the break
      // renders exactly where it was typed — both live and, since Print
      // reads this same DOM via lastCanvasHtmlRef, in the printed
      // output too.
      if (e.key === "Enter") {
        const fieldEl = resolveCurrentField();
        const field = fieldEl?.getAttribute("data-field");
        if (field === "to" || field === "subject") {
          e.preventDefault();
          const sel = doc.getSelection();
          if (!sel || !sel.rangeCount) return;
          const range = sel.getRangeAt(0);
          range.deleteContents();
          const br = doc.createElement("br");
          range.insertNode(br);

          if (!br.nextSibling) {
            const filler = doc.createElement("br");
            br.parentNode.insertBefore(filler, br.nextSibling);
          }
          range.setStartAfter(br);
          range.setEndAfter(br);
          sel.removeAllRanges();
          sel.addRange(range);
          captureCanvasSnapshot();
        }
      }
    });

    canvas.addEventListener("paste", (e) => {
      e.preventDefault();
      const text = (e.clipboardData || doc.defaultView.clipboardData).getData(
        "text/plain",
      );
      const sel = doc.getSelection();
      if (!sel || !sel.rangeCount) return;

      sel.deleteFromDocument();
      const range = sel.getRangeAt(0);

      const lines = text.split(/\r\n|\r|\n/);
      const frag = doc.createDocumentFragment();
      lines.forEach((line, i) => {
        frag.appendChild(doc.createTextNode(line));
        if (i < lines.length - 1) frag.appendChild(doc.createElement("br"));
      });
      const lastNode = frag.lastChild;
      range.insertNode(frag);
      if (lastNode) {
        range.setStartAfter(lastNode);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });

    // silently dropped.
    canvas.addEventListener("blur", () => {
      captureCanvasSnapshot();

      const toEl = canvas.querySelector('[data-field="to"]');
      const refEl = canvas.querySelector('[data-field="reference"]');
      const subjEl = canvas.querySelector('[data-field="subject"]');
      const bodyEl = canvas.querySelector('[data-field="body"]');

      if (toEl) {
        const rawTo = elementToText(toEl).trim();
        setTo(rawTo === TO_LABEL ? "" : rawTo);
      }
      if (refEl) {
        setReferenceNumber(sanitizeReferenceNumber(refEl.textContent.trim()));
      }
      if (subjEl) {
        const rawSubject = elementToText(subjEl).trim();
        setSubject(rawSubject === SUBJECT_LABEL ? "" : rawSubject);
      }
      if (bodyEl) setIncidentText(elementToText(bodyEl));

      setIsConsoleFocused(false);
      setSuggestionState(null);
    });
  };

  // Single source of truth for both the live preview iframe and the
  // printed output — what's on screen is exactly what gets printed.
  const letterHtml = useMemo(
    () =>
      buildLetterHtml({
        to,
        date: today,
        referenceNumber,
        subject,
        incidentText,
        screenshots,
        passportScan: passportAttached ? passportDataUri : null,
      }),
    [
      to,
      today,
      referenceNumber,
      subject,
      incidentText,
      screenshots,
      passportAttached,
      passportDataUri,
    ],
  );

  const handlePrint = () => {
    const fileTitle = worker?.full_name
      ? `Letter - ${worker.full_name}`
      : "Letter";

    let canvasHtmlOverride = lastCanvasHtmlRef.current;
    if (!canvasHtmlOverride) {
      const liveCanvas = iframeRef.current?.contentDocument?.querySelector(
        '[data-canvas="true"]',
      );
      if (liveCanvas) {
        const clone = liveCanvas.cloneNode(true);
        clone.removeAttribute("contenteditable");
        canvasHtmlOverride = clone.outerHTML;
      }
    }

    const printHtml = buildLetterHtml({
      to,
      date: today,
      referenceNumber,
      subject,
      incidentText,
      screenshots,
      passportScan: passportAttached ? passportDataUri : null,
      canvasHtmlOverride,
    });

    printLetter(printHtml, fileTitle);
  };

  return (
    <div className="dashboard-wraper">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <div>
          <h2 className="fw-bold text-dark mb-0">Letter</h2>
        </div>
      </div>
      <div className="row g-4">
        <div className="col-lg-9 order-2 order-lg-1">
          <p className="text-muted  mb-3">
            write your letter in the console below.
          </p>

          <div
            ref={consoleWrapperRef}
            style={{
              border: `1px solid ${isConsoleFocused ? "#1a3c6e" : "#dde5f5"}`,
              borderRadius: "12px",
              padding: "10px",
              background: "#fff",
              boxShadow: isConsoleFocused
                ? "0 0 0 3px rgba(26,60,110,0.12)"
                : "0 1px 4px rgba(26,60,110,0.06)",
              transition: "border-color .18s ease, box-shadow .18s ease",
            }}
          >
            <iframe
              ref={iframeRef}
              title="Letter Writing Console"
              srcDoc={letterHtml}
              onLoad={handleIframeLoad}
              style={{
                width: "100%",
                height: "850px",
                border: "none",
                display: "block",
                borderRadius: "8px",
              }}
            />
          </div>
        </div>

        <div className="col-lg-3 order-1 order-lg-2">
          <LetterToolkit
            worker={worker}
            passportAttached={passportAttached}
            onTogglePassportAttach={handleTogglePassportAttach}
            screenshots={screenshots}
            onAddScreenshots={handleAddScreenshots}
            onRemoveScreenshot={handleRemoveScreenshot}
            onPrint={handlePrint}
            isCached={isCached}
            onToggleCache={handleToggleCache}
            onRemoveFromCache={handleRemoveFromCache}
          />
        </div>
      </div>

      {/* Contextual, autocomplete-style suggestion dropdown — rendered
          only while relevant, positioned right next to the caret. Never
          part of the console itself, so it never restricts where the
          user can click or type. */}
      {suggestionState && (
        <div
          ref={suggestionDropdownRef}
          role="listbox"
          style={{
            position: "fixed",
            top: suggestionState.top,
            left: suggestionState.left,
            zIndex: 2000,
            background: "#fff",
            border: "1px solid #dde5f5",
            borderRadius: "8px",
            boxShadow: "0 4px 16px rgba(26,60,110,0.18)",
            minWidth: "220px",
            maxWidth: "380px",
            maxHeight: "220px",
            overflowY: "auto",
            padding: "4px",
          }}
        >
          {suggestionState.options.map((opt, idx) => (
            <div
              key={opt}
              role="option"
              aria-selected={idx === suggestionState.activeIndex}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() =>
                setSuggestionState((prev) =>
                  prev ? { ...prev, activeIndex: idx } : prev,
                )
              }
              onClick={() => commitSuggestion(suggestionState.field, opt)}
              style={{
                padding: "6px 10px",
                borderRadius: "6px",
                fontSize: "0.82rem",
                color: "#1a2640",
                cursor: "pointer",
                background:
                  idx === suggestionState.activeIndex
                    ? "#eef3fb"
                    : "transparent",
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LetterGenerator;
