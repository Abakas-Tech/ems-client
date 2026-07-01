import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { getWorkerProfile } from "../../../api/worker.api";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";

import musanedLogo from "../../../../../assets/img/autofill/musaned.png";
import wafidLogo from "../../../../../assets/img/autofill/wafid.svg";
import tasheerLogo from "../../../../../assets/img/autofill/tasheer.png";
import nyalaLogo from "../../../../../assets/img/autofill/niyala.png";

const EXTENSION_ID = "ldfajgipacioiafcjbnefjejbaanjbpp";
const STORAGE_ACTION = "STAGE_CANDIDATE_QUEUE";

const TARGET_SITES = [
  {
    key: "musaned",
    title: "Musaned",
    description: "Domestic labor service portal",
    logo: musanedLogo,
    color: "#1677a8",
    url: "https://tawtheeq.musaned.com.sa/",
  },
  {
    key: "wafid",
    title: "Wafid",
    description: "Medical status verification system",
    logo: wafidLogo,
    color: "#1f8f6a",
    url: "https://wafid.com/en/book-appointment/",
  },
  {
    key: "tasheer",
    title: "Tasheer",
    description: "Visa appointment scheduling",
    logo: tasheerLogo,
    color: "#8b5cf6",
    url: "https://agents.tasheer.com/AgentTasheer/auth/agentGroupScheduling",
  },
  {
    key: "insurance",
    title: "Nyala",
    description: "Nyala Insurance S.C. (NISCO)",
    logo: nyalaLogo,
    color: "#9a3412",
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

    // Support JSON returned from MySQL JSON_ARRAYAGG if it arrives as string.
    if (
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      (trimmed.startsWith("{") && trimmed.endsWith("}"))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [parsed];
      } catch {
        // fall back to splitting below
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

  if (parts.length === 0) {
    return { firstName: "", middleName: "", lastName: "" };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], middleName: "", lastName: "" };
  }

  if (parts.length === 2) {
    return { firstName: parts[0], middleName: "", lastName: parts[1] };
  }

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
    "wereda",
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

  return {
    id: pick(worker, ["id", "worker_id"]),
    workerId: pick(worker, ["id", "worker_id"]),
    fullName:
      fullName ||
      joinNames(resolvedFirstName, resolvedMiddleName, resolvedLastName),

    firstName: resolvedFirstName,
    middleName: resolvedMiddleName,
    lastName: resolvedLastName,

    // Musaned disabled/OCR fields
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
    eNumber: pick(worker, ["eNumber", "e_number", "enumber"]),

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
    destinationCountry: pick(worker, [
      "destinationCountry",
      "destination_country",
      "countryOfDestination",
      "visa.destination_country",
    ]),
    visaType: pick(worker, ["visaType", "visa_type"]),
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

    branch: pick(worker, ["branch", "branchName", "branch_name"]),
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

function WorkerAutoFillComponent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();

  const workerIds = useMemo(
    () => location.state?.workerIds || [],
    [location.state],
  );

  const [workers, setWorkers] = useState([]);
  const [queue, setQueue] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);

  const goBack = () => navigate(-1);

  const loadWorkers = useCallback(async () => {
    if (!workerIds.length) return;

    showLoader();

    try {
      const responses = await Promise.all(
        workerIds.map((id) => getWorkerProfile(id)),
      );

      const profiles = responses.map(unwrapProfile).filter(Boolean);
      const normalizedQueue = profiles.map(mapWorkerToAutofillCandidate);

      setWorkers(profiles);
      setQueue(normalizedQueue);

      console.log("[Autofill] raw profiles", profiles);
      console.log("[Autofill] normalized queue", normalizedQueue);
    } catch (err) {
      console.error("Failed to load selected employees for autofill:", err);
      addMessage(
        false,
        err?.message || "Failed to load selected employees for autofill",
      );
    } finally {
      hideLoader();
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

    if (invalidCount > 0) {
      const ok = window.confirm(
        `${invalidCount} employee(s) are missing required ${site.title} fields. Do you want to send the queue anyway?`,
      );
      if (!ok) return false;
    }

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

  const handleSiteClick = async (site) => {
    setSelectedSite(site.key);
    const ok = await sendQueueToExtension(site);
    setSelectedSite(null);

    if (ok) {
      window.open(site.url, "_blank", "noopener,noreferrer");
    }
  };

  const getSiteValidationSummary = (siteKey) => {
    const validation = validateQueue(queue, siteKey);
    const invalidRows = validation.filter((item) => item.missing.length > 0);
    const missingTotal = invalidRows.reduce(
      (sum, item) => sum + item.missing.length,
      0,
    );

    return {
      invalidCount: invalidRows.length,
      missingTotal,
      firstInvalid: invalidRows[0],
    };
  };

  return (
    <div className="dashboard-wraper">
      <style>{`
        .autofill-site-card {
          min-height: 170px;
          background: #ffffff;
          border: 1px solid #eef0f4;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.055);
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background-color 0.18s ease;
        }

        .autofill-site-card:hover {
          transform: translateY(-4px) scale(1.015);
          box-shadow: 0 14px 32px rgba(15, 23, 42, 0.12);
          border-color: rgba(22, 119, 168, 0.25);
          background: #fbfdff;
        }

        .autofill-site-card:active {
          transform: translateY(-1px) scale(0.995);
        }

        .autofill-logo-box {
          height: 62px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
        }

        .autofill-logo-img {
          max-height: 58px;
          max-width: 118px;
          object-fit: contain;
        }
      `}</style>

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <BackButton onClick={goBack} />
          <h2 className="fw-bold text-dark mb-2">Employee Autofill</h2>
          <p className="text-muted mb-0">
            Choose the target system for the selected employees. EMS will
            prepare the queue and send it to the Chrome extension.
          </p>
        </div>

        <div className="mt-3 mt-md-5 text-white w-45 d-flex align-items-center justify-content-center">
          <div className="badge rounded-pill bg-light text-dark border px-3 py-2">
            {queue.length} {queue.length === 1 ? "employee" : "employees"}{" "}
            selected
          </div>
        </div>
      </div>

      {!workerIds.length && (
        <div className="alert alert-warning rounded-4 border-0 shadow-sm">
          No employees were selected. Please go back to Active Employees and
          select employees first.
        </div>
      )}

      <div className="row justify-content-center g-3 g-lg-4">
        {TARGET_SITES.map((site) => {
          const isLoading = selectedSite === site.key;

          return (
            <div
              key={site.key}
              className="col-xl-3 col-lg-3 col-md-6 col-sm-12"
            >
              <button
                type="button"
                className="w-100 border-0 bg-transparent p-0 text-center"
                onClick={() => handleSiteClick(site)}
                disabled={!queue.length || isLoading}
                style={{
                  cursor:
                    !queue.length || isLoading ? "not-allowed" : "pointer",
                  opacity: !queue.length ? 0.68 : 1,
                }}
              >
                <div className="autofill-site-card card rounded-4 text-center h-100 overflow-hidden">
                  <div className="card-body px-3 py-4 d-flex flex-column align-items-center justify-content-center">
                    <div className="autofill-logo-box">
                      <img
                        src={site.logo}
                        alt={`${site.title} logo`}
                        className="autofill-logo-img"
                      />
                    </div>

                    <h5 className="fw-bold text-dark mb-1">{site.title}</h5>
                    <p className="text-muted small mb-0 px-2">
                      {site.description}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Keep this for now until all employee profile data is properly mapped. */}
      {queue.length > 0 && (
        <div className="card border-0 rounded-4 shadow-sm mt-4">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3">Validation Summary</h5>
            <div className="row g-3">
              {TARGET_SITES.map((site) => {
                const summary = getSiteValidationSummary(site.key);

                return (
                  <div key={site.key} className="col-lg-3 col-md-6">
                    <div className="border rounded-4 p-3 h-100">
                      <div className="fw-bold mb-1">{site.title}</div>
                      {summary.invalidCount === 0 ? (
                        <div className="small text-success">
                          All selected employees have the required fields.
                        </div>
                      ) : (
                        <div className="small text-muted">
                          <span className="text-warning fw-bold">
                            {summary.invalidCount}
                          </span>{" "}
                          employee(s) missing{" "}
                          <span className="text-warning fw-bold">
                            {summary.missingTotal}
                          </span>{" "}
                          field(s).
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkerAutoFillComponent;
