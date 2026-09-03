import { REPORT_META } from "../../../../../shared/components/Report/Data";

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

// Same header shape as PeriodReport.jsx's buildHeader — logo/org block on
// the left, document title centered, meta on the right — just with
// invoice-specific title/meta instead of period status/duration.
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
        <div><b>Status:</b> ${(invoice.status || "").replace("_", " ").toUpperCase()}</div>
        <div><b>Customer:</b> ${invoice.customer_full_name || "—"}</div>
        <div><b>Invoice Date:</b> ${fmtDate(invoice.invoice_date)}</div>
        <div><b>Due Date:</b> ${fmtDate(invoice.due_date)}</div>
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

const buildItemRows = (items) =>
  items
    .map((item, i) => {
      const bg = i % 2 === 0 ? "#fff" : "#f5f8ff";
      return `<tr>
        <td style="background:${bg};color:#9aa4b8;font-weight:600;text-align:center;">${i + 1}</td>
        <td style="background:${bg}">${item.user_full_name || "Unassigned"}</td>
        <td style="background:${bg}">${item.description || "—"}</td>
        <td style="background:${bg};text-align:right;font-weight:600;">${fmtAmount(item.unit_price)}</td>
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

// Same buildStatCard shape as PeriodReport.jsx (label + value, optional tone).
const buildStatCard = (label, value, tone = "neutral") => `
  <div class="stat-card stat-${tone}">
    <div class="stat-label">${label}</div>
    <div class="stat-value">${value}</div>
  </div>`;

// ── Premium summary layout — same structure as PeriodReport.jsx's
// buildSummaryPage: an eyebrow label, a hero figure, supporting stat
// cards, an optional note, and a signoff block. Total is the hero here
// (in place of Net Profit/Loss); the supporting cards are exactly
// Subtotal, Discount, and VAT — no Paid, no Balance. ──
const buildSummarySection = (invoice) => {
  const generatedOn = fmtDate(new Date());

  const statCards = [
    buildStatCard("Subtotal", `${fmtAmount(invoice.subtotal)} Birr`),
    buildStatCard(
      "Discount",
      `- ${fmtAmount(invoice.discount_amount)} Birr`,
      "expense",
    ),
    buildStatCard("VAT", `+ ${fmtAmount(invoice.vat_amount)} Birr`, "income"),
  ].join("");

  return `
    <div class="summary-wrap">
      <div class="summary-eyebrow">Invoice Summary</div>

      <div class="summary-hero hero-pos">
        <div class="hero-label">Total</div>
        <div class="hero-value">${fmtAmount(invoice.total_amount)}<span class="hero-unit">Birr</span></div>
        <div class="hero-sub">${invoice.invoice_number} &nbsp;·&nbsp; ${fmtDate(invoice.invoice_date)}</div>
      </div>

      <div class="stat-grid">${statCards}</div>

      ${
        invoice.notes
          ? `<div class="summary-note">
              <div class="summary-note-label">Notes</div>
              <p>${invoice.notes}</p>
            </div>`
          : ""
      }

      <div class="summary-signoff">
        <div class="signoff-line"><span>Prepared by</span><span>${REPORT_META.orgName}</span></div>
        <div class="signoff-line"><span>Generated on</span><span>${generatedOn}</span></div>
      </div>
    </div>`;
};

// Same REPORT_STYLES as PeriodReport.jsx, verbatim, so the printed invoice
// looks identical to the printed period report/summary — same fonts,
// spacing, table chrome, stat cards, hero block, footer.
const REPORT_STYLES = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  @page{size:A4;margin:11mm 13mm;}
  body{font-family:"Segoe UI",Tahoma,sans-serif;font-size:8.5pt;color:#1a2640;background:#fff;print-color-adjust:exact;-webkit-print-color-adjust:exact;}
  .page{padding:0;position:relative;padding-bottom:26px;min-height:265mm;}
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
  .bp{display:inline-block;padding:2px 8px;border-radius:20px;font-size:7pt;font-weight:600;white-space:nowrap;}
  .pf{position:absolute;bottom:0;left:0;right:0;padding-top:5px;border-top:1.5px solid #c8d8f0;display:flex;justify-content:space-between;font-size:7pt;color:#8a97b0;background:#fff;}
  .section-title{font-size:8.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#1a3c6e;margin:14px 0 8px;padding-bottom:5px;border-bottom:2px solid #e2e8f0;}

  /* ── Premium financial-summary layout (identical to PeriodReport.jsx) ── */
  .summary-wrap{max-width:760px;margin:0 auto;padding:22px 10px 6px;}
  .summary-eyebrow{font-size:10.5pt;font-weight:700;color:#1a3c6e;text-transform:uppercase;letter-spacing:1.6px;text-align:center;margin-bottom:20px;}

  .summary-hero{border:1px solid #d7e4f5;border-radius:14px;padding:22px 30px;margin-bottom:22px;text-align:center;}
  .hero-pos{background:linear-gradient(135deg,#eefcf3 0%,#f7fbff 75%);}
  .hero-neg{background:linear-gradient(135deg,#fdeeee 0%,#f7fbff 75%);}
  .hero-label{font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:1.4px;color:#5a6a85;margin-bottom:6px;}
  .hero-value{font-size:27pt;font-weight:800;font-variant-numeric:tabular-nums;line-height:1;white-space:nowrap;}
  .hero-pos .hero-value{color:#15803d;}
  .hero-neg .hero-value{color:#b91c1c;}
  .hero-unit{font-size:11pt;font-weight:600;color:#5a6a85;margin-left:6px;}
  .hero-sub{font-size:7.8pt;color:#5a6a85;margin-top:9px;}

  .stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:22px;}
  .stat-card{border:1px solid #e2e8f0;border-top:3px solid #cbd5e1;border-radius:10px;padding:14px 16px;background:#fff;}
  .stat-card.stat-income{border-top-color:#22c55e;}
  .stat-card.stat-expense{border-top-color:#ef4444;}
  .stat-label{font-size:7.3pt;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:#8a97b0;margin-bottom:6px;}
  .stat-value{font-size:12.5pt;font-weight:700;color:#1a2640;font-variant-numeric:tabular-nums;}
  .stat-card.stat-income .stat-value{color:#15803d;}
  .stat-card.stat-expense .stat-value{color:#b91c1c;}

  .summary-note{border-radius:0 8px 8px 0;padding:12px 16px;margin-bottom:20px;}
  .summary-note-label{font-size:7.3pt;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:#1a3c6e;margin-bottom:4px;}
  .summary-note p{font-size:8.5pt;color:#3c4a63;line-height:1.5;}

  .summary-signoff{border-top:1px solid #e2e8f0;padding-top:12px;display:flex;flex-direction:column;gap:5px;}
  .signoff-line{display:flex;justify-content:space-between;font-size:7.8pt;color:#5a6a85;}
  .signoff-line span:last-child{font-weight:600;color:#1a2640;}
`;

const buildInvoicePage = (invoice) => {
  const items = invoice.items || [];
  const payments = invoice.payments || [];

  const itemsThead = `<thead><tr>
      <th style="width:28px;text-align:center;">#</th>
      <th>Worker</th>
      <th>Description</th>
      <th style="text-align:right;">Amount (Birr)</th>
    </tr></thead>`;

  const paymentsThead = `<thead><tr>
      <th>Date</th>
      <th>Description</th>
      <th>Reference</th>
      <th style="text-align:right;">Amount (Birr)</th>
    </tr></thead>`;

  return `<div class="page">
    ${buildHeader(invoice)}

    <div class="section-title">Items</div>
    <table>${itemsThead}<tbody>${
      items.length
        ? buildItemRows(items)
        : `<tr><td colspan="4" style="text-align:center;color:#8a97b0;padding:14px;">No items</td></tr>`
    }</tbody></table>

    ${buildSummarySection(invoice)}

    <div class="section-title">Payments</div>
    <table>${paymentsThead}<tbody>${
      payments.length
        ? buildPaymentRows(payments)
        : `<tr><td colspan="4" style="text-align:center;color:#8a97b0;padding:14px;">No payments recorded yet</td></tr>`
    }</tbody></table>

    ${buildFooter("Page 1 of 1")}
  </div>`;
};

// Same hidden-iframe + srcdoc + window.print() technique as
// PeriodReport.jsx's openAndPrint — renders into a fully isolated document
// so nothing in this app's own layout/CSS can interfere with or blank out
// the printed page.
const openAndPrint = (html) => {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
  };

  iframe.onload = () => {
    const win = iframe.contentWindow;
    if (!win) return;

    win.focus();
    win.addEventListener("afterprint", cleanup);

    setTimeout(() => {
      try {
        win.print();
      } catch (e) {
        cleanup();
      }
    }, 150);

    setTimeout(cleanup, 4000);
  };

  iframe.srcdoc = html;
  document.body.appendChild(iframe);
};

export const printInvoiceDocument = (invoice) => {
  if (!invoice) return;

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>Invoice ${invoice.invoice_number}</title>
<style>${REPORT_STYLES}</style>
</head><body>${buildInvoicePage(invoice)}</body></html>`;

  openAndPrint(html);
};
