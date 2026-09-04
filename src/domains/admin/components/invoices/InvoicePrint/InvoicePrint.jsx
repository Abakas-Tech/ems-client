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
        <div><b>Status:</b> ${(invoice.status || "").replace("_", " ").toUpperCase()}</div>
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

const buildItemRows = (items) =>
  items
    .map((item, i) => {
      const bg = i % 2 === 0 ? "#fff" : "#f5f8ff";
      return `<tr>
        <td style="background:${bg};color:#9aa4b8;font-weight:600;text-align:center;">${i + 1}</td>
        <td style="background:${bg}">${item.user_full_name || "Unassigned"}</td>
        <td style="background:${bg}">${item.passport_number || "—"}</td>
        <td style="background:${bg}">${item.employer_full_name || "—"}</td>
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
  tfoot .totals-row td{padding:7px;font-weight:800;font-size:9.5pt;color:#1a3c6e;background:#eaf1fc;border-top:2px solid #1a3c6e;}
  .pf{position:absolute;bottom:0;left:0;right:0;padding-top:5px;border-top:1.5px solid #c8d8f0;display:flex;justify-content:space-between;font-size:7pt;color:#8a97b0;background:#fff;}
  .section-title{font-size:8.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#1a3c6e;margin:16px 0 8px;padding-bottom:5px;border-bottom:2px solid #e2e8f0;}
  .notes-box{font-size:8.5pt;color:#3c4a63;line-height:1.5;margin-bottom:8px;}
`;

const buildInvoicePage = (invoice) => {
  const items = invoice.items || [];
  const payments = invoice.payments || [];
  const hasPayments = payments.length > 0;

  const itemsThead = `<thead><tr>
      <th style="width:24px;text-align:center;">#</th>
      <th>Worker</th>
      <th>Passport #</th>
      <th>Employer</th>
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
    <table>
      ${itemsThead}
      <tbody>${
        items.length
          ? buildItemRows(items)
          : `<tr><td colspan="5" style="text-align:center;color:#8a97b0;padding:14px;">No items</td></tr>`
      }</tbody>
      <tfoot>
        <tr class="totals-row">
          <td colspan="4">Total</td>
          <td style="text-align:right;">${fmtAmount(invoice.total_amount)}</td>
        </tr>
      </tfoot>
    </table>

    ${invoice.notes ? `<div class="section-title">Notes</div><div class="notes-box">${invoice.notes}</div>` : ""}

    ${
      hasPayments
        ? `<div class="section-title">Payments</div>
           <table>${paymentsThead}<tbody>${buildPaymentRows(payments)}</tbody></table>`
        : ""
    }

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
