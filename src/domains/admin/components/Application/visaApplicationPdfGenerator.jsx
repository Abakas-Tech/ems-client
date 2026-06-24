// npm install html2canvas jspdf jsbarcode
// (jsbarcode is used inside VisaApplicationTemplate.jsx)

import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import VisaApplicationTemplate from "./VisaApplicationTemplate";

// NOTE: adjust this path to wherever VisaApplication/ ends up relative to
// your api folder — it matches the same depth used in ActiveWorkers.jsx.
import { getWorkerProfile } from "../../api/worker.api";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
  value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : null;

// Pre-fetch an image and inline it as a base64 data URI so html2canvas never
// has to deal with cross-origin / not-yet-loaded images. Falls back to null
// (the template then shows its own placeholder) if the fetch fails.
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
    console.warn("Could not inline image for PDF, using placeholder:", err);
    return null;
  }
};

// ---------------------------------------------------------------------------
// Default values for fields the current API doesn't return yet.
// These mirror the agency's standard template (MMH Foreign Employment
// Agent / easyenjaz.net) rather than any specific worker's real data.
// ---------------------------------------------------------------------------
const AGENCY_DEFAULTS = {
  qualification: "House Maid",
  profession: "House Maid",
  homeAddress: "RIYADH",
  purposeOfTravel: "Work",
  placeOfIssue: "Ethiopia",
  agentEmail: "mmh.fea@gmail.com",
  agentWebsite: "www.easyenjaz.net | easyenjaz.sa@gmail.com",
};

const mapWorkerToVisaForm = (profile, photoDataUri) => {
  const pi = profile.personal_information || {};
  const passport = profile.passport || {};
  const visa = profile.visa || {};
  const today = new Date();

  return {
    visaNo: visa.visa_number || "—",
    agentRef: passport.passport_number ? `E${passport.passport_number}` : `W-${profile.id}`,
    sponsorName: visa.sponsor_name || "—",

    fullName: (profile.full_name || "N/A").toUpperCase(),
    dateOfBirth: formatDate(pi.date_of_birth),
    placeOfBirth: pi.place_of_birth || "—",
    pastNationality: pi.past_nationality || "—",
    currentNationality: pi.nationality || "Ethiopia",
    sex: titleCase(pi.sex) || "—",
    maritalStatus: titleCase(pi.marital_status) || "—",
    sect: pi.sect || "—",
    religion: titleCase(pi.religion) || "—",

    qualification: pi.education || AGENCY_DEFAULTS.qualification,
    profession: AGENCY_DEFAULTS.profession,
    homeAddress: visa.destination_address || AGENCY_DEFAULTS.homeAddress,
    businessAddress: visa.business_address || "—",
    purposeOfTravel: visa.purpose_of_travel || AGENCY_DEFAULTS.purposeOfTravel,

    placeOfIssue: passport.issuing_country || AGENCY_DEFAULTS.placeOfIssue,
    dateOfIssue: formatDate(passport.issue_date),
    passportNo: passport.passport_number || "—",
    dateOfExpiry: formatDate(passport.expiry_date),

    durationOfStay: visa.duration_of_stay || "—",
    dateOfArrival: formatDate(visa.date_of_arrival) === "—" ? "—" : formatDate(visa.date_of_arrival),
    dateOfDeparture: formatDate(visa.date_of_departure) === "—" ? "—" : formatDate(visa.date_of_departure),
    modeOfPayment: visa.mode_of_payment || "—",
    paymentNo: visa.payment_no || "—",
    paymentDate: formatDate(visa.payment_date),
    relationship: visa.relationship || "—",
    dealerName: visa.dealer_name || "—",
    destination: visa.destination || "—",
    dependents: profile.dependents || [],
    companyInKingdom: visa.company_in_kingdom || "—",

    photoUrl: photoDataUri,
    signDate: formatDate(today),
    generatedDateLabel: today.toDateString(),
    agentEmail: AGENCY_DEFAULTS.agentEmail,
    agentWebsite: AGENCY_DEFAULTS.agentWebsite,
  };
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetches the worker's profile, renders the visa application template
 * off-screen, captures it, and triggers an instant PDF download.
 *
 * @param {number|string} employeeId
 * @param {{ logoSrc?: string }} [options] - pass your real agency logo asset.
 */
export async function generateVisaApplicationPdf(employeeId, options = {}) {
  if (!employeeId) throw new Error("employeeId is required");

  const res = await getWorkerProfile(employeeId);
  const profile = res?.data || res;
  if (!profile) throw new Error("Worker profile not found");

  const pi = profile.personal_information || {};
  const photoUrl = pi.photo_3x4?.url || pi.photo_standing?.url || null;
  const photoDataUri = await toDataUri(photoUrl);
  const mapped = mapWorkerToVisaForm(profile, photoDataUri);

  // Render the template off-screen so html2canvas has a real DOM node to read.
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.top = "-10000px";
  host.style.left = "-10000px";
  document.body.appendChild(host);

  const root = createRoot(host);
  let templateNode = null;

  await new Promise((resolve) => {
    root.render(
      <VisaApplicationTemplate
        ref={(node) => {
          templateNode = node;
        }}
        data={mapped}
        logoSrc={options.logoSrc}
      />,
    );
    // Give the browser a couple of frames to lay out, paint fonts/images,
    // and let the barcode <svg> elements render before we capture.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setTimeout(resolve, 150)),
    );
  });

  try {
    const canvas = await html2canvas(templateNode, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = (canvas.height * pageWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);

    const fileSafeName = mapped.fullName.replace(/\s+/g, "_");
    pdf.save(`Visa_Application_${fileSafeName}.pdf`);
  } finally {
    root.unmount();
    document.body.removeChild(host);
  }
}
