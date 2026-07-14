import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  createComplaint,
  updateComplaint,
  addResolutionAttempts,
  updateComplaintOutcome,
  updateComplaintStatus, // <-- new
} from "../../../api/complaint.api";
import { listWorkers, getWorkerProfile } from "../../../api/worker.api";
// NOTE: getCountries here uses the same { name, page, limit } signature already used in Country.jsx
import { getCountries } from "../../../api/meta.api";
import useloader from "../../../../../context/Loader/useLoader";
import BackButton from "./../../../../../shared/components/BackButton/BackButton";
import useResponse from "../../../../../context/Response/useResponse";

const RESOLUTION_METHODS = [
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "social_media", label: "Social Media" },
  { value: "other", label: "Other" },
];

const SOCIAL_PLATFORMS = [
  "whatsapp",
  "telegram",
  "imo",
  "facebook",
  "instagram",
  "other",
];

const RELIABILITY_LEVELS = ["low", "medium", "high", "confirmed"];

// New: status options, matches complaints.status ENUM
const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "investigating", label: "Investigating" },
  { value: "resolved", label: "Resolved" },
];

const emptyComplainant = () => ({
  full_name: "",
  relationship: "",
  phone_number: "",
});

const emptyAttempt = () => ({
  method: "",
  social_platform: "",
  notes: "",
});

// Different endpoints on this codebase return lists in slightly different
// shapes (bare array, { data: [...] }, { data: { data: [...] } }, etc).
// This normalizes any of those down to a plain array so a shape mismatch
// can never crash a .map() call downstream.
const toArray = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data?.items)) return res.data.items;
  if (Array.isArray(res?.items)) return res.items;
  return [];
};

const ComplaintForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();

  // Edit mode comes in via router state, same pattern used for the user form
  const { isEditMode = false, complaintData = null } = location.state || {};

  // Employee info
  const [employeeFullName, setEmployeeFullName] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);

  // Worker search/autocomplete state
  const [workerSuggestions, setWorkerSuggestions] = useState([]);
  const [showWorkerSuggestions, setShowWorkerSuggestions] = useState(false);
  const [workerSearchLoading, setWorkerSearchLoading] = useState(false);
  const [workerAutofillLoading, setWorkerAutofillLoading] = useState(false);
  const workerBlurTimeout = useRef(null);

  // Destination country (searchable dropdown, submits an id)
  const [countryQuery, setCountryQuery] = useState("");
  const [selectedCountryId, setSelectedCountryId] = useState(null);
  const [countryOptions, setCountryOptions] = useState([]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countryLoading, setCountryLoading] = useState(false);
  const countryBlurTimeout = useRef(null);

  // Complaint info
  const [incidentDescription, setIncidentDescription] = useState("");
  const [informationSource, setInformationSource] = useState("");
  const [informationReliability, setInformationReliability] = useState("");

  // Complainants (one-to-many)
  const [complainants, setComplainants] = useState([emptyComplainant()]);

  // Employer info
  const [employerFullName, setEmployerFullName] = useState("");
  const [employerPhoneNumber, setEmployerPhoneNumber] = useState("");
  const [employerFullAddress, setEmployerFullAddress] = useState("");

  // Resolution info (one-to-many)
  const [attempts, setAttempts] = useState([]);
  const [complaintOutcome, setComplaintOutcome] = useState("");

  // Status (edit mode only — a new complaint always starts as "open" on the backend)
  const [status, setStatus] = useState("open");
  const originalStatusRef = useRef("open");

  // Intake
  const [receivedDate, setReceivedDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const [submitLoading, setSubmitLoading] = useState(false);

  const handleBack = () => navigate(-1);

  // ---------- Prefill in edit mode ----------
  useEffect(() => {
    if (!isEditMode || !complaintData) return;

    setEmployeeFullName(complaintData.employee_full_name || "");
    setSelectedWorkerId(complaintData.worker_id || null);
    setDepartureDate(
      complaintData.departure_date
        ? String(complaintData.departure_date).slice(0, 10)
        : "",
    );
    setIncidentDescription(complaintData.incident_description || "");
    setInformationSource(complaintData.information_source || "");
    setInformationReliability(complaintData.information_reliability || "");

    setComplainants(
      complaintData.complainants?.length
        ? complaintData.complainants.map((c) => ({
            full_name: c.complainant_full_name || c.full_name || "",
            relationship: c.complainant_relationship || c.relationship || "",
            phone_number: c.complainant_phone_number || c.phone_number || "",
          }))
        : [emptyComplainant()],
    );

    setEmployerFullName(complaintData.employer_full_name || "");
    setEmployerPhoneNumber(complaintData.employer_phone_number || "");
    setEmployerFullAddress(complaintData.employer_full_address || "");

    setAttempts(
      (complaintData.resolution_attempts || []).map((a) => ({
        method: a.method || "",
        social_platform: a.social_platform || "",
        notes: a.notes || "",
      })),
    );
    setComplaintOutcome(complaintData.complaint_outcome || "");

    // New: prefill status and remember the original so we only PATCH it if it actually changed
    const initialStatus = complaintData.status || "open";
    setStatus(initialStatus);
    originalStatusRef.current = initialStatus;

    setReceivedDate(
      complaintData.received_date
        ? String(complaintData.received_date).slice(0, 10)
        : new Date().toISOString().slice(0, 10),
    );

    // Destination country may come back as an id + name, or a nested object —
    // adjust the field names below to match your API's actual response shape.
    const countryId =
      complaintData.destination_country_id ||
      complaintData.destination_country?.id ||
      null;
    const countryName =
      complaintData.destination_country_name ||
      complaintData.destination_country?.name ||
      "";
    if (countryId) {
      setSelectedCountryId(countryId);
      setCountryQuery(countryName);
    }
  }, [isEditMode, complaintData]);

  // ---------- Worker search (debounced) ----------
  useEffect(() => {
    if (selectedWorkerId) return; // already linked to a worker, no need to search
    if (!employeeFullName || employeeFullName.trim().length < 2) {
      setWorkerSuggestions([]);
      return;
    }

    setWorkerSearchLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await listWorkers({ search: employeeFullName, limit: 5 });
        setWorkerSuggestions(toArray(res));
        setShowWorkerSuggestions(true);
      } catch {
        setWorkerSuggestions([]);
      } finally {
        setWorkerSearchLoading(false);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [employeeFullName, selectedWorkerId]);

  const handleEmployeeNameChange = (e) => {
    setEmployeeFullName(e.target.value);
    // Typing after a selection unlinks the worker — treat it as a fresh name
    if (selectedWorkerId) setSelectedWorkerId(null);
  };

  const handleSelectWorker = async (worker) => {
    setEmployeeFullName(worker.full_name);
    setSelectedWorkerId(worker.id);
    setWorkerSuggestions([]);
    setShowWorkerSuggestions(false);

    setWorkerAutofillLoading(true);
    try {
      const res = await getWorkerProfile(worker.id);
      const profile = res?.data || res;
      if (!profile) return;

      const latestTravel = profile.travel_records?.[0];
      if (latestTravel?.departure_date) {
        setDepartureDate(String(latestTravel.departure_date).slice(0, 10));
      }
      if (latestTravel?.arrival_location) {
        // The travel record only stores a free-text location (e.g. "riyad"),
        // not a country id — so show it immediately as best-effort text,
        // then try to resolve it against the countries list to get a real id.
        setCountryQuery(latestTravel.arrival_location);
        try {
          const countryRes = await getCountries({
            name: latestTravel.arrival_location,
            page: 1,
            limit: 5,
          });
          const matches = toArray(countryRes);
          if (matches.length > 0) {
            const exactMatch = matches.find(
              (c) =>
                c.name?.toLowerCase() ===
                latestTravel.arrival_location.toLowerCase(),
            );
            const bestMatch = exactMatch || matches[0];
            setSelectedCountryId(bestMatch.id);
            setCountryQuery(bestMatch.name);
          }
        } catch {
          // Lookup failed — leave the free-text value in place, unlinked.
        }
      }

      const latestContract = profile.contracts?.[0];
      if (latestContract?.employer_name) {
        setEmployerFullName(latestContract.employer_name);
      }
      if (latestContract?.employer_phone_number) {
        setEmployerPhoneNumber(latestContract.employer_phone_number);
      }
      if (latestContract?.employer_address) {
        setEmployerFullAddress(latestContract.employer_address);
      }
    } catch (err) {
      addMessage(false, err.message || "Failed to load worker details");
    } finally {
      setWorkerAutofillLoading(false);
    }
  };

  const handleWorkerInputBlur = () => {
    // Small delay so a click on a suggestion registers before the list unmounts
    workerBlurTimeout.current = setTimeout(
      () => setShowWorkerSuggestions(false),
      150,
    );
  };
  useEffect(() => () => clearTimeout(workerBlurTimeout.current), []);

  // ---------- Country search (debounced) ----------
  useEffect(() => {
    setCountryLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await getCountries({
          name: countryQuery,
          page: 1,
          limit: 20,
        });
        setCountryOptions(toArray(res));
      } catch {
        setCountryOptions([]);
      } finally {
        setCountryLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [countryQuery]);

  const handleCountryInputChange = (e) => {
    setCountryQuery(e.target.value);
    setSelectedCountryId(null);
    setShowCountryDropdown(true);
  };

  const handleSelectCountry = (country) => {
    setCountryQuery(country.name);
    setSelectedCountryId(country.id);
    setShowCountryDropdown(false);
  };

  const handleCountryInputBlur = () => {
    countryBlurTimeout.current = setTimeout(
      () => setShowCountryDropdown(false),
      150,
    );
  };
  useEffect(() => () => clearTimeout(countryBlurTimeout.current), []);

  // ---------- Complainant row handlers ----------
  const updateComplainant = (index, field, value) => {
    setComplainants((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    );
  };
  const addComplainantRow = () =>
    setComplainants((prev) => [...prev, emptyComplainant()]);
  const removeComplainantRow = (index) =>
    setComplainants((prev) => prev.filter((_, i) => i !== index));

  // ---------- Resolution attempt row handlers ----------
  const updateAttempt = (index, field, value) => {
    setAttempts((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)),
    );
  };
  const addAttemptRow = () => setAttempts((prev) => [...prev, emptyAttempt()]);
  const removeAttemptRow = (index) =>
    setAttempts((prev) => prev.filter((_, i) => i !== index));

  const removeEmptyFields = (obj) => {
    return Object.fromEntries(
      Object.entries(obj).filter(
        // eslint-disable-next-line no-unused-vars
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );
  };

  const validateFields = () => {
    if (!employeeFullName.trim()) {
      addMessage(false, "Worker full name is required.");
      return false;
    }
    if (!incidentDescription || incidentDescription.trim().length < 10) {
      addMessage(
        false,
        "Please provide a detailed incident description (at least 10 characters).",
      );
      return false;
    }
    if (
      !complainants.length ||
      complainants.some((c) => !c.full_name.trim() || !c.phone_number.trim())
    ) {
      addMessage(
        false,
        "Each complainant needs at least a full name and phone number.",
      );
      return false;
    }
    if (
      attempts.some((a) => a.method === "social_media" && !a.social_platform)
    ) {
      addMessage(
        false,
        "Select a social media platform for each social media attempt.",
      );
      return false;
    }
    if (!receivedDate) {
      addMessage(false, "Received date is required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    setSubmitLoading(true);
    showLoader();
    try {
      const payload = removeEmptyFields({
        employee_full_name: employeeFullName,
        worker_id: selectedWorkerId || undefined,
        departure_date: departureDate || undefined,
        destination_country_id: selectedCountryId || undefined,
        incident_description: incidentDescription,
        information_source: informationSource || undefined,
        information_reliability: informationReliability || undefined,
        employer_full_name: employerFullName || undefined,
        employer_phone_number: employerPhoneNumber || undefined,
        employer_full_address: employerFullAddress || undefined,
        received_date: receivedDate,
      });
      payload.complainants = complainants.map((c) => removeEmptyFields(c));

      const validAttempts = attempts
        .filter((a) => a.method)
        .map((a) => removeEmptyFields(a));

      // In edit mode, the PUT endpoint now does a full replace of resolution
      // attempts as part of the same request — send them inline instead of
      // as a separate call.
      if (isEditMode) {
        payload.resolution_attempts = validAttempts;
      }

      const response =
        isEditMode && complaintData?.id
          ? await updateComplaint(complaintData.id, payload)
          : await createComplaint(payload);

      if (!response.success) {
        addMessage(false, response.message);
        hideLoader();
        return;
      }

      const complaintId = complaintData?.id || response?.data?.id;

      // Create mode only: attach newly-added resolution attempts via the
      // dedicated append endpoint, since createComplaint doesn't accept them.
      if (!isEditMode && complaintId && validAttempts.length > 0) {
        await addResolutionAttempts(complaintId, validAttempts);
      }

      // Attach/update outcome
      if (complaintId && complaintOutcome.trim()) {
        await updateComplaintOutcome(complaintId, complaintOutcome.trim());
      }

      // Edit mode only: push a status change if the user actually changed it
      if (
        isEditMode &&
        complaintId &&
        status &&
        status !== originalStatusRef.current
      ) {
        await updateComplaintStatus(complaintId, status);
      }

      addMessage(true, response.message);
      navigate(-1);
    } catch (error) {
      addMessage(false, error.message);
    } finally {
      setSubmitLoading(false);
      hideLoader();
    }
  };

  return (
    <div className="dashboard-wraper">
      <div className="form-submit">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h2 className="fw-bold text-dark mb-2">
              {isEditMode ? "Edit Complaint" : "Log Complaint"}
            </h2>
            <p className="text-muted">
              {isEditMode
                ? "Update this complaint's details."
                : "Record a complaint against an employer on behalf of a worker."}
            </p>
          </div>
          <BackButton onClick={handleBack} />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="submit-section">
            {/* Employee Information */}
            <h5 className="fw-bold mb-3">Worker Information</h5>
            <div className="row">
              <div className="form-group col-md-6 mb-3 position-relative">
                <label>
                  Worker Full Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={employeeFullName}
                  required
                  autoComplete="off"
                  onChange={handleEmployeeNameChange}
                  onFocus={() => {
                    if (workerSuggestions.length > 0)
                      setShowWorkerSuggestions(true);
                  }}
                  onBlur={handleWorkerInputBlur}
                  placeholder="Start typing to search existing workers…"
                />
                {selectedWorkerId && (
                  <small className="text-success d-block mt-1 ">
                    {workerAutofillLoading ? " — loading details…" : ""}
                  </small>
                )}
                {showWorkerSuggestions && (
                  <ul
                    className="list-group position-absolute w-100 pe-4"
                    style={{
                      zIndex: 20,
                      maxHeight: "220px",
                      overflowY: "auto",
                    }}
                  >
                    {workerSearchLoading && (
                      <li className="list-group-item text-muted small">
                        Searching…
                      </li>
                    )}
                    {!workerSearchLoading && workerSuggestions.length === 0 && (
                      <li className="list-group-item text-muted small">
                        No matching workers — this will be logged as a new,
                        unlinked employee.
                      </li>
                    )}
                    {(Array.isArray(workerSuggestions)
                      ? workerSuggestions
                      : []
                    ).map((worker) => (
                      <li
                        key={worker.id}
                        className="list-group-item list-group-item-action"
                        style={{ cursor: "pointer" }}
                        // onMouseDown (not onClick) fires before the input's onBlur
                        onMouseDown={() => handleSelectWorker(worker)}
                      >
                        <span className="fw-bold">{worker.full_name}</span>
                        {worker.phone_number && (
                          <span className="text-muted ms-2 small">
                            {worker.phone_number}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="form-group col-md-3 mb-3">
                <label>Departure Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                />
              </div>
              <div className="form-group col-md-3 mb-3 position-relative">
                <label>Destination Country</label>
                <input
                  type="text"
                  className="form-control"
                  value={countryQuery}
                  autoComplete="off"
                  onChange={handleCountryInputChange}
                  onFocus={() => setShowCountryDropdown(true)}
                  onBlur={handleCountryInputBlur}
                  placeholder="Search country…"
                />
                {showCountryDropdown && (
                  <ul
                    className="list-group position-absolute w-100 pe-4"
                    style={{
                      zIndex: 20,
                      maxHeight: "220px",
                      overflowY: "auto",
                    }}
                  >
                    {countryLoading && (
                      <li className="list-group-item text-muted small">
                        Searching…
                      </li>
                    )}
                    {!countryLoading && countryOptions.length === 0 && (
                      <li className="list-group-item text-muted small">
                        No countries found
                      </li>
                    )}
                    {(Array.isArray(countryOptions) ? countryOptions : []).map(
                      (country) => (
                        <li
                          key={country.id}
                          className="list-group-item list-group-item-action"
                          style={{ cursor: "pointer" }}
                          onMouseDown={() => handleSelectCountry(country)}
                        >
                          {country.name}
                        </li>
                      ),
                    )}
                  </ul>
                )}
              </div>
            </div>

            {/* Complaint Information */}
            <h5 className="fw-bold mb-3 mt-2">Complaint Information</h5>
            <div className="row">
              <div className="form-group col-md-12 mb-3">
                <label>
                  Detailed Description of the Incident{" "}
                  <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={incidentDescription}
                  required
                  onChange={(e) => setIncidentDescription(e.target.value)}
                />
              </div>
              <div className="form-group col-md-6 mb-3">
                <label>Information Source</label>
                <input
                  type="text"
                  className="form-control"
                  value={informationSource}
                  onChange={(e) => setInformationSource(e.target.value)}
                  placeholder="e.g. relative call, colleague, agency staff"
                />
              </div>
              <div className="form-group col-md-6 mb-3">
                <label>Information Reliability</label>
                <select
                  className="form-control"
                  value={informationReliability}
                  onChange={(e) => setInformationReliability(e.target.value)}
                >
                  <option value="">Select reliability</option>
                  {RELIABILITY_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Complainant Information */}
            <div className="d-flex justify-content-between align-items-center mt-2">
              <h5 className="fw-bold mb-3">Complainant Information</h5>
              <button
                type="button"
                className="btn btn-sm btn-outline-main"
                onClick={addComplainantRow}
              >
                + Add Complainant
              </button>
            </div>
            {complainants.map((c, index) => (
              <div className="row align-items-end" key={index}>
                <div className="form-group col-md-4 mb-3">
                  <label>
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={c.full_name}
                    required
                    onChange={(e) =>
                      updateComplainant(index, "full_name", e.target.value)
                    }
                  />
                </div>
                <div className="form-group col-md-4 mb-3">
                  <label>Relationship to Worker</label>
                  <input
                    type="text"
                    className="form-control"
                    value={c.relationship}
                    onChange={(e) =>
                      updateComplainant(index, "relationship", e.target.value)
                    }
                    placeholder="e.g. sister, husband, friend"
                  />
                </div>
                <div className="form-group col-md-3 mb-3">
                  <label>
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={c.phone_number}
                    required
                    onChange={(e) =>
                      updateComplainant(index, "phone_number", e.target.value)
                    }
                  />
                </div>
                <div className="form-group col-md-1 mb-3">
                  {complainants.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeComplainantRow(index)}
                    >
                      &times;
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Employer Information */}
            <h5 className="fw-bold mb-3 mt-2">Employer Information</h5>
            <div className="row">
              <div className="form-group col-md-4 mb-3">
                <label>Employer Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={employerFullName}
                  onChange={(e) => setEmployerFullName(e.target.value)}
                />
              </div>
              <div className="form-group col-md-4 mb-3">
                <label>Employer Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={employerPhoneNumber}
                  onChange={(e) => setEmployerPhoneNumber(e.target.value)}
                />
              </div>
              <div className="form-group col-md-4 mb-3">
                <label>Employer Full Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={employerFullAddress}
                  onChange={(e) => setEmployerFullAddress(e.target.value)}
                />
              </div>
            </div>

            {/* Resolution Information */}
            <div className="d-flex justify-content-between align-items-center mt-2">
              <h5 className="fw-bold mb-3">Resolution Information</h5>
              <button
                type="button"
                className="btn btn-sm btn-outline-main"
                onClick={addAttemptRow}
              >
                + Add Resolution Attempt
              </button>
            </div>
            {attempts.map((a, index) => (
              <div className="row align-items-end" key={index}>
                <div className="form-group col-md-3 mb-3">
                  <label>Method Attempted</label>
                  <select
                    className="form-control"
                    value={a.method}
                    onChange={(e) =>
                      updateAttempt(index, "method", e.target.value)
                    }
                  >
                    <option value="">Select method</option>
                    {RESOLUTION_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                {a.method === "social_media" && (
                  <div className="form-group col-md-3 mb-3">
                    <label>Platform</label>
                    <select
                      className="form-control"
                      value={a.social_platform}
                      onChange={(e) =>
                        updateAttempt(index, "social_platform", e.target.value)
                      }
                    >
                      <option value="">Select platform</option>
                      {SOCIAL_PLATFORMS.map((p) => (
                        <option key={p} value={p}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="form-group col-md-5 mb-3">
                  <label>Notes</label>
                  <input
                    type="text"
                    className="form-control"
                    value={a.notes}
                    onChange={(e) =>
                      updateAttempt(index, "notes", e.target.value)
                    }
                  />
                </div>
                <div className="form-group col-md-1 mb-3">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeAttemptRow(index)}
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
            <div className="row">
              <div className="form-group col-md-12 mb-3">
                <label>Complaint Outcome</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={complaintOutcome}
                  onChange={(e) => setComplaintOutcome(e.target.value)}
                  placeholder="Optional — can also be filled in later"
                />
              </div>
            </div>

            {/* Status — edit mode only; a new complaint always starts as "open" */}
            {isEditMode && (
              <>
                <h5 className="fw-bold mb-3 mt-2">Complaint Status</h5>
                <div className="row">
                  <div className="form-group col-md-4 mb-3">
                    <label>Status</label>
                    <select
                      className="form-control"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Complaint Intake */}
            <h5 className="fw-bold mb-3 mt-2">Complaint Intake</h5>
            <div className="row">
              <div className="form-group col-md-4 mb-3">
                <label>
                  Date Received <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={receivedDate}
                  required
                  onChange={(e) => setReceivedDate(e.target.value)}
                />
              </div>
            </div>

            {/* Submit */}
            <div className="form-group col-lg-12 text-start mt-4">
              <button
                type="submit"
                className="btn btn-main px-4 rounded"
                disabled={submitLoading}
              >
                {isEditMode ? "Update Complaint" : "Submit Complaint"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;
