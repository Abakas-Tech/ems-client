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
// These are the default values for fields that the embassy form requires.
const AGENCY_DEFAULTS = {
  qualification: "House Maid",
  profession: "House Maid",
  homeAddress: "RIYADH",
  purposeOfTravel: "Work",
  placeOfIssue: "Ethiopia",
  agentEmail: "mmh.fea@gmail.com",
  agentWebsite: "mmh@gmail.com",
};
// These are the fields the embassy form requires.
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
  { label: "Sponsor Name", get: (p) => p.contracts[0]?.employer_name },
];

const getMissingRequiredFields = (profile) =>
  REQUIRED_FIELDS.filter(({ get }) => {
    const value = get(profile);
    return value === undefined || value === null || value === "";
  }).map(({ label }) => label);

// Returns a snapshot of all the required fields and their values (or "MISSING" if not present).
const getRequiredFieldsSnapshot = (profile) =>
  REQUIRED_FIELDS.reduce((acc, { label, get }) => {
    const value = get(profile);
    const isMissing = value === undefined || value === null || value === "";
    acc[label] = isMissing ? "MISSING" : value;
    return acc;
  }, {});

const mapWorkerToVisaForm = (profile, photoDataUri) => {
  const pi = profile.personal_information || {};
  const passport = profile.passport || {};
  const visa = profile.visa || {};
  const today = new Date();

  return {
    visaNo: visa.visa_number,
    agentRef: visa.reference_number,
    sponsorName: profile.contracts[0]?.employer_name,
    fullName: (profile.full_name || "N/A").toUpperCase(),
    dateOfBirth: formatDate(pi.date_of_birth),
    placeOfBirth: pi.place_of_birth,
    pastNationality: pi.past_nationality,
    currentNationality: pi.nationality || "Ethiopia",
    sex: titleCase(pi.sex),
    maritalStatus: titleCase(pi.marital_status),
    sect: pi.sect,
    religion: titleCase(pi.religion),

    qualification: pi.education || AGENCY_DEFAULTS.qualification,
    profession: AGENCY_DEFAULTS.profession,
    homeAddress: visa.destination_address || AGENCY_DEFAULTS.homeAddress,
    businessAddress: visa.business_address,
    purposeOfTravel: visa.purpose_of_travel || AGENCY_DEFAULTS.purposeOfTravel,

    placeOfIssue: passport.issuing_country || AGENCY_DEFAULTS.placeOfIssue,
    dateOfIssue: formatDate(passport.issue_date),
    passportNo: passport.passport_number,
    dateOfExpiry: formatDate(passport.expiry_date),

    durationOfStay: visa.duration_of_stay,
    dateOfArrival:
      formatDate(visa.date_of_arrival) === "—"
        ? "—"
        : formatDate(visa.date_of_arrival),
    dateOfDeparture:
      formatDate(visa.date_of_departure) === "—"
        ? "—"
        : formatDate(visa.date_of_departure),
    modeOfPayment: visa.mode_of_payment,
    paymentNo: visa.payment_no,
    paymentDate: formatDate(visa.payment_date),
    relationship: visa.relationship,
    dealerName: visa.dealer_name,
    destination: visa.destination,
    dependents: profile.dependents || [],
    companyInKingdom: visa.company_in_kingdom,

    photoUrl: photoDataUri,
    signDate: formatDate(today),
    generatedDateLabel: today.toDateString(),
    agentEmail: AGENCY_DEFAULTS.agentEmail,
    agentWebsite: AGENCY_DEFAULTS.agentWebsite,
    // The API doesn't yet return a phone number, so we try to get it from the personal information first, then the profile, and if neither has it, we set it to null.
    _phoneNumber: pi.phone_number || profile.phone_number || null,
  };
};

/**
 * @param {number|string} employeeId
 * @param {{ logoSrc?: string, autoDownload?: boolean }} [options]
 * @returns {Promise<void|{ blob: Blob, url: string, fileName: string, fullName: string, phoneNumber: string|null }>}
 */
export async function generateVisaApplicationPdf(employeeId, options = {}) {
  if (!employeeId) throw new Error("employeeId is required");

  const { autoDownload = true, logoSrc } = options;

  const res = await getWorkerProfile(employeeId);
  console.log(res);
  const profile = res?.data || res;
  if (!profile) throw new Error("Worker profile not found");
  // Check for missing required fields before proceeding.
  const missingFields = getMissingRequiredFields(profile);
  if (missingFields.length > 0) {
    console.warn(
      "Visa application generation blocked — required fields:",
      getRequiredFieldsSnapshot(profile),
    );
    console.warn("Missing fields:", missingFields);
    throw new Error("Required worker information is missing.");
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
    // Wait a couple of frames to ensure the template is fully rendered and styled.
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

    const imgData = canvas.toDataURL("image/jpeg", 0.72);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });
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

    const fileSafeName = mapped.fullName.replace(/\s+/g, "_");
    const fileName = `Visa_Application_${fileSafeName}.pdf`;

    if (autoDownload) {
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
      mapped,
      logoSrc,
    };
  } finally {
    root.unmount();
    document.body.removeChild(host);
  }
}
