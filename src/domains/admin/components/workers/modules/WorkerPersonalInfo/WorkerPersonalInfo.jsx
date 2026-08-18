/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  createPersonalInfo,
  updatePersonalInfo,
} from "../../../../api/worker.api";
import { getWorkerStatuses } from "../../../../api/meta.api";
import useloader from "../../../../../../context/Loader/useLoader";
import useResponse from "../../../../../../context/Response/useResponse";
import BackButton from "../../../../../../shared/components/BackButton/BackButton";

// helper function
const renderLabel = (text, required = false) => {
  return (
    <label>
      {text} {required && <span className="text-danger">*</span>}
    </label>
  );
};

function WorkerPersonalInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();

  // Check each field in the existing personal info object to determine if it's edit mode
  const existingPersonal = location.state?.personal || null;

  // Returns true only if existingPersonal exists AND has at least one non-null value
  const isEditMode = Boolean(
    existingPersonal &&
    Object.values(existingPersonal).some((value) => value !== null),
  );
  const isCreate = !isEditMode;

  const [statuses, setStatuses] = useState([]);

  // CHANGED: region/wereda/city/subcity are now free-text columns on
  // workers_personal_information (no more regions/weredas/cities/subcities
  // lookup tables), so these come straight off existingPersonal as strings
  // instead of existingPersonal.region.id / .name objects.
  const [formData, setFormData] = useState({
    region: existingPersonal?.region || "",
    wereda: existingPersonal?.wereda || "",
    city: existingPersonal?.city || "",
    subcity: existingPersonal?.subcity || "",
    status_id: existingPersonal?.status?.id
      ? Number(existingPersonal.status.id)
      : "",
    sex: existingPersonal?.sex
      ? existingPersonal.sex.charAt(0).toUpperCase() +
        existingPersonal.sex.slice(1).toLowerCase()
      : "",
    date_of_birth: existingPersonal?.date_of_birth || "",
    place_of_birth: existingPersonal?.place_of_birth || "",
    religion: existingPersonal?.religion || "",
    marital_status: existingPersonal?.marital_status || "",
    nationality: existingPersonal?.nationality || "Ethiopian",
    address: existingPersonal?.address || "",
    education: existingPersonal?.education || "",
    number_of_children: existingPersonal?.number_of_children || 0,
    height_cm: existingPersonal?.height_cm || "",
    weight_kg: existingPersonal?.weight_kg || "",
    national_id_number: existingPersonal?.national_id_number || "",
  });

  const [photo3x4, setPhoto3x4] = useState(null);
  const [photoStanding, setPhotoStanding] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const goBack = () => navigate(-1);

  // Load statuses
  useEffect(() => {
    const loadStatuses = async () => {
      showLoader();
      try {
        const res = await getWorkerStatuses();
        setStatuses(res.data || []);
      } catch (err) {
        addMessage(false, err.message || "Failed to load statuses");
      } finally {
        hideLoader();
      }
    };
    loadStatuses();
  }, []);

  useEffect(() => {
    if (isEditMode && existingPersonal?.status?.id) {
      setFormData((prev) => ({
        ...prev,
        status_id: Number(existingPersonal.status.id),
      }));
    }
  }, [isEditMode, existingPersonal?.status_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // CHANGED: region/woreda/city/subcity are now free text, not FK ids —
    // dropped from numericFields.
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

    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (!files?.[0]) return;
    if (name === "photo_3x4_url") setPhoto3x4(files[0]);
    if (name === "photo_standing_url") setPhotoStanding(files[0]);
  };

  const isOnlyAlphabetsAndSpaces = (value) => {
    if (!value || value.trim() === "") return true;
    return /^[A-Za-z\s]+$/.test(value.trim());
  };

  const educationRegex = /^[A-Za-z\s.]+$/;

  const validatePersonalInfo = () => {
    if (!["Male", "Female"].includes(formData.sex))
      return "Sex must be Male or Female";

    // CHANGED: region/city are now free text — validated like the other
    // text fields (letters/spaces, max length) instead of as positive
    // integer FK ids.
    if (
      formData.region &&
      (formData.region.length > 100 ||
        !isOnlyAlphabetsAndSpaces(formData.region))
    )
      return "Region must contain only letters and spaces (max 100 chars)";

    if (
      formData.wereda &&
      (formData.wereda.length > 100 ||
        !isOnlyAlphabetsAndSpaces(formData.wereda))
    )
      return "Wereda must contain only letters and spaces (max 100 chars)";

    if (
      formData.city &&
      (formData.city.length > 100 || !isOnlyAlphabetsAndSpaces(formData.city))
    )
      return "City must contain only letters and spaces (max 100 chars)";

    if (
      formData.subcity &&
      (formData.subcity.length > 100 ||
        !isOnlyAlphabetsAndSpaces(formData.subcity))
    )
      return "Sub-city must contain only letters and spaces (max 100 chars)";

    if (formData.date_of_birth) {
      const dob = new Date(formData.date_of_birth);
      if (isNaN(dob.getTime())) return "Date of birth must be valid";
      if (dob >= new Date()) return "Date of birth must be in the past";
    }

    if (
      formData.place_of_birth &&
      (formData.place_of_birth.length > 100 ||
        !isOnlyAlphabetsAndSpaces(formData.place_of_birth))
    )
      return "Place of birth must contain only letters and spaces (max 100 chars)";

    if (
      formData.religion &&
      (formData.religion.length > 50 ||
        !isOnlyAlphabetsAndSpaces(formData.religion))
    )
      return "Religion must contain only letters and spaces (max 50 chars)";

    if (
      formData.marital_status &&
      !["Single", "Married", "Divorced", "Widowed"].includes(
        formData.marital_status,
      )
    )
      return "Marital status must be Single, Married, Divorced, or Widowed";

    if (formData.nationality && !isOnlyAlphabetsAndSpaces(formData.nationality))
      return "Nationality must contain only letters and spaces";

    if (formData.address && formData.address.length > 500)
      return "Address must be at most 500 characters";

    if (
      formData.education &&
      (formData.education.length > 100 ||
        !educationRegex.test(formData.education))
    )
      return "Education must contain only letters, spaces, and dots (max 100 chars)";

    if (
      formData.number_of_children !== "" &&
      (!Number.isInteger(formData.number_of_children) ||
        formData.number_of_children < 0)
    )
      return "Number of children must be 0 or a positive integer";

    if (
      formData.height_cm !== "" &&
      (formData.height_cm < 100 || formData.height_cm > 250)
    )
      return "Height must be between 100 and 250 cm";

    if (
      formData.weight_kg !== "" &&
      (formData.weight_kg < 30 || formData.weight_kg > 200)
    )
      return "Weight must be between 30 and 200 kg";

    if (!isEditMode) {
      if (!photo3x4) return "Photo 3x4 is required";
      if (!photoStanding) return "Photo Standing is required";
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (photo3x4 && !allowedTypes.includes(photo3x4.type))
      return "Photo 3x4 must be JPEG or PNG";
    if (photoStanding && !allowedTypes.includes(photoStanding.type))
      return "Photo Standing must be JPEG or PNG";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validatePersonalInfo();
    if (error) return addMessage(false, error);

    setSubmitLoading(true);
    showLoader();

    try {
      const dataToSend = new FormData();

      // Append all fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== "" && value !== null) {
          dataToSend.append(key, value);
        }
      });

      if (photo3x4 instanceof File)
        dataToSend.append("photo_3x4_url", photo3x4);
      if (photoStanding instanceof File)
        dataToSend.append("photo_standing_url", photoStanding);

      const response = isEditMode
        ? await updatePersonalInfo(id, dataToSend)
        : await createPersonalInfo(id, dataToSend);

      addMessage(
        response?.success,
        response?.message ||
          (isEditMode
            ? "Personal information updated successfully"
            : "Personal information added successfully"),
      );

      goBack();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      setSubmitLoading(false);
      hideLoader();
    }
  };

  const title = isEditMode
    ? "Edit Personal Information"
    : "Add Personal Information";
  const buttonText = isEditMode ? "Update Personal " : "Add Personal ";

  return (
    <section className="dashboard-wraper">
      <BackButton onClick={goBack} />

      <form className="form-submit" onSubmit={handleSubmit}>
        <h2 className="fw-bold text-dark mb-3">{title}</h2>

        <div className="row">
          {/* Sex */}
          <div className="form-group col-md-6">
            {renderLabel("Sex", isCreate)}
            <select
              name="sex"
              className="form-control"
              value={formData.sex}
              onChange={handleChange}
              required
            >
              <option value="">Select sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {/* Worker Status */}
          {!isEditMode && (
            <div className="form-group col-md-6">
              {renderLabel("Status", isCreate)}
              {statuses.length === 0 ? (
                <div className="form-control text-muted">
                  Loading statuses...
                </div>
              ) : (
                <select
                  name="status_id"
                  className="form-control"
                  value={formData.status_id}
                  onChange={handleChange}
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
            </div>
          )}

          {/* Region */}
          {/* CHANGED: was a Region dropdown backed by getRegions(); region
              is now a free-text column, so this is a plain text input. */}
          <div className="form-group col-md-6">
            {renderLabel("Region", isCreate)}
            <input
              type="text"
              name="region"
              className="form-control"
              value={formData.region}
              onChange={handleChange}
              required={isCreate}
            />
          </div>

          {/* Woreda */}
          {/* CHANGED: was a cascading Woreda dropdown; now free text. */}
          <div className="form-group col-md-6">
            <label>Woreda</label>
            <input
              type="text"
              name="wereda"
              className="form-control"
              value={formData.wereda}
              onChange={handleChange}
            />
          </div>

          {/* City */}
          {/* CHANGED: was a cascading City dropdown; now free text. */}
          <div className="form-group col-md-6">
            <label>City</label>
            <input
              type="text"
              name="city"
              className="form-control"
              value={formData.city}
              onChange={handleChange}
            />
          </div>

          {/* Sub-City */}
          {/* CHANGED: was a cascading Sub-City dropdown; now free text. */}
          <div className="form-group col-md-6">
            <label>Sub-City</label>
            <input
              type="text"
              name="subcity"
              className="form-control"
              value={formData.subcity}
              onChange={handleChange}
            />
          </div>

          {/* Date of Birth */}
          <div className="form-group col-md-6">
            <label>Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              className="form-control"
              value={formData.date_of_birth}
              onChange={handleChange}
            />
          </div>

          {/* Place of Birth */}
          <div className="form-group col-md-6">
            <label>Place of Birth</label>
            <input
              type="text"
              name="place_of_birth"
              className="form-control"
              value={formData.place_of_birth}
              onChange={handleChange}
            />
          </div>

          {/* Religion */}
          <div className="form-group col-md-6">
            <label>Religion</label>
            <input
              type="text"
              name="religion"
              className="form-control"
              value={formData.religion}
              onChange={handleChange}
            />
          </div>

          {/* Marital Status */}
          <div className="form-group col-md-6">
            <label>Marital Status</label>
            <select
              name="marital_status"
              className="form-control"
              value={formData.marital_status}
              onChange={handleChange}
            >
              <option value="">Select status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>

          {/* Nationality */}
          <div className="form-group col-md-6">
            <label>Nationality</label>
            <input
              type="text"
              name="nationality"
              className="form-control"
              value={formData.nationality}
              onChange={handleChange}
            />
          </div>

          {/* Address */}
          <div className="form-group col-md-6">
            <label>Address</label>
            <input
              type="text"
              name="address"
              className="form-control"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          {/* Education */}
          <div className="form-group col-md-6">
            <label>Education</label>
            <input
              type="text"
              name="education"
              className="form-control"
              value={formData.education}
              onChange={handleChange}
            />
          </div>

          {/* Number of Children */}
          <div className="form-group col-md-6">
            <label>Number of Children</label>
            <input
              type="number"
              name="number_of_children"
              className="form-control"
              value={formData.number_of_children}
              onChange={handleChange}
              min="0"
            />
          </div>

          {/* Height */}
          <div className="form-group col-md-6">
            <label>Height (cm)</label>
            <input
              type="number"
              name="height_cm"
              className="form-control"
              value={formData.height_cm}
              onChange={handleChange}
              step="0.01"
            />
          </div>

          {/* Weight */}
          <div className="form-group col-md-6">
            <label>Weight (kg)</label>
            <input
              type="number"
              name="weight_kg"
              className="form-control"
              value={formData.weight_kg}
              onChange={handleChange}
              step="0.01"
            />
          </div>

          {/* Photo 3x4 */}
          <div className="form-group col-md-6">
            {renderLabel("Photo 3x4", isCreate)}
            <input
              type="file"
              name="photo_3x4_url"
              accept="image/*"
              className="form-control"
              onChange={handleFileChange}
              required={!isEditMode}
            />

            <label>
              {isEditMode && existingPersonal?.photo_3x4?.url && !photo3x4 && (
                <small className="d-block text-muted">
                  Current photo:{" "}
                  <a
                    href={existingPersonal.photo_3x4.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </a>
                </small>
              )}
            </label>
          </div>

          {/* Photo Standing */}
          <div className="form-group col-md-6">
            {renderLabel("Photo Standing", isCreate)}
            <input
              type="file"
              name="photo_standing_url"
              accept="image/*"
              className="form-control"
              onChange={handleFileChange}
              required={!isEditMode}
            />

            <label>
              {isEditMode &&
                existingPersonal?.photo_standing?.url &&
                !photoStanding && (
                  <small className="d-block text-muted">
                    Current photo:{" "}
                    <a
                      href={existingPersonal.photo_standing.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  </small>
                )}
            </label>
          </div>

          {/* National ID Number */}
          {/* CHANGED: National ID Scan file field removed — 
              workers_personal_information only has national_id_number now,
              there is no national_id_scan_url/public_id/resource_type
              column to upload a scan into. */}
          <div className="form-group col-md-6">
            <label>National ID Number</label>
            <input
              type="text"
              name="national_id_number"
              className="form-control"
              value={formData.national_id_number}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="submit-section">
          <button
            type="submit"
            className="btn btn-main px-4 rounded"
            disabled={submitLoading}
          >
            {buttonText}
          </button>
        </div>
      </form>
    </section>
  );
}

export default WorkerPersonalInfo;
