import React from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { FaExclamationCircle, FaStar } from "react-icons/fa";

const PropertyDetailsForm = ({ onSubmit, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const selectStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: errors.category ? "#dc3545" : provided.borderColor,
      "&:hover": { borderColor: errors.category ? "#dc3545" : "#ced4da" },
    }),
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Basic Information */}
      <div className="form-submit">
        <h3>Basic Information</h3>
        <div className="submit-section">
          <div className="row">
            <div className="form-group col-md-12">
              <label>
                Property Title <span className="text-danger">*</span>
              </label>
              <input
                {...register("title", {
                  required: "Title is required",
                  minLength: {
                    value: 3,
                    message: "Title must be at least 3 characters",
                  },
                  maxLength: {
                    value: 255,
                    message: "Title must be less than 255 characters",
                  },
                })}
                className="form-control"
              />
              {errors.title && (
                <div className="text-danger">{errors.title.message}</div>
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
                <div className="text-danger">{errors.category.message}</div>
              )}
            </div>
            <div className="form-group col-md-6">
              <label>
                Property Type <span className="text-danger">*</span>
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
                <div className="text-danger">{errors.propertyType.message}</div>
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
                <div className="text-danger">{errors.areaSize.message}</div>
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
                    message: "Address must be less than 255 characters",
                  },
                })}
                className="form-control"
              />
              {errors.address && (
                <div className="text-danger">{errors.address.message}</div>
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
                <div className="text-danger">{errors.latitude.message}</div>
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
                <div className="text-danger">{errors.longitude.message}</div>
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
                    message: "Description must be at least 10 characters",
                  },
                })}
                className="form-control h-120"
              />
              {errors.description && (
                <div className="text-danger">{errors.description.message}</div>
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
                  <FaExclamationCircle style={{ marginRight: "5px" }} />
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
                <div className="text-danger">{errors.status.message}</div>
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
  );
};

export default PropertyDetailsForm;
