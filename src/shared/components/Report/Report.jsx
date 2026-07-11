import { REPORT_META } from "./Data.jsx";
import * as XLSX from "xlsx-js-style";

// Badge colour palette
const PALETTE = [
  { bg: "#dbeafe", color: "#1d4ed8" },
  { bg: "#dcfce7", color: "#15803d" },
  { bg: "#fef9c3", color: "#854d0e" },
  { bg: "#fee2e2", color: "#b91c1c" },
  { bg: "#cffafe", color: "#0e7490" },
  { bg: "#f3e8ff", color: "#7e22ce" },
  { bg: "#ffe4e6", color: "#9f1239" },
  { bg: "#e2e8f0", color: "#475569" },
];

const badgeStyle = (name) => {
  if (!name) return null;
  const hash = name
    .toLowerCase()
    .split("")
    .reduce((a, c) => a + c.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
};

const fmtDate = (val) =>
  val
    ? new Date(val).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

const cellToHtml = (col, row) => {
  if (col.printRender) return col.printRender(row);
  const raw = row[col.accessor];
  if (raw === null || raw === undefined || raw === "")
    return `<span class="dash">—</span>`;
  if (col.accessor.endsWith("_date"))
    return fmtDate(raw) || `<span class="dash">—</span>`;
  if (col.isBadge || col.accessor.endsWith("_status_name")) {
    const s = badgeStyle(String(raw));
    return s
      ? `<span class="bp" style="background:${s.bg};color:${s.color}">${raw}</span>`
      : `<span class="dash">—</span>`;
  }
  return String(raw);
};

// Build full paginated print HTML
const buildPrintHtml = ({ reportType, columns, data }) => {
  const {
    orgName,
    orgSub,
    logoPath,
    logoInitials,
    logoColor,
    confidentiality,
    rowsPerPage,
  } = REPORT_META;

  const now = new Date();
  const printedAt = now.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));

  const logoHtml = logoPath
    ? `<img src="${logoPath}" alt="${orgName}" style="height:48px;max-width:130px;object-fit:contain;" />`
    : `<div style="width:48px;height:48px;background:${logoColor};border-radius:9px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;font-weight:800;flex-shrink:0;">${logoInitials}</div>`;

  const pageHeader = () => `
    <div class="ph">
      <div class="logo-block">${logoHtml}
        <div>
          <div class="org-name">${orgName}</div>
          <div class="org-sub">${orgSub}</div>
        </div>
      </div>
      <div class="title-block">
        <div class="report-title">${reportType} Candidates Report</div>
        <div class="report-sub">All ${reportType} Candidates</div>
      </div>
      <div class="meta-r">
        <div><b>Date Printed:</b> ${printedAt}</div>
        <div><b>Total Records:</b> ${data.length}</div>
      </div>
    </div>`;

  const thead = `<thead><tr>
    <th style="width:28px;text-align:center;">#</th>
    ${columns.map((c) => `<th>${c.header}</th>`).join("")}
  </tr></thead>`;

  const pages = Array.from({ length: totalPages }, (_, p) => {
    const slice = data.slice(p * rowsPerPage, (p + 1) * rowsPerPage);
    const startIdx = p * rowsPerPage;
    const rows = slice
      .map((row, i) => {
        const bg = i % 2 === 0 ? "#fff" : "#f5f8ff";
        const tds = columns
          .map(
            (col) =>
              `<td style="background:${bg}">${cellToHtml(col, row)}</td>`,
          )
          .join("");
        return `<tr>
        <td style="background:${bg};color:#9aa4b8;font-weight:600;text-align:center;">${startIdx + i + 1}</td>
        ${tds}
      </tr>`;
      })
      .join("");

    return `<div class="page${p < totalPages - 1 ? " pb" : ""}">
      ${pageHeader(p + 1)}
      <table>${thead}<tbody>${rows}</tbody></table>
    <div class="pf">
  <span>${orgName} — ${confidentiality}</span>
  <span>Powered by Abakas Technologies</span>
  <span>Page ${p + 1} of ${totalPages}</span>
</div>
    </div>`;
  });

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>${reportType} Report</title>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  @page{size:A4 landscape;margin:11mm 13mm;}
  body{font-family:"Segoe UI",Tahoma,sans-serif;font-size:8.5pt;color:#1a1a2e;background:#fff;print-color-adjust:exact;-webkit-print-color-adjust:exact;}
  .page{padding:0;}
  .pb{page-break-after:always;}
  /* header */
  .ph{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #1a3c6e;padding-bottom:8px;margin-bottom:8px;}
  .logo-block{display:flex;align-items:center;gap:9px;min-width:190px;}
  .org-name{font-size:12.5pt;font-weight:700;color:#1a3c6e;line-height:1.15;}
  .org-sub{font-size:7.5pt;color:#5a6a85;margin-top:2px;}
  .title-block{text-align:center;}
  .report-title{font-size:12pt;font-weight:700;color:#1a3c6e;text-transform:uppercase;letter-spacing:1px;}
  .report-sub{font-size:7.5pt;color:#5a6a85;margin-top:3px;}
  .meta-r{text-align:right;font-size:7.5pt;color:#5a6a85;line-height:1.9;min-width:190px;}
  .meta-r b{color:#1a3c6e;}
  /* table */
  table{width:100%;border-collapse:collapse;font-size:7.8pt;margin-bottom:8px;}
  thead tr{background:#1a3c6e;color:#fff;}
  thead th{padding:6px 7px;text-align:left;font-weight:600;font-size:7.5pt;letter-spacing:.3px;white-space:nowrap;border-right:1px solid #2e5ca8;}
  thead th:last-child{border-right:none;}
  tbody tr{border-bottom:1px solid #dde5f5;}
  tbody td{padding:5px 7px;vertical-align:middle;border-right:1px solid #e8edf8;}
  tbody td:last-child{border-right:none;}
  .bp{display:inline-block;padding:2px 8px;border-radius:20px;font-size:7pt;font-weight:600;white-space:nowrap;}
  .dash{color:#aab4c8;}
  /* footer */
  .pf{border-top:1.5px solid #c8d8f0;padding-top:5px;display:flex;justify-content:space-between;font-size:7pt;color:#8a97b0;}
</style>
</head><body>${pages.join("\n")}</body></html>`;
};

const buildExcelData = ({ columns, data }) => {
  const headers = ["S/N", ...columns.map((c) => c.header)];

  const rows = data.map((row, index) => {
    const rowData = columns.map((col) => {
      const raw = row[col.accessor];

      if (raw === null || raw === undefined || raw === "") return "—";
      if (col.accessor.endsWith("_date")) return fmtDate(raw) || "—";

      return String(raw);
    });

    return [index + 1, ...rowData];
  });

  return [headers, ...rows];
};

// Report
const Report = ({
  reportType = "Candidates",
  columns = [],
  data = [],
  // onBeforeGenerate: optional async fn — must RETURN the data array directly.
  // Used when the parent needs to fetch fresh/full data before printing.
  onBeforeGenerate = null,
}) => {
  const handlePrint = async () => {
    let printData = data;

    if (onBeforeGenerate) {
      // onBeforeGenerate must return the full data array
      const fetched = await onBeforeGenerate();
      if (Array.isArray(fetched) && fetched.length) {
        printData = fetched;
      }
    }

    if (!printData.length) return;

    const html = buildPrintHtml({ reportType, columns, data: printData });
    const win = window.open("", "_blank", "width=1280,height=900");
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  };

  const handleExcel = async () => {
    let printData = data;

    if (onBeforeGenerate) {
      const fetched = await onBeforeGenerate();
      if (Array.isArray(fetched) && fetched.length) printData = fetched;
    }

    if (!printData.length) return;

    const excelData = buildExcelData({ columns, data: printData });

    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Auto-fit column widths
    const colWidths = excelData[0].map((_, colIndex) => {
      const maxLength = excelData.reduce((max, row) => {
        const cellValue = row[colIndex] ? String(row[colIndex]) : "";
        return Math.max(max, cellValue.length);
      }, 0);
      return { wch: Math.max(maxLength + 4, 12) };
    });

    ws["!cols"] = colWidths;

    const range = XLSX.utils.decode_range(ws["!ref"]);

    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });

      if (!ws[cellAddress]) continue;

      ws[cellAddress].s = {
        fill: {
          fgColor: { rgb: "FFD700" },
        },
        font: {
          bold: true,
          color: { rgb: "000000" },
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
      };
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, reportType);

    XLSX.writeFile(wb, `${reportType}_Report.xlsx`);
  };

  return (
    <div className="d-flex gap-2">
      <button type="button" className="btn btn-main px-4" onClick={handlePrint}>
        Print Report
      </button>
      <button
        type="button"
        className="btn btn-outline-success px-4"
        onClick={handleExcel}
      >
        Export Excel
      </button>
    </div>
  );
};

export default Report;
