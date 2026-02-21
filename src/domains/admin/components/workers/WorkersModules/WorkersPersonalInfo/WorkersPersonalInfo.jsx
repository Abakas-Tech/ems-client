import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { updateWorker } from "../../../../api/worker.api";
import { getRegions, getCities } from "../../../../api/meta.api";
import useLoader from "../../../../../../context/Loader/useLoader";
import useResponse from "../../../../../../context/response/useResponse";

function WorkersPersonalInfo() {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { id } = useParams();

  const [regions, setRegions] = useState([]);
  const [regionsError, setRegionsError] = useState(null);
  const [cities, setCities] = useState([]);

  const [formData, setFormData] = useState({
    personal_information: {
      region_id: "",
      city_id: "",
      date_of_birth: "",
      place_of_birth: "",
      religion: "",
      marital_status: "",
      nationality: "Ethiopian",
      address: "",
      education: "",
      number_of_children: "0",
      height_cm: "",
      weight_kg: "",
    },
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const [photo3x4, setPhoto3x4] = useState(null);
  const [photoStanding, setPhotoStanding] = useState(null);

  // Load regions
  useEffect(() => {
    const loadRegions = async () => {
      showLoader();
      try {
        const regions = await getRegions();
        setRegions(Array.isArray(regions) ? regions : []);
      } catch (err) {
        console.error(err);
        setRegions([]);
        addMessage(false, "Could not load regions. Please try again.");
      } finally {
        hideLoader();
      }
    };
    loadRegions();
  }, []);

  // Load cities when region changes
  useEffect(() => {
    const regionId = formData.personal_information.region_id;
    if (!regionId) return setCities([]);

    const loadCities = async () => {
      showLoader();
      try {
        const data = await getCities(regionId);
        setCities(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load cities:", err);
        addMessage(false, "Failed to load cities");
        setCities([]);
      } finally {
        hideLoader();
      }
    };
    loadCities();
  }, [formData.personal_information.region_id]);

  // Handle form field changes
  const handleTextChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("personal_")) {
      const field = name.replace("personal_", "");
      setFormData((prev) => ({
        ...prev,
        personal_information: { ...prev.personal_information, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle number inputs separately to allow empty string (for optional fields)
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("personal_")) {
      const field = name.replace("personal_", "");
      setFormData((prev) => ({
        ...prev,
        personal_information: {
          ...prev.personal_information,
          [field]: value === "" ? "" : Number(value),
        },
      }));
    }
  };

  // Handle file inputs
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (!files?.[0]) return;
    if (name === "photo_3x4_url") setPhoto3x4(files[0]);
    if (name === "photo_standing_url") setPhotoStanding(files[0]);
  };

  // Simple frontend mirror of your Joi schema
  const validatePersonalInfo = (personalInfo) => {
    const errors = [];

    // Region and City – must be positive integers if provided
    if (personalInfo.region_id) {
      const rid = Number(personalInfo.region_id);
      if (!Number.isInteger(rid) || rid <= 0) {
        errors.push("Region must be a valid positive number");
      }
    }

    if (personalInfo.city_id) {
      const cid = Number(personalInfo.city_id);
      if (!Number.isInteger(cid) || cid <= 0) {
        errors.push("City must be a valid positive number");
      }
    }

    // Date of Birth – must be a valid date in the past
    if (personalInfo.date_of_birth) {
      const dob = new Date(personalInfo.date_of_birth);
      const now = new Date();
      if (isNaN(dob.getTime())) {
        errors.push("Date of birth must be a valid date");
      } else if (dob > now) {
        errors.push("Date of birth cannot be in the future");
      }
    }

    // Text fields – check max lengths (you can adjust these based on your needs)
    const maxLengths = {
      place_of_birth: 100,
      religion: 50,
      address: 500,
      education: 100,
      nationality: 100,
    };

    for (const [field, max] of Object.entries(maxLengths)) {
      const value = personalInfo[field]?.trim() || "";
      if (value.length > max) {
        errors.push(
          `${field.replace(/_/g, " ")} must be at most ${max} characters`,
        );
      }
    }

    // Marital status – must be one of the allowed values
    const allowedMarital = ["Single", "Married", "Divorced", "Widowed", ""];
    if (
      personalInfo.marital_status &&
      !allowedMarital.includes(personalInfo.marital_status)
    ) {
      errors.push(
        "Marital status must be one of: Single, Married, Divorced, Widowed",
      );
    }

    // Number of children – must be 0 or a positive integer
    if (
      personalInfo.number_of_children !== "" &&
      personalInfo.number_of_children !== null
    ) {
      const noc = Number(personalInfo.number_of_children);
      if (!Number.isInteger(noc) || noc < 0) {
        errors.push("Number of children must be 0 or a positive integer");
      }
    }

    // Height and Weight – must be within reasonable ranges if provided
    if (personalInfo.height_cm !== "" && personalInfo.height_cm !== null) {
      const h = Number(personalInfo.height_cm);
      if (isNaN(h) || h < 100 || h > 250) {
        errors.push("Height must be between 100 and 250 cm");
      }
    }

    // Weight – must be within reasonable ranges if provided
    if (personalInfo.weight_kg !== "" && personalInfo.weight_kg !== null) {
      const w = Number(personalInfo.weight_kg);
      if (isNaN(w) || w < 30 || w > 200) {
        errors.push("Weight must be between 30 and 200 kg");
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const pi = formData.personal_information;

    // Frontend validation before sending
    const validationErrors = validatePersonalInfo(pi);

    if (validationErrors.length > 0) {
      addMessage(false, validationErrors.join(" • "));
      return;
    }

    setSubmitLoading(true);
    showLoader();
    try {
      const dataToSend = new FormData();

      const pi = formData.personal_information;

      // IDs – send only if provided
      if (pi.region_id) {
        dataToSend.append("personal_information[region_id]", pi.region_id);
      }
      if (pi.city_id) {
        dataToSend.append("personal_information[city_id]", pi.city_id);
      }
      if (pi.status_id) {
        dataToSend.append("personal_information[status_id]", pi.status_id);
      }

      // Date of Birth – send only if provided and valid
      if (pi.date_of_birth) {
        dataToSend.append(
          "personal_information[date_of_birth]",
          pi.date_of_birth,
        );
      }

      // Text fields – send even if empty
      dataToSend.append(
        "personal_information[place_of_birth]",
        pi.place_of_birth || "",
      );
      dataToSend.append("personal_information[religion]", pi.religion || "");
      dataToSend.append(
        "personal_information[marital_status]",
        pi.marital_status || "",
      );
      dataToSend.append(
        "personal_information[nationality]",
        pi.nationality || "Ethiopian",
      );
      dataToSend.append("personal_information[address]", pi.address || "");
      dataToSend.append("personal_information[education]", pi.education || "");

      // Numbers – send as string (express/joi will coerce)
      dataToSend.append(
        "personal_information[number_of_children]",
        pi.number_of_children ?? "",
      );
      dataToSend.append("personal_information[height_cm]", pi.height_cm ?? "");
      dataToSend.append("personal_information[weight_kg]", pi.weight_kg ?? "");

      // Files – send only if a new file is selected
      if (photo3x4 instanceof File) {
        dataToSend.append("photo_3x4_url", photo3x4);
      }
      if (photoStanding instanceof File) {
        dataToSend.append("photo_standing_url", photoStanding);
      }

      // Debug: log FormData entries
      console.log("FormData being sent:");
      for (let [key, value] of dataToSend.entries()) {
        console.log(
          key.padEnd(38),
          "→",
          value instanceof File ? `${value.name} (File)` : value,
        );
      }

      await updateWorker(dataToSend, id);

      addMessage(true, "Personal information added successfully!");
    } catch (err) {
      console.error("Submit error:", err);

      let errorMsg = "Failed to add personal information";

      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      if (err.response?.data?.errors?.length > 0) {
        errorMsg = err.response.data.errors.join(" • ");
      }

      addMessage(false, errorMsg);
    } finally {
      setSubmitLoading(false);
      hideLoader();
    }
  };

  return (
    <section className="bg-light">
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12 col-md-12">
            <div className="dashboard-wraper">
              <form className="form-submit" onSubmit={handleSubmit}>
                <h4>Worker Personal Information</h4>
                <div className="submit-section">
                  <div className="row">
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
                          name="personal_region_id"
                          className="form-control"
                          value={formData.personal_information.region_id}
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
                        name="personal_city_id"
                        className="form-control"
                        value={formData.personal_information.city_id}
                        onChange={handleTextChange}
                        disabled={!formData.personal_information.region_id}
                      >
                        <option value="">
                          {formData.personal_information.region_id
                            ? "Select city"
                            : "Select region first"}
                        </option>
                        {cities.map((c) => (
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
                        name="personal_date_of_birth"
                        className="form-control"
                        value={formData.personal_information.date_of_birth}
                        onChange={handleTextChange}
                      />
                    </div>

                    {/* Place of Birth */}
                    <div className="form-group col-md-6">
                      <label>Place of Birth</label>
                      <input
                        type="text"
                        name="personal_place_of_birth"
                        className="form-control"
                        value={formData.personal_information.place_of_birth}
                        onChange={handleTextChange}
                      />
                    </div>

                    {/* Religion */}
                    <div className="form-group col-md-6">
                      <label>Religion </label>
                      <input
                        type="text"
                        name="personal_religion"
                        className="form-control"
                        value={formData.personal_information.religion}
                        onChange={handleTextChange}
                      />
                    </div>

                    {/* Marital Status */}
                    <div className="form-group col-md-6">
                      <label>Marital Status</label>
                      <select
                        name="personal_marital_status"
                        className="form-control"
                        value={formData.personal_information.marital_status}
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
                        name="personal_nationality"
                        className="form-control"
                        value={formData.personal_information.nationality}
                        onChange={handleTextChange}
                      />
                    </div>

                    {/* Address */}
                    <div className="form-group col-md-6">
                      <label>Address</label>
                      <input
                        type="text"
                        name="personal_address"
                        className="form-control"
                        value={formData.personal_information.address}
                        onChange={handleTextChange}
                      />
                    </div>

                    {/* Education */}
                    <div className="form-group col-md-6">
                      <label>Education</label>
                      <input
                        type="text"
                        name="personal_education"
                        className="form-control"
                        value={formData.personal_information.education}
                        onChange={handleTextChange}
                      />
                    </div>

                    {/* Number of Children */}
                    <div className="form-group col-md-6">
                      <label>Number of Children</label>
                      <input
                        type="number"
                        name="personal_number_of_children"
                        className="form-control"
                        value={formData.personal_information.number_of_children}
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
                        name="personal_height_cm"
                        className="form-control"
                        value={formData.personal_information.height_cm}
                        onChange={handleNumberChange}
                        step="0.01"
                        min="100"
                        max="250"
                        required
                      />
                    </div>

                    {/* Weight */}
                    <div className="form-group col-md-6">
                      <label>
                        Weight (kg)<span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        name="personal_weight_kg"
                        className="form-control"
                        value={formData.personal_information.weight_kg}
                        onChange={handleNumberChange}
                        step="0.01"
                        min="30"
                        max="200"
                        required
                      />
                    </div>

                    {/* Photos */}
                    <div className="form-group col-md-6">
                      <label>Photo 3x4</label>
                      <input
                        type="file"
                        name="photo_3x4_url"
                        accept="image/*"
                        className="form-control"
                        onChange={handleFileChange}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <label>Photo Standing</label>
                      <input
                        type="file"
                        name="photo_standing_url"
                        accept="image/*"
                        className="form-control"
                        onChange={handleFileChange}
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
                      Add Personal Information
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WorkersPersonalInfo;
