/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createPersonalInfo } from "../../../../api/worker.api";
import {
  getRegions,
  getCities,
  getWorkerStatuses,
} from "../../../../api/meta.api"; // ← added getWorkerStatuses
import useloader from "../../../../../../context/Loader/useLoader";
import useResponse from "../../../../../../context/Response/useResponse";
import BackButton from "../../../../../../shared/components/BackButton/BackButton";

function WorkerPersonalInfo() {
  const Navigate = useNavigate();
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();
  const { id } = useParams(); // worker ID

  const [regions, setRegions] = useState([]);
  const [regionsError] = useState(null);
  const [cities, setCities] = useState([]);
  const [statuses, setStatuses] = useState([]); // ← new: for worker statuses

  const [formData, setFormData] = useState({
    region_id: "",
    city_id: "",
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
    sex: "",
    status_id: "",
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const [photo3x4, setPhoto3x4] = useState(null);
  const [photoStanding, setPhotoStanding] = useState(null);

  // Go back to previous page
  const goBack = () => {
    Navigate(-1);
  };

  // Load regions
  useEffect(() => {
    const loadRegions = async () => {
      showLoader();
      try {
        const regions = await getRegions();
        setRegions(regions.data || []);
      } catch (err) {
        setRegions([]);
        addMessage(false, err.message);
      } finally {
        hideLoader();
      }
    };
    loadRegions();
  }, []);

  // Load worker statuses (just like in registration)
  useEffect(() => {
    const loadStatuses = async () => {
      showLoader();
      try {
        const response = await getWorkerStatuses();
        setStatuses(response.data || []);
      } catch (err) {
        setStatuses([]);
        addMessage(false, err.message);
      } finally {
        hideLoader();
      }
    };
    loadStatuses();
  }, []);

  // Load cities when region changes
  useEffect(() => {
    const regionId = Number(formData.region_id);

    const loadCities = async () => {
      showLoader();
      try {
        const response = await getCities({ region_id: regionId });

        // Force array
        const cityList = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];
        setCities(cityList);
      } catch (err) {
        addMessage(false, err.message);
        setCities([]);
      } finally {
        hideLoader();
      }
    };

    loadCities();
  }, [formData.region_id]);

  // Handle text/select changes
  const handleTextChange = (e) => {
    const { name, value } = e.target;

    // For ID fields
    if (name === "region_id" || name === "city_id" || name === "status_id") {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? Number(value) : "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle number inputs (allow empty string for optional)
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? "" : Number(value),
    }));
  };

  // Handle file inputs
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (!files?.[0]) return;
    if (name === "photo_3x4_url") setPhoto3x4(files[0]);
    if (name === "photo_standing_url") setPhotoStanding(files[0]);
  };

  const nameRegex = /^[A-Za-z\s]+$/;

  const educationRegex = /^[A-Za-z\s.]+$/;

  const isOnlyAlphabetsAndSpaces = (value) => {
    if (!value || value.trim() === "") return true;
    return nameRegex.test(value.trim());
  };
  // Frontend validation
  const validatePersonalInfo = (data) => {
    if (!["Male", "Female"].includes(data.sex)) {
      return "Sex must be Male or Female";
    }


    // region_id (optional but valid if provided)
    if (data.region_id && data.region_id !== "") {
      const v = Number(data.region_id);
      if (!Number.isInteger(v) || v <= 0)
        return "Region must be a positive integer";
    }

    // city_id (optional but valid if provided)
    if (data.city_id && data.city_id !== "") {
      const v = Number(data.city_id);
      if (!Number.isInteger(v) || v <= 0)
        return "City must be a positive integer";
    }

    // date_of_birth
    if (data.date_of_birth) {
      const dob = new Date(data.date_of_birth);
      if (isNaN(dob.getTime())) return "Date of birth must be a valid date";
      if (dob >= new Date()) return "Date of birth must be in the past";
    }

    // place_of_birth
    if (data.place_of_birth && data.place_of_birth.trim().length > 100) {
      return "Place of birth must be at most 100 characters";
    } else if (
      data.place_of_birth &&
      !isOnlyAlphabetsAndSpaces(data.place_of_birth)
    ) {
      return "Place of birth must contain only letters and spaces";
    }

    // religion
    if (data.religion && data.religion.trim().length > 50) {
      return "Religion must be at most 50 characters";
    } else if (data.religion && !isOnlyAlphabetsAndSpaces(data.religion)) {
      return "Religion must contain only letters and spaces";
    }

    // marital_status
    if (data.marital_status) {
      const allowed = ["Single", "Married", "Divorced", "Widowed"];
      if (!allowed.includes(data.marital_status)) {
        return "Marital status must be Single, Married, Divorced, or Widowed";
      }
    }

    // nationality
    if (data.nationality && !isOnlyAlphabetsAndSpaces(data.nationality)) {
      return "Nationality must contain only letters and spaces";
    }

    // address
    if (data.address && data.address.trim().length > 500) {
      return "Address must be at most 500 characters";
    }

    // education
    if (data.education && data.education.trim().length > 100) {
      return "Education must be at most 100 characters";
    } else if (data.education && !educationRegex.test(data.education.trim())) {
      return "Education must contain only letters, spaces, and dots";
    }

    // number_of_children
    if (data.number_of_children !== "" && data.number_of_children !== null) {
      const v = Number(data.number_of_children);
      if (!Number.isInteger(v) || v < 0) {
        return "Number of children must be 0 or a positive integer";
      }
    }

    // validate only if provided
    if (
      data.height_cm !== "" &&
      data.height_cm !== null &&
      data.height_cm !== undefined
    ) {
      const h = Number(data.height_cm);
      if (isNaN(h) || h < 100 || h > 250) {
        return "Height must be between 100 and 250 cm";
      }
    }

    // validate only if provided
    if (
      data.weight_kg !== "" &&
      data.weight_kg !== null &&
      data.weight_kg !== undefined
    ) {
      const w = Number(data.weight_kg);
      if (isNaN(w) || w < 30 || w > 200) {
        return "Weight must be between 30 and 200 kg";
      }
    }
    // Photos (required)
    if (!photo3x4) return "Photo 3x4 is required";
    if (!photoStanding) return "Photo Standing is required";

    // File type check
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (photo3x4 && !allowedTypes.includes(photo3x4.type)) {
      return "Photo 3x4 must be a JPEG or PNG image";
    }
    if (photoStanding && !allowedTypes.includes(photoStanding.type)) {
      return "Photo Standing must be a JPEG, JPG or PNG image";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validatePersonalInfo(formData);
    if (error) {
      addMessage(false, error);
      return;
    }

    setSubmitLoading(true);
    showLoader();

    try {
      const dataToSend = new FormData();

      // Only append fields if they have values (prevents '' issues)
      if (formData.sex) dataToSend.append("sex", formData.sex);
      if (formData.status_id)
        dataToSend.append("status_id", formData.status_id);
      if (formData.region_id)
        dataToSend.append("region_id", formData.region_id);
      if (formData.city_id) dataToSend.append("city_id", formData.city_id);
      if (formData.date_of_birth)
        dataToSend.append("date_of_birth", formData.date_of_birth);
      if (formData.place_of_birth)
        dataToSend.append("place_of_birth", formData.place_of_birth);
      if (formData.religion) dataToSend.append("religion", formData.religion);
      if (formData.marital_status)
        dataToSend.append("marital_status", formData.marital_status);
      dataToSend.append("nationality", formData.nationality || "Ethiopian");
      if (formData.address) dataToSend.append("address", formData.address);
      if (formData.education)
        dataToSend.append("education", formData.education);
      if (formData.number_of_children !== "") {
        dataToSend.append("number_of_children", formData.number_of_children);
      }
      dataToSend.append("height_cm", formData.height_cm);
      dataToSend.append("weight_kg", formData.weight_kg);

      // Files (required)
      if (photo3x4 instanceof File)
        dataToSend.append("photo_3x4_url", photo3x4);
      if (photoStanding instanceof File)
        dataToSend.append("photo_standing_url", photoStanding);

      const response = await createPersonalInfo(id, dataToSend);

      addMessage(
        response?.success,
        response?.message || "Personal information added successfully",
      );

      // Reset form
      setFormData({
        region_id: "",
        city_id: "",
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
        sex: "",
        status_id: "",
      });
      setPhoto3x4(null);
      setPhotoStanding(null);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      setSubmitLoading(false);
      hideLoader();
    }
  };

  return (
    <section className="dashboard-wraper">
      <div className="row">
        <div className="col-lg-12 col-md-12">
          <BackButton onClick={goBack} />
          <form className="form-submit" onSubmit={handleSubmit}>
            <h2 className="fw-bold text-dark mb-1">
              Worker Personal Information
            </h2>
            <div className="submit-section">
              <div className="row">
                {/* Sex */}
                <div className="form-group col-md-6">
                  <label>
                    Sex <span className="text-danger">*</span>
                  </label>
                  <select
                    name="sex"
                    className="form-control"
                    value={formData.sex}
                    onChange={handleTextChange}
                    required
                  >
                    <option value="">Select sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                {/* Status - fetched from backend */}
                <div className="form-group col-md-6">
                  <label>
                    Worker Status <span className="text-danger">*</span>
                  </label>
                  {statuses.length === 0 ? (
                    <div className="form-control text-muted">
                      Loading statuses...
                    </div>
                  ) : (
                    <select
                      name="status_id"
                      className="form-control"
                      value={formData.status_id}
                      onChange={handleTextChange}
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

                {/* Region */}
                <div className="form-group col-md-6">
                  <label>
                    Region <span className="text-danger">*</span>
                  </label>
                  {regions.length === 0 ? (
                    <div className="form-control text-muted">
                      {regionsError
                        ? "Failed to load regions"
                        : "Loading regions..."}
                    </div>
                  ) : (
                    <select
                      name="region_id"
                      className="form-control"
                      value={formData.region_id}
                      onChange={handleTextChange}
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
                    onChange={handleTextChange}
                    disabled={!formData.region_id}
                  >
                    <option value="">
                      {formData.region_id
                        ? "Select city"
                        : "Select region first"}
                    </option>
                    {Array.isArray(cities) && cities.length > 0 ? (
                      cities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No cities available</option>
                    )}
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
                    onChange={handleTextChange}
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
                    onChange={handleTextChange}
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
                    onChange={handleTextChange}
                  />
                </div>

                {/* Marital Status */}
                <div className="form-group col-md-6">
                  <label>Marital Status</label>
                  <select
                    name="marital_status"
                    className="form-control"
                    value={formData.marital_status}
                    onChange={handleTextChange}
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
                    onChange={handleTextChange}
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
                    onChange={handleTextChange}
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
                    onChange={handleTextChange}
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
                    onChange={handleNumberChange}
                    min="0"
                  />
                </div>

                {/* Height */}
                <div className="form-group col-md-6">
                  <label>
                    Height (cm) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    name="height_cm"
                    className="form-control"
                    value={formData.height_cm}
                    onChange={handleNumberChange}
                    step="0.01"
                  />
                </div>

                {/* Weight */}
                <div className="form-group col-md-6">
                  <label>
                    Weight (kg) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    name="weight_kg"
                    className="form-control"
                    value={formData.weight_kg}
                    onChange={handleNumberChange}
                    step="0.01"
                  />
                </div>

                {/* Photos - required */}
                <div className="form-group col-md-6">
                  <label>
                    Photo 3x4 <span className="text-danger">*</span>
                  </label>
                  <input
                    type="file"
                    name="photo_3x4_url"
                    accept="image/*"
                    className="form-control"
                    onChange={handleFileChange}
                    required
                  />
                </div>

                <div className="form-group col-md-6">
                  <label>
                    Photo Standing <span className="text-danger">*</span>
                  </label>
                  <input
                    type="file"
                    name="photo_standing_url"
                    accept="image/*"
                    className="form-control"
                    onChange={handleFileChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="submit-section">
              <div className="form-group col-lg-12 col-md-12 mt-4">
                <button
                  className="btn btn-main px-5 rounded"
                  type="submit"
                  disabled={submitLoading}
                >
                  Save Personal Information
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default WorkerPersonalInfo;
