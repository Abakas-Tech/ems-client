import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import Select from "react-select";
import { FaExclamationCircle, FaStar } from "react-icons/fa";

// Lazy-load API functions to avoid initialization issues
const createProperty = async (...args) => {
  const module = await import("../../../api/Public/properties.api");
  return module.createProperty(...args);
};

const addPropertyImages = async (...args) => {
  const module = await import("../../../api/public/PropertiesImage.api");
  return module.addPropertyImages(...args);
};

const PropertyForm = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setError,
    clearErrors,
    reset,
  } = useForm();

  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [files, setFiles] = useState([]);
  const [altTexts, setAltTexts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStage, setFormStage] = useState("property"); // "property" or "images"
  const [propertyId, setPropertyId] = useState(null);

  const maxFiles = 10;
  const maxFileSize = 5 * 1024 * 1024; // 5MB
  const allowedMimeTypes = {
    "image/jpeg": [],
    "image/png": [],
    "image/gif": [],
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: allowedMimeTypes,
    maxFiles,
    maxSize: maxFileSize,
    onDrop: (acceptedFiles, fileRejections) => {
      if (fileRejections.length > 0) {
        const message =
          fileRejections[0].errors[0].code === "file-too-large"
            ? "Each file must be less than 5MB."
            : "Only JPEG, PNG, and GIF images are allowed.";
        setError("images", { message });
        return;
      }
      setFiles(acceptedFiles);
      setAltTexts(acceptedFiles.map(() => ""));
      clearErrors("images");
    },
  });

  const handleAltTextChange = (index, value) => {
    const newAltTexts = [...altTexts];
    newAltTexts[index] = value.slice(0, 255);
    setAltTexts(newAltTexts);
  };

  const onPropertySubmit = async (data) => {
    setIsSubmitting(true);
    setSubmissionStatus(null);

    const propertyData = {
      title: data.title,
      description: data.description,
      location: data.address,
      propertyType: data.propertyType?.value,
      bedrooms: data.bedrooms?.value,
      bathrooms: data.bathrooms?.value,
      halls: data.halls?.value,
      kitchens: data.kitchens?.value,
      areaSize: data.areaSize ? parseInt(data.areaSize) : undefined,
      category: data.category?.value,
      isUrgent: !!data.isUrgent,
      isFeatured: !!data.isFeatured,
      features: data.features.filter(Boolean),
      tags: data.tags
        ? data.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      status: data.status?.value,
    };

    try {
      const propertyResponse = await createProperty(propertyData);
      if (!propertyResponse.success) {
        setSubmissionStatus({
          type: "error",
          message: propertyResponse.message,
        });
        setIsSubmitting(false);
        return;
      }

      setPropertyId(propertyResponse.data.id);
      setFormStage("images"); // Transition to images stage
      setIsSubmitting(false);
    } catch (error) {
      console.error("Property submission error:", error);
      setSubmissionStatus({
        type: "error",
        message:
          "An error occurred during property submission. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  const onImagesSubmit = async () => {
    if (files.length === 0) {
      setError("images", { message: "At least one image is required." });
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus(null);

    try {
      // Log files and altTexts for debugging
      console.log("Files before FormData:", files);
      console.log("AltTexts before FormData:", altTexts);
      console.log("Property ID:", propertyId);

      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append("images", file);
        console.log(
          `Appending image ${index}:`,
          file.name,
          file.type,
          file.size
        );
      });
      formData.append("altTexts", JSON.stringify(altTexts));
      console.log("FormData contents:", Array.from(formData.entries()));

      const imageResponse = await addPropertyImages(propertyId, formData);
      if (!imageResponse.success) {
        setSubmissionStatus({
          type: "error",
          message: imageResponse.message || "Failed to upload images.",
        });
        setIsSubmitting(false);
        return;
      }

      setSubmissionStatus({
        type: "success",
        message: "Images submitted successfully!",
      });
      setFiles([]);
      setAltTexts([]);
      setFormStage("property"); // Return to property form
      reset(); // Reset form for new property
      setIsSubmitting(false);
    } catch (error) {
      console.error("Image submission error:", error);
      setSubmissionStatus({
        type: "error",
        message: "An error occurred during image submission. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormStage("property");
    setFiles([]);
    setAltTexts([]);
    setPropertyId(null);
    setSubmissionStatus(null);
    reset(); // Reset form for new property
  };

  const selectStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: errors.category ? "#dc3545" : provided.borderColor,
      "&:hover": { borderColor: errors.category ? "#dc3545" : "#ced4da" },
    }),
  };

  return (
    <div>
      {/* Page Title */}
      <div className="page-title">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 col-md-12">
              <h2 className="ipt-title">Submit Property</h2>
              <span className="ipn-subtitle">Just Submit Your Property</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <section className="gray-simple">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 col-md-12">
              <div className="submit-page">
                {submissionStatus && (
                  <div
                    className={`alert ${
                      submissionStatus.type === "success"
                        ? "bg-green text-light"
                        : "alert-danger"
                    } text-center`}
                    role="alert"
                  >
                    {submissionStatus.message}
                  </div>
                )}

                {formStage === "property" ? (
                  <form onSubmit={handleSubmit(onPropertySubmit)}>
                    {/* Basic Information */}
                    <div className="form-submit">
                      <h3>Basic Information</h3>
                      <div className="submit-section">
                        <div className="row">
                          <div className="form-group col-md-12">
                            <label>
                              Property Title{" "}
                              <span className="text-danger">*</span>
                            </label>
                            <input
                              {...register("title", {
                                required: "Title is required",
                                minLength: {
                                  value: 3,
                                  message:
                                    "Title must be at least 3 characters",
                                },
                                maxLength: {
                                  value: 255,
                                  message:
                                    "Title must be less than 255 characters",
                                },
                              })}
                              className="form-control"
                            />
                            {errors.title && (
                              <div className="text-danger">
                                {errors.title.message}
                              </div>
                            )}
                          </div>
                          <div className="form-group col-md-6">
                            <label>
                              Category <span className="text-danger">*</span>
                            </label>
                            <Controller
                              name="category"
                              control={control}
                              rules={{ required: "Category is required" }}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={[
                                    { value: "rent", label: "For Rent" },
                                    { value: "sale", label: "For Sale" },
                                  ]}
                                  styles={selectStyles}
                                  onChange={(option) => field.onChange(option)}
                                />
                              )}
                            />
                            {errors.category && (
                              <div className="text-danger">
                                {errors.category.message}
                              </div>
                            )}
                          </div>
                          <div className="form-group col-md-6">
                            <label>
                              Property Type{" "}
                              <span className="text-danger">*</span>
                            </label>
                            <Controller
                              name="propertyType"
                              control={control}
                              rules={{ required: "Property Type is required" }}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={[
                                    { value: "apartment", label: "Apartment" },
                                    { value: "house", label: "House" },
                                    { value: "villa", label: "Villa" },
                                    { value: "land", label: "Land" },
                                  ]}
                                  styles={selectStyles}
                                  onChange={(option) => field.onChange(option)}
                                />
                              )}
                            />
                            {errors.propertyType && (
                              <div className="text-danger">
                                {errors.propertyType.message}
                              </div>
                            )}
                          </div>
                          <div className="form-group col-md-6">
                            <label>Area Size (optional)</label>
                            <input
                              {...register("areaSize", {
                                min: {
                                  value: 0,
                                  message: "Area size must be positive",
                                },
                              })}
                              type="number"
                              className="form-control"
                              placeholder="sq ft"
                            />
                            {errors.areaSize && (
                              <div className="text-danger">
                                {errors.areaSize.message}
                              </div>
                            )}
                          </div>
                          <div className="form-group col-md-6">
                            <label>Bedrooms (optional)</label>
                            <Controller
                              name="bedrooms"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={[1, 2, 3, 4, 5].map((num) => ({
                                    value: num,
                                    label: num,
                                  }))}
                                  styles={selectStyles}
                                  onChange={(option) => field.onChange(option)}
                                />
                              )}
                            />
                          </div>
                          <div className="form-group col-md-6">
                            <label>Bathrooms (optional)</label>
                            <Controller
                              name="bathrooms"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={[1, 2, 3, 4, 5].map((num) => ({
                                    value: num,
                                    label: num,
                                  }))}
                                  styles={selectStyles}
                                  onChange={(option) => field.onChange(option)}
                                />
                              )}
                            />
                          </div>
                          <div className="form-group col-md-6">
                            <label>Halls (optional)</label>
                            <Controller
                              name="halls"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={[1, 2, 3, 4, 5].map((num) => ({
                                    value: num,
                                    label: num,
                                  }))}
                                  styles={selectStyles}
                                  onChange={(option) => field.onChange(option)}
                                />
                              )}
                            />
                          </div>
                          <div className="form-group col-md-6">
                            <label>Kitchens (optional)</label>
                            <Controller
                              name="kitchens"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={[1, 2, 3, 4, 5].map((num) => ({
                                    value: num,
                                    label: num,
                                  }))}
                                  styles={selectStyles}
                                  onChange={(option) => field.onChange(option)}
                                />
                              )}
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
                              {...register("address", {
                                required: "Address is required",
                                maxLength: {
                                  value: 255,
                                  message:
                                    "Address must be less than 255 characters",
                                },
                              })}
                              className="form-control"
                            />
                            {errors.address && (
                              <div className="text-danger">
                                {errors.address.message}
                              </div>
                            )}
                          </div>
                          <div className="form-group col-md-6">
                            <label>
                              Latitude <span className="text-danger">*</span>
                            </label>
                            <input
                              {...register("latitude", {
                                required: "Latitude is required",
                                valueAsNumber: true,
                              })}
                              type="number"
                              step="any"
                              className="form-control"
                            />
                            {errors.latitude && (
                              <div className="text-danger">
                                {errors.latitude.message}
                              </div>
                            )}
                          </div>
                          <div className="form-group col-md-6">
                            <label>
                              Longitude <span className="text-danger">*</span>
                            </label>
                            <input
                              {...register("longitude", {
                                required: "Longitude is required",
                                valueAsNumber: true,
                              })}
                              type="number"
                              step="any"
                              className="form-control"
                            />
                            {errors.longitude && (
                              <div className="text-danger">
                                {errors.longitude.message}
                              </div>
                            )}
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
                              {...register("description", {
                                required: "Description is required",
                                minLength: {
                                  value: 10,
                                  message:
                                    "Description must be at least 10 characters",
                                },
                              })}
                              className="form-control h-120"
                            />
                            {errors.description && (
                              <div className="text-danger">
                                {errors.description.message}
                              </div>
                            )}
                          </div>
                          <div className="form-group col-md-12">
                            <label>Tags (optional, comma-separated)</label>
                            <input
                              {...register("tags")}
                              className="form-control"
                              placeholder="e.g., modern, cozy"
                            />
                          </div>
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
                                  "Terrace",
                                  "Balcony",
                                  "Wi-Fi",
                                  "Beach",
                                  "Parking",
                                ].map((feature, index) => (
                                  <li key={index}>
                                    <input
                                      id={`a-${index + 1}`}
                                      className="form-check-input"
                                      {...register("features")}
                                      value={feature}
                                      type="checkbox"
                                    />
                                    <label
                                      htmlFor={`a-${index + 1}`}
                                      className="form-check-label"
                                    >
                                      {feature}
                                    </label>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <div className="form-group col-md-12">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                {...register("isUrgent")}
                                id="isUrgent"
                                className="form-check-input"
                              />
                              <label
                                htmlFor="isUrgent"
                                className="form-check-label"
                                style={{ color: "#dc3545" }}
                              >
                                <FaExclamationCircle
                                  style={{ marginRight: "5px" }}
                                />
                                Is Urgent
                              </label>
                            </div>
                          </div>
                          <div className="form-group col-md-12">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                {...register("isFeatured")}
                                id="isFeatured"
                                className="form-check-input"
                              />
                              <label
                                htmlFor="isFeatured"
                                className="form-check-label"
                                style={{ color: "#ffc107" }}
                              >
                                <FaStar style={{ marginRight: "5px" }} />
                                Is Featured
                              </label>
                            </div>
                          </div>
                          <div className="form-group col-md-12">
                            <label>
                              Status <span className="text-danger">*</span>
                            </label>
                            <Controller
                              name="status"
                              control={control}
                              rules={{ required: "Status is required" }}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={[
                                    { value: "available", label: "Available" },
                                    { value: "sold", label: "Sold" },
                                    { value: "rented", label: "Rented" },
                                  ]}
                                  styles={selectStyles}
                                  onChange={(option) => field.onChange(option)}
                                />
                              )}
                            />
                            {errors.status && (
                              <div className="text-danger">
                                {errors.status.message}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="form-group col-lg-12 col-md-12">
                      <button
                        type="submit"
                        className="btn btn-main fw-medium px-5"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Property"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    {/* Gallery */}
                    <div className="form-submit">
                      <h3>Upload Images for Property #{propertyId}</h3>
                      <div className="submit-section">
                        <div className="row">
                          <div className="form-group col-md-12">
                            <label>Upload Gallery</label>
                            <div
                              {...getRootProps()}
                              className="dropzone dz-clickable primary-dropzone"
                            >
                              <input {...getInputProps()} />
                              {isDragActive ? (
                                <div className="dz-default dz-message">
                                  <span>Drop the images here...</span>
                                </div>
                              ) : (
                                <div className="dz-default dz-message">
                                  <i className="bi bi-cloud-plus-fill text-main"></i>
                                  <span>Drag & Drop Images Here</span>
                                </div>
                              )}
                            </div>
                            {errors.images && (
                              <div className="text-danger mt-2">
                                {errors.images.message}
                              </div>
                            )}
                            {files.length > 0 && (
                              <div className="mt-3">
                                <h4>Uploaded Images</h4>
                                {files.map((file, index) => (
                                  <div
                                    key={index}
                                    className="d-flex align-items-center mb-2"
                                  >
                                    <span className="me-2">{file.name}</span>
                                    <input
                                      type="text"
                                      placeholder="Alt text (optional)"
                                      value={altTexts[index]}
                                      onChange={(e) =>
                                        handleAltTextChange(
                                          index,
                                          e.target.value
                                        )
                                      }
                                      className="form-control flex-grow-1"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="form-group col-lg-12 col-md-12 d-flex gap-3">
                      <button
                        type="button"
                        className="btn btn-main fw-medium px-5"
                        onClick={onImagesSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Images"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary fw-medium px-5"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PropertyForm;
