import { REPORT_META } from "./Data";

const ROWS_PER_PAGE = REPORT_META.rowsPerPage || 15;

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

// Falls back to computing income/expense/net from the transaction set
// itself when the period record doesn't carry those totals yet. Net
// profit/loss accounts for commission and VAT as well, not just the raw
// income vs. expense difference.
const computeTotals = (period, transactions) => {
  const computedIncome = transactions
    .filter((t) => t.category === "income")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const computedExpense = transactions
    .filter((t) => t.category === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const commission = period.total_commission ?? period.commission ?? null;
  const vat = period.total_vat ?? period.vat ?? null;

  const computedNet =
    computedIncome -
    computedExpense -
    Number(commission || 0) -
    Number(vat || 0);

  return {
    income: period.total_income ?? computedIncome,
    expense: period.total_expense ?? computedExpense,
    commission,
    vat,
    netProfit: period.net_profit ?? computedNet,
    transactionCount: period.transaction_count ?? transactions.length,
  };
};

const buildHeader = (period, summaryOnly = false) => {
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
        <div class="report-title">Financial Period ${
          summaryOnly ? "Summary" : "Report"
        }</div>
        <div class="report-sub">${period.title}</div>
      </div>
      <div class="meta-r">
        <div><b>Status:</b> ${
          period.status === "closed" ? "Closed" : "Currently Active Period"
        }</div>
        <div><b>Period:</b> ${fmtDate(period.started_at)} – ${
          period.closed_at ? fmtDate(period.closed_at) : "Present"
        }</div>
      </div>
    </div>`;
};

const buildFooter = (pageLabel) => `
  <div class="pf">
    <span>${REPORT_META.orgName} — ${REPORT_META.confidentiality}</span>
    <span>Powered by Abakas Technologies</span>
    <span>${pageLabel}</span>
  </div>`;

const buildTransactionRows = (transactions, startIdx) =>
  transactions
    .map((t, i) => {
      const bg = i % 2 === 0 ? "#fff" : "#f5f8ff";
      const isIncome = t.category === "income";
      return `<tr>
        <td style="background:${bg};color:#9aa4b8;font-weight:600;text-align:center;">${
          startIdx + i + 1
        }</td>
        <td style="background:${bg}">${fmtDate(
          t.transaction_date || t.created_at,
        )}</td>
        <td style="background:${bg}">${t.reference || "—"}</td>
        <td style="background:${bg}"><span class="bp" style="background:${
          isIncome ? "#dcfce7" : "#fee2e2"
        };color:${isIncome ? "#15803d" : "#b91c1c"}">${(
          t.category || ""
        ).toUpperCase()}</span></td>
        <td style="background:${bg}">${
          t.target_user_name || (t.user_id ? "—" : "Company Account")
        }</td>
        <td style="background:${bg}">${t.creator_name || "System"}</td>
        <td style="background:${bg};text-align:right;font-weight:600;color:${
          isIncome ? "#15803d" : "#b91c1c"
        }">${isIncome ? "+" : "-"} ${fmtAmount(t.amount)}</td>
      </tr>`;
    })
    .join("");

const buildTransactionPages = (period, transactions, totalPages) => {
  const txTotalPages = Math.max(
    1,
    Math.ceil(transactions.length / ROWS_PER_PAGE),
  );
  const thead = `<thead><tr>
      <th style="width:28px;text-align:center;">#</th>
      <th>Date</th>
      <th>Reference</th>
      <th>Category</th>
      <th>For</th>
      <th>Recorded By</th>
      <th style="text-align:right;">Amount (Birr)</th>
    </tr></thead>`;

  return Array.from({ length: txTotalPages }, (_, p) => {
    const slice = transactions.slice(
      p * ROWS_PER_PAGE,
      (p + 1) * ROWS_PER_PAGE,
    );
    const rows = buildTransactionRows(slice, p * ROWS_PER_PAGE);
    return `<div class="page pb">
      ${buildHeader(period)}
      <table>${thead}<tbody>${rows}</tbody></table>
      ${buildFooter(`Page ${p + 1} of ${totalPages}`)}
    </div>`;
  }).join("\n");
};

// ── Summary page — a single plain table, same look as the transaction
// pages (dark header row, alternating row backgrounds), ending with Net
// Profit/Loss as the bold final row. No separate tables for the closing
// note or signoff — everything is one table, one row each.
const buildSummaryRows = (period, totals) => {
  const rows = [
    ["Total Income", `+ ${fmtAmount(totals.income)} Birr`, true, "income"],
    ["Total Expenses", `- ${fmtAmount(totals.expense)} Birr`, true, "expense"],
  ];

  if (totals.commission !== null) {
    rows.push([
      "Total Commission",
      `${fmtAmount(totals.commission)} Birr`,
      true,
      "neutral",
    ]);
  }
  if (totals.vat !== null) {
    rows.push(["Total VAT", `${fmtAmount(totals.vat)} Birr`, true, "neutral"]);
  }

  rows.push(["Total Transactions", totals.transactionCount, true, "neutral"]);

  if (period.closing_note) {
    rows.push(["Closing Note", period.closing_note, false, "neutral"]);
  }

  rows.push(["Prepared by", REPORT_META.orgName, true, "neutral"]);
  rows.push(["Generated on", fmtDate(new Date()), true, "neutral"]);

  return rows
    .map(([label, value, alignRight, tone], i) => {
      const bg = i % 2 === 0 ? "#fff" : "#f5f8ff";
      const color =
        tone === "income"
          ? "#15803d"
          : tone === "expense"
            ? "#b91c1c"
            : "#1a2640";
      return `<tr>
        <td style="background:${bg};font-weight:600;">${label}</td>
        <td style="background:${bg};${alignRight ? "text-align:right;" : ""}font-weight:600;color:${color};">${value}</td>
      </tr>`;
    })
    .join("");
};

const buildSummaryPage = (
  period,
  transactions,
  totalPages,
  summaryOnly = false,
) => {
  const totals = computeTotals(period, transactions);
  const isProfit = Number(totals.netProfit) >= 0;

  return `<div class="page">
    ${buildHeader(period, summaryOnly)}

    <table>
      <thead><tr><th>Summary</th><th style="text-align:right;">Amount (Birr)</th></tr></thead>
      <tbody>${buildSummaryRows(period, totals)}</tbody>
      <tfoot>
        <tr class="totals-row">
          <td>Net ${isProfit ? "Profit" : "Loss"}</td>
          <td style="text-align:right;">${isProfit ? "+" : "-"} ${fmtAmount(
            Math.abs(totals.netProfit),
          )} Birr</td>
        </tr>
      </tfoot>
    </table>

    ${buildFooter(`Page ${totalPages} of ${totalPages}`)}
  </div>`;
};

const REPORT_STYLES = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  @page{size:A4 landscape;margin:11mm 13mm;}
  body{font-family:"Segoe UI",Tahoma,sans-serif;font-size:8.5pt;color:#1a2640;background:#fff;print-color-adjust:exact;-webkit-print-color-adjust:exact;}
  /* 210mm A4 height minus 11mm top + 11mm bottom @page margin = 188mm printable height.
     Explicit min-height is required so the absolutely-positioned footer (.pf) anchors
     to the true bottom of each physical page instead of collapsing under short content. */
  .page{padding:0;position:relative;padding-bottom:26px;min-height:188mm;}
  .pb{page-break-after:always;}
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
  tfoot .totals-row td{padding:7px;font-weight:800;font-size:9pt;color:#1a3c6e;background:#eaf1fc;border-top:2px solid #1a3c6e;}
  .bp{display:inline-block;padding:2px 8px;border-radius:20px;font-size:7pt;font-weight:600;white-space:nowrap;}
  .pf{position:absolute;bottom:0;left:0;right:0;padding-top:5px;border-top:1.5px solid #c8d8f0;display:flex;justify-content:space-between;font-size:7pt;color:#8a97b0;background:#fff;}
`;

// Renders the report HTML into a hidden, off-screen iframe and triggers
// the browser's native print dialog against it — no new tab/window is
// opened, so nothing extra ever becomes visible in the background. The
// iframe is removed automatically once printing finishes (or after a
// timeout fallback, since some browsers don't reliably fire "afterprint").
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
    // Guard against browsers firing "load" for the initial blank frame
    // before srcdoc content has actually been parsed in.
    const win = iframe.contentWindow;
    if (!win) return;

    win.focus();
    win.addEventListener("afterprint", cleanup);

    // Give the frame a beat to finish layout before printing.
    setTimeout(() => {
      try {
        win.print();
      } catch (e) {
        cleanup();
      }
    }, 150);

    // Fallback cleanup in case "afterprint" doesn't fire in this browser.
    setTimeout(cleanup, 4000);
  };

  iframe.srcdoc = html;
  document.body.appendChild(iframe);
};

// Full report: every transaction (paginated) followed by the summary page.
// Pass summaryOnly: true to print just the summary page (used by the
// on-screen period summary's Print button) with no transaction listing.
export const generatePeriodReport = ({
  period,
  transactions = [],
  summaryOnly = false,
}) => {
  if (!period) return;

  if (summaryOnly) {
    const summaryHtml = buildSummaryPage(period, transactions, 1, true);
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>${period.title} Summary</title>
<style>${REPORT_STYLES}</style>
</head><body>${summaryHtml}</body></html>`;
    openAndPrint(html);
    return;
  }

  const txTotalPages = Math.max(
    1,
    Math.ceil(transactions.length / ROWS_PER_PAGE),
  );
  const totalPages = txTotalPages + 1; // + summary page

  const txPagesHtml = buildTransactionPages(period, transactions, totalPages);
  const summaryHtml = buildSummaryPage(period, transactions, totalPages);

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>${period.title} Report</title>
<style>${REPORT_STYLES}</style>
</head><body>${txPagesHtml}${summaryHtml}</body></html>`;

  openAndPrint(html);
};
