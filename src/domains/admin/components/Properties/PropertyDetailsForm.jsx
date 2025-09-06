import React, { useMemo } from "react";
import { useFormik } from "formik";
import Select from "react-select";
import { AiFillStar } from "react-icons/ai";
import { FaBolt } from "react-icons/fa";
import useResponse from "../../../../context/response/UseResponse";

const PropertyDetailsForm = ({
  initialValues = {},
  onSubmit,
  isEditMode = false,
  onUpdateImages,
}) => {
  const { addMessage } = useResponse();
  const [validationError, setValidationError] = React.useState(null);

  // Normalize incoming initialValues to the shape this form expects
  const normalizedInitial = useMemo(() => {
    const d = initialValues || {};

    const propertyTypeLabel = (pt) =>
      pt === "apartment"
        ? "Apartment"
        : pt === "house"
        ? "House"
        : pt === "villa"
        ? "Villa"
        : "Land";

    const statusLabel = (s) =>
      s === "available" ? "Available" : s === "sold" ? "Sold" : "Rented";
    // eslint-disable-next-line no-unused-vars
    const toSelect = (value, labelFn, specialLabels) => {
      if (value === undefined || value === null) return null;
      return {
        value,
        label: labelFn
          ? labelFn(value)
          : specialLabels?.[value] ?? String(value),
      };
    };
    // Helper function to safely parse and join tags
    const parseAndFormatTags = (tags) => {
      // Case 1: Already an array
      if (Array.isArray(tags)) {
        return tags.join(", ");
      }

      // Case 2: A string that looks like an array
      if (typeof tags === "string") {
        try {
          const parsedTags = JSON.parse(tags);
          if (Array.isArray(parsedTags)) {
            return parsedTags.join(", ");
          }
        } catch (error) {
          // Ignore parsing errors, return empty string
        }
      }

      // Fallback for null, undefined, or empty arrays/strings
      return "";
    };
    return {
      // basic
      title: d.title ?? "",
      category:
        d.category ??
        (d.category_name
          ? { value: d.category_name, label: d.category_name }
          : null),
      propertyType: d.property_type
        ? { value: d.property_type, label: propertyTypeLabel(d.property_type) }
        : d.propertyType ?? null,
      // location (coordinates may be nested)
      address: d.location ?? d.address ?? "",
      latitude:
        (d.coordinates && (d.coordinates.latitude ?? "")) ?? d.latitude ?? "",
      longitude:
        (d.coordinates && (d.coordinates.longitude ?? "")) ?? d.longitude ?? "",
      // description / tags / features
      description: d.description ?? "",
      tags: parseAndFormatTags(d?.tags),

      features: Array.isArray(d.features)
        ? d.features
        : typeof d.features === "string" && d.features.length
        ? d.features.split(",").map((t) => t.trim())
        : [],
      // booleans (API may use 0/1 or true/false)
      isUrgent:
        d.is_urgent !== undefined ? !!Number(d.is_urgent) : !!d.isUrgent,
      isFeatured:
        d.is_featured !== undefined ? !!Number(d.is_featured) : !!d.isFeatured,
      // status select
      status: d.status
        ? typeof d.status === "object"
          ? d.status // already {value, label} → use as-is
          : { value: d.status, label: statusLabel(d.status) } // string → map
        : null,
      // optional numeric/selects (we keep them as the same select object shape you used)
      areaSize:
        d.area_size !== undefined && d.area_size !== null
          ? String(d.area_size)
          : d.areaSize !== undefined && d.areaSize !== null
          ? String(d.areaSize)
          : "",
      bedrooms: d.bedrooms ?? null,
      bathrooms: d.bathrooms ?? null,
      halls: d.halls ?? null,
      kitchens: d.kitchens ?? null,
    };
  }, [initialValues]);

  // helper: build numeric select options and ensure the current selection is included
  const buildNumberOptions = (selectedObj, max = 10) => {
    const selectedVal =
      selectedObj && typeof selectedObj === "object"
        ? Number(selectedObj.value)
        : typeof selectedObj === "number"
        ? selectedObj
        : null;

    const base = Array.from({ length: max }, (_, i) => i + 1);
    if (selectedVal && !base.includes(selectedVal)) base.push(selectedVal);
    const sorted = base.sort((a, b) => a - b);
    return sorted.map((n) => ({ value: n, label: String(n) }));
  };

  // category options ensure current selection (sale/rent) is present
  const categoryOptions = useMemo(() => {
    const opts = [
      { value: "rent", label: "For Rent" },
      { value: "sale", label: "For Sale" },
    ];
    const selected = normalizedInitial.category;
    if (selected && !opts.some((o) => o.value === selected.value)) {
      opts.push({
        value: selected.value,
        label: selected.label || selected.value,
      });
    }
    return opts;
  }, [normalizedInitial.category]);

  const propertyTypeOptions = [
    { value: "apartment", label: "Apartment" },
    { value: "house", label: "House" },
    { value: "villa", label: "Villa" },
    { value: "land", label: "Land" },
  ];

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
    enableReinitialize: true,
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
      ...normalizedInitial,
    },
    onSubmit: (values) => {
      setValidationError(null);

      // --- Basic validations ---
      if (!values.title.trim()) {
        addMessage("error", "Property Title is required");
        setValidationError("title");
        return;
      }
      if (values.title.trim().length < 3) {
        addMessage("error", "Property Title must be more than 3 characters");
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
      if (!values.description.trim()) {
        addMessage("error", "Description is required");
        setValidationError("description");
        return;
      }
      if (values.description.trim().length <= 10) {
        addMessage("error", "Description must be more than 10 characters");
        setValidationError("description");
        return;
      }
      if (!values.status) {
        addMessage("error", "Status is required");
        setValidationError("status");
        return;
      }

      // --- Latitude & Longitude logic ---
      const latEmpty = values.latitude === "" || values.latitude === null;
      const lonEmpty = values.longitude === "" || values.longitude === null;

      if (!latEmpty && !lonEmpty) {
        // Both provided → validate
        if (isNaN(values.latitude)) {
          addMessage("error", "Latitude must be a number");
          setValidationError("latitude");
          return;
        }
        if (Number(values.latitude) < -90 || Number(values.latitude) > 90) {
          addMessage("error", "Latitude must be between -90 and +90");
          setValidationError("latitude");
          return;
        }

        if (isNaN(values.longitude)) {
          addMessage("error", "Longitude must be a number");
          setValidationError("longitude");
          return;
        }
        if (Number(values.longitude) < -180 || Number(values.longitude) > 180) {
          addMessage("error", "Longitude must be between -180 and +180");
          setValidationError("longitude");
          return;
        }
      } else if (!latEmpty || !lonEmpty) {
        // Only one provided → show error
        addMessage(
          "error",
          "Both Latitude and Longitude must be provided together"
        );
        setValidationError(!latEmpty ? "longitude" : "latitude");
        return;
      }
      // --- Build payload ---
      const payload = { ...values };

      // Only keep latitude & longitude if BOTH are provided
      if (
        values.latitude !== "" &&
        values.latitude !== null &&
        values.longitude !== "" &&
        values.longitude !== null
      ) {
        payload.latitude = Number(values.latitude);
        payload.longitude = Number(values.longitude);
      } else {
        // Remove latitude & longitude keys entirely
        delete payload.latitude;
        delete payload.longitude;
      }

      onSubmit(payload);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="dashboard-wraper">
      {/* Header */}
      <div className="mb-4 text-start">
        <h2 className="fw-bold">
          {isEditMode ? "Edit Property" : "Submit Property"}
        </h2>
        <p className="text-muted">
          {isEditMode
            ? "Update details to keep your property listing accurate and up to date."
            : "Add a new property with all the key details to attract potential clients."}
        </p>
      </div>

      {/* Basic Information */}
      <div className="form-submit  ">
        <h5>Basic Information</h5>
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
                options={categoryOptions}
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
                options={propertyTypeOptions}
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
                options={buildNumberOptions(formik.values.bedrooms, 10)}
                styles={selectStyles}
              />
            </div>
            <div className="form-group col-md-6">
              <label>Bathrooms (optional)</label>
              <Select
                name="bathrooms"
                value={formik.values.bathrooms}
                onChange={(val) => formik.setFieldValue("bathrooms", val)}
                options={buildNumberOptions(formik.values.bathrooms, 10)}
                styles={selectStyles}
              />
            </div>
            <div className="form-group col-md-6">
              <label>Halls (optional)</label>
              <Select
                name="halls"
                value={formik.values.halls}
                onChange={(val) => formik.setFieldValue("halls", val)}
                options={buildNumberOptions(formik.values.halls, 10)}
                styles={selectStyles}
              />
            </div>
            <div className="form-group col-md-6">
              <label>Kitchens (optional)</label>
              <Select
                name="kitchens"
                value={formik.values.kitchens}
                onChange={(val) => formik.setFieldValue("kitchens", val)}
                options={buildNumberOptions(formik.values.kitchens, 10)}
                styles={selectStyles}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Location */}
      <div className="form-submit">
        <h5>Location</h5>
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
              <label>Latitude</label>
              <input
                type="number"
                name="latitude"
                value={formik.values.latitude}
                onChange={formik.handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group col-md-6">
              <label>Longitude</label>
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
        <h5>Detailed Information</h5>
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
                    "Air Conditioning",
                    "Bedding",
                    "Heating",
                    "Internet",
                    "Playground",
                    "Green Area",
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
                  onChange={(e) =>
                    formik.setFieldValue("isUrgent", e.target.checked)
                  }
                  id="isUrgent"
                  className="form-check-input"
                />
                <label
                  htmlFor="isUrgent"
                  className="form-check-label text-danger fw-bold"
                >
                  <FaBolt style={{ marginRight: 6 }} /> Mark as Urgent
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
                  onChange={(e) =>
                    formik.setFieldValue("isFeatured", e.target.checked)
                  }
                  id="isFeatured"
                  className="form-check-input"
                />
                <label
                  htmlFor="isFeatured"
                  className="form-check-label text-warning fw-bold"
                >
                  <AiFillStar style={{ marginRight: 6 }} /> Highlight as
                  Featured
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
      <div className="form-group col-lg-12 col-md-12 d-flex gap-2">
        <button type="submit" className="btn btn-main fw-medium px-5">
          {isEditMode ? "Update Property" : "Submit Property"}
        </button>

        {isEditMode && (
          <button
            type="button"
            className="btn btn-secondary fw-medium px-5"
            onClick={() => onUpdateImages && onUpdateImages()}
          >
            Update Images
          </button>
        )}
      </div>
    </form>
  );
};

export default PropertyDetailsForm;
