// NOTE: I don't have the source of the project's existing PDF generator
// (VisaApplicationPdfGenerator.jsx / InsuranceReport.jsx), only how it's
// *used* (ActiveWorkers.jsx: generateVisaApplicationPdf(...) resolves to
// { url, blob, fileName, ... }, which download/share then consume as-is).
// This generator returns that exact same shape so InvoiceDetail can reuse
// ActiveWorkers' download/share handlers verbatim. It uses jsPDF directly
// here — if the project already wraps PDF generation differently, swap the
// body of buildInvoicePdfBlob() for that shared utility and keep the
// { url, blob, fileName } return contract the same.
import jsPDF from "jspdf";

const formatAmount = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const buildInvoicePdfBlob = (invoice) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 40;
  let y = 50;

  doc.setFontSize(18);
  doc.text(`Invoice ${invoice.invoice_number}`, marginX, y);
  y += 22;

  doc.setFontSize(10);
  doc.text(`Status: ${invoice.status?.toUpperCase()}`, marginX, y);
  y += 16;
  doc.text(`Customer: ${invoice.customer_full_name || "—"}`, marginX, y);
  y += 16;
  doc.text(
    `Invoice Date: ${invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : "—"}`,
    marginX,
    y,
  );
  y += 16;
  doc.text(
    `Due Date: ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "—"}`,
    marginX,
    y,
  );
  y += 24;

  // Items grouped by worker
  const groups = (invoice.items || []).reduce((acc, item) => {
    const key = item.user_full_name || "Unassigned";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  doc.setFontSize(12);
  Object.entries(groups).forEach(([workerName, rows]) => {
    doc.setFont(undefined, "bold");
    doc.text(workerName, marginX, y);
    doc.setFont(undefined, "normal");
    y += 16;

    rows.forEach((row) => {
      const line = `${row.description}   x${row.quantity}   @ ${formatAmount(row.unit_price)}   = ${formatAmount(row.amount)}`;
      doc.setFontSize(10);
      doc.text(line, marginX + 16, y);
      y += 14;
    });

    y += 8;
    if (y > 720) {
      doc.addPage();
      y = 50;
    }
  });

  y += 10;
  doc.setFontSize(11);
  doc.text(`Subtotal: ${formatAmount(invoice.subtotal)}`, marginX, y);
  y += 16;
  doc.text(`Discount: -${formatAmount(invoice.discount_amount)}`, marginX, y);
  y += 16;
  doc.text(`VAT: +${formatAmount(invoice.vat_amount)}`, marginX, y);
  y += 16;
  doc.setFont(undefined, "bold");
  doc.text(`Total: ${formatAmount(invoice.total_amount)}`, marginX, y);
  doc.setFont(undefined, "normal");
  y += 16;
  doc.text(`Paid: ${formatAmount(invoice.paid_amount)}`, marginX, y);
  y += 16;
  doc.text(`Balance: ${formatAmount(invoice.balance_amount)}`, marginX, y);

  if (invoice.notes) {
    y += 24;
    doc.setFontSize(10);
    doc.text(`Notes: ${invoice.notes}`, marginX, y);
  }

  return doc.output("blob");
};

// Same interface as generateVisaApplicationPdf: { url, blob, fileName }
const generateInvoicePdf = async (invoice, { autoDownload = false } = {}) => {
  const blob = buildInvoicePdfBlob(invoice);
  const fileName = `Invoice-${invoice.invoice_number}.pdf`;
  const url = URL.createObjectURL(blob);

  if (autoDownload) {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return {
    url,
    blob,
    fileName,
    invoiceNumber: invoice.invoice_number,
  };
};

export { generateInvoicePdf };
