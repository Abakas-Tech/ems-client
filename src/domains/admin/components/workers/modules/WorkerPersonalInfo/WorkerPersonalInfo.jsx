import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { updateWorker } from "../../../../api/worker.api";
import { getRegions, getCities } from "../../../../api/meta.api";
import useLoader from "../../../../../../context/Loader/useLoader";
import useResponse from "../../../../../../context/response/useResponse";
import BackButton from "../../../../../../shared/components/BackButton/BackButton";

function WorkerPersonalInfo() {
  const Navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { id } = useParams();

  const [regions, setRegions] = useState([]);
  const [regionsError] = useState(null);
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
      number_of_children: 0,
      height_cm: "",
      weight_kg: "",
    },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load cities when region changes
  useEffect(() => {
    const regionId = formData.personal_information.region_id;
    if (!regionId) return setCities([]);

    const loadCities = async () => {
      showLoader();
      try {
        const response = await getCities(regionId);
        setCities(response.data || []);
      } catch (err) {
        addMessage(false, err.message);
        setCities([]);
      } finally {
        hideLoader();
      }
    };
    loadCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Frontend validation function
  const validatePersonalInfo = (pi) => {
    // region_id
    if (pi.region_id !== null && pi.region_id !== "") {
      const v = Number(pi.region_id);
      if (!Number.isInteger(v) || v <= 0) {
        return "Region must be a positive integer";
      }
    }

    // city_id
    if (pi.city_id !== null && pi.city_id !== "") {
      const v = Number(pi.city_id);
      if (!Number.isInteger(v) || v <= 0) {
        return "City must be a positive integer";
      }
    }

    // date_of_birth
    if (pi.date_of_birth) {
      const dob = new Date(pi.date_of_birth);
      if (isNaN(dob.getTime())) {
        return "Date of birth must be a valid ISO date";
      }
      if (dob >= new Date()) {
        return "Date of birth must be in the past";
      }
    }

    // place_of_birth
    if (pi.place_of_birth) {
      if (pi.place_of_birth.trim().length > 100) {
        return "Place of birth must be at most 100 characters";
      }
    }

    // religion
    if (pi.religion) {
      if (pi.religion.trim().length > 50) {
        return "Religion must be at most 50 characters";
      }
    }

    // marital_status
    if (pi.marital_status) {
      const allowed = ["Single", "Married", "Divorced", "Widowed"];
      if (!allowed.includes(pi.marital_status)) {
        return "Marital status must be Single, Married, Divorced, or Widowed";
      }
    }

    // sex
    if (pi.sex) {
      if (!["Male", "Female"].includes(pi.sex)) {
        return "Sex must be Male or Female";
      }
    }

    // nationality
    if (pi.nationality) {
      if (typeof pi.nationality !== "string") {
        return "Nationality must be a string";
      }
    }

    // address
    if (pi.address) {
      if (pi.address.trim().length > 500) {
        return "Address must be at most 500 characters";
      }
    }

    // education
    if (pi.education) {
      if (pi.education.trim().length > 100) {
        return "Education must be at most 100 characters";
      }
    }

    // number_of_children
    if (pi.number_of_children !== null && pi.number_of_children !== "") {
      const v = Number(pi.number_of_children);
      if (!Number.isInteger(v) || v < 0) {
        return "Number of children must be 0 or a positive integer";
      }
    }

    // height_cm
    if (pi.height_cm !== null && pi.height_cm !== "") {
      const v = Number(pi.height_cm);
      if (isNaN(v) || v < 100 || v > 250) {
        return "Height must be between 100 and 250 cm";
      }
    }

    // weight_kg
    if (pi.weight_kg !== null && pi.weight_kg !== "") {
      const v = Number(pi.weight_kg);
      if (isNaN(v) || v < 30 || v > 200) {
        return "Weight must be between 30 and 200 kg";
      }
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const pi = formData.personal_information;

    const error = validatePersonalInfo(pi);
    if (error) {
      addMessage(false, error);
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

      const response = await updateWorker(dataToSend, id);

      addMessage(
        response?.success,
        response?.message || "Personal information added successfully",
      );

      // Clear form and photos after successful submission
      setFormData({
        personal_information: {
          region_id: "",
          city_id: "",
          status_id: "",
          date_of_birth: "",
          place_of_birth: "",
          religion: "",
          marital_status: "",
          nationality: "Ethiopian",
          address: "",
          education: "",
          number_of_children: "",
          height_cm: "",
          weight_kg: "",
        },
        photo_3x4_url: null,
        photo_standing_url: null,
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
                {/* Region */}
                <div className="form-group col-md-6">
                  <label>
                    Region <span className="text-danger">*</span>
                  </label>
                  {regions.length === 0 ?
                    <div className="form-control text-muted">
                      {regionsError ?
                        "Failed to load regions"
                      : "Loading regions..."}
                    </div>
                  : <select
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
                  }
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
                      {formData.personal_information.region_id ?
                        "Select city"
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
    </section>
  );
}

export default WorkerPersonalInfo;
