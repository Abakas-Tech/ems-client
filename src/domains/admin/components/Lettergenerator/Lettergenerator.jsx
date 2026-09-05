import { useEffect, useId, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { getWorkerProfile } from "../../api/worker.api";
import useLoader from "../../../../context/Loader/useLoader";
import useResponse from "../../../../context/Response/useResponse";
import BackButton from "../../../../shared/components/BackButton/BackButton";
// TODO: point this at the exact module the Finance/period report imports
// REPORT_META from, so the letter header is guaranteed to be the same
// logo/company name/confidentiality line as every other printed report.
import { REPORT_META } from "../../../../shared/components/Report/Data";


// Predefined options (ለ / ጉዳዩ / default incident text)


const TO_OPTIONS = [
  "የኢፌድሪ ስራና ክህሎት ሚኒስቴር ለሲስተም ክፍል አዲስ አበባ",
  "ኢትዮጵያ ንግድ ባንክ ኮልፌ ዲስትሪክት ዳይሬክተር አዲስ አበባ",
  "ለስራና ክህሎት ሚኒስቴር ለሲስተም ክፍል አዲስ አበባ",
];

const SUBJECT_OPTIONS = [
  "ከሲስተም ላይ እንዲለቀቅልን ስለመጠየቅ",
  "የውጭ ምንዛሪ ተመንዝሮ ገቢ እንዲሆን ስለመጠየቅ",
  "-የስም ስህተት እንዲስተካከልልን ስለመጠየቅ",
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

const fmtDate = (val) =>
  new Date(val).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });


// Shared muted input styling — a light fill only, no border/shadow chrome
// of its own beyond the standard form-control outline.


const FIELD_STYLE = {
  backgroundColor: "#f5f7fa",
};


// Print / HTML builder — mirrors the Finance period report's
// buildHeader/buildFooter/openAndPrint pattern class-for-class, so every
// printed page in the system shares one visual header.

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
      <div class="meta-r"></div>
    </div>`;
};

const buildLetterFooter = (pageLabel) => `
  <div class="pf">
    <span>${REPORT_META.orgName} — ${REPORT_META.confidentiality}</span>
    <span>Powered by Abakas Technologies</span>
    <span>${pageLabel}</span>
  </div>`;

// On screen (not print) each .page is rendered as its own floating white
// sheet on a neutral backdrop — the usual "print preview" look — and the
// document's own scrollbar is hidden (scroll still works, the bar itself
// just isn't drawn) so the preview edge stays clean. None of this affects
// the actual printed output: the @media print block strips it back to
// plain pages exactly as @page already governs.
const LETTER_STYLES = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  @page{size:A4 portrait;margin:15mm 16mm;}
  html{scrollbar-width:none;}
  html::-webkit-scrollbar{width:0;height:0;}
  body{
    font-family:"Nyala","Segoe UI",Tahoma,sans-serif;font-size:11pt;color:#1a2640;
    background:#e9edf3;print-color-adjust:exact;-webkit-print-color-adjust:exact;
    display:flex;flex-direction:column;align-items:center;gap:20px;padding:24px 0;
  }
  .page{
    position:relative;padding:15mm 16mm 26px;min-height:257mm;width:210mm;max-width:100%;
    background:#fff;box-shadow:0 2px 12px rgba(26,60,110,0.14);
  }
  @media print{
    body{background:#fff;padding:0;gap:0;}
    .page{box-shadow:none;width:auto;padding:0 0 26px;}
  }
  .pb{page-break-after:always;}
  .ph{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #1a3c6e;padding-bottom:8px;margin-bottom:18px;}
  .logo-block{display:flex;align-items:center;gap:9px;min-width:190px;}
  .org-name{font-size:12.5pt;font-weight:700;color:#1a3c6e;line-height:1.15;}
  .org-sub{font-size:7.5pt;color:#5a6a85;margin-top:2px;}
  .title-block{text-align:center;}
  .report-title{font-size:12pt;font-weight:700;color:#1a3c6e;text-transform:uppercase;letter-spacing:1px;}
  .report-sub{font-size:7.5pt;color:#5a6a85;margin-top:3px;}
  .meta-r{min-width:190px;}
  .pf{position:absolute;bottom:0;left:0;right:0;padding-top:5px;border-top:1.5px solid #c8d8f0;display:flex;justify-content:space-between;font-size:7pt;color:#8a97b0;background:#fff;}

  /* ለ on the left, ቀን/ቁጥር stacked on the right — same horizontal band,
     never side by side with each other. Preview/Print only; has no
     bearing on the input form above. */
  .letter-info-row{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;margin-bottom:18px;}
  .letter-to{font-size:11.5pt;font-weight:600;text-align:left;}
  .letter-meta-col{display:flex;flex-direction:column;gap:6px;font-size:10.5pt;text-align:right;white-space:nowrap;}
  .letter-meta-col b{color:#1a3c6e;}

  .letter-subject{text-align:center;font-weight:700;font-size:11.5pt;margin-bottom:16px;text-decoration:underline;}
  .letter-body{text-align:left;font-size:11pt;line-height:1.9;white-space:pre-wrap;}

  .image-page{display:flex;flex-direction:column;align-items:center;justify-content:center;height:220mm;}
  .image-page img{max-width:100%;max-height:100%;object-fit:contain;border:1px solid #dde5f5;}
  .image-caption{margin-top:10px;font-size:8.5pt;color:#5a6a85;}
`;

// Builds the full printable/previewable HTML document: page 1 is the
// letter body, followed by one full page per uploaded screenshot,
// followed by the passport scan page (if attached). This is the single
// source of truth used for BOTH the live preview iframe and the actual
// browser-print output. Reads directly from the same to/date/
// referenceNumber/subject/incidentText values the input fields above
// hold — the fields themselves are untouched, only how these values are
// arranged on the printed page changes here.
const buildLetterHtml = ({
  to,
  date,
  referenceNumber,
  subject,
  incidentText,
  screenshots = [],
  passportScan,
}) => {
  const totalPages = 1 + screenshots.length + (passportScan ? 1 : 0);

  const letterPage = `<div class="page${totalPages > 1 ? " pb" : ""}">
    ${buildLetterHeader("Official Letter", "ደብዳቤ")}
    <div class="letter-info-row">
      <div class="letter-to">ለ: ${to || ""}</div>
      <div class="letter-meta-col">
        <div><b>ቀን:</b> ${date}</div>
        <div><b>ቁጥር:</b> ${referenceNumber || ""}</div>
      </div>
    </div>
    <div class="letter-subject">ጉዳዩ: ${subject || ""}</div>
    <div class="letter-body">${incidentText || ""}</div>
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

// Inlines a remote image (e.g. the worker's passport scan) as a data URI
// — same trick VisaApplicationPdfGenerator.jsx uses — so it prints
// reliably even if the URL needs auth/CORS the print iframe can't
// satisfy. Falls back to the original URL on failure.
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


// SelectableField — ONE input that both picks a predefined option and
// stays freely editable: a native <datalist> attached to a plain text
// input, so the same field is what you pick from AND what you type/edit
// in — nothing renders into a second field.


const SelectableField = ({ label, options, value, onChange, placeholder }) => {
  const listId = useId();

  return (
    <div className="form-group">
      {label && (
        <label className="fw-semibold small mb-1 d-block">{label}</label>
      )}
      <input
        className="form-control"
        style={FIELD_STYLE}
        list={listId}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      <datalist id={listId}>
        {options.map((opt) => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
    </div>
  );
};


// CopyField — a single toolkit row: clicking it copies the value and,
// like the copy button in the Claude console, swaps its own icon/text to
// a "Copied" confirmation for a moment instead of firing a global toast.
// Left-aligned via an explicit inline style so it can never fall back to
// a button's default centered text.


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
}) => {
  // TODO: confirm these field paths against the real worker profile shape.
  const workerFields = worker
    ? [
        { label: "Name", value: worker.full_name },
        { label: "Passport No.", value: worker.passport?.passport_number },
        {
          label: "Labour ID",
          value: worker.labour_id || worker.contracts?.[0]?.labour_id,
        },
        {
          label: "Ticket Date",
          value: worker.ticket_date || worker.contracts?.[0]?.ticket_date,
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
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  // Passed in from Active Workers' "Create Letter" bulk action:
  // navigate("/admin/letter-generator", { state: { workerId } }).
  // Entirely optional — the page works with no worker at all.
  const workerId = location.state?.workerId || null;

  const [worker, setWorker] = useState(null);

  const [to, setTo] = useState("");
  // Seeded with DEFAULT_REFERENCE_NUMBER so ቁጥር is never blank on load,
  // but the field stays a normal controlled input the user can edit.
  const [referenceNumber, setReferenceNumber] = useState(
    DEFAULT_REFERENCE_NUMBER,
  );
  const [subject, setSubject] = useState("");
  const [incidentText, setIncidentText] = useState(DEFAULT_INCIDENT_TEXT);

  const [screenshots, setScreenshots] = useState([]);
  const [passportAttached, setPassportAttached] = useState(false);
  const [passportDataUri, setPassportDataUri] = useState(null);

  const today = useMemo(() => fmtDate(new Date()), []);

  useEffect(() => {
    if (!workerId) return;

    let cancelled = false;
    showLoader();

    getWorkerProfile(workerId)
      .then((res) => {
        if (cancelled) return;
        const profile = res?.data || res;
        // TODO: confirm the real field name for the passport scan image.
        const passportScanUrl =
          profile?.passport?.scan_url ||
          profile?.passport?.passport_scan?.url ||
          profile?.personal_information?.passport_scan?.url ||
          null;
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
    printLetter(letterHtml, fileTitle);
  };

  return (
    <div className="dashboard-wraper">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Letter Generator</h2>
          <p className="text-muted mb-0 small">
            {worker
              ? `Preparing a letter for ${worker.full_name}`
              : "No worker selected — fill the letter in manually."}
          </p>
        </div>
        <BackButton onClick={() => navigate(-1)} />
      </div>

      {/* Input layout: every field paired 2-up on larger screens
          (collapsing to one column on small screens), no card/border/
          shadow wrapper — plain sections like Record Transaction.
          Unchanged from before — only the Preview/Print HTML below
          rearranges how these same values are laid out on the page. */}
      <div className="submit-section mb-4">
        <div className="row">
          {/* ለ and ቀን share a row */}
          <div className="form-group col-md-6">
            <SelectableField
              label="ለ"
              options={TO_OPTIONS}
              value={to}
              onChange={setTo}
              placeholder="Type recipient…"
            />
          </div>
          <div className="form-group col-md-6">
            <label className="fw-semibold small mb-1 d-block">ቀን</label>
            <input
              className="form-control"
              style={FIELD_STYLE}
              value={today}
              disabled
            />
          </div>
        </div>

        <div className="row">
          {/* ቁጥር and ጉዳዩ share their own separate row — never on the
              same row as ቀን — kept aligned the same way as the row above. */}
          <div className="form-group col-md-6">
            <label className="fw-semibold small mb-1 d-block">ቁጥር</label>
            <input
              className="form-control"
              style={FIELD_STYLE}
              value={referenceNumber}
              placeholder="e.g. PEA/948/2021"
              onChange={(e) =>
                setReferenceNumber(sanitizeReferenceNumber(e.target.value))
              }
            />
          </div>
          <div className="form-group col-md-6">
            <SelectableField
              label="ጉዳዩ"
              options={SUBJECT_OPTIONS}
              value={subject}
              onChange={setSubject}
              placeholder="Type subject…"
            />
          </div>
        </div>

        <div className="row">
          <div className="form-group col-md-12">
            <label className="fw-semibold small mb-1 d-block">
              Letter Content
            </label>
            <textarea
              className="form-control"
              style={{ ...FIELD_STYLE, textAlign: "left" }}
              rows={7}
              value={incidentText}
              onChange={(e) => setIncidentText(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Preview (left, wide) + compact toolkit (right, narrow) — plain,
          no card/border/shadow, just the dashboard's own background. */}
      <div className="row g-4">
        <div className="col-lg-9">
          <iframe
            title="Letter Preview"
            srcDoc={letterHtml}
            style={{ width: "100%", height: "850px", border: "none" }}
          />
        </div>

        <div className="col-lg-3">
          <LetterToolkit
            worker={worker}
            passportAttached={passportAttached}
            onTogglePassportAttach={handleTogglePassportAttach}
            screenshots={screenshots}
            onAddScreenshots={handleAddScreenshots}
            onRemoveScreenshot={handleRemoveScreenshot}
            onPrint={handlePrint}
          />
        </div>
      </div>
    </div>
  );
};

export default LetterGenerator;
