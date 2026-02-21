import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { createWorker } from "../../../../api/worker.api";
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

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (!files?.[0]) return;
    if (name === "photo_3x4_url") setPhoto3x4(files[0]);
    if (name === "photo_standing_url") setPhotoStanding(files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { personal_information } = formData;
    setSubmitLoading(true);
    showLoader();

    try {
      const dataToSend = new FormData();

      dataToSend.append("mode", "personal");
      dataToSend.append("worker_id", id);

      // Flatten – NO personal_information[ ] wrapper
      Object.entries(personal_information).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          dataToSend.append(key, value);
        }
      });

      // File names MUST match what controller is searching for
      if (photo3x4) dataToSend.append("photo_3x4_url", photo3x4);
      if (photoStanding) dataToSend.append("photo_standing_url", photoStanding);

      // Debug: see what is actually sent (browser console)
      console.log("Sending FormData:");
      for (let [key, val] of dataToSend.entries()) {
        console.log(key, "→", val instanceof File ? val.name : val);
      }

      const response = await createWorker(dataToSend);
      console.log("Server response:", response);

      addMessage(true, "Personal information added successfully!");

      // reset ...
    } catch (err) {
      console.error("Submit failed:", err);
      const msg = err.response?.data?.message || err.message || "Failed";
      addMessage(false, msg);
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
                      <label>Region</label>
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
                        required
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
                      <label>Religion</label>
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
                      <label>Height (cm)</label>
                      <input
                        type="number"
                        name="personal_height_cm"
                        className="form-control"
                        value={formData.personal_information.height_cm}
                        onChange={handleNumberChange}
                        step="0.01"
                        min="100"
                        max="250"
                      />
                    </div>

                    {/* Weight */}
                    <div className="form-group col-md-6">
                      <label>Weight (kg)</label>
                      <input
                        type="number"
                        name="personal_weight_kg"
                        className="form-control"
                        value={formData.personal_information.weight_kg}
                        onChange={handleNumberChange}
                        step="0.01"
                        min="30"
                        max="200"
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
