import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  createPersonalInfo,
  updatePersonalInfo,
} from "../../../../api/worker.api";
import {
  getRegions,
  getCities,
  getWorkerStatuses,
} from "../../../../api/meta.api";
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

  // Receive the raw personal object — same pattern as LMIS / Passport
  const existingPersonal = location.state?.personal || null;
  const isEditMode = Boolean(existingPersonal);
  const isCreate = !isEditMode;

  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [formData, setFormData] = useState({
    region_id: existingPersonal?.region?.id
      ? Number(existingPersonal.region.id)
      : "",
    city_id: existingPersonal?.city?.id ? Number(existingPersonal.city.id) : "",
    status_id: existingPersonal?.status?.id
      ? Number(existingPersonal.status.id)
      : "",
    sex: existingPersonal?.sex || "",
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
  });

  const [photo3x4, setPhoto3x4] = useState(null);
  const [photoStanding, setPhotoStanding] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const goBack = () => navigate(-1);

  // Load regions
  useEffect(() => {
    const loadRegions = async () => {
      showLoader();
      try {
        const res = await getRegions();
        setRegions(res.data || []);
      } catch (err) {
        addMessage(false, err.message || "Failed to load regions");
      } finally {
        hideLoader();
      }
    };
    loadRegions();
  }, []);

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

  // Load cities when region changes
  useEffect(() => {
    const regionId = Number(formData.region_id);
    if (!regionId) return setCities([]);

    const loadCities = async () => {
      showLoader();
      try {
        const res = await getCities({ region_id: regionId });
        setCities(Array.isArray(res) ? res : res?.data || []);
      } catch (err) {
        addMessage(false, err.message || "Failed to load cities");
        setCities([]);
      } finally {
        hideLoader();
      }
    };
    loadCities();
  }, [formData.region_id]);

  // Preload cities in edit mode
  useEffect(() => {
    if (isEditMode && existingPersonal?.region?.id) {
      const loadInitialCities = async () => {
        showLoader();
        try {
          const res = await getCities({
            region_id: Number(existingPersonal.region.id),
          });
          setCities(Array.isArray(res) ? res : res?.data || []);
        } catch (err) {
          addMessage(false, err.message || "Failed to load saved cities");
          setCities([]);
        } finally {
          hideLoader();
        }
      };
      loadInitialCities();
    }
  }, [isEditMode, existingPersonal?.region?.id]);

  // Add this after the other useEffects
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
    setFormData((prev) => ({
      ...prev,
      [name]: [
        "region_id",
        "city_id",
        "status_id",
        "number_of_children",
        "height_cm",
        "weight_kg",
      ].includes(name)
        ? value
          ? Number(value)
          : ""
        : value,
    }));
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

    if (
      formData.region_id &&
      (!Number.isInteger(formData.region_id) || formData.region_id <= 0)
    )
      return "Region must be a positive integer";
    if (
      formData.city_id &&
      (!Number.isInteger(formData.city_id) || formData.city_id <= 0)
    )
      return "City must be a positive integer";

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
    : "Personal Information";
  const buttonText = isEditMode
    ? "Update Personal Information"
    : "Add Personal Information";

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
              {renderLabel("Sex", isCreate)}
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
          <div className="form-group col-md-6">
            {renderLabel("Region", isCreate)}
            {regions.length === 0 ? (
              <div className="form-control text-muted">Loading regions...</div>
            ) : (
              <select
                name="region_id"
                className="form-control"
                value={formData.region_id}
                onChange={handleChange}
                required
              >
                <option value="">Select region</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* City */}
          <div className="form-group col-md-6">
            <label>City</label>
            <select
              name="city_id"
              className="form-control"
              value={formData.city_id}
              onChange={handleChange}
              disabled={!formData.region_id}
            >
              <option value="">
                {formData.region_id ? "Select city" : "Select region first"}
              </option>
              {cities.length > 0 &&
                cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
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
              {isEditMode ? "" : <span className="text-danger">*</span>}
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
              {isEditMode ? "" : <span className="text-danger">*</span>}
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
        </div>

        <div className="submit-section mt-4">
          <button
            type="submit"
            className="btn btn-main px-5 rounded"
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
