import { useState, useEffect } from "react";
import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete";

import {
  createOrUpdateLocation,
  getLocation,
  deleteLocation,
} from "../../../api/location.api";

import BackButton from "../../../../../shared/components/BackButton/BackButton";
import { useNavigate } from "react-router-dom";

const Location = () => {
  const navigate = useNavigate();

  const [locationData, setLocationData] = useState({
    name: "",
    latitude: "",
    longitude: "",
    address: "",
  });

  const [existingData, setExistingData] = useState(null);

  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();

  const goBack = () => navigate(-1);

  const fetchLocation = async () => {
    showLoader();
    try {
      const response = await getLocation();

      if (response?.data) {
        setExistingData(response.data);

        setLocationData({
          name: response.data?.name || "",
          latitude: response.data?.latitude || "",
          longitude: response.data?.longitude || "",
          address: response.data?.address || "",
        });
      } else {
        setExistingData(null);
      }
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchLocation();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocationData((prev) => ({ ...prev, [name]: value }));
  };

  const validateFields = () => {
    const { name, latitude, longitude, address } = locationData;

    // Name length check
    if (name.trim().length < 2 || name.trim().length > 100) {
      return addMessage(
        false,
        "Location name must be between 2 and 100 characters.",
      );
    }

    // Latitude must be a number within -90 to 90
    const lat = parseFloat(latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      return addMessage(false, "Latitude must be a number between -90 and 90.");
    }

    // Longitude must be a number within -180 to 180
    const lng = parseFloat(longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      return addMessage(
        false,
        "Longitude must be a number between -180 and 180.",
      );
    }

    // Address length check
    if (address.trim().length < 3 || address.trim().length > 100) {
      return addMessage(false, "Address must be between 3 and 100 characters.");
    }

    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFields()) return;

    const payload = {
      name: locationData.name.trim(),
      latitude: parseFloat(locationData.latitude),
      longitude: parseFloat(locationData.longitude),
      address: locationData.address.trim(),
    };

    showLoader();

    try {
      const response = await createOrUpdateLocation(payload);

      addMessage(
        response?.success,
        response?.message ||
          (existingData
            ? "Location updated successfully"
            : "Location created successfully"),
      );

      await fetchLocation();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  const handleDelete = async () => {
    openModal(
      async () => {
        showLoader();

        try {
          const response = await deleteLocation();

          addMessage(response?.success, response?.message);

          setLocationData({
            name: "",
            latitude: "",
            longitude: "",
            address: "",
          });

          setExistingData(null);
        } catch (err) {
          addMessage(false, err.message);
        } finally {
          hideLoader();
        }
      },
      {
        title: "Are you sure you want to delete this location?",
        confirmText: "Delete",
      },
    );
  };

  return (
    <div className="dashboard-wraper">
      <div>
        <BackButton onClick={goBack} />
      </div>
      <div className="form-submit">
        <h2 className="fw-bold text-dark mb-2">Location </h2>

        <p className="text-muted">Manage company location information.</p>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label>
                Location Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                name="name"
                placeholder="Main Office"
                required
                value={locationData.name}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label>
                Latitude <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                step="any"
                className="form-control"
                name="latitude"
                placeholder="9.032"
                required
                value={locationData.latitude}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label>
                Longitude <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                step="any"
                className="form-control"
                name="longitude"
                placeholder="38.746"
                required
                value={locationData.longitude}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label>
                Address <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                name="address"
                placeholder="Bole Road, Addis Ababa"
                required
                value={locationData.address}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mt-4 d-flex gap-3">
            <button type="submit" className="btn btn-main px-5">
              {existingData ? "Update Location" : "Create Location"}
            </button>

            {existingData && (
              <button
                type="button"
                className="btn btn-danger px-5"
                onClick={handleDelete}
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Location;
