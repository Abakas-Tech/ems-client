import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  createWorker,
  updateWorker,
  getWorkerProfile,
} from "../../../api/worker.api";
import { getWorkerStatuses } from "../../../api/meta.api";
import {
  getWorkerCurrentStatus,
  assignWorkerStatus,
  deleteWorkerStatus,
} from "../../../api/workerMeta.api";
import { getUsers } from "../../../api/user.api";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete";
import useProfile from "../../../../../context/Profile/useProfile";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import ActionButtons from "../../../../../shared/components/ActionButtons/ActionButtons";
import Badge from "../../../../../shared/components/Badge/Badge";
import RoleButton from "../../../../../shared/components/RoleButton/RoleButton";
import CreateModal from "../../../../../shared/components/CreateModal/CreateModal";

// helper function
const renderLabel = (text, required = false) => {
  return (
    <label>
      {text} {required && <span className="text-danger">*</span>}
    </label>
  );
};

// section definitions, in the order they appear on the page / in the nav
const SECTIONS = [
  { key: "basic", label: "Basic & Personal Information", optional: false },
  { key: "status", label: "Status", optional: false },
  { key: "passport", label: "Passport", optional: true },
  { key: "coc", label: "COC", optional: true },
  { key: "medical", label: "Medical", optional: true },
  { key: "guarantor", label: "Emergency Contact", optional: true },
  { key: "visa", label: "Visa", optional: true },
  { key: "travel", label: "Travel", optional: true },
  { key: "contract", label: "Contract", optional: true },
];

const defaultBasic = () => ({
  full_name: "",
  phone_number: "",
  is_active: true,
});

const defaultPersonal = () => ({
  region: "",
  wereda: "",
  city: "",
  subcity: "",
  status_id: "",
  sex: "",
  date_of_birth: "",
  place_of_birth: "",
  religion: "",
  marital_status: "",
  nationality: "Ethiopian",
  address: "",
  education: "",
  number_of_children: 0,
  height_cm: "",
  weight_kg: "",
  national_id_number: "",
});

const defaultPassport = () => ({
  passport_number: "",
  passport_issue_date: "",
  passport_expiry_date: "",
  passport_issuing_country: "Ethiopia",
});

const defaultCoc = () => ({
  coc_number: "",
  coc_assessment_center: "",
  coc_assessment_date: "",
  coc_issue_date: "",
  coc_expiry_date: "",
});

const defaultMedical = () => ({
  medical_status: "",
  medical_center: "",
  medical_report_number: "",
  medical_issue_date: "",
  medical_expiry_date: "",
});

const defaultGuarantor = () => ({
  guarantor_name: "",
  relation: "",
  guarantor_address: "",
  guarantor_phone_number: "",
});

const defaultVisa = () => ({
  visa_number: "",
  visa_issue_date: "",
  visa_expiry_date: "",
  visa_reference_number: "",
  visa_reference_date: "",
  issuance_id: "",
  sponsor_id: "",
});

const defaultTravel = () => ({
  ticket_number: "",
  departure_date: "",
  arrival_date: "",
  departure_location: "",
  arrival_location: "",
});

const defaultContract = () => ({
  employer: "",
  partner_id: "",
  contract_start_date: "",
  contract_end_date: "",
  monthly_salary: "",
  status: "pending",
});

const isOnlyAlphabetsAndSpaces = (value) => {
  if (!value || value.trim() === "") return true;
  return /^[A-Za-z\s]+$/.test(value.trim());
};

const educationRegex = /^[A-Za-z\s.]+$/;
const guarantorPhoneRegex = /^(?:\+251[79]\d{8}|09\d{8})$/;
const workerPhoneRegex = /^(?:\+251[79]\d{8}|09\d{8}|07\d{8})$/;
const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg"];

const fallback = (value) => (value === "" || value == null ? "—" : value);

// Utility to get a consistent color for a status badge based on its name
// (mirrors WorkerProfile's getConsistentColor so badges look identical
// wherever a worker's status is shown across the app)
const getConsistentColor = (name) => {
  const availableColors = [
    "green",
    "blue",
    "yellow",
    "red",
    "gray",
    "dark",
    "cyan",
  ];
  if (!name) return "gray";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % availableColors.length;
  return availableColors[index];
};

function WorkerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = Boolean(id);

  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();
  const { profile } = useProfile();

  const [loadingProfile, setLoadingProfile] = useState(isEditMode);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(
    location.state?.openSection ||
      (location.state?.openInPreview ? "preview" : "basic"),
  );

  // Form Mode vs Preview Mode.
  const [previewMode, setPreviewMode] = useState(
    Boolean(location.state?.openInPreview),
  );
  const [pendingScroll, setPendingScroll] = useState(null);

  const [statuses, setStatuses] = useState([]);
  const [partners, setPartners] = useState([]);

  // Statuses currently assigned to this worker, sourced the same way
  // WorkerProfile does (getWorkerCurrentStatus), used for the Status module
  // in edit mode.
  const [workerStatuses, setWorkerStatuses] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const canDeleteStatus = [1, 2].includes(profile?.role_id);

  const [basic, setBasic] = useState(defaultBasic());
  const [personal, setPersonal] = useState(defaultPersonal());
  const [passport, setPassport] = useState(defaultPassport());
  const [coc, setCoc] = useState(defaultCoc());
  const [medical, setMedical] = useState(defaultMedical());
  const [guarantor, setGuarantor] = useState(defaultGuarantor());
  const [visa, setVisa] = useState(defaultVisa());
  const [travel, setTravel] = useState(defaultTravel());
  const [contract, setContract] = useState(defaultContract());

  // Optional modules default to Include = ON, so their data is part of the
  // request payload unless the user explicitly switches a module off.
  const [sectionsEnabled, setSectionsEnabled] = useState({
    passport: true,
    coc: true,
    medical: true,
    guarantor: true,
    visa: true,
    travel: true,
    contract: true,
  });

  const [photo3x4, setPhoto3x4] = useState(null);
  const [photoStanding, setPhotoStanding] = useState(null);
  const [passportScan, setPassportScan] = useState(null);

  const [existingPhoto3x4Url, setExistingPhoto3x4Url] = useState(null);
  const [existingPhotoStandingUrl, setExistingPhotoStandingUrl] =
    useState(null);
  const [existingPassportScanUrl, setExistingPassportScanUrl] = useState(null);

  // refs for scroll-to-section navigation. Only one of Form Mode / Preview
  // Mode is mounted at a time, so the same key ("basic", "status", ...) can
  // safely point at either the form card or the preview module.
  const sectionRefs = useRef({});
  const setSectionRef = (key) => (el) => {
    sectionRefs.current[key] = el;
  };

  // measures the reserved nav column so the fixed tree nav can align with it
  // horizontally without breaking out of the page's existing grid/padding
  const treeNavSpacerRef = useRef(null);
  const [treeNavRect, setTreeNavRect] = useState({ left: 0, width: 0 });

useEffect(() => {
  if (previewMode || loadingProfile) return;

  const updateTreeNavRect = () => {
    if (!treeNavSpacerRef.current) return;

    const rect = treeNavSpacerRef.current.getBoundingClientRect();

    setTreeNavRect({
      left: rect.left,
      width: rect.width,
    });
  };

  // Wait until the edit tree has actually mounted.
  requestAnimationFrame(() => {
    requestAnimationFrame(updateTreeNavRect);
  });

  window.addEventListener("resize", updateTreeNavRect);

  return () => {
    window.removeEventListener("resize", updateTreeNavRect);
  };
}, [previewMode, loadingProfile]);
  const goBack = () => navigate(-1);

  // Navigates between form sections and Preview Mode.
  const scrollToSection = (key) => {
    setActiveSection(key);

    if (key === "preview") {
      setPreviewMode(true);
      return;
    }

    const node = sectionRefs.current[key];
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Used by Preview module Edit/Add buttons to return to the Create/Edit page.
const jumpToStep = (key) => {
  setPreviewMode(false);
  setActiveSection(key);
  setPendingScroll(key);
};
useEffect(() => {
  if (!previewMode && pendingScroll) {
    const key = pendingScroll;

    setPendingScroll(null);
    setActiveSection(key);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const node = sectionRefs.current[key];

        if (node) {
          node.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });
  }
}, [previewMode, pendingScroll]);
  // Keeps the tree in sync with whatever section is actually on screen.
  // Only tracked in Form Mode, where every module in SECTIONS has its own
  // scroll anchor — Preview Mode is a single continuous page and is
  // navigated only via the tree/edit icons, not scroll-tracked.
  useEffect(() => {
    if (previewMode || loadingProfile) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length === 0) return;

        const topEntry = visible[0];
        const matchedKey = Object.keys(sectionRefs.current).find(
          (key) => sectionRefs.current[key] === topEntry.target,
        );
        if (matchedKey) setActiveSection(matchedKey);
      },
      {
        root: null,
        rootMargin: "-110px 0px -55% 0px",
        threshold: [0, 1],
      },
    );

    SECTIONS.forEach((section) => {
      const node = sectionRefs.current[section.key];
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [previewMode, loadingProfile]);

  // load worker statuses for the status dropdown / assign modal
  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const res = await getWorkerStatuses();
        setStatuses(res.data || []);
      } catch (err) {
        addMessage(false, err.message || "Failed to load statuses");
      }
    };
    loadStatuses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // load partners for the contract dropdown
  useEffect(() => {
    const loadPartners = async () => {
      try {
        const res = await getUsers({ role_id: 3 });
        setPartners(res?.data || []);
      } catch (err) {
        addMessage(false, err.message || "Failed to load partners");
      }
    };
    loadPartners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // load the worker's currently assigned statuses (edit mode only — a
  // worker must exist before statuses can be assigned/revoked), the same
  // source WorkerProfile uses.
  useEffect(() => {
    if (!isEditMode || !id) return;
    const loadWorkerStatuses = async () => {
      try {
        const res = await getWorkerCurrentStatus(id);
        setWorkerStatuses(res.data || []);
      } catch (err) {
        console.error("Failed to fetch worker statuses:", err);
      }
    };
    loadWorkerStatuses();
  }, [id, isEditMode]);

  // load the full worker profile automatically when editing
  useEffect(() => {
    if (!isEditMode) return;
    const loadProfile = async () => {
      setLoadingProfile(true);
      showLoader();
      try {
        const res = await getWorkerProfile(id);
        applyProfileToForm(res.data);
      } catch (err) {
        addMessage(false, err.message || "Failed to load worker profile");
      } finally {
        setLoadingProfile(false);
        hideLoader();
      }
    };
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // map the aggregated getWorkerProfile response onto the form state
  const applyProfileToForm = (profileData) => {
    setBasic({
      full_name: profileData.full_name || "",
      phone_number: profileData.phone_number || "",
      is_active: !!profileData.is_active,
    });

    const pi = profileData.personal_information || {};
    setPersonal({
      region: pi.region || "",
      wereda: pi.wereda || "",
      city: pi.city || "",
      subcity: pi.subcity || "",
      status_id: profileData.status?.id ? Number(profileData.status.id) : "",
      sex: pi.sex
        ? pi.sex.charAt(0).toUpperCase() + pi.sex.slice(1).toLowerCase()
        : "",
      date_of_birth: pi.date_of_birth || "",
      place_of_birth: pi.place_of_birth || "",
      religion: pi.religion || "",
      marital_status: pi.marital_status || "",
      nationality: pi.nationality || "Ethiopian",
      address: pi.address || "",
      education: pi.education || "",
      number_of_children: pi.number_of_children ?? 0,
      height_cm: pi.height_cm || "",
      weight_kg: pi.weight_kg || "",
      national_id_number: pi.national_id_number || "",
    });
    setExistingPhoto3x4Url(pi.photo_3x4?.url || null);
    setExistingPhotoStandingUrl(pi.photo_standing?.url || null);

    if (profileData.passport) {
      setPassport({
        passport_number: profileData.passport.passport_number || "",
        passport_issue_date: profileData.passport.issue_date || "",
        passport_expiry_date: profileData.passport.expiry_date || "",
        passport_issuing_country:
          profileData.passport.issuing_country || "Ethiopia",
      });
      setExistingPassportScanUrl(profileData.passport.scan?.url || null);
    }

    if (profileData.coc) {
      setCoc({
        coc_number: profileData.coc.coc_number || "",
        coc_assessment_center: profileData.coc.assessment_center || "",
        coc_assessment_date: profileData.coc.assessment_date || "",
        coc_issue_date: profileData.coc.issue_date || "",
        coc_expiry_date: profileData.coc.expiry_date || "",
      });
    }

    if (profileData.medical) {
      setMedical({
        medical_status: profileData.medical.medical_status || "",
        medical_center: profileData.medical.medical_center || "",
        medical_report_number: profileData.medical.medical_report_number || "",
        medical_issue_date: profileData.medical.issue_date || "",
        medical_expiry_date: profileData.medical.expiry_date || "",
      });
    }

    if (profileData.emergency) {
      setGuarantor({
        guarantor_name: profileData.emergency.guarantor_name || "",
        relation: profileData.emergency.relation || "",
        guarantor_address: profileData.emergency.guarantor_address || "",
        guarantor_phone_number:
          profileData.emergency.guarantor_phone_number || "",
      });
    }

    if (profileData.visa) {
      setVisa({
        visa_number: profileData.visa.visa_number || "",
        visa_issue_date: profileData.visa.issue_date || "",
        visa_expiry_date: profileData.visa.expiry_date || "",
        visa_reference_number: profileData.visa.reference_number || "",
        visa_reference_date: profileData.visa.reference_date || "",
        issuance_id: profileData.visa.issuance_id || "",
        sponsor_id: profileData.visa.sponsor_id || "",
      });
    }

    const travelRecord = profileData.travel_records?.[0];
    if (travelRecord) {
      setTravel({
        ticket_number: travelRecord.ticket_number || "",
        departure_date: travelRecord.departure_date || "",
        arrival_date: travelRecord.arrival_date || "",
        departure_location: travelRecord.departure_location || "",
        arrival_location: travelRecord.arrival_location || "",
      });
    }

    const contractRecord = profileData.contracts?.[0];
    if (contractRecord) {
      setContract({
        employer: contractRecord.employer_name || "",
        partner_id: contractRecord.partner_id || "",
        contract_start_date: contractRecord.contract_start_date || "",
        contract_end_date: contractRecord.contract_end_date || "",
        monthly_salary: contractRecord.monthly_salary || "",
        status: contractRecord.status || "pending",
      });
    }

    setSectionsEnabled({
      passport: true,
      coc: true,
      medical: true,
      guarantor: true,
      visa: true,
      travel: true,
      contract: true,
    });
  };

  const handleBasicChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBasic((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    const numericFields = [
      "status_id",
      "number_of_children",
      "height_cm",
      "weight_kg",
    ];
    const val = numericFields.includes(name)
      ? value
        ? Number(value)
        : ""
      : value;
    setPersonal((prev) => ({ ...prev, [name]: val }));
  };

  const handlePassportChange = (e) => {
    const { name, value } = e.target;
    setPassport((prev) => ({ ...prev, [name]: value }));
  };

  const handleCocChange = (e) => {
    const { name, value } = e.target;
    setCoc((prev) => ({ ...prev, [name]: value }));
  };

  const handleMedicalChange = (e) => {
    const { name, value } = e.target;
    setMedical((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuarantorChange = (e) => {
    const { name, value } = e.target;
    setGuarantor((prev) => ({ ...prev, [name]: value }));
  };

  const handleVisaChange = (e) => {
    const { name, value } = e.target;
    setVisa((prev) => ({ ...prev, [name]: value }));
  };

  const handleTravelChange = (e) => {
    const { name, value } = e.target;
    setTravel((prev) => ({ ...prev, [name]: value }));
  };

  const handleContractChange = (e) => {
    const { name, value } = e.target;
    setContract((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoto3x4Change = (e) => {
    if (e.target.files?.[0]) setPhoto3x4(e.target.files[0]);
  };

  const handlePhotoStandingChange = (e) => {
    if (e.target.files?.[0]) setPhotoStanding(e.target.files[0]);
  };

  const handlePassportScanChange = (e) => {
    if (e.target.files?.[0]) setPassportScan(e.target.files[0]);
  };

  const toggleSection = (key) => {
    setSectionsEnabled((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ---------------- status assignment (reuses WorkerProfile's flow) ----------------

  // Fields for the existing CreateModal, identical to WorkerProfile's
  // fieldsStatuses so the same modal UX is reused rather than reinvented.
  const fieldsStatuses = [
    {
      name: "status_id",
      label: "Status",
      type: "select",
      options: statuses.map((status) => ({
        value: status.id,
        label: status.name,
      })),
    },
  ];

  const refreshWorkerStatuses = async () => {
    try {
      const res = await getWorkerCurrentStatus(id);
      setWorkerStatuses(res.data || []);
    } catch (err) {
      console.error("Failed to refresh worker statuses:", err);
    }
  };

  const handleAssignStatus = async (inputValues) => {
    const statusId = inputValues.status_id;
    if (!statusId) {
      addMessage(false, "Please select a status");
      return;
    }
    showLoader();
    try {
      const res = await assignWorkerStatus(id, statusId);
      addMessage(res?.success, res?.message || "Status assigned successfully");
      setShowStatusModal(false);
      await refreshWorkerStatuses();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  const handleDeleteStatus = (statusItem) => {
    openModal(
      async () => {
        showLoader();
        try {
          const res = await deleteWorkerStatus(id, statusItem.id);
          addMessage(
            res?.success,
            res?.message || "Status revoked successfully",
          );
          await refreshWorkerStatuses();
        } catch (err) {
          addMessage(false, err.message);
        } finally {
          hideLoader();
        }
      },
      {
        title: "Are you sure you want to revoke this status?",
        confirmText: "Revoke",
      },
    );
  };

  const validateBasic = () => {
    if (
      !basic.full_name ||
      basic.full_name.trim().length < 3 ||
      basic.full_name.length > 100
    )
      return "Full name must be 3-100 characters";
    if (!workerPhoneRegex.test(basic.phone_number))
      return "Phone number must be a valid Ethiopian number";
    return null;
  };

  const validatePersonal = () => {
    if (!["Male", "Female"].includes(personal.sex))
      return "Sex must be Male or Female";
    if (!isEditMode && !personal.region) return "Region is required";

    if (
      personal.region &&
      (personal.region.length > 100 ||
        !isOnlyAlphabetsAndSpaces(personal.region))
    )
      return "Region must contain only letters and spaces (max 100 chars)";
    if (
      personal.wereda &&
      (personal.wereda.length > 100 ||
        !isOnlyAlphabetsAndSpaces(personal.wereda))
    )
      return "Wereda must contain only letters and spaces (max 100 chars)";
    if (
      personal.city &&
      (personal.city.length > 100 || !isOnlyAlphabetsAndSpaces(personal.city))
    )
      return "City must contain only letters and spaces (max 100 chars)";
    if (
      personal.subcity &&
      (personal.subcity.length > 100 ||
        !isOnlyAlphabetsAndSpaces(personal.subcity))
    )
      return "Sub-city must contain only letters and spaces (max 100 chars)";

    if (personal.date_of_birth) {
      const dob = new Date(personal.date_of_birth);
      if (isNaN(dob.getTime())) return "Date of birth must be valid";
      if (dob >= new Date()) return "Date of birth must be in the past";
    }

    if (
      personal.place_of_birth &&
      (personal.place_of_birth.length > 100 ||
        !isOnlyAlphabetsAndSpaces(personal.place_of_birth))
    )
      return "Place of birth must contain only letters and spaces (max 100 chars)";
    if (
      personal.religion &&
      (personal.religion.length > 50 ||
        !isOnlyAlphabetsAndSpaces(personal.religion))
    )
      return "Religion must contain only letters and spaces (max 50 chars)";
    if (
      personal.marital_status &&
      !["Single", "Married", "Divorced", "Widowed"].includes(
        personal.marital_status,
      )
    )
      return "Marital status must be Single, Married, Divorced, or Widowed";
    if (personal.nationality && !isOnlyAlphabetsAndSpaces(personal.nationality))
      return "Nationality must contain only letters and spaces";
    if (personal.address && personal.address.length > 500)
      return "Address must be at most 500 characters";
    if (
      personal.education &&
      (personal.education.length > 100 ||
        !educationRegex.test(personal.education))
    )
      return "Education must contain only letters, spaces, and dots (max 100 chars)";
    if (
      personal.number_of_children !== "" &&
      (!Number.isInteger(personal.number_of_children) ||
        personal.number_of_children < 0)
    )
      return "Number of children must be 0 or a positive integer";
    if (
      personal.height_cm !== "" &&
      (personal.height_cm < 100 || personal.height_cm > 250)
    )
      return "Height must be between 100 and 250 cm";
    if (
      personal.weight_kg !== "" &&
      (personal.weight_kg < 30 || personal.weight_kg > 200)
    )
      return "Weight must be between 30 and 200 kg";

    if (!isEditMode) {
      if (!photo3x4) return "Photo 3x4 is required";
      if (!photoStanding) return "Photo Standing is required";
    }
    if (photo3x4 && !allowedImageTypes.includes(photo3x4.type))
      return "Photo 3x4 must be JPEG or PNG";
    if (photoStanding && !allowedImageTypes.includes(photoStanding.type))
      return "Photo Standing must be JPEG or PNG";

    return null;
  };

  // Status now has its own section/tree entry: on create it's a required
  // single-select (sent as part of personal_information, unchanged payload
  // shape); on edit it's the reused assign/revoke flow, so nothing here
  // blocks submission.
  const validateStatus = () => {
    if (!isEditMode && !personal.status_id) return "Status is required";
    return null;
  };

  const validatePassport = () => {
    if (!sectionsEnabled.passport) return null;
    const passportNumber = passport.passport_number?.trim();
    if (!passportNumber) return "Passport number is required";
    if (passportNumber.length < 5 || passportNumber.length > 50)
      return "Passport number must be 5-50 characters";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (passport.passport_issue_date) {
      const issue = new Date(passport.passport_issue_date);
      if (isNaN(issue.getTime())) return "Invalid issue date";
      if (issue > today) return "Issue date cannot be in future";
    }
    if (passport.passport_expiry_date) {
      const expiry = new Date(passport.passport_expiry_date);
      if (isNaN(expiry.getTime())) return "Invalid expiry date";
      if (
        passport.passport_issue_date &&
        expiry <= new Date(passport.passport_issue_date)
      )
        return "Expiry must be after issue date";
    }

    const hasExistingScan = isEditMode && existingPassportScanUrl;
    if (!hasExistingScan && !passportScan) return "Passport scan is required";
    if (passportScan && !allowedImageTypes.includes(passportScan.type))
      return "Passport scan must be JPG, JPEG or PNG";

    return null;
  };

  const validateCoc = () => {
    if (!sectionsEnabled.coc) return null;
    const center = coc.coc_assessment_center?.trim();
    if (!center) return "Assessment center is required";
    if (
      coc.coc_number &&
      (coc.coc_number.length < 3 || coc.coc_number.length > 50)
    )
      return "COC number must be 3-50 characters";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!coc.coc_assessment_date) return "Assessment date is required";
    const assessmentDate = new Date(coc.coc_assessment_date);
    if (isNaN(assessmentDate.getTime())) return "Invalid assessment date";
    if (assessmentDate > today) return "Assessment date cannot be in future";

    if (!coc.coc_issue_date) return "Issue date is required";
    const issueDate = new Date(coc.coc_issue_date);
    if (isNaN(issueDate.getTime())) return "Invalid issue date";
    if (issueDate > today) return "Issue date cannot be in future";

    if (!coc.coc_expiry_date) return "Expiry date is required";
    const expiryDate = new Date(coc.coc_expiry_date);
    if (isNaN(expiryDate.getTime())) return "Invalid expiry date";
    if (expiryDate <= issueDate) return "Expiry must be after issue date";

    return null;
  };

  const validateMedical = () => {
    if (!sectionsEnabled.medical) return null;
    if (!["fit", "unfit", "pending"].includes(medical.medical_status))
      return "Medical status must be fit, unfit, or pending";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (medical.medical_issue_date) {
      const issue = new Date(medical.medical_issue_date);
      if (isNaN(issue.getTime())) return "Issue date must be valid";
      if (issue > today) return "Issue date cannot be in the future";
    }
    if (medical.medical_expiry_date) {
      const expiry = new Date(medical.medical_expiry_date);
      if (isNaN(expiry.getTime())) return "Expiry date must be valid";
    }
    if (medical.medical_issue_date && medical.medical_expiry_date) {
      if (
        new Date(medical.medical_expiry_date) <=
        new Date(medical.medical_issue_date)
      )
        return "Expiry date must be after issue date";
    }

    return null;
  };

  const validateGuarantor = () => {
    if (!sectionsEnabled.guarantor) return null;
    if (!guarantor.guarantor_name || !guarantor.guarantor_name.trim())
      return "Name is required";
    if (guarantor.guarantor_name.length > 150)
      return "Name cannot exceed 150 characters";
    if (guarantor.relation && guarantor.relation.length > 200)
      return "Relation cannot exceed 200 characters";
    if (!guarantorPhoneRegex.test(guarantor.guarantor_phone_number))
      return "Phone must be a valid format";
    return null;
  };

  const validateVisa = () => {
    if (!sectionsEnabled.visa) return null;
    if (visa.visa_number && visa.visa_number.length > 100)
      return "Visa number cannot exceed 100 characters";
    if (visa.visa_reference_number && visa.visa_reference_number.length > 100)
      return "Reference number cannot exceed 100 characters";
    if (visa.issuance_id && visa.issuance_id.length > 100)
      return "Issuance number cannot exceed 100 characters";
    if (visa.sponsor_id && visa.sponsor_id.length > 100)
      return "Sponsor ID cannot exceed 100 characters";
    if (visa.visa_expiry_date && !visa.visa_issue_date)
      return "Visa issue date must be provided if expiry date exists";
    if (visa.visa_issue_date && visa.visa_expiry_date) {
      if (new Date(visa.visa_expiry_date) <= new Date(visa.visa_issue_date))
        return "Visa expiry date must be greater than issue date";
    }
    return null;
  };

  const validateTravel = () => {
    if (!sectionsEnabled.travel) return null;
    if (!travel.ticket_number || !travel.ticket_number.trim())
      return "Ticket number is required";
    if (travel.ticket_number.length > 100)
      return "Ticket number cannot exceed 100 characters";

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const departureDate = travel.departure_date
      ? new Date(travel.departure_date)
      : null;
    const arrivalDate = travel.arrival_date
      ? new Date(travel.arrival_date)
      : null;

    if (!departureDate && arrivalDate)
      return "Departure date must be provided if arrival date is set";
    if (departureDate) {
      if (isNaN(departureDate.getTime()))
        return "Departure date must be a valid date";
      departureDate.setHours(0, 0, 0, 0);
      if (departureDate < now) return "Departure date cannot be in the past";
    }
    if (arrivalDate && isNaN(arrivalDate.getTime()))
      return "Arrival date must be a valid date";

    return null;
  };

  const validateContract = () => {
    if (!sectionsEnabled.contract) return null;
    if (!contract.employer || !contract.employer.trim())
      return "Employer name is required";
    if (contract.partner_id) {
      if (
        !Number.isInteger(Number(contract.partner_id)) ||
        Number(contract.partner_id) <= 0
      )
        return "Partner must be a positive integer or empty";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = contract.contract_start_date
      ? new Date(contract.contract_start_date)
      : null;
    const endDate = contract.contract_end_date
      ? new Date(contract.contract_end_date)
      : null;

    if (!startDate && endDate)
      return "Contract start date must be provided if end date exists";
    if (startDate) {
      if (isNaN(startDate.getTime()))
        return "Contract start date must be a valid date";
      startDate.setHours(0, 0, 0, 0);
      if (startDate < today) return "Contract start date cannot be in the past";
    }
    if (endDate) {
      if (isNaN(endDate.getTime()))
        return "Contract end date must be a valid date";
      endDate.setHours(0, 0, 0, 0);
      if (endDate <= startDate)
        return "Contract end date must be after start date";
    }

    if (!contract.monthly_salary) return "Monthly salary is required";
    const salary = Number(contract.monthly_salary);
    if (isNaN(salary) || salary <= 0)
      return "Monthly salary must be a positive number";
    const decimalParts = contract.monthly_salary.toString().split(".");
    if (decimalParts[1]?.length > 2)
      return "Monthly salary cannot have more than 2 decimal places";

    const validStatuses = ["pending", "approved", "rejected", "terminated"];
    if (!contract.status || !validStatuses.includes(contract.status))
      return `Status must be one of: ${validStatuses.join(", ")}`;

    return null;
  };

  // Basic Information and Personal Information now live in a single module,
  // so a single step validates both — order matters: basic-info errors
  // surface before personal-info errors, matching the field order on screen.
  const validateBasicAndPersonal = () => validateBasic() || validatePersonal();

  const stepValidators = {
    basic: validateBasicAndPersonal,
    status: validateStatus,
    passport: validatePassport,
    coc: validateCoc,
    medical: validateMedical,
    guarantor: validateGuarantor,
    visa: validateVisa,
    travel: validateTravel,
    contract: validateContract,
  };

  const handleSubmit = async () => {
    // validate every section before submitting
    for (const s of SECTIONS) {
      const error = stepValidators[s.key]?.();
      if (error) {
        addMessage(false, error);
        setPreviewMode(false);
        scrollToSection(s.key);
        return;
      }
    }

    setSubmitLoading(true);
    showLoader();

    try {
      const dataToSend = new FormData();

      dataToSend.append("full_name", basic.full_name);
      dataToSend.append("phone_number", basic.phone_number);
      dataToSend.append("is_active", basic.is_active);

      // status is only sent on create — edit mode manages status separately
      // through the assign/revoke flow, never through this form submission
      const personalPayload = { ...personal };
      if (isEditMode) delete personalPayload.status_id;
      Object.keys(personalPayload).forEach((key) => {
        if (personalPayload[key] === "" || personalPayload[key] === null)
          delete personalPayload[key];
      });
      dataToSend.append(
        "personal_information",
        JSON.stringify(personalPayload),
      );

      // Optional modules are always rendered/editable; the "Include" toggle
      // is the only thing that decides whether a module's data is attached
      // to the request payload.
      if (sectionsEnabled.passport)
        dataToSend.append("passport", JSON.stringify(passport));
      if (sectionsEnabled.coc) dataToSend.append("coc", JSON.stringify(coc));
      if (sectionsEnabled.medical)
        dataToSend.append("medical", JSON.stringify(medical));
      if (sectionsEnabled.guarantor)
        dataToSend.append("guarantor", JSON.stringify(guarantor));
      if (sectionsEnabled.visa) dataToSend.append("visa", JSON.stringify(visa));
      if (sectionsEnabled.travel)
        dataToSend.append("travel", JSON.stringify(travel));
      if (sectionsEnabled.contract)
        dataToSend.append("contract", JSON.stringify(contract));

      if (photo3x4) dataToSend.append("photo_3x4_url", photo3x4);
      if (photoStanding) dataToSend.append("photo_standing_url", photoStanding);
      if (passportScan) dataToSend.append("passport_scan_url", passportScan);

      const response = isEditMode
        ? await updateWorker(id, dataToSend)
        : await createWorker(dataToSend);

      addMessage(
        response?.success,
        response?.message ||
          (isEditMode
            ? "Worker updated successfully"
            : "Worker created successfully"),
      );

      goBack();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      setSubmitLoading(false);
      hideLoader();
    }
  };

  /* ---------------- section field content (no wrapper/title — the card wrapper handles that) ---------------- */
  /* Input classes below intentionally mirror the Create User Form exactly
     (`row` + `form-group col-md-6 mb-3` + `form-control`) so both forms
     share the same input look and feel. */

  const renderBasicFields = () => (
    <div className="row">
      <div className="form-group col-md-6 mb-3">
        {renderLabel("Full Name", true)}
        <input
          type="text"
          name="full_name"
          className="form-control"
          value={basic.full_name}
          onChange={handleBasicChange}
          required
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        {renderLabel("Phone Number", true)}
        <input
          type="text"
          name="phone_number"
          className="form-control"
          value={basic.phone_number}
          onChange={handleBasicChange}
          required
        />
      </div>
    </div>
  );

  const renderPersonalFields = () => (
    <div className="row">
      <div className="form-group col-md-6 mb-3">
        {renderLabel("Sex", true)}
        <select
          name="sex"
          className="form-control"
          value={personal.sex}
          onChange={handlePersonalChange}
          required
        >
          <option value="">Select sex</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>

      <div className="form-group col-md-6 mb-3">
        {renderLabel("Region", !isEditMode)}
        <input
          type="text"
          name="region"
          className="form-control"
          value={personal.region}
          onChange={handlePersonalChange}
          required={!isEditMode}
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Woreda</label>
        <input
          type="text"
          name="wereda"
          className="form-control"
          value={personal.wereda}
          onChange={handlePersonalChange}
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>City</label>
        <input
          type="text"
          name="city"
          className="form-control"
          value={personal.city}
          onChange={handlePersonalChange}
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Sub-City</label>
        <input
          type="text"
          name="subcity"
          className="form-control"
          value={personal.subcity}
          onChange={handlePersonalChange}
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Date of Birth</label>
        <input
          type="date"
          name="date_of_birth"
          className="form-control"
          value={personal.date_of_birth}
          onChange={handlePersonalChange}
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Place of Birth</label>
        <input
          type="text"
          name="place_of_birth"
          className="form-control"
          value={personal.place_of_birth}
          onChange={handlePersonalChange}
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Religion</label>
        <input
          type="text"
          name="religion"
          className="form-control"
          value={personal.religion}
          onChange={handlePersonalChange}
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Marital Status</label>
        <select
          name="marital_status"
          className="form-control"
          value={personal.marital_status}
          onChange={handlePersonalChange}
        >
          <option value="">Select status</option>
          <option value="Single">Single</option>
          <option value="Married">Married</option>
          <option value="Divorced">Divorced</option>
          <option value="Widowed">Widowed</option>
        </select>
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Nationality</label>
        <input
          type="text"
          name="nationality"
          className="form-control"
          value={personal.nationality}
          onChange={handlePersonalChange}
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Address</label>
        <input
          type="text"
          name="address"
          className="form-control"
          value={personal.address}
          onChange={handlePersonalChange}
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Education</label>
        <input
          type="text"
          name="education"
          className="form-control"
          value={personal.education}
          onChange={handlePersonalChange}
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Number of Children</label>
        <input
          type="number"
          name="number_of_children"
          className="form-control"
          value={personal.number_of_children}
          onChange={handlePersonalChange}
          min="0"
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Height (cm)</label>
        <input
          type="number"
          name="height_cm"
          className="form-control"
          value={personal.height_cm}
          onChange={handlePersonalChange}
          step="0.01"
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Weight (kg)</label>
        <input
          type="number"
          name="weight_kg"
          className="form-control"
          value={personal.weight_kg}
          onChange={handlePersonalChange}
          step="0.01"
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        {renderLabel("Photo 3x4", !isEditMode)}
        <input
          type="file"
          name="photo_3x4_url"
          accept="image/*"
          className="form-control"
          onChange={handlePhoto3x4Change}
          required={!isEditMode}
        />
        {isEditMode && existingPhoto3x4Url && !photo3x4 && (
          <small className="text-muted">
            Current photo:{" "}
            <a
              href={existingPhoto3x4Url}
              target="_blank"
              rel="noopener noreferrer"
            >
              View
            </a>
          </small>
        )}
      </div>
      <div className="form-group col-md-6 mb-3">
        {renderLabel("Photo Standing", !isEditMode)}
        <input
          type="file"
          name="photo_standing_url"
          accept="image/*"
          className="form-control"
          onChange={handlePhotoStandingChange}
          required={!isEditMode}
        />
        {isEditMode && existingPhotoStandingUrl && !photoStanding && (
          <small className="text-muted">
            Current photo:{" "}
            <a
              href={existingPhotoStandingUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View
            </a>
          </small>
        )}
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>National ID Number</label>
        <input
          type="text"
          name="national_id_number"
          className="form-control"
          value={personal.national_id_number}
          onChange={handlePersonalChange}
        />
      </div>
    </div>
  );

  // Status module content. On create there's no worker yet, so it keeps the
  // original single-select (still written into personal.status_id and sent
  // as part of personal_information — payload shape is unchanged). On edit
  // it reuses WorkerProfile's assign/revoke flow exactly: same Badge list,
  // same RoleButton-gated "+ Assign Status" trigger, same CreateModal, same
  // delete-confirmation flow through useDelete.
  const renderStatusFields = () => {
    if (!isEditMode) {
      return (
        <div className="row">
          <div className="form-group col-md-6 mb-3">
            {renderLabel("Status", true)}
            {statuses.length === 0 ? (
              <div className="form-control text-muted">Loading statuses...</div>
            ) : (
              <select
                name="status_id"
                className="form-control"
                value={personal.status_id}
                onChange={handlePersonalChange}
                required
              >
                <option value="">Select status</option>
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            )}
            <small className="text-muted d-block mt-2">
              This status will be assigned as soon as the worker is created.
            </small>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="d-flex flex-wrap gap-2 mb-3">
          {workerStatuses.length === 0 && (
            <span className="text-muted">No assigned statuses available</span>
          )}
          {workerStatuses.map((status) => (
            <span key={status.id} className="d-inline-flex align-items-center">
              <Badge
                content={status.name}
                color={getConsistentColor(status.name)}
                {...(canDeleteStatus && {
                  onDelete: () => handleDeleteStatus(status),
                })}
              />
            </span>
          ))}
        </div>
        <RoleButton
          visibleTo={[2, 1]}
          className="btn btn-main btn-sm"
          onClick={() => setShowStatusModal(true)}
        >
          + Assign Status
        </RoleButton>
      </div>
    );
  };

  const renderPassportFields = () => (
    <div className="row">
      <div className="form-group col-md-6 mb-3">
        {renderLabel("Passport Number", true)}
        <input
          type="text"
          name="passport_number"
          className="form-control"
          value={passport.passport_number}
          onChange={handlePassportChange}
          required
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Issuing Country</label>
        <input
          type="text"
          name="passport_issuing_country"
          className="form-control"
          value={passport.passport_issuing_country}
          onChange={handlePassportChange}
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Issue Date</label>
        <input
          type="date"
          name="passport_issue_date"
          className="form-control"
          value={passport.passport_issue_date}
          onChange={handlePassportChange}
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Expiry Date</label>
        <input
          type="date"
          name="passport_expiry_date"
          className="form-control"
          value={passport.passport_expiry_date}
          onChange={handlePassportChange}
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        {renderLabel("Passport Scan", !existingPassportScanUrl)}
        <input
          type="file"
          accept="image/*"
          className="form-control"
          onChange={handlePassportScanChange}
          required={!existingPassportScanUrl}
        />
        {isEditMode && existingPassportScanUrl && !passportScan && (
          <small className="text-muted">
            Current scan:{" "}
            <a
              href={existingPassportScanUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View
            </a>
          </small>
        )}
      </div>
    </div>
  );

  const renderCocFields = () => (
    <div className="row">
      <div className="form-group col-md-6 mb-3">
        <label>COC Number</label>
        <input
          type="text"
          name="coc_number"
          className="form-control"
          value={coc.coc_number}
          onChange={handleCocChange}
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        {renderLabel("Assessment Center", true)}
        <input
          type="text"
          name="coc_assessment_center"
          className="form-control"
          value={coc.coc_assessment_center}
          onChange={handleCocChange}
          required
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        {renderLabel("Assessment Date", true)}
        <input
          type="date"
          name="coc_assessment_date"
          className="form-control"
          value={coc.coc_assessment_date}
          onChange={handleCocChange}
          required
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        {renderLabel("Issue Date", true)}
        <input
          type="date"
          name="coc_issue_date"
          className="form-control"
          value={coc.coc_issue_date}
          onChange={handleCocChange}
          required
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        {renderLabel("Expiry Date", true)}
        <input
          type="date"
          name="coc_expiry_date"
          className="form-control"
          value={coc.coc_expiry_date}
          onChange={handleCocChange}
          required
        />
      </div>
    </div>
  );

  const renderMedicalFields = () => (
    <div className="row">
      <div className="form-group col-md-6 mb-3">
        {renderLabel("Medical Status", true)}
        <select
          name="medical_status"
          className="form-control"
          value={medical.medical_status}
          onChange={handleMedicalChange}
          required
        >
          <option value="">Select status</option>
          <option value="fit">Fit</option>
          <option value="unfit">Unfit</option>
          <option value="pending">Pending</option>
        </select>
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Medical Center</label>
        <input
          type="text"
          name="medical_center"
          className="form-control"
          value={medical.medical_center}
          onChange={handleMedicalChange}
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Medical Report Number</label>
        <input
          type="text"
          name="medical_report_number"
          className="form-control"
          value={medical.medical_report_number}
          onChange={handleMedicalChange}
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Issue Date</label>
        <input
          type="date"
          name="medical_issue_date"
          className="form-control"
          value={medical.medical_issue_date}
          onChange={handleMedicalChange}
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Expiry Date</label>
        <input
          type="date"
          name="medical_expiry_date"
          className="form-control"
          value={medical.medical_expiry_date}
          onChange={handleMedicalChange}
        />
      </div>
    </div>
  );

  const renderGuarantorFields = () => (
    <div className="row">
      <div className="form-group col-md-6 mb-3">
        {renderLabel("Name", true)}
        <input
          type="text"
          name="guarantor_name"
          className="form-control"
          value={guarantor.guarantor_name}
          onChange={handleGuarantorChange}
          required
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Relation</label>
        <input
          type="text"
          name="relation"
          className="form-control"
          value={guarantor.relation}
          onChange={handleGuarantorChange}
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        {renderLabel("Phone Number", true)}
        <input
          type="text"
          name="guarantor_phone_number"
          className="form-control"
          value={guarantor.guarantor_phone_number}
          onChange={handleGuarantorChange}
          required
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Address</label>
        <input
          type="text"
          name="guarantor_address"
          className="form-control"
          value={guarantor.guarantor_address}
          onChange={handleGuarantorChange}
        />
      </div>
    </div>
  );

  const renderVisaFields = () => (
    <div className="row">
      <div className="form-group col-md-6 mb-3">
        <label>Visa Number</label>
        <input
          type="text"
          name="visa_number"
          className="form-control"
          value={visa.visa_number}
          onChange={handleVisaChange}
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Issue Date</label>
        <input
          type="date"
          name="visa_issue_date"
          className="form-control"
          value={visa.visa_issue_date}
          onChange={handleVisaChange}
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Expiry Date</label>
        <input
          type="date"
          name="visa_expiry_date"
          className="form-control"
          value={visa.visa_expiry_date}
          onChange={handleVisaChange}
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Reference Number</label>
        <input
          type="text"
          name="visa_reference_number"
          className="form-control"
          value={visa.visa_reference_number}
          onChange={handleVisaChange}
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Reference Date</label>
        <input
          type="date"
          name="visa_reference_date"
          className="form-control"
          value={visa.visa_reference_date}
          onChange={handleVisaChange}
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Issuance Number</label>
        <input
          type="text"
          name="issuance_id"
          className="form-control"
          value={visa.issuance_id}
          onChange={handleVisaChange}
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Sponsor ID</label>
        <input
          type="text"
          name="sponsor_id"
          className="form-control"
          value={visa.sponsor_id}
          onChange={handleVisaChange}
        />
      </div>
    </div>
  );

  const renderTravelFields = () => (
    <div className="row">
      <div className="form-group col-md-6 mb-3">
        {renderLabel("Ticket Number", true)}
        <input
          type="text"
          name="ticket_number"
          className="form-control"
          value={travel.ticket_number}
          onChange={handleTravelChange}
          required
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Departure Date</label>
        <input
          type="date"
          name="departure_date"
          className="form-control"
          value={travel.departure_date}
          onChange={handleTravelChange}
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Arrival Date</label>
        <input
          type="date"
          name="arrival_date"
          className="form-control"
          value={travel.arrival_date}
          onChange={handleTravelChange}
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Departure Location</label>
        <input
          type="text"
          name="departure_location"
          className="form-control"
          value={travel.departure_location}
          onChange={handleTravelChange}
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Arrival Location</label>
        <input
          type="text"
          name="arrival_location"
          className="form-control"
          value={travel.arrival_location}
          onChange={handleTravelChange}
        />
      </div>
    </div>
  );

  const renderContractFields = () => (
    <div className="row">
      <div className="form-group col-md-6 mb-3">
        {renderLabel("Employer", true)}
        <input
          type="text"
          name="employer"
          className="form-control"
          value={contract.employer}
          onChange={handleContractChange}
          required
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Partner</label>
        <select
          name="partner_id"
          className="form-control"
          value={contract.partner_id}
          onChange={handleContractChange}
        >
          <option value="">Select Partner</option>
          {partners.map((partner) => (
            <option key={partner.partner_id} value={Number(partner.partner_id)}>
              {partner.full_name || partner.email}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>Start Date</label>
        <input
          type="date"
          name="contract_start_date"
          className="form-control"
          value={contract.contract_start_date}
          onChange={handleContractChange}
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        <label>End Date</label>
        <input
          type="date"
          name="contract_end_date"
          className="form-control"
          value={contract.contract_end_date}
          onChange={handleContractChange}
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        {renderLabel("Monthly Salary", true)}
        <input
          type="number"
          step="0.01"
          name="monthly_salary"
          className="form-control"
          value={contract.monthly_salary}
          onChange={handleContractChange}
          required
        />
      </div>
      <div className="form-group col-md-6 mb-3">
        {renderLabel("Status", true)}
        <select
          name="status"
          className="form-control"
          value={contract.status}
          onChange={handleContractChange}
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="terminated">Terminated</option>
        </select>
      </div>
    </div>
  );

  const SECTION_FIELD_RENDERERS = {
    basic: () => (
      <>
        {renderBasicFields()}
        {renderPersonalFields()}
      </>
    ),
    status: renderStatusFields,
    passport: renderPassportFields,
    coc: renderCocFields,
    medical: renderMedicalFields,
    guarantor: renderGuarantorFields,
    visa: renderVisaFields,
    travel: renderTravelFields,
    contract: renderContractFields,
  };

  const SECTION_SUBTITLES = {
    basic:
      "The worker's core account details plus demographic, location, and identification information.",
    status: isEditMode
      ? "Assign or revoke this worker's current status."
      : "Choose the status this worker will start with.",
    passport: "Optional — add if the worker's passport is available.",
    coc: "Optional — add if the worker has a COC assessment on record.",
    medical: "Optional — add if a medical fitness result is on record.",
    guarantor: "Optional — add a guarantor or emergency contact.",
    visa: "Optional — add if visa details are available.",
    travel: "Optional — add if a travel ticket has been booked.",
    contract: "Optional — add if an employer contract has been agreed.",
  };

  /* ---------------- section navigation (shared data + markup for the tree nav) ---------------- */

  // Create/Edit navigation contains only the actual form modules.
  const navItems = SECTIONS;

  // a module counts as "completed" once it actually has information on it.
  // Status is judged by whether a status exists (assigned statuses in edit
  // mode, a chosen status_id in create mode) rather than by validation
  // passing trivially. Optional modules must also be switched on, since a
  // disabled/empty optional section should never look finished.
  const isSectionComplete = (section) => {
    if (section.key === "preview") return false;
    if (section.key === "status") {
      return isEditMode
        ? workerStatuses.length > 0
        : Boolean(personal.status_id);
    }
    if (section.optional && !sectionsEnabled[section.key]) return false;
    const validate = stepValidators[section.key];
    return validate ? !validate() : false;
  };

  const renderNavItem = (section, mobile = false, index = 0) => {
    const isActive = activeSection === section.key;
    const nodeNumber = index + 1;
    const isComplete = isSectionComplete(section);

    if (mobile) {
      return (
        <div
          key={section.key}
          className={`tree-nav-mobile-item ${isActive ? "active" : ""}`}
          role="button"
          onClick={() => scrollToSection(section.key)}
        >
          <span className="tree-node-dot">{nodeNumber}</span>
          <span className="tree-node-label d-inline-flex align-items-center">
            {section.label}
            {isComplete && (
              <span className="tree-node-check text-success" title="Completed">
                »»
              </span>
            )}
          </span>
        </div>
      );
    }

    return (
      <li
        key={section.key}
        className={`tree-nav-item ${isActive ? "active" : ""}`}
        role="button"
        onClick={() => scrollToSection(section.key)}
      >
        <span className="tree-node-dot">{nodeNumber}</span>
        <span className="tree-node-label-wrap">
          <span className="tree-node-label d-inline-flex align-items-center">
            {section.label}
            {isComplete && (
              <span className="tree-node-check text-success" title="Completed">
                »»
              </span>
            )}
          </span>
          {section.optional && (
            <span className="tree-node-badge">Optional</span>
          )}
        </span>
      </li>
    );
  };

  // The single primary action button — reused for the fixed desktop tree,
  // the mobile top nav, and (compact) the Preview header once the tree is
  // hidden there. Label/behavior only depends on mode + loading state,
  // matching the existing Create User Form button styling exactly
  // (`btn btn-main px-4 rounded`).
  const renderActionButton = (compact = false) => (
    <button
      type="button"
      className={`btn btn-main rounded ${
        compact ? "btn-sm px-3" : "px-4 w-100"
      }`}
      onClick={handleSubmit}
      disabled={submitLoading}
    >
      {submitLoading
        ? "Saving..."
        : isEditMode
          ? "Save Changes"
          : "Create Worker"}
    </button>
  );

  /* ---------------- section card wrapper ---------------- */

  // Optional modules are always rendered and editable — the "Include"
  // switch only controls whether the module's data is attached to the
  // request payload in handleSubmit, never whether the module is visible.
const renderSectionCard = (section) => {
  const isOptional = section.optional;

  return (
    <div
      key={section.key}
      id={`section-${section.key}`}
      ref={setSectionRef(section.key)}
      className="card border-0 shadow-sm rounded-4 mb-4 section-scroll-anchor position-relative"
    >
      {isOptional && (
        <div
          className="position-absolute top-0 end-0 m-3"
          style={{ zIndex: 2 }}
        >
          <div className="form-check form-switch d-flex align-items-center gap-2 ps-0 mb-0">
            <input
              type="checkbox"
              role="switch"
              className="form-check-input ms-0"
              id={`toggle-${section.key}`}
              checked={sectionsEnabled[section.key]}
              onChange={() => toggleSection(section.key)}
            />
            <label
              className="form-check-label small text-muted"
              htmlFor={`toggle-${section.key}`}
            >
              Include
            </label>
          </div>
        </div>
      )}

      <div className="card-header bg-white border-0 rounded-4 pt-3 pb-0 pe-5">
        <div>
          <h5 className="fw-bold text-dark mb-1">{section.label}</h5>
          <p className="text-muted small mb-0">
            {SECTION_SUBTITLES[section.key]}
          </p>
        </div>
      </div>

      <div className="card-body pt-2">
        <div className="submit-section">
          {SECTION_FIELD_RENDERERS[section.key]()}
        </div>
      </div>
    </div>
  );
};

  /* ---------------- preview (mirrors Worker Profile module layout) ---------------- */

  const previewRow = (label, value) => (
    <p className="mb-2">
      <small className="text-muted">{label}</small>
      <br />
      {fallback(value)}
    </p>
  );

  // Same row, wrapped in a half-width grid column — used to lay fields out
  // in a clean, balanced two-column grid inside a module.
  const previewRowCol = (label, value, colClass = "col-md-6") => (
    <div className={colClass}>{previewRow(label, value)}</div>
  );

  // Link-style row for file fields (photos/scans) in the preview — mirrors
  // the "Current photo:/scan: View" link pattern already used in the form.
  const previewFileRow = (label, file, existingUrl) => {
    const url = file ? URL.createObjectURL(file) : existingUrl;
    return (
      <p className="mb-2">
        <small className="text-muted">{label}</small>
        <br />
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer">
            View
          </a>
        ) : (
          fallback(null)
        )}
      </p>
    );
  };

  const previewFileRowCol = (
    label,
    file,
    existingUrl,
    colClass = "col-md-6",
  ) => (
    <div className={colClass}>{previewFileRow(label, file, existingUrl)}</div>
  );

  const renderPreviewModule = (
    title,
    sectionKey,
    content,
    empty = false,
    colClass = "col-12 col-md-6",
  ) => (
    <div className={colClass}>
      <div className="card h-100 border rounded-4 border-info">
        <div className="card-header border-0 d-flex justify-content-between align-items-center pb-0">
          <h6 className="fw-bold text-info mb-0">{title}</h6>
          <ActionButtons
            actions={[
              {
                type: empty ? "addModule" : "edit",
                onClick: () => jumpToStep(sectionKey),
              },
            ]}
          />
        </div>
        <div className="card-body">{content}</div>
      </div>
    </div>
  );

  const currentStatusBadges = () => {
    if (isEditMode) {
      if (workerStatuses.length === 0)
        return <span className="text-muted">No assigned statuses</span>;
      return workerStatuses.map((s) => (
        <Badge
          key={s.id}
          content={s.name}
          color={getConsistentColor(s.name)}
          solid
        />
      ));
    }
    const selected = statuses.find((s) => s.id === personal.status_id);
    if (!selected) return <span className="text-muted">Not set</span>;
    return (
      <Badge
        content={selected.name}
        color={getConsistentColor(selected.name)}
        solid
      />
    );
  };

  const renderPreview = () => (
    <div
      id="section-preview"
      ref={setSectionRef("preview")}
      className="mb-5 section-scroll-anchor"
    >
      <div className="d-flex align-items-center gap-3 mb-4">
        <img
          src={
            photo3x4
              ? URL.createObjectURL(photo3x4)
              : existingPhoto3x4Url ||
                "https://placehold.co/140x140?text=No+Photo"
          }
          alt="worker"
          className="rounded-circle object-fit-cover border"
          style={{ width: 100, height: 100 }}
        />
        <div>
          <h4 className="fw-bold mb-1">{basic.full_name || "—"}</h4>
          <p className="text-muted mb-0">
            <strong>Phone:</strong> {fallback(basic.phone_number)}
          </p>
        </div>
      </div>

      <div className="row g-4">
        {/* Status — its own compact, full-width card so it stays visible
            without crowding the rest of the preview grid */}
        <div
          className="col-12"
          ref={setSectionRef("status")}
          id="section-status"
        >
          <div className="card h-100 border rounded-4 border-info">
            <div className="card-header border-0 d-flex justify-content-between align-items-center pb-0">
              <h6 className="fw-bold text-info mb-0">Status</h6>
              <ActionButtons
                actions={[
                  {
                    type: "edit",
                    onClick: () => jumpToStep("status"),
                  },
                ]}
              />
            </div>
            <div className="card-body d-flex flex-wrap gap-2">
              {currentStatusBadges()}
            </div>
          </div>
        </div>

        {/* Basic + Personal Information are one module in the form, so the
            preview keeps them as a single combined module too — sized to
            occupy the space of two normal modules (col-12) with all fields
            laid out in a balanced two-column grid inside it. */}
        {renderPreviewModule(
          "Basic & Personal Information",
          "basic",
          <div className="row g-3">
            {previewRowCol("Full Name", basic.full_name)}
            {previewRowCol("Phone", basic.phone_number)}
            {previewRowCol("Active", basic.is_active ? "Yes" : "No")}
            {previewRowCol("Sex", personal.sex)}
            {previewRowCol("Region", personal.region)}
            {previewRowCol("Woreda", personal.wereda)}
            {previewRowCol("City", personal.city)}
            {previewRowCol("Sub-City", personal.subcity)}
            {previewRowCol("Date of Birth", personal.date_of_birth)}
            {previewRowCol("Place of Birth", personal.place_of_birth)}
            {previewRowCol("Religion", personal.religion)}
            {previewRowCol("Marital Status", personal.marital_status)}
            {previewRowCol("Nationality", personal.nationality)}
            {previewRowCol("Address", personal.address)}
            {previewRowCol("Education", personal.education)}
            {previewRowCol("Number of Children", personal.number_of_children)}
            {previewRowCol("Height (cm)", personal.height_cm)}
            {previewRowCol("Weight (kg)", personal.weight_kg)}
            {previewRowCol("National ID", personal.national_id_number)}
            {previewFileRowCol("Photo 3x4", photo3x4, existingPhoto3x4Url)}
            {previewFileRowCol(
              "Photo Standing",
              photoStanding,
              existingPhotoStandingUrl,
            )}
          </div>,
          false,
          "col-12",
        )}

        {/* Optional modules always show their real current field values in
            Preview, regardless of Include state — the toggle only controls
            payload inclusion on save, never what's visible here. */}
        {renderPreviewModule(
          "Passport",
          "passport",
          <>
            {previewRow("Passport Number", passport.passport_number)}
            {previewRow("Issuing Country", passport.passport_issuing_country)}
            {previewRow("Issue Date", passport.passport_issue_date)}
            {previewRow("Expiry Date", passport.passport_expiry_date)}
            {previewFileRow(
              "Passport Scan",
              passportScan,
              existingPassportScanUrl,
            )}
          </>,
          !sectionsEnabled.passport,
        )}

        {renderPreviewModule(
          "COC",
          "coc",
          <>
            {previewRow("COC Number", coc.coc_number)}
            {previewRow("Assessment Center", coc.coc_assessment_center)}
            {previewRow("Assessment Date", coc.coc_assessment_date)}
            {previewRow("Issue Date", coc.coc_issue_date)}
            {previewRow("Expiry Date", coc.coc_expiry_date)}
          </>,
          !sectionsEnabled.coc,
        )}

        {renderPreviewModule(
          "Medical",
          "medical",
          <>
            {previewRow("Medical Status", medical.medical_status)}
            {previewRow("Medical Center", medical.medical_center)}
            {previewRow("Medical Report Number", medical.medical_report_number)}
            {previewRow("Issue Date", medical.medical_issue_date)}
            {previewRow("Expiry Date", medical.medical_expiry_date)}
          </>,
          !sectionsEnabled.medical,
        )}

        {renderPreviewModule(
          "Emergency Contact",
          "guarantor",
          <>
            {previewRow("Name", guarantor.guarantor_name)}
            {previewRow("Relation", guarantor.relation)}
            {previewRow("Phone", guarantor.guarantor_phone_number)}
            {previewRow("Address", guarantor.guarantor_address)}
          </>,
          !sectionsEnabled.guarantor,
        )}

        {renderPreviewModule(
          "Visa",
          "visa",
          <>
            {previewRow("Visa Number", visa.visa_number)}
            {previewRow("Issue Date", visa.visa_issue_date)}
            {previewRow("Expiry Date", visa.visa_expiry_date)}
            {previewRow("Reference Number", visa.visa_reference_number)}
            {previewRow("Reference Date", visa.visa_reference_date)}
            {previewRow("Issuance Number", visa.issuance_id)}
            {previewRow("Sponsor ID", visa.sponsor_id)}
          </>,
          !sectionsEnabled.visa,
        )}

        {renderPreviewModule(
          "Travel",
          "travel",
          <>
            {previewRow("Ticket Number", travel.ticket_number)}
            {previewRow("Departure Date", travel.departure_date)}
            {previewRow("Arrival Date", travel.arrival_date)}
            {previewRow("Departure Location", travel.departure_location)}
            {previewRow("Arrival Location", travel.arrival_location)}
          </>,
          !sectionsEnabled.travel,
        )}

        {renderPreviewModule(
          "Contract",
          "contract",
          <>
            {previewRow("Employer", contract.employer)}
            {previewRow(
              "Partner",
              partners.find(
                (p) => Number(p.partner_id) === Number(contract.partner_id),
              )?.full_name || contract.partner_id,
            )}
            {previewRow("Start Date", contract.contract_start_date)}
            {previewRow("End Date", contract.contract_end_date)}
            {previewRow("Monthly Salary", contract.monthly_salary)}
            {previewRow("Status", contract.status)}
          </>,
          !sectionsEnabled.contract,
        )}
      </div>
    </div>
  );

  /* ---------------- main render ---------------- */

  if (loadingProfile) {
    return (
      <section className="dashboard-wraper">
        <BackButton onClick={goBack} />
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center text-muted">
          Loading worker data...
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-wraper">
      {/*
        Tree-navigation styling.
        Bootstrap has no built-in "connected tree" nav component, so a small,
        scoped stylesheet is used only for the connector lines / node dots.
        Every color, spacing, and radius token below is the standard
        Bootstrap palette already used elsewhere in this file (primary blue,
        grays, card radii) — nothing here reinvents the design system. The
        same tree is reused, unchanged, for both Create and Edit and for both
        Form Mode and Preview Mode.
      */}
      <style>{`
        .tree-nav-fixed {
          position: fixed;
          background: transparent;
          padding: 0.25rem 0 0.25rem 1.1rem;
          z-index: 5;
          display: flex;
          flex-direction: column;
        }
        .tree-nav-title {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #98a2b3;
          margin-bottom: 1rem;
          padding-left: 2.75rem;
        }
        .tree-nav-list {
          position: relative;
          margin: 0;
          padding: 0;
        }
        .tree-nav-list::before {
          content: "";
          position: absolute;
          left: 15px;
          top: 4px;
          bottom: 4px;
          width: 2px;
          background: #e6e9ee;
        }
        .tree-nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.5rem 0.5rem;
          margin-bottom: 0.15rem;
          border-radius: 0.6rem;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }
        .tree-nav-item:hover {
          background: #f5f7fa;
        }
        .tree-nav-item.active {
          background: rgba(13, 110, 253, 0.08);
        }
        .tree-node-dot {
          position: relative;
          z-index: 1;
          flex: 0 0 auto;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          border: 2px solid #d9dee5;
          color: #8a94a6;
          font-size: 0.78rem;
          font-weight: 700;
          transition: all 0.15s ease;
        }
        .tree-nav-item.active .tree-node-dot {
          border-color: #0d6efd;
          background: #0d6efd;
          color: #fff;
          box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.15);
        }
        .tree-node-label-wrap {
          display: flex;
          flex-direction: column;
          line-height: 1.25;
        }
        .tree-node-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #495057;
        }
        .tree-nav-item.active .tree-node-label {
          color: #0d6efd;
          font-weight: 700;
        }
        .tree-node-badge {
          font-size: 0.65rem;
          color: #adb5bd;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .tree-node-check {
          margin-left: 0.4rem;
          font-weight: 700;
          font-size: 0.8rem;
          line-height: 1;
        }

        .tree-nav-action-wrap {
          padding-right: 1.1rem;
          margin-top: 1.25rem;
        }

        .tree-nav-mobile-wrap {
          padding: 0.25rem 0.25rem 0.5rem;
        }
        .tree-nav-mobile {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
          overflow-x: auto;
          padding: 1rem 0.75rem 0.5rem;
        }
        .tree-nav-mobile::before {
          content: "";
          position: absolute;
          top: 26px;
          left: 0.75rem;
          right: 0.75rem;
          height: 2px;
          background: #e6e9ee;
        }
        .tree-nav-mobile-item {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          flex: 0 0 auto;
          min-width: 68px;
          cursor: pointer;
        }
        .tree-nav-mobile-item .tree-node-dot {
          width: 28px;
          height: 28px;
          font-size: 0.7rem;
        }
        .tree-nav-mobile-item .tree-node-label {
          font-size: 0.7rem;
          white-space: nowrap;
          color: #6c757d;
          font-weight: 500;
        }
        .tree-nav-mobile-item.active .tree-node-label {
          color: #0d6efd;
          font-weight: 700;
        }
        .tree-nav-mobile-action-wrap {
          padding: 0 0.75rem 0.75rem;
        }

        /* keeps sections from hiding under the sticky header when jumped to */
        .section-scroll-anchor {
          scroll-margin-top: 100px;
        }

        .dashboard-wraper input.form-control,
        .dashboard-wraper select.form-control,
        .dashboard-wraper textarea.form-control {
          background-color: #EDF1FB;
        }
      `}</style>

      <BackButton onClick={goBack} />

      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">
          {previewMode
            ? "Worker Preview"
            : isEditMode
              ? "Edit Worker"
              : "Create Worker"}
        </h2>
        <p className="text-muted mb-0">
          {previewMode
            ? "Reviewing the worker profile — use the tree to jump between modules."
            : isEditMode
              ? "Update this worker's information section by section."
              : "Fill in each section to register a new worker."}
        </p>
      </div>

      {/* mobile / small-screen section nav: horizontal connected tree at top,
          plus the primary action button right below it so it stays
          reachable once the tree moves to the top of the page. Hidden while
          reviewing the Preview — the Preview card carries its own action
          button instead. Shared identically between Create and Edit. */}
      {!previewMode && (
        <div className="d-lg-none mb-3">
          <div className="tree-nav-mobile-wrap shadow-sm rounded-4 bg-white">
            <div className="tree-nav-mobile">
              {navItems.map((s, idx) => renderNavItem(s, true, idx))}
            </div>
            <div className="tree-nav-mobile-action-wrap">
              {renderActionButton()}
            </div>
          </div>
        </div>
      )}

      <div className="row">
        {/* main content column — swaps between the editable modules and the
            Worker-Profile-style preview; takes the full width once the tree
            is hidden for Preview. */}
        <div
          className={
            previewMode ? "col-12" : "col-12 col-lg-9 order-2 order-lg-1"
          }
        >
          {!previewMode ? (
            <>{SECTIONS.map((s) => renderSectionCard(s))}</>
          ) : (
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-header bg-white border-0 rounded-4 pt-3 pb-0 d-flex justify-content-between align-items-start"></div>
              <div className="card-body pt-2">{renderPreview()}</div>
            </div>
          )}
        </div>

        {!previewMode && (
          <div
            className="col-lg-3 order-1 order-lg-2 d-none d-lg-block"
            ref={treeNavSpacerRef}
          >
            <div
              className="tree-nav-fixed"
              style={{
                top: "100px",
                left: treeNavRect.left,
                width: treeNavRect.width,
              }}
            >
              <div className="tree-nav-title">Worker Sections</div>
              <ul className="tree-nav-list list-unstyled mb-0">
                {navItems.map((s, idx) => renderNavItem(s, false, idx))}
              </ul>
              <div className="tree-nav-action-wrap">{renderActionButton()}</div>
            </div>
          </div>
        )}
      </div>

      {/* Status assignment modal — same CreateModal + fields shape used by
          WorkerProfile, so the assign UX is identical everywhere. */}
      {isEditMode && (
        <CreateModal
          show={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          onCreate={handleAssignStatus}
          fields={fieldsStatuses}
          title="Assign Status"
          btnLabel="Assign"
        />
      )}
    </section>
  );
}

export default WorkerForm;
