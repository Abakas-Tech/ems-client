import React, { useState, useEffect } from "react";
import { createWorker } from "../../../../api/worker.api";
import {
  getWorkerStatuses,
  getRegions,
  getCities,
} from "../../../../api/meta.api";
import useLoader from "../../../../../../context/Loader/useLoader";
import useResponse from "../../../../../../context/response/UseResponse";

function WorkersPersonalInfo() {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const [regions, setRegions] = useState([]);
  const [regionsError, setRegionsError] = useState(null);
  const [cities, setCities] = useState([]);

  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    personal_information: {
      region_id: "",
      city_id: "",
      status_id: "",
      date_of_birth: "",
      place_of_birth: "",
      religion: "",
      marital_status: "",
      sex: "",
      nationality: "Ethiopian",
      address: "",
      education: "",
      number_of_children: "0",
      height_cm: "",
      weight_kg: "",
    },
  });

  const [statuses, setStatuses] = useState(null);
  const [statusesError, setStatusesError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Photo states
  const [photo3x4, setPhoto3x4] = useState(null);
  const [photoStanding, setPhotoStanding] = useState(null);

  // Fetch worker statuses on mount
  useEffect(() => {
    const loadStatuses = async () => {
      showLoader();
      try {
        const data = await getWorkerStatuses();
        setStatuses(Array.isArray(data?.data) ? data.data : data || []);
        setStatusesError(null);
      } catch (err) {
        console.error(err);
        setStatuses([]);
        setStatusesError("Could not load worker statuses");
        addMessage(false, "Could not load worker statuses. Please try again.");
      } finally {
        hideLoader();
      }
    };

    loadStatuses();
  }, []);

  useEffect(() => {
    const loadRegions = async () => {
      showLoader();
      try {
        const regions = await getRegions(); // already an array
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

  // Fetch cities
  useEffect(() => {
    const regionId = formData.personal_information.region_id;
    console.log("Selected region_id:", regionId);

    if (!regionId) {
      setCities([]);
      return;
    }

    const loadCities = async () => {
      showLoader();
      try {
        const data = await getCities(regionId);
        console.log("Cities loaded:", data);
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
        personal_information: {
          ...prev.personal_information,
          [field]: value,
        },
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
    if (files?.[0]) {
      if (name === "photo_3x4_url") setPhoto3x4(files[0]);
      if (name === "photo_standing_url") setPhotoStanding(files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { full_name, phone_number, personal_information, email } = formData;

    // Client-side validation (matching Joi + required attribute)
    const name = full_name.trim();
    if (!name || name.length < 3) {
      return addMessage(false, "Full name must be at least 3 characters");
    }
    if (!/^[A-Za-z\s'-]+$/.test(name)) {
      return addMessage(
        false,
        "Full name must contain only letters, spaces, hyphens or apostrophes",
      );
    }

    const phone = phone_number.trim();
    const phonePattern = /^(?:\+251[79]\d{8}|09\d{8})$/;
    if (!phonePattern.test(phone)) {
      return addMessage(
        false,
        "Phone number must be in Ethiopian format (+2519... or 09...)",
      );
    }

    if (!personal_information.sex) {
      return addMessage(false, "Sex is required");
    }

    const statusId = Number(personal_information.status_id);
    if (isNaN(statusId) || statusId <= 0) {
      return addMessage(false, "Please select a valid worker status");
    }

    setSubmitLoading(true);
    showLoader();

    try {
      const dataToSend = new FormData();

      dataToSend.append("full_name", name);
      dataToSend.append("phone_number", phone);
      if (email.trim()) dataToSend.append("email", email.trim());
      dataToSend.append("is_active", "true");

      // Personal information – bracket notation (flat keys)
      dataToSend.append("personal_information[sex]", personal_information.sex);
      dataToSend.append("personal_information[status_id]", statusId);

      // Optional fields – only send if filled
      if (personal_information.region_id) {
        dataToSend.append(
          "personal_information[region_id]",
          personal_information.region_id,
        );
      }
      if (personal_information.city_id) {
        dataToSend.append(
          "personal_information[city_id]",
          personal_information.city_id,
        );
      }
      if (personal_information.date_of_birth) {
        dataToSend.append(
          "personal_information[date_of_birth]",
          personal_information.date_of_birth,
        );
      }
      if (personal_information.place_of_birth.trim()) {
        dataToSend.append(
          "personal_information[place_of_birth]",
          personal_information.place_of_birth.trim(),
        );
      }
      if (personal_information.religion.trim()) {
        dataToSend.append(
          "personal_information[religion]",
          personal_information.religion.trim(),
        );
      }
      if (personal_information.marital_status) {
        dataToSend.append(
          "personal_information[marital_status]",
          personal_information.marital_status,
        );
      }
      dataToSend.append(
        "personal_information[nationality]",
        personal_information.nationality || "Ethiopian",
      );
      if (personal_information.address.trim()) {
        dataToSend.append(
          "personal_information[address]",
          personal_information.address.trim(),
        );
      }
      if (personal_information.education.trim()) {
        dataToSend.append(
          "personal_information[education]",
          personal_information.education.trim(),
        );
      }
      dataToSend.append(
        "personal_information[number_of_children]",
        personal_information.number_of_children || 0,
      );
      if (personal_information.height_cm) {
        dataToSend.append(
          "personal_information[height_cm]",
          personal_information.height_cm,
        );
      }
      if (personal_information.weight_kg) {
        dataToSend.append(
          "personal_information[weight_kg]",
          personal_information.weight_kg,
        );
      }

      // Photos
      if (photo3x4) dataToSend.append("photo_3x4_url", photo3x4);
      if (photoStanding) dataToSend.append("photo_standing_url", photoStanding);

      await createWorker(dataToSend);

      addMessage(true, "Worker registered successfully!");

      // Reset form
      setFormData({
        full_name: "",
        phone_number: "",
        email: "",
        personal_information: {
          region_id: "",
          city_id: "",
          status_id: "",
          date_of_birth: "",
          place_of_birth: "",
          religion: "",
          marital_status: "",
          sex: "",
          nationality: "Ethiopian",
          address: "",
          education: "",
          number_of_children: "0",
          height_cm: "",
          weight_kg: "",
        },
      });
      setPhoto3x4(null);
      setPhotoStanding(null);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to register worker";
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
                <h4>Worker Registration</h4>

                <div className="submit-section">
                  <div className="row">
                    {/* Core fields */}

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

                    <div className="form-group col-md-6">
                      <label>City *</label>
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

                    <div className="form-group col-md-6">
                      <label>Marital Status</label>
                      <select
                        name="personal_marital_status"
                        className="form-control"
                        value={formData.personal_information.marital_status}
                        onChange={handleTextChange}
                      >
                        <option value="">Select...</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>

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

                    <div className="form-group col-md-6">
                      <label>Address</label>
                      <input
                        name="personal_address"
                        className="form-control"
                        value={formData.personal_information.address}
                        onChange={handleTextChange}
                        rows="2"
                      />
                    </div>

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
                      {submitLoading ? "Registering..." : "Register Worker"}
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
