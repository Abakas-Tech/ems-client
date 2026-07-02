import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import VisaApplicationTemplate from "./VisaApplicationTemplate";
import { getWorkerProfile } from "../../api/worker.api";

//helpers
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
// Default values for fields the current API doesn't return yet.
// These mirror the agency's standard template (MMH Foreign Employment
// Agent / easyenjaz.net) rather than any specific worker's real data.
const AGENCY_DEFAULTS = {
  qualification: "House Maid",
  profession: "House Maid",
  homeAddress: "RIYADH",
  purposeOfTravel: "Work",
  placeOfIssue: "Ethiopia",
  agentEmail: "mmh.fea@gmail.com",
  agentWebsite: "www.easyenjaz.net | easyenjaz.sa@gmail.com",
};

// Fields that MUST come back from the API before a visa application is
// generated. These are the details that appear on the actual embassy form
// and can't safely be replaced by a "—" placeholder — if any are missing,
// the resulting PDF would be incomplete/unsubmittable, so we refuse to
// generate it.
const REQUIRED_FIELDS = [
  { label: "Full Name", get: (p) => p.full_name },
  { label: "Date of Birth", get: (p) => p.personal_information?.date_of_birth },
  {
    label: "Place of Birth",
    get: (p) => p.personal_information?.place_of_birth,
  },
  { label: "Nationality", get: (p) => p.personal_information?.nationality },
  { label: "Sex", get: (p) => p.personal_information?.sex },
  {
    label: "Marital Status",
    get: (p) => p.personal_information?.marital_status,
  },
  { label: "Passport Number", get: (p) => p.passport?.passport_number },
  { label: "Passport Issue Date", get: (p) => p.passport?.issue_date },
  { label: "Passport Expiry Date", get: (p) => p.passport?.expiry_date },
  {
    label: "Passport Issuing Country",
    get: (p) => p.passport?.issuing_country,
  },
  { label: "Visa Number", get: (p) => p.visa?.visa_number },
  { label: "Sponsor Name", get: (p) => p.visa?.sponsor_name },
];

const getMissingRequiredFields = (profile) =>
  REQUIRED_FIELDS.filter(({ get }) => {
    const value = get(profile);
    return value === undefined || value === null || value === "";
  }).map(({ label }) => label);

const mapWorkerToVisaForm = (profile, photoDataUri) => {
  const pi = profile.personal_information || {};
  const passport = profile.passport || {};
  const visa = profile.visa || {};
  const today = new Date();

  return {
    visaNo: visa.visa_number  ,
    agentRef: passport.passport_number
      ? `E${passport.passport_number}`
      : `W-${profile.id}`,
    sponsorName: visa.sponsor_name  ,

    fullName: (profile.full_name || "N/A").toUpperCase(),
    dateOfBirth: formatDate(pi.date_of_birth),
    placeOfBirth: pi.place_of_birth  ,
    pastNationality: pi.past_nationality  ,
    currentNationality: pi.nationality || "Ethiopia",
    sex: titleCase(pi.sex)  ,
    maritalStatus: titleCase(pi.marital_status)  ,
    sect: pi.sect  ,
    religion: titleCase(pi.religion)  ,

    qualification: pi.education || AGENCY_DEFAULTS.qualification,
    profession: AGENCY_DEFAULTS.profession,
    homeAddress: visa.destination_address || AGENCY_DEFAULTS.homeAddress,
    businessAddress: visa.business_address  ,
    purposeOfTravel: visa.purpose_of_travel || AGENCY_DEFAULTS.purposeOfTravel,

    placeOfIssue: passport.issuing_country || AGENCY_DEFAULTS.placeOfIssue,
    dateOfIssue: formatDate(passport.issue_date),
    passportNo: passport.passport_number  ,
    dateOfExpiry: formatDate(passport.expiry_date),

    durationOfStay: visa.duration_of_stay  ,
    dateOfArrival:
      formatDate(visa.date_of_arrival) === "—"
        ? "—"
        : formatDate(visa.date_of_arrival),
    dateOfDeparture:
      formatDate(visa.date_of_departure) === "—"
        ? "—"
        : formatDate(visa.date_of_departure),
    modeOfPayment: visa.mode_of_payment  ,
    paymentNo: visa.payment_no  ,
    paymentDate: formatDate(visa.payment_date),
    relationship: visa.relationship  ,
    dealerName: visa.dealer_name  ,
    destination: visa.destination  ,
    dependents: profile.dependents || [],
    companyInKingdom: visa.company_in_kingdom  ,

    photoUrl: photoDataUri,
    signDate: formatDate(today),
    generatedDateLabel: today.toDateString(),
    agentEmail: AGENCY_DEFAULTS.agentEmail,
    agentWebsite: AGENCY_DEFAULTS.agentWebsite,

    // phone number used for the WhatsApp share flow, kept off the visible
    // form itself — not rendered by VisaApplicationTemplate.
    _phoneNumber: pi.phone_number || profile.phone_number || null,
  };
};

/**
 * Fetches the worker's profile, renders the visa application template
 * off-screen, captures it, and produces a PDF.
 *
 * If the API doesn't yet have all the information the embassy form
 * requires (see REQUIRED_FIELDS), no PDF is generated — this throws a
 * simple, general Error instead of producing an incomplete document. The
 * specific missing fields are logged to the console for debugging, but
 * kept out of the user-facing message.
 *
 * By default this preserves the original behavior: it triggers an instant
 * browser download via pdf.save(...) and returns nothing.
 *
 * Pass `{ autoDownload: false }` to instead get the generated file back
 * (as a Blob + object URL + filename) without triggering a download, so the
 * caller can show its own "Download or Share" UI afterwards.
 *
 * @param {number|string} employeeId
 * @param {{ logoSrc?: string, autoDownload?: boolean }} [options]
 * @returns {Promise<void|{ blob: Blob, url: string, fileName: string, fullName: string, phoneNumber: string|null }>}
 */
export async function generateVisaApplicationPdf(employeeId, options = {}) {
  if (!employeeId) throw new Error("employeeId is required");

  const { autoDownload = true, logoSrc } = options;

  const res = await getWorkerProfile(employeeId);
  const profile = res?.data || res;
  if (!profile) throw new Error("Worker profile not found");

  // Refuse to generate an incomplete visa application — bail out early
  // instead of producing a half-filled PDF. Keep the specific missing
  // fields in the console for debugging, but throw a simple, general
  // message for the user-facing side.
  const missingFields = getMissingRequiredFields(profile);
  if (missingFields.length > 0) {
    console.warn(
      "Visa application generation blocked — missing fields:",
      missingFields,
    );
    throw new Error(
      "Required worker information is missing.",
    );
  }

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
        logoSrc={logoSrc}
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
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = (canvas.height * pageWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);

    const fileSafeName = mapped.fullName.replace(/\s+/g, "_");
    const fileName = `Visa_Application_${fileSafeName}.pdf`;

    if (autoDownload) {
      // Original behavior — unchanged for any existing caller that doesn't
      // pass autoDownload: false.
      pdf.save(fileName);
      return;
    }

    const blob = pdf.output("blob");
    const url = URL.createObjectURL(blob);

    return {
      blob,
      url,
      fileName,
      fullName: mapped.fullName,
      phoneNumber: mapped._phoneNumber || null,
    };
  } finally {
    root.unmount();
    document.body.removeChild(host);
  }
}
