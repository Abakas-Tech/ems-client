import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import ComplaintReportTemplate from "./ComplaintReportTemplate";
import { getComplaintById } from "../../../api/complaint.api";

const formatDate = (value) => {
  if (!value) return "—";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "—";
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const titleCase = (value) =>
  value
    ? value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ")
    : "—";

const mapComplaintToReport = (complaint) => ({
  id: complaint.id,
  employeeFullName: complaint.employee_full_name,
  workerLinked: Boolean(complaint.worker_id),
  departureDate: formatDate(complaint.departure_date),
  destinationCountry: complaint.destination_country_name || "—",
  status: titleCase(complaint.status),

  incidentDescription: complaint.incident_description,
  informationSource: complaint.information_source || "—",
  informationReliability: titleCase(complaint.information_reliability),

  complainants: complaint.complainants || [],

  employerFullName: complaint.employer_full_name || "—",
  employerPhoneNumber: complaint.employer_phone_number || "—",
  employerFullAddress: complaint.employer_full_address || "—",

  resolutionAttempts: (complaint.resolution_attempts || []).map((a) => ({
    method: titleCase(a.method),
    platform: a.social_platform ? titleCase(a.social_platform) : null,
    notes: a.notes || "—",
    attemptedAt: formatDate(a.attempted_at),
  })),
  complaintOutcome: complaint.complaint_outcome || "Not yet resolved",

  receivedDate: formatDate(complaint.received_date),
  receivedBy: complaint.received_by_full_name || "—",
  generatedDateLabel: new Date().toDateString(),
});

/**
 * Fetches one complaint, renders the report template off-screen, and
 * rasterizes it to a canvas. Shared by both the single and bulk generators
 * so there's only one place that knows how to render a complaint.
 */
async function renderComplaintCanvas(complaintId) {
  const res = await getComplaintById(complaintId);
  const complaint = res?.data || res;
  if (!complaint) throw new Error(`Complaint ${complaintId} not found`);

  const mapped = mapComplaintToReport(complaint);

  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.top = "-10000px";
  host.style.left = "-10000px";
  document.body.appendChild(host);

  const root = createRoot(host);
  let templateNode = null;

  await new Promise((resolve) => {
    root.render(
      <ComplaintReportTemplate
        ref={(node) => {
          templateNode = node;
        }}
        data={mapped}
      />,
    );
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setTimeout(resolve, 150)),
    );
  });

  try {
    const canvas = await html2canvas(templateNode, {
      scale: 1.5,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    return { canvas, mapped };
  } finally {
    root.unmount();
    document.body.removeChild(host);
  }
}

/**
 * @param {number|string} complaintId
 * @param {{ autoDownload?: boolean }} [options]
 */
export async function generateComplaintReportPdf(complaintId, options = {}) {
  if (!complaintId) throw new Error("complaintId is required");
  const { autoDownload = true } = options;

  const { canvas, mapped } = await renderComplaintCanvas(complaintId);

  const imgData = canvas.toDataURL("image/jpeg", 0.85);
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = (canvas.height * pageWidth) / canvas.width;
  pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight, undefined, "FAST");

  const fileSafeName = mapped.employeeFullName.replace(/\s+/g, "_");
  const fileName = `Complaint_Report_${fileSafeName}_${mapped.id}.pdf`;

  if (autoDownload) {
    pdf.save(fileName);
    return;
  }

  const blob = pdf.output("blob");
  const url = URL.createObjectURL(blob);
  return { blob, url, fileName, mapped };
}

/**
 * Generates a single combined PDF containing one page per complaint.
 * Renders sequentially (rather than in parallel) to keep only one hidden
 * DOM node/canvas in memory at a time — safer for large selections.
 *
 * @param {(number|string)[]} complaintIds
 * @param {{ autoDownload?: boolean }} [options]
 */
export async function generateComplaintReportsPdf(complaintIds, options = {}) {
  if (!complaintIds || complaintIds.length === 0) {
    throw new Error("At least one complaintId is required");
  }
  const { autoDownload = true } = options;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const failed = [];

  for (let i = 0; i < complaintIds.length; i++) {
    try {
      const { canvas } = await renderComplaintCanvas(complaintIds[i]);
      const imgData = canvas.toDataURL("image/jpeg", 0.85);

      if (i > 0) pdf.addPage();

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = (canvas.height * pageWidth) / canvas.width;
      pdf.addImage(
        imgData,
        "JPEG",
        0,
        0,
        pageWidth,
        pageHeight,
        undefined,
        "FAST",
      );
    } catch (err) {
      failed.push(complaintIds[i]);
      console.error(`Failed to render complaint ${complaintIds[i]}:`, err);
    }
  }

  const dateLabel = new Date().toISOString().slice(0, 10);
  const fileName = `Complaint_Reports_${complaintIds.length}_${dateLabel}.pdf`;

  if (autoDownload) {
    pdf.save(fileName);
  }

  if (failed.length > 0) {
    throw new Error(
      `Generated report(s) but failed for ${failed.length} complaint(s): ${failed.join(", ")}`,
    );
  }

  if (!autoDownload) {
    const blob = pdf.output("blob");
    const url = URL.createObjectURL(blob);
    return { blob, url, fileName };
  }
}
