import { REPORT_META } from "../../../../../shared/components/Report/Data";

const fmtDate = (val) =>
  val
    ? new Date(val).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

// Same header shape as PeriodReport.jsx's buildHeader — logo/org block on
// the left, document title centered, meta on the right — with the
// partner's name as the report's main header, since this report is
// generated for that partner.
const buildHeader = (partnerName, workerCount) => {
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
        <div class="report-title">Employee Report</div>
        <div class="report-sub">${partnerName}</div>
      </div>
      <div class="meta-r">
        <div><b>Partner:</b> ${partnerName}</div>
        <div><b>Employees:</b> ${workerCount}</div>
      </div>
    </div>`;
};

// Identical shape/content to PeriodReport.jsx's buildFooter.
const buildFooter = (pageLabel) => `
  <div class="pf">
    <span>${REPORT_META.orgName} — ${REPORT_META.confidentiality}</span>
    <span>Powered by Abakas Technologies</span>
    <span>${pageLabel}</span>
  </div>`;

// A worker "has" a category (Medical/COC/Contract/Foreign/LMIS QR) if
// their status history contains any entry whose status name matches it.
const hasStatus = (worker, keyword) =>
  (worker.status_history || []).some((entry) =>
    (entry.status_name || "").toLowerCase().includes(keyword),
  );

const yesNoCell = (value) => {
  const isYes = !!value;
  return `<td style="text-align:center;font-weight:700;color:${isYes ? "#15803d" : "#b91c1c"};">${isYes ? "Yes" : "No"}</td>`;
};

const buildWorkerRows = (workers) =>
  workers
    .map((worker, i) => {
      const bg = i % 2 === 0 ? "#fff" : "#f5f8ff";
      return `<tr style="background:${bg};">
        <td style="font-weight:600;">${worker.full_name}</td>
        ${yesNoCell(hasStatus(worker, "medical"))}
        ${yesNoCell(hasStatus(worker, "coc"))}
        ${yesNoCell(hasStatus(worker, "contract"))}
        ${yesNoCell(hasStatus(worker, "foreign"))}
        ${yesNoCell(hasStatus(worker, "lmis"))}
        <td>${fmtDate(worker.ticket_date)}</td>
      </tr>`;
    })
    .join("");

const REPORT_STYLES = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  @page{size:A4 landscape;margin:11mm 13mm;}
  body{font-family:"Segoe UI",Tahoma,sans-serif;font-size:8.5pt;color:#1a2640;background:#fff;print-color-adjust:exact;-webkit-print-color-adjust:exact;}
  .page{padding:0;position:relative;padding-bottom:26px;min-height:188mm;}
  .ph{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #1a3c6e;padding-bottom:8px;margin-bottom:8px;}
  .logo-block{display:flex;align-items:center;gap:9px;min-width:190px;}
  .org-name{font-size:12.5pt;font-weight:700;color:#1a3c6e;line-height:1.15;}
  .org-sub{font-size:7.5pt;color:#5a6a85;margin-top:2px;}
  .title-block{text-align:center;}
  .report-title{font-size:12pt;font-weight:700;color:#1a3c6e;text-transform:uppercase;letter-spacing:1px;}
  .report-sub{font-size:9pt;font-weight:700;color:#1a3c6e;margin-top:3px;}
  .meta-r{text-align:right;font-size:7.5pt;color:#5a6a85;line-height:1.9;min-width:190px;}
  .meta-r b{color:#1a3c6e;}
  table{width:100%;border-collapse:collapse;font-size:7.8pt;margin-bottom:8px;}
  thead tr{background:#1a3c6e;color:#fff;}
  thead th{padding:6px 7px;text-align:left;font-weight:600;font-size:7.5pt;letter-spacing:.3px;white-space:nowrap;border-right:1px solid #2e5ca8;}
  thead th:last-child{border-right:none;}
  tbody tr{border-bottom:1px solid #dde5f5;}
  tbody td{padding:5px 7px;vertical-align:middle;border-right:1px solid #e8edf8;}
  tbody td:last-child{border-right:none;}
  .pf{position:absolute;bottom:0;left:0;right:0;padding-top:5px;border-top:1.5px solid #c8d8f0;display:flex;justify-content:space-between;font-size:7pt;color:#8a97b0;background:#fff;}
`;

const ROWS_PER_PAGE = REPORT_META.rowsPerPage || 20;

const buildPages = (partnerName, workers) => {
  const totalPages = Math.max(1, Math.ceil(workers.length / ROWS_PER_PAGE));

  const thead = `<thead><tr>
      <th>Name</th>
      <th style="text-align:center;">Medical</th>
      <th style="text-align:center;">COC</th>
      <th style="text-align:center;">Contract</th>
      <th style="text-align:center;">Foreign</th>
      <th style="text-align:center;">LMIS QR</th>
      <th>Ticket Date</th>
    </tr></thead>`;

  return Array.from({ length: totalPages }, (_, p) => {
    const slice = workers.slice(p * ROWS_PER_PAGE, (p + 1) * ROWS_PER_PAGE);
    const rows = buildWorkerRows(slice);
    return `<div class="page">
      ${buildHeader(partnerName, workers.length)}
      <table>${thead}<tbody>${
        rows ||
        `<tr><td colspan="7" style="text-align:center;color:#8a97b0;padding:14px;">No employees found</td></tr>`
      }</tbody></table>
      ${buildFooter(`Page ${p + 1} of ${totalPages}`)}
    </div>`;
  }).join("\n");
};

// Same hidden-iframe + srcdoc + window.print() technique as
// PeriodReport.jsx's openAndPrint — renders into a fully isolated document
// so nothing in this app's own layout/CSS can interfere with or blank out
// the printed page.
//
// printTitle, when given, is what "Save as PDF" suggests as the
// filename. Browsers take that from the *top-level page's* document
// title, not the iframe's own <title> — the iframe's title only names
// its own (invisible) document, so without this the saved file kept
// picking up whatever the app's real page title happened to be. This
// swaps document.title in for the duration of the print and puts the
// original back afterward.
const openAndPrint = (html, printTitle) => {
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

    if (printTitle) document.title = printTitle;

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

// workers: the exact set to print — either the selected employees, or
// the partner's full roster, decided by the caller.
export const printWorkerReport = ({ partnerName, workers = [] }) => {
  if (!partnerName) return;

  const printTitle = `${REPORT_META.orgName} - ${partnerName} Employee Report`;

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>${printTitle}</title>
<style>${REPORT_STYLES}</style>
</head><body>${buildPages(partnerName, workers)}</body></html>`;

  openAndPrint(html, printTitle);
};
