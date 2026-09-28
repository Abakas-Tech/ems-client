import { REPORT_META } from "../../../../../shared/components/Report/Data";
import {
  DOCUMENT_ELEMENT_STYLES,
  buildElementsLayerHtml,
} from "../../../../../utils/documentElements.utils";

// Printable width of the invoice page: A4 210mm minus the 13mm left/right
// @page margins. The print-options preview renders the page at exactly
// this width, so a stamp/signature positioned there prints in the same
// spot (same mm-based system as the Letter editor).
export const INVOICE_PAGE_WIDTH_MM = 184;

// Default stamp/signature widths and the bottom-center default's distance
// from the bottom of the page (just above the footer line).
export const INVOICE_ELEMENT_WIDTH_MM = { stamp: 32, signature: 40 };
export const INVOICE_BOTTOM_CENTER_MM = 6;

// Default layout: signature and stamp side by side, centered on the page
// as a pair (signature left, stamp right) with a gap between them, so they
// never cover each other. `widths` are the current element widths (mm).
export const INVOICE_ELEMENT_GAP_MM = 10;
export const invoiceDefaultElementLeft = (
  kind,
  widths = INVOICE_ELEMENT_WIDTH_MM,
) => {
  const pairWidth = widths.signature + INVOICE_ELEMENT_GAP_MM + widths.stamp;
  const start = (INVOICE_PAGE_WIDTH_MM - pairWidth) / 2;
  const left =
    kind === "signature"
      ? start
      : start + widths.signature + INVOICE_ELEMENT_GAP_MM;
  return Math.round(left * 10) / 10;
};

// Default name of the printed/saved file (the browser adds ".pdf").
export const DEFAULT_INVOICE_FILE_NAME = "invoice";

// The user-entered file name, made safe to use as a file name: characters
// not allowed in file names are dropped and a typed ".pdf" is removed, since
// the browser's "Save as PDF" adds the extension itself.
export const sanitizeInvoiceFileName = (value) =>
  String(value ?? "")
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\.pdf$/i, "")
    .trim() || DEFAULT_INVOICE_FILE_NAME;

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const fmtDate = (val) =>
  val
    ? new Date(val).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const fmtAmount = (val) =>
  Number(val ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Fixed, non-editable, always-printed value — not part of the bank-info
// form, not part of the toggle, never sourced from the invoice/API.
const WORK_RECEIVER_NAME = "ALETESALAT FOREIGN EMPLOYMENT AGENCY";

// ---- Amount-in-words helper (for the Total Payment line) -----------
const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];
const SCALES = ["", "Thousand", "Million", "Billion"];

const threeDigitsToWords = (num) => {
  let str = "";
  if (num >= 100) {
    str += `${ONES[Math.floor(num / 100)]} Hundred`;
    num %= 100;
    if (num) str += " ";
  }
  if (num >= 20) {
    str += TENS[Math.floor(num / 10)];
    if (num % 10) str += `-${ONES[num % 10]}`;
  } else if (num > 0) {
    str += ONES[num];
  }
  return str;
};

const integerToWords = (num) => {
  if (num === 0) return "Zero";
  const groups = [];
  let n = num;
  while (n > 0) {
    groups.push(n % 1000);
    n = Math.floor(n / 1000);
  }
  const parts = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue;
    const words = threeDigitsToWords(groups[i]);
    parts.push(SCALES[i] ? `${words} ${SCALES[i]}` : words);
  }
  return parts.join(" ");
};

// Spells out the invoice total, e.g. 1234.56 -> "One Thousand Two
// Hundred Thirty-Four Birr and Fifty-Six Cents Only". Purely a display
// helper for the printed Payment Summary — never used elsewhere.
const amountToWords = (value) => {
  const num = Number(value) || 0;
  const abs = Math.abs(num);
  const birr = Math.floor(abs);
  const cents = Math.round((abs - birr) * 100);

  const sign = num < 0 ? "Negative " : "";
  const birrWords = `${integerToWords(birr)} USD`;
  const centsWords = cents > 0 ? ` and ${integerToWords(cents)} Cents` : "";

  return `${sign}${birrWords}${centsWords} Only`;
};

// Same header shape as PeriodReport.jsx's buildHeader — logo/org block on
// the left, document title centered, meta on the right.
const buildHeader = (invoice) => {
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
        <div class="report-title">Invoice</div>
        <div class="report-sub">${invoice.invoice_number}</div>
      </div>
      <div class="meta-r">
        <div><b>Partner:</b> ${invoice.customer_full_name || "—"}</div>
        <div><b>Invoice Date:</b> ${fmtDate(invoice.invoice_date)}</div>
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

// Always-displayed summary — Sender (the invoice's selected Partner),
// Work Receiver (fixed), Total Payment (derived from the invoice total),
// and the total spelled out in words. Never gated by the bank-info
// toggle. Returns bare rows only — buildInvoicePage wraps this together
// with the bank-details rows in a single shared "bank-box" container so
// the whole block reads as one continuous section.
const buildSummarySection = (invoice) => `
    <div class="bank-row"><span class="bank-label">SENDER:</span> <span class="bank-value">${invoice.customer_full_name || "—"}</span></div>
    <div class="bank-row"><span class="bank-label">WORK RECEIVER:</span> <span class="bank-value">${WORK_RECEIVER_NAME}</span></div>
    <div class="bank-row"><span class="bank-label">TOTAL PAYMENT:</span> <span class="bank-value bank-value--total">${fmtAmount(invoice.total_amount)} (${amountToWords(invoice.total_amount)}) </span></div>`;

// Agent is folded into the Worker cell as "Name (Agent Name)" — there is
// no standalone Agent column anymore.
const buildItemRows = (items) =>
  items
    .map((item, i) => {
      const bg = i % 2 === 0 ? "#fff" : "#f5f8ff";
      const workerLabel = `${item.user_full_name || "Unassigned"}${
        item.agent_name ? ` (${item.agent_name})` : ""
      }`;
      return `<tr>
        <td style="background:${bg};color:#9aa4b8;font-weight:600;text-align:center;">${i + 1}</td>
        <td style="background:${bg}">${workerLabel}</td>
        <td style="background:${bg}">${item.passport_number || "—"}</td>
        <td style="background:${bg}">${item.employer_full_name || "—"}</td>
        <td style="background:${bg};text-align:right;font-weight:600;">${fmtAmount(item.unit_price)}</td>
        <td style="background:${bg}">${item.status || "—"}</td>
      </tr>`;
    })
    .join("");

const buildPaymentRows = (payments) =>
  payments
    .map((p, i) => {
      const bg = i % 2 === 0 ? "#fff" : "#f5f8ff";
      return `<tr>
        <td style="background:${bg}">${fmtDate(p.transaction_date)}</td>
        <td style="background:${bg}">${p.description || "—"}</td>
        <td style="background:${bg}">${p.reference || "—"}</td>
        <td style="background:${bg};text-align:right;font-weight:600;color:#15803d;">${fmtAmount(p.amount)}</td>
      </tr>`;
    })
    .join("");

// Bank info is print-only: built fresh from whatever the user typed into
// InvoiceDetail's print-options panel for this single print call, and
// never read from or written to the invoice/API. Only fields that are
// actually filled in are rendered — an empty field is simply omitted
// rather than printed blank. Labels match the print-options form
// exactly (ACCOUNT, TELE PHONE, BANK NAME, SWIFT CODE, LOCATION).
// Returns bare rows only (or "" if nothing is filled in) — folded into
// the same shared "bank-box" container as the summary rows above it.
const BANK_FIELD_LABELS = {
  account_number: "ACCOUNT",
  phone: "TELE PHONE",
  bank_name: "BANK NAME",
  swift_code: "SWIFT CODE",
  location: "LOCATION",
};

const buildBankSection = (fields = {}) =>
  Object.entries(BANK_FIELD_LABELS)
    .filter(([key]) => (fields[key] ?? "").toString().trim())
    .map(
      ([key, label]) =>
        `<div class="bank-row"><span class="bank-label">${label}:</span> <span class="bank-value">${fields[key]}</span></div>`,
    )
    .join("");

// "Best regards" — fixed, non-editable sign-off, positioned bottom-right
// above the footer bar. Deliberately left with empty space beneath it
// (before the footer line) so a stamp or signature can be added on the
// printed/physical copy.
const buildSignOff = () => `
  <div class="sign-off">Best regards</div>`;

const REPORT_STYLES = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  @page{size:A4;margin:11mm 13mm;}
  body{font-family:"Segoe UI",Tahoma,sans-serif;font-size:8.5pt;color:#1a2640;background:#fff;print-color-adjust:exact;-webkit-print-color-adjust:exact;}
  .page{padding:0;position:relative;padding-bottom:70px;min-height:265mm;width:${INVOICE_PAGE_WIDTH_MM}mm;}
  .ph{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #1a3c6e;padding-bottom:8px;margin-bottom:8px;}
  .logo-block{display:flex;align-items:center;gap:9px;min-width:190px;}
  .org-name{font-size:12.5pt;font-weight:700;color:#1a3c6e;line-height:1.15;}
  .org-sub{font-size:7.5pt;color:#5a6a85;margin-top:2px;}
  .title-block{text-align:center;}
  .report-title{font-size:12pt;font-weight:700;color:#1a3c6e;text-transform:uppercase;letter-spacing:1px;}
  .report-sub{font-size:7.5pt;color:#5a6a85;margin-top:3px;}
  .meta-r{text-align:right;font-size:7.5pt;color:#5a6a85;line-height:1.9;min-width:190px;}
  .meta-r b{color:#1a3c6e;}
  table{width:100%;border-collapse:collapse;font-size:7.8pt;margin-bottom:8px;}
  thead tr{background:#1a3c6e;color:#fff;}
  thead th{padding:6px 7px;text-align:left;font-weight:600;font-size:7.5pt;letter-spacing:.3px;white-space:nowrap;border-right:1px solid #2e5ca8;}
  thead th:last-child{border-right:none;}
  tbody tr{border-bottom:1px solid #dde5f5;}
  tbody td{padding:5px 7px;vertical-align:middle;border-right:1px solid #e8edf8;}
  tbody td:last-child{border-right:none;}
  tfoot .totals-row td{padding:7px;font-weight:800;font-size:9.5pt;color:#1a3c6e;background:#eaf1fc;border-top:2px solid #1a3c6e;}
  .pf{position:absolute;bottom:0;left:0;right:0;padding-top:5px;border-top:1.5px solid #c8d8f0;display:flex;justify-content:space-between;font-size:9pt;font-weight:600;color:#5a6a85;background:#fff;}
  .section-title{font-size:8.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#1a3c6e;margin:16px 0 8px;padding-bottom:5px;border-bottom:2px solid #e2e8f0;}
  .notes-box{font-size:8.5pt;color:#3c4a63;line-height:1.5;margin-bottom:8px;}
  .bank-box{font-size:9pt;color:#2b3a55;line-height:2.1;margin:26px 0 12px;padding:0;}
  .bank-row{display:flex;gap:6px;}
  .bank-label{font-weight:800;color:#1a3c6e;min-width:118px;letter-spacing:.5px;font-size:8.5pt;}
  .bank-value{color:#1a2640;font-weight:600;font-size:9.5pt;letter-spacing:.2px;}
  .bank-value--total{font-weight:800;font-size:10.5pt;color:#1a3c6e;}
  .sign-off{position:absolute;right:0;bottom:36px;font-size:8.5pt;font-weight:600;color:#1a2640;text-align:right;}
  ${DOCUMENT_ELEMENT_STYLES}
  /* On-screen preview only (print options): the page on a grey desk with
     its white paper margins drawn around it — the page box itself is laid
     out exactly as printed. */
  @media screen{
    html:has(body.doc-preview){overflow-y:hidden;scrollbar-width:none;}
    html:has(body.doc-preview)::-webkit-scrollbar{width:0;height:0;}
    body.doc-preview{background:#fff;padding:4mm 0;}
    body.doc-preview .page{margin:0 auto;}
  }
`;

// Column order: #, Worker (agent folded in as "Name (Agent)"), Passport #,
// Employer, Amount, Status — Agent Name no longer has its own column.
const buildInvoicePage = (invoice, bankOptions, elements = []) => {
  const items = invoice.items || [];
  const payments = invoice.payments || [];
  const hasPayments = payments.length > 0;
  const bankSectionHtml = bankOptions?.enabled
    ? buildBankSection(bankOptions.fields)
    : "";

  const itemsThead = `<thead><tr>
      <th style="width:24px;text-align:center;">#</th>
      <th>Worker Name</th>
      <th>Passport Number</th>
      <th>Sponsor Name</th>
      <th style="text-align:right;">Agency Fee(USD)</th>
      <th>Status</th>
    </tr></thead>`;

  const paymentsThead = `<thead><tr>
      <th>Date</th>
      <th>Description</th>
      <th>Reference</th>
      <th style="text-align:right;">Agency Fee(USD)</th>
    </tr></thead>`;

  return `<div class="page">
    ${buildHeader(invoice)}

    <div class="section-title">Items</div>
    <table>
      ${itemsThead}
      <tbody>${
        items.length
          ? buildItemRows(items)
          : `<tr><td colspan="6" style="text-align:center;color:#8a97b0;padding:14px;">No items</td></tr>`
      }</tbody>
      <tfoot>
        <tr class="totals-row">
          <td colspan="4">Total</td>
          <td style="text-align:right;">${fmtAmount(invoice.total_amount)}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>

    <div class="bank-box">${buildSummarySection(invoice)}${bankSectionHtml}</div>

    ${invoice.notes ? `<div class="section-title">Notes</div><div class="notes-box">${invoice.notes}</div>` : ""}

    ${
      hasPayments
        ? `<div class="section-title">Payments</div>
           <table>${paymentsThead}<tbody>${buildPaymentRows(payments)}</tbody></table>`
        : ""
    }

    ${buildSignOff()}

    ${buildFooter("Page 1 of 1")}

    ${buildElementsLayerHtml(elements, 0)}
  </div>`;
};

// Same hidden-iframe + srcdoc + window.print() technique as
// PeriodReport.jsx's openAndPrint — renders into a fully isolated document
// so nothing in this app's own layout/CSS can interfere with or blank out
// the printed page.
const openAndPrint = (html, printTitle) => {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";

  // The browser names the saved PDF after the document title, so the page's
  // title is set to the chosen file name while printing (same as the
  // Letter print), and restored afterwards.
  const originalTitle = document.title;
  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    if (printTitle) document.title = originalTitle;
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

// bankOptions: { enabled: boolean, fields: { account_number, phone,
// bank_name, swift_code, location } } — optional. Purely a print-time
// input; nothing here reads from or writes to storage. Sender / Work
// Receiver / Total Payment / Amount in Words always print regardless of
// bankOptions, positioned right after the items table and right above
// the Bank Information block.
//
// The full invoice document. `elements` are the stamp/signature placed from
// the print options (mm positions); `preview` renders the on-screen preview
// variant (the print output is unaffected by it).
export const buildInvoiceDocumentHtml = (
  invoice,
  bankOptions,
  { elements = [], title, preview = false } = {},
) => `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>${escapeHtml(title || `Invoice ${invoice.invoice_number}`)}</title>
<style>${REPORT_STYLES}</style>
</head><body${preview ? ' class="doc-preview"' : ""}>${buildInvoicePage(invoice, bankOptions, elements)}</body></html>`;

// printOptions (optional): { elements, fileName } — the stamp/signature to
// print (Admin only, see InvoiceDetail) and the name of the saved file.
export const printInvoiceDocument = (invoice, bankOptions, printOptions = {}) => {
  if (!invoice) return;

  const fileName = sanitizeInvoiceFileName(printOptions.fileName);
  const html = buildInvoiceDocumentHtml(invoice, bankOptions, {
    elements: printOptions.elements || [],
    title: fileName,
  });

  openAndPrint(html, fileName);
};
