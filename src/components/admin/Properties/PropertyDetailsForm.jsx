import React, { useState } from "react";
import { useFormik } from "formik";
import Select from "react-select";
import { AiOutlineExclamationCircle, AiFillStar } from "react-icons/ai";
import { FaBolt, FaThumbtack } from "react-icons/fa"; // extra amazing icons
import useResponse from "./../../../context/response/UseResponse";

const PropertyDetailsForm = ({ onSubmit }) => {
  const { addMessage } = useResponse();
  const [validationError, setValidationError] = useState(null);

  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused
        ? "#80bdff"
        : validationError === state.selectProps.name
        ? "#dc3545"
        : provided.borderColor,
      "&:hover": {
        borderColor:
          validationError === state.selectProps.name ? "#dc3545" : "#ced4da",
      },
    }),
  };

  const formik = useFormik({
    initialValues: {
      title: "",
      category: null,
      propertyType: null,
      address: "",
      latitude: "",
      longitude: "",
      description: "",
      tags: "",
      features: [],
      isUrgent: false,
      isFeatured: false,
      status: null,
      areaSize: "",
      bedrooms: null,
      bathrooms: null,
      halls: null,
      kitchens: null,
    },
    onSubmit: (values) => {
      setValidationError(null);

      // Top-to-bottom sequential validation
      if (!values.title.trim()) {
        addMessage("error", "Property Title is required");
        setValidationError("title");
        return;
      }
      if (!values.category) {
        addMessage("error", "Category is required");
        setValidationError("category");
        return;
      }
      if (!values.propertyType) {
        addMessage("error", "Property Type is required");
        setValidationError("propertyType");
        return;
      }
      if (!values.address.trim()) {
        addMessage("error", "Address is required");
        setValidationError("address");
        return;
      }
      if (values.latitude === "" || isNaN(values.latitude)) {
        addMessage("error", "Latitude is required and must be a number");
        setValidationError("latitude");
        return;
      }
      if (values.longitude === "" || isNaN(values.longitude)) {
        addMessage("error", "Longitude is required and must be a number");
        setValidationError("longitude");
        return;
      }
      if (!values.description.trim()) {
        addMessage("error", "Description is required");
        setValidationError("description");
        return;
      }
      if (!values.status) {
        addMessage("error", "Status is required");
        setValidationError("status");
        return;
      }

      // ✅ All good → submit
      onSubmit(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      {/* Basic Information */}
      <div className="form-submit">
        <h3>Basic Information</h3>
        <div className="submit-section">
          <div className="row">
            {/* Property Title */}
            <div className="form-group col-md-12">
              <label>
                Property Title <span className="text-danger">*</span>
              </label>
              <input
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                className="form-control"
              />
            </div>

            {/* Category */}
            <div className="form-group col-md-6">
              <label>
                Category <span className="text-danger">*</span>
              </label>
              <Select
                name="category"
                value={formik.values.category}
                onChange={(val) => formik.setFieldValue("category", val)}
                options={[
                  { value: "rent", label: "For Rent" },
                  { value: "sale", label: "For Sale" },
                ]}
                styles={selectStyles}
              />
            </div>

            {/* Property Type */}
            <div className="form-group col-md-6">
              <label>
                Property Type <span className="text-danger">*</span>
              </label>
              <Select
                name="propertyType"
                value={formik.values.propertyType}
                onChange={(val) => formik.setFieldValue("propertyType", val)}
                options={[
                  { value: "apartment", label: "Apartment" },
                  { value: "house", label: "House" },
                  { value: "villa", label: "Villa" },
                  { value: "land", label: "Land" },
                ]}
                styles={selectStyles}
              />
            </div>

            {/* Optional Fields */}
            <div className="form-group col-md-6">
              <label>Area Size (optional)</label>
              <input
                type="number"
                name="areaSize"
                value={formik.values.areaSize}
                onChange={formik.handleChange}
                className="form-control"
                placeholder="sq ft"
              />
            </div>
            <div className="form-group col-md-6">
              <label>Bedrooms (optional)</label>
              <Select
                name="bedrooms"
                value={formik.values.bedrooms}
                onChange={(val) => formik.setFieldValue("bedrooms", val)}
                options={[1, 2, 3, 4, 5].map((num) => ({
                  value: num,
                  label: num,
                }))}
                styles={selectStyles}
              />
            </div>
            <div className="form-group col-md-6">
              <label>Bathrooms (optional)</label>
              <Select
                name="bathrooms"
                value={formik.values.bathrooms}
                onChange={(val) => formik.setFieldValue("bathrooms", val)}
                options={[1, 2, 3, 4, 5].map((num) => ({
                  value: num,
                  label: num,
                }))}
                styles={selectStyles}
              />
            </div>
            <div className="form-group col-md-6">
              <label>Halls (optional)</label>
              <Select
                name="halls"
                value={formik.values.halls}
                onChange={(val) => formik.setFieldValue("halls", val)}
                options={[1, 2, 3, 4, 5].map((num) => ({
                  value: num,
                  label: num,
                }))}
                styles={selectStyles}
              />
            </div>
            <div className="form-group col-md-6">
              <label>Kitchens (optional)</label>
              <Select
                name="kitchens"
                value={formik.values.kitchens}
                onChange={(val) => formik.setFieldValue("kitchens", val)}
                options={[1, 2, 3, 4, 5].map((num) => ({
                  value: num,
                  label: num,
                }))}
                styles={selectStyles}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="form-submit">
        <h3>Location</h3>
        <div className="submit-section">
          <div className="row">
            <div className="form-group col-md-12">
              <label>
                Address <span className="text-danger">*</span>
              </label>
              <input
                name="address"
                value={formik.values.address}
                onChange={formik.handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group col-md-6">
              <label>
                Latitude <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                name="latitude"
                value={formik.values.latitude}
                onChange={formik.handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group col-md-6">
              <label>
                Longitude <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                name="longitude"
                value={formik.values.longitude}
                onChange={formik.handleChange}
                className="form-control"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Information */}
      <div className="form-submit">
        <h3>Detailed Information</h3>
        <div className="submit-section">
          <div className="row">
            <div className="form-group col-md-12">
              <label>
                Description <span className="text-danger">*</span>
              </label>
              <textarea
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                className="form-control h-120"
              />
            </div>

            <div className="form-group col-md-12">
              <label>Tags (optional, comma-separated)</label>
              <input
                name="tags"
                value={formik.values.tags}
                onChange={formik.handleChange}
                className="form-control"
                placeholder="e.g., modern, cozy"
              />
            </div>

            {/* Features */}
            <div className="form-group col-md-12">
              <label>Other Features (optional)</label>
              <div className="o-features">
                <ul className="no-ul-list third-row">
                  {[
                    "Air Condition",
                    "Bedding",
                    "Heating",
                    "Internet",
                    "Microwave",
                    "Smoking Allow",
                    "Balcony",
                    "Wi-Fi",
                    "Parking",
                  ].map((feature, index) => (
                    <li key={index}>
                      <input
                        id={`f-${index}`}
                        type="checkbox"
                        value={feature}
                        checked={formik.values.features.includes(feature)}
                        onChange={(e) => {
                          const { checked, value } = e.target;
                          const newFeatures = checked
                            ? [...formik.values.features, value]
                            : formik.values.features.filter((f) => f !== value);
                          formik.setFieldValue("features", newFeatures);
                        }}
                        className="form-check-input"
                      />
                      <label
                        htmlFor={`f-${index}`}
                        className="ms-2 form-check-label"
                      >
                        {feature}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Urgent Property */}
            <div className="form-group col-md-12">
              <div className="form-check">
                <input
                  type="checkbox"
                  name="isUrgent"
                  checked={formik.values.isUrgent}
                  onChange={formik.handleChange}
                  id="isUrgent"
                  className="form-check-input"
                />
                <label
                  htmlFor="isUrgent"
                  className="form-check-label text-danger fw-bold"
                >
                  <FaBolt style={{ marginRight: 6 }} />
                  Mark as Urgent
                </label>
              </div>
            </div>

            {/* Featured Property */}
            <div className="form-group col-md-12">
              <div className="form-check">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formik.values.isFeatured}
                  onChange={formik.handleChange}
                  id="isFeatured"
                  className="form-check-input"
                />
                <label
                  htmlFor="isFeatured"
                  className="form-check-label text-warning fw-bold"
                >
                  <AiFillStar style={{ marginRight: 6 }} />
                  Highlight as Featured
                </label>
              </div>
            </div>

            {/* Status */}
            <div className="form-group col-md-12">
              <label>
                Status <span className="text-danger">*</span>
              </label>
              <Select
                name="status"
                value={formik.values.status}
                onChange={(val) => formik.setFieldValue("status", val)}
                options={[
                  { value: "available", label: "Available" },
                  { value: "sold", label: "Sold" },
                  { value: "rented", label: "Rented" },
                ]}
                styles={selectStyles}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="form-group col-lg-12 col-md-12">
        <button type="submit" className="btn btn-main fw-medium px-5">
          Submit Property
        </button>
      </div>
    </form>
  );
};

export default PropertyDetailsForm;
