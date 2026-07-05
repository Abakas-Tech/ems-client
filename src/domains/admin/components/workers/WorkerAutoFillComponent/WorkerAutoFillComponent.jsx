import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx-js-style";

import { getWorkerProfile } from "../../../api/worker.api";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import styles from "../../UserManual/UserManual.module.css";

import musanedLogo from "../../../../../assets/img/autofill/musaned.png";
import wafidLogo from "../../../../../assets/img/autofill/wafid.svg";
import tasheerLogo from "../../../../../assets/img/autofill/tasheer.png";
import nyalaLogo from "../../../../../assets/img/autofill/niyala.png";

const EXTENSION_ID = "lddpgbebdnmlibiickgjkmlppokhnbdp";
// const EXTENSION_ID = "ldfajgipacioiafcjbnefjejbaanjbpp";
const STORAGE_ACTION = "STAGE_CANDIDATE_QUEUE";

const TARGET_SITES = [
  {
    key: "musaned",
    title: "Musaned",
    description: "Domestic labor service portal",
    logo: musanedLogo,
    url: "https://tawtheeq.musaned.com.sa/",
  },
  {
    key: "wafid",
    title: "Wafid",
    description: "Medical status verification system",
    logo: wafidLogo,
    url: "https://wafid.com/en/book-appointment/",
  },
  {
    key: "tasheer",
    title: "Tasheer",
    description: "Visa appointment scheduling",
    logo: tasheerLogo,
    url: "https://agents.tasheer.com/AgentTasheer/auth/agentGroupScheduling",
  },
  {
    key: "insurance",
    title: "Nyala",
    description: "Nyala Insurance S.C. (NISCO)",
    logo: nyalaLogo,
    url: "https://agency.niscofetap.com/certificate/draft",
  },
];

function unwrapProfile(response) {
  return response?.data?.data || response?.data || response?.worker || response;
}

function isFilled(value) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function pick(obj, keys, fallback = "") {
  for (const key of keys) {
    const value = key.split(".").reduce((acc, part) => acc?.[part], obj);
    if (isFilled(value)) return value;
  }
  return fallback;
}

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === undefined || value === null || value === "") return [];

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      (trimmed.startsWith("{") && trimmed.endsWith("}"))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [parsed];
      } catch {
        // Fall back to splitting below.
      }
    }

    return trimmed
      .split(/[|,;]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [value];
}

function namesFromArray(items) {
  return asArray(items)
    .map((item) => {
      if (typeof item === "string") return item;
      return (
        item?.name || item?.job_position || item?.position || item?.value || ""
      );
    })
    .map((name) => String(name).trim())
    .filter(Boolean);
}

function joinNames(...parts) {
  return parts
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(" ");
}

function splitFullName(fullName) {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0)
    return { firstName: "", middleName: "", lastName: "" };
  if (parts.length === 1)
    return { firstName: parts[0], middleName: "", lastName: "" };
  if (parts.length === 2)
    return { firstName: parts[0], middleName: "", lastName: parts[1] };

  return {
    firstName: parts[0],
    middleName: parts[1],
    lastName: parts.slice(2).join(" "),
  };
}

function normalizeDate(value) {
  if (!value) return "";

  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);

  return raw;
}

function normalizeGender(value) {
  const v = String(value || "")
    .trim()
    .toLowerCase();
  if (!v) return "";
  if (v.startsWith("m")) return "Male";
  if (v.startsWith("f")) return "Female";
  return value;
}

function normalizeMaritalStatus(value) {
  const v = String(value || "")
    .trim()
    .toLowerCase();
  if (!v) return "";
  if (v.includes("married")) return "Married";
  if (v.includes("single")) return "Single";
  if (v.includes("divorced")) return "Divorced";
  if (v.includes("widowed")) return "Widowed";
  return value;
}

function normalizeExperience(value, worker = {}) {
  if (typeof value === "boolean")
    return value ? "Have experience" : "No experience";

  const direct = String(value || "")
    .trim()
    .toLowerCase();
  if (direct) {
    if (["0", "false", "no", "none", "no experience"].includes(direct)) {
      return "No experience";
    }
    return "Have experience";
  }

  const experiences = asArray(
    worker.experiences || worker.experience || worker.worker_experiences,
  );
  if (experiences.length > 0) return "Have experience";

  const positions = asArray(worker.positions || worker.worker_positions);
  const hasYearsOnPosition = positions.some(
    (position) => Number(position?.years_of_experience || 0) > 0,
  );

  if (hasYearsOnPosition) return "Have experience";
  return "No experience";
}

function normalizeMusanedLanguage(worker) {
  const languageValue = pick(worker, ["language", "languages"]);
  const languageNames = namesFromArray(languageValue);

  const hasEnglish = languageNames.some((name) =>
    name.toLowerCase().includes("english"),
  );
  const hasArabic = languageNames.some((name) =>
    name.toLowerCase().includes("arabic"),
  );

  if (hasEnglish && hasArabic) return "English And Arabic";
  if (hasEnglish) return "English";
  if (hasArabic) return "Arabic";
  if (languageNames.length > 0) return languageNames[0];

  return "";
}

function getPrimaryPositionName(worker) {
  const positions = asArray(
    worker.positions || worker.worker_positions || worker.position,
  );

  const primary = positions.find((position) => {
    return (
      position?.is_primary === 1 ||
      position?.is_primary === true ||
      String(position?.is_primary || "").toLowerCase() === "true"
    );
  });

  const selected = primary || positions[0];

  if (typeof selected === "string") return selected;

  return (
    selected?.name ||
    selected?.position_name ||
    selected?.job_position ||
    selected?.job_position_name ||
    selected?.value ||
    ""
  );
}

function getLatestTravelRecord(worker) {
  const records = asArray(worker.travel_records || worker.travelRecords);
  if (!records.length) return null;

  return [...records].sort((a, b) => {
    const aDate = new Date(a.departure_date || a.departureDate || 0).getTime();
    const bDate = new Date(b.departure_date || b.departureDate || 0).getTime();
    return bDate - aDate;
  })[0];
}

function normalizeDestinationCountry(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const normalized = raw.toLowerCase();
  const map = {
    saudi: "Saudi Arabia",
    ksa: "Saudi Arabia",
    "saudi arabia": "Saudi Arabia",
    uae: "UAE",
    "united arab emirates": "UAE",
    qatar: "Qatar",
    kuwait: "Kuwait",
    oman: "Oman",
    bahrain: "Bahrain",
    jordan: "Jordan",
    lebanon: "Lebanon",
  };

  return map[normalized] || raw;
}

function mapWorkerToAutofillCandidate(worker) {
  const fullName = pick(worker, ["full_name", "fullName"]);
  const splitNames = splitFullName(fullName);

  const resolvedFirstName =
    pick(worker, ["firstName", "first_name", "given_name"]) ||
    splitNames.firstName;

  const resolvedMiddleName =
    pick(worker, ["middleName", "middle_name", "fatherName", "father_name"]) ||
    splitNames.middleName;

  const resolvedLastName =
    pick(worker, [
      "lastName",
      "last_name",
      "grandFatherName",
      "grand_father_name",
      "surname",
      "family_name",
    ]) || splitNames.lastName;

  const dob = normalizeDate(
    pick(worker, [
      "personal_information.date_of_birth",
      "dob",
      "dateOfBirth",
      "date_of_birth",
      "birthDate",
      "birth_date",
    ]),
  );

  const passport = pick(worker, [
    "passport.passport_number",
    "passportNumber",
    "passport_number",
    "passport",
    "passportNo",
    "passport_no",
  ]);

  const phone = pick(worker, [
    "phone_number",
    "phone",
    "mobile",
    "mobileNumber",
    "mobile_number",
    "smsPhoneNumber",
  ]);

  const email = pick(worker, ["email", "email_address", "eMailId"]);

  const nationalId = pick(worker, [
    "personal_information.national_id_number",
    "nationalId",
    "national_id",
    "idNumber",
    "id_number",
    "lmis.labour_id",
    "lmis.lmis_labour_id",
    "laborId",
    "labor_id",
  ]);

  const passportIssueDate = normalizeDate(
    pick(worker, [
      "passport.issue_date",
      "passport.passport_issue_date",
      "passportIssueDate",
      "passport_issue_date",
      "passportDateOfIssue",
      "passport_date_of_issue",
    ]),
  );

  const passportExpiryDate = normalizeDate(
    pick(worker, [
      "passport.expiry_date",
      "passport.passport_expiry_date",
      "passportExpiryDate",
      "passport_expiry_date",
      "passportExpiryDateGregorian",
      "passport_expiry_on",
    ]),
  );

  const passportIssuePlace = pick(worker, [
    "passport.issuing_country",
    "passport.passport_issuing_country",
    "passportIssuePlace",
    "passport_issue_place",
    "passportPlaceOfIssue",
    "passport_place_of_issue",
  ]);

  const job =
    getPrimaryPositionName(worker) ||
    pick(worker, [
      "job",
      "career",
      "positionApplied",
      "position_applied",
      "applied_position",
      "occupation",
    ]);

  const skills = namesFromArray(
    pick(worker, ["skills", "skill", "workerSkills"]),
  );
  const qualifications = asArray(
    pick(worker, [
      "qualifications",
      "personal_information.education",
      "educationLevel",
      "education_level",
      "education",
      "qualification",
    ]),
  );

  const language = normalizeMusanedLanguage(worker);
  const experience = normalizeExperience(
    pick(worker, [
      "hasExperience",
      "has_experience",
      "experience",
      "workExperience",
    ]),
    worker,
  );

  const regionName = pick(worker, [
    "personal_information.region.name",
    "region.name",
    "region_name",
    "state",
    "region",
  ]);

  const cityName = pick(worker, [
    "personal_information.city.name",
    "city.name",
    "city_name",
    "city",
  ]);

  const woredaName = pick(worker, [
    "personal_information.wereda.name",
    "personal_information.woreda.name",
    "wereda.name",
    "woreda.name",
    "wereda_name",
    "woreda",
  ]);

  const subCityName = pick(worker, [
    "personal_information.subcity.name",
    "personal_information.subCity.name",
    "subcity.name",
    "subCity.name",
    "subcity_name",
    "subCity",
    "sub_city",
  ]);

  const latestTravelRecord = getLatestTravelRecord(worker);
  const destinationCountry = normalizeDestinationCountry(
    pick(worker, [
      "destinationCountry",
      "destination_country",
      "countryOfDestination",
      "visa.destination_country",
      "contract.destination_country",
      "contracts.0.destination_country",
      "travel_records.0.arrival_location",
      "travelRecords.0.arrivalLocation",
    ]) ||
      latestTravelRecord?.arrival_location ||
      latestTravelRecord?.arrivalLocation ||
      "",
  );

  return {
    id: pick(worker, ["id", "worker_id"]),
    workerId: pick(worker, ["id", "worker_id"]),
    fullName:
      fullName ||
      joinNames(resolvedFirstName, resolvedMiddleName, resolvedLastName),

    firstName: resolvedFirstName,
    middleName: resolvedMiddleName,
    lastName: resolvedLastName,

    surname: resolvedLastName,
    givenNames: joinNames(resolvedFirstName, resolvedMiddleName),

    dob,
    dateOfBirth: dob,
    dateOfBirthGregorian: dob,
    birthDate: dob,

    passport,
    passportNumber: passport,

    passportIssuePlace,
    passportPlaceOfIssue: passportIssuePlace,
    passportIssueDate,
    passportDateOfIssue: passportIssueDate,
    passportExpiryDate,
    passportExpiryDateGregorian: passportExpiryDate,

    nationalId,
    idNumber: nationalId,
    laborId: pick(
      worker,
      ["lmis.labour_id", "lmis.lmis_labour_id", "laborId", "labor_id"],
      nationalId,
    ),
    eNumber: pick(worker, [
      "visa.reference_number",
      "visa.referenceNumber",
      "eNumber",
      "e_number",
      "enumber",
    ]),

    phone,
    mobileNumber: phone,
    smsPhoneNumber: phone,
    email,
    eMailId: email,

    gender: normalizeGender(
      pick(worker, ["personal_information.sex", "gender", "sex"]),
    ),
    title: pick(worker, ["title"]),
    maritalStatus: normalizeMaritalStatus(
      pick(worker, [
        "personal_information.marital_status",
        "maritalStatus",
        "marital_status",
      ]),
    ),
    religion: pick(worker, ["personal_information.religion", "religion"]),

    country: pick(worker, ["country"], "Ethiopia"),
    nationality: pick(
      worker,
      ["personal_information.nationality", "nationality"],
      "Ethiopian",
    ),
    destinationCountry,
    visaType: "wv",
    state: regionName,
    city: cityName,
    address: pick(worker, [
      "personal_information.address",
      "address",
      "current_address",
    ]),
    woreda: woredaName,
    subCity: subCityName,

    job,
    career: job,
    positionApplied: job,
    appliedPosition: job,
    applied_position: job,

    educationLevel:
      qualifications[0] ||
      pick(worker, ["personal_information.education", "education"]),
    qualifications,
    skills,
    language,
    languages: language,
    experience,
    hasExperience: experience,

    amountOfChildren: pick(worker, [
      "personal_information.number_of_children",
      "amountOfChildren",
      "numberOfChildren",
      "children",
      "children_count",
      "childrenCount",
    ]),

    relativeContactName: pick(worker, [
      "emergency.guarantor_name",
      "relativeContactName",
      "relative_name",
      "relativeName",
      "emergencyContactName",
    ]),
    relativeContactKinship: pick(worker, [
      "emergency.relation",
      "relativeContactKinship",
      "relative_kinship",
      "relativeKinship",
      "kinship",
    ]),
    relativeContactPhone: pick(worker, [
      "emergency.guarantor_phone_number",
      "relativeContactPhone",
      "relative_phone",
      "relativePhone",
      "emergencyContactPhone",
    ]),
    relativeContactAddress: pick(worker, [
      "emergency.guarantor_address",
      "relativeContactAddress",
      "relative_address",
      "relativeAddress",
      "emergencyContactAddress",
    ]),

    branch: "4b234e19-cd02-4873-a892-a362b01cc24a",
    effectiveDate: pick(worker, ["effectiveDate", "effective_date"]),
    confirmCheck: pick(worker, ["confirmCheck", "confirm_check"], true),
  };
}

const REQUIRED_FIELDS = {
  musaned: [
    ["surname", "lastName"],
    ["givenNames", "firstName"],
    ["dateOfBirthGregorian", "dateOfBirth", "dob"],
    ["idNumber", "nationalId", "laborId"],
    ["maritalStatus"],
    ["religion"],
    ["career", "job", "positionApplied"],
    ["language", "languages"],
    ["mobileNumber", "phone"],
    ["email"],
    ["amountOfChildren"],
    ["hasExperience", "experience"],
    ["city"],
    ["address"],
    ["relativeContactName"],
    ["relativeContactKinship"],
    ["relativeContactPhone"],
    ["relativeContactAddress"],
  ],
  wafid: [
    ["firstName"],
    ["lastName"],
    ["passport", "passportNumber"],
    ["dob", "dateOfBirth"],
    ["passportIssuePlace", "passportPlaceOfIssue"],
    ["passportIssueDate", "passportDateOfIssue"],
    ["passportExpiryDate"],
    ["email"],
    ["phone", "mobileNumber"],
    ["nationality"],
    ["destinationCountry"],
    ["gender"],
    ["maritalStatus"],
    ["positionApplied", "job", "career"],
  ],
  tasheer: [
    ["firstName"],
    ["middleName"],
    ["lastName"],
    ["passportNumber", "passport"],
    ["dateOfBirth", "dob"],
    ["nationality"],
    ["passportDateOfIssue", "passportIssueDate"],
    ["gender"],
    ["passportPlaceOfIssue", "passportIssuePlace"],
    ["passportExpiryDate"],
    ["phone", "smsPhoneNumber"],
    ["email", "eMailId"],
  ],
  insurance: [
    ["firstName"],
    ["middleName"],
    ["lastName"],
    ["passportNumber", "passport"],
    ["laborId"],
    ["phone"],
    ["email"],
    ["woreda"],
    ["subCity"],
    ["dob", "birthDate"],
    ["gender"],
    ["state"],
    ["destinationCountry"],
  ],
};

function hasAny(candidate, keys) {
  return keys.some((key) => isFilled(candidate?.[key]));
}

function validateCandidate(candidate, siteKey) {
  const required = REQUIRED_FIELDS[siteKey] || [];
  return required
    .filter((keyGroup) => !hasAny(candidate, keyGroup))
    .map((keyGroup) => keyGroup[0]);
}

function validateQueue(queue, siteKey) {
  return queue.map((candidate) => ({
    candidate,
    missing: validateCandidate(candidate, siteKey),
  }));
}
function getSavedExtensionQueue() {
  return new Promise((resolve) => {
    if (!window.chrome?.runtime?.sendMessage) {
      resolve([]);
      return;
    }

    window.chrome.runtime.sendMessage(
      EXTENSION_ID,
      {
        action: "GET_AUTOFILL_QUEUE",
      },
      (response) => {
        const runtimeError = window.chrome.runtime.lastError;

        if (runtimeError) {
          console.warn(
            "Could not read saved autofill queue:",
            runtimeError.message,
          );
          resolve([]);
          return;
        }

        resolve(response?.queue || []);
      },
    );
  });
}

/* ── Tasheer-only Excel export ──
   Exports the currently staged queue (already normalized via
   mapWorkerToAutofillCandidate) to an .xlsx file that downloads
   immediately, using the same xlsx-js-style header-styling approach
   as the shared Report component. */
const TASHEER_EXCEL_COLUMNS = [
  { header: "First Name", key: "firstName" },
  { header: "Middle Name", key: "middleName" },
  { header: "Last Name", key: "lastName" },
  { header: "Passport No.", key: "passportNumber" },
  { header: "E No.", key: "eNumber" },
  { header: "Date of Birth", key: "dateOfBirth" },
  { header: "Nationality", key: "nationality" },
  { header: "Passport Issue Date", key: "passportDateOfIssue" },
  { header: "Passport Expiry Date", key: "passportExpiryDate" },
  { header: "Gender", key: "gender" },
  { header: "Place of Issue", key: "passportPlaceOfIssue" },
  { header: "Phone", key: "phone" },
  { header: "Email", key: "email" },
];

function exportTasheerExcel(queue) {
  if (!queue?.length) return;

  const headers = TASHEER_EXCEL_COLUMNS.map((c) => c.header);
  const rows = queue.map((candidate) =>
    TASHEER_EXCEL_COLUMNS.map((c) => candidate?.[c.key] || "—"),
  );

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Auto-fit column widths
  ws["!cols"] = headers.map((_, colIndex) => {
    const maxLength = [headers, ...rows].reduce((max, row) => {
      const val = row[colIndex] ? String(row[colIndex]) : "";
      return Math.max(max, val.length);
    }, 0);
    return { wch: Math.max(maxLength + 4, 12) };
  });

  // Style header row
  const range = XLSX.utils.decode_range(ws["!ref"]);
  for (let C = range.s.c; C <= range.e.c; C++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[cellAddress]) continue;
    ws[cellAddress].s = {
      fill: { fgColor: { rgb: "FFD700" } },
      font: { bold: true, color: { rgb: "000000" } },
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Tasheer");

  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Tasheer_Candidates_${stamp}.xlsx`);
}

function WorkerAutoFillComponent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();

  const workerIds = useMemo(
    () => location.state?.workerIds || [],
    [location.state],
  );

  const openedFromSelection = workerIds.length > 0;

  const [workers, setWorkers] = useState([]);
  const [queue, setQueue] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [isQueueLoading, setIsQueueLoading] = useState(true);

  const goBack = () => navigate(-1);

  const loadWorkers = useCallback(async () => {
    setIsQueueLoading(true);
    showLoader();

    try {
      if (workerIds.length) {
        const responses = await Promise.all(
          workerIds.map((id) => getWorkerProfile(id)),
        );

        const profiles = responses.map(unwrapProfile).filter(Boolean);
        const normalizedQueue = profiles.map(mapWorkerToAutofillCandidate);

        setWorkers(profiles);
        setQueue(normalizedQueue);
        return;
      }

      // Sidebar flow: no selected worker IDs, so read previous saved queue.
      const savedQueue = await getSavedExtensionQueue();

      setWorkers([]);
      setQueue(savedQueue || []);
    } catch (err) {
      console.error("Failed to load autofill queue:", err);
      addMessage(false, err?.message || "Failed to load autofill queue");
    } finally {
      hideLoader();
      setIsQueueLoading(false);
    }
  }, [workerIds, showLoader, hideLoader, addMessage]);

  useEffect(() => {
    loadWorkers();
  }, []);

  const sendQueueToExtension = async (site) => {
    if (!queue.length) {
      addMessage(
        false,
        "No selected employees found. Please go back and select employees first.",
      );
      return false;
    }

    if (!window.chrome?.runtime?.sendMessage) {
      addMessage(
        false,
        "Chrome extension messaging is not available. Please use Chrome and make sure the extension is installed.",
      );
      return false;
    }

    if (!EXTENSION_ID || EXTENSION_ID === "PUT_EXTENSION_ID_HERE") {
      addMessage(false, "Please configure the Chrome extension ID.");
      return false;
    }

    const validation = validateQueue(queue, site.key);
    const invalidCount = validation.filter(
      (item) => item.missing.length,
    ).length;

    return new Promise((resolve) => {
      window.chrome.runtime.sendMessage(
        EXTENSION_ID,
        {
          action: STORAGE_ACTION,
          site: site.key,
          data: queue,
          meta: {
            source: "EMS",
            selectedWorkerIds: workerIds,
            openedFromSelection,
            createdAt: new Date().toISOString(),
          },
        },
        (response) => {
          const runtimeError = window.chrome.runtime.lastError;

          if (runtimeError) {
            addMessage(
              false,
              runtimeError.message || "Failed to send queue to extension",
            );
            resolve(false);
            return;
          }

          addMessage(
            true,
            response?.status ||
              `${queue.length} employees staged for ${site.title}`,
          );
          resolve(true);
        },
      );
    });
  };

  const handleResetQueue = () => {
    if (!window.chrome?.runtime?.sendMessage) {
      setWorkers([]);
      setQueue([]);
      return;
    }

    window.chrome.runtime.sendMessage(
      EXTENSION_ID,
      {
        action: "CLEAR_QUEUE",
      },
      (response) => {
        if (window.chrome.runtime.lastError) {
          console.error(window.chrome.runtime.lastError.message);
          return;
        }

        setWorkers([]);
        setQueue([]);

        addMessage(true, "Queue has been reset.");
      },
    );
  };

  const handleSiteClick = async (site) => {
    setSelectedSite(site.key);
    const ok = await sendQueueToExtension(site);
    setSelectedSite(null);

    if (ok) {
      window.open(site.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="dashboard-wraper">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          {openedFromSelection && <BackButton onClick={goBack} />}
          <h2 className="fw-bold text-dark mb-2">Employee Autofill</h2>
          <p className="text-muted mb-0">
            Choose the target system for the selected employees. EMS will
            prepare the queue and send it to the Chrome extension.
          </p>
        </div>

        <div className="mt-3 mt-md-5">
          <div className="d-flex align-items-center gap-2">
            <span className="badge rounded-pill bg-light text-dark border px-3 py-2">
              {queue.length} {queue.length === 1 ? "employee" : "employees"}{" "}
              selected
            </span>
            <button
              type="button"
              className="btn btn-outline-success btn-sm rounded-pill px-3 py-2 fw-bold text-nowrap"
              onClick={() => exportTasheerExcel(queue)}
              disabled={!queue.length}
            >
              Export Tasheer
            </button>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm rounded-pill px-3 py-2 fw-bold text-nowrap"
              onClick={handleResetQueue}
              disabled={!queue.length}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {!isQueueLoading && !queue.length && (
        <div className="alert alert-warning rounded-4 border-0 shadow-sm">
          {openedFromSelection
            ? "No selected employees found. Please go back to Active Employees and select employees first."
            : "No saved autofill queue found. Select employees from Active Employees first, or stage a queue from EMS."}
        </div>
      )}
      <div className="container">
        <div className="row justify-content-start g-lg-3 g-4">
          {TARGET_SITES.map((site) => {
            const isLoading = selectedSite === site.key;
            const disabled = !queue.length || isLoading;

            return (
              <div
                key={site.key}
                className="col-xl-3 col-lg-4 col-md-6 col-sm-12"
              >
                <button
                  type="button"
                  className="text-decoration-none text-dark border-0 bg-transparent p-0 w-100 h-100"
                  onClick={() => handleSiteClick(site)}
                  disabled={disabled}
                >
                  <div
                    className={`agents-grid card rounded-4 border p-4 text-center h-100 shadow-sm-hover ${styles["manual-card"]} ${
                      disabled ? "opacity-50" : ""
                    }`}
                  >
                    <div className="d-flex flex-column align-items-center justify-content-between h-100">
                      <div
                        className="d-flex align-items-center justify-content-center mb-3"
                        style={{
                          width: "130px",
                          height: "70px",
                        }}
                      >
                        <img
                          src={site.logo}
                          alt={`${site.title} logo`}
                          className="img-fluid object-fit-contain"
                          style={{
                            maxWidth: "120px",
                            maxHeight: "58px",
                          }}
                        />
                      </div>

                      <div className="w-100">
                        <h5 className="fr-can-name lh-base mb-2">
                          {site.title}
                        </h5>
                        <p
                          className="text-muted small mb-0 mx-auto"
                          style={{
                            minHeight: "38px",
                            maxWidth: "190px",
                          }}
                        >
                          {site.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default WorkerAutoFillComponent;
