import { useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import styles from "./FileModalForm.module.css";

const FileModalForm = ({ show, handleClose, handleSubmit, initialData }) => {
  const {
    register,
    handleSubmit: handleFormSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (initialData) {
      // ✅ Normalize keys for consistency
      reset({
        file_name: initialData.file_name || initialData.filename || "",
        category: initialData.category || "",
        description: initialData.description || "",
        file_url: initialData.file_url || "",
      });
    } else {
      reset({
        file_name: "",
        category: "",
        description: "",
        file_url: "",
      });
    }
  }, [initialData, reset]);

  const onSubmit = (data) => {
    if (data.file && data.file.length > 0) {
      data.file = data.file[0]; // single File object
    } else {
      delete data.file; // don’t send if not changed
    }
    handleSubmit(data);
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
      backdrop={false}
      className={styles["onboarding-modal"]}
      style={{ zIndex: 1000 }}
    >
      <div className={styles["onboarding-modal__content"]}>
        {/* Close Button */}
        <button
          className={styles["onboarding-modal__close"]}
          onClick={handleClose}
        >
          &times;
        </button>

        {/* Header */}
        <div className={styles["onboarding-modal__header"]}>
          <h4 className="fw-bold text-start text-primary">
            {initialData ? "Update File" : "Upload File"}
          </h4>
        </div>

        {/* Body */}
        <form onSubmit={handleFormSubmit(onSubmit)}>
          <div className="row gx-5">
            {/* File Name */}
            <div className={`col-md-6 ${styles["onboarding-modal__input"]}`}>
              <label className="fw-bold fs-6 text-start">File Name</label>
              <input
                type="text"
                {...register("file_name", {
                  required: "File name is required",
                })}
                className={`form-control ${
                  errors.file_name
                    ? styles["onboarding-modal__field--error"]
                    : ""
                }`}
                placeholder="Enter file name"
              />
              {errors.file_name && (
                <small className="text-danger">
                  {errors.file_name.message}
                </small>
              )}
            </div>

            {/* Category */}
            <div className={`col-md-6 ${styles["onboarding-modal__input"]}`}>
              <label className="fw-bold fs-6 text-start">Category</label>
              <div className="position-relative">
                <select
                  {...register("category", {
                    required: "Category is required",
                  })}
                  className={`form-control ${
                    errors.category
                      ? styles["onboarding-modal__field--error"]
                      : ""
                  }`}
                  style={{ paddingRight: "2.5rem" }} // Space for icon
                >
                  <option value="">Select a category</option>
                  <option value="Contracts">Contracts</option>
                  <option value="Photos">Photos</option>
                  <option value="Floor Plans">Floor Plans</option>
                  <option value="Reports">Reports</option>
                  <option value="Marketing Materials">
                    Marketing Materials
                  </option>
                  <option value="Correspondence">Correspondence</option>
                </select>
                <span
                  className="bi bi-caret-down-fill position-absolute"
                  style={{
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                ></span>
              </div>
              {errors.category && (
                <small className="text-danger">{errors.category.message}</small>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="row gx-5 mt-4">
            <div className="col-md-12">
              <label className="fw-bold fs-6 text-start">Description</label>
              <textarea
                {...register("description")}
                className="form-control"
                placeholder="Enter description"
                rows={3}
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="row gx-5 mt-4">
            <div className="col-md-12">
              <label className="fw-bold fs-6 text-start">Upload File</label>

              {/* ✅ Show preview if file_url exists */}
              {initialData?.file_url && (
                <div className="mb-2">
                  <a
                    href={initialData.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Current file: {initialData.file_name}
                  </a>
                </div>
              )}

              <input
                type="file"
                {...register("file")}
                className="form-control"
              />
              {errors.file && (
                <small className="text-danger">{errors.file.message}</small>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="ms-2 btn btn-primary">
              {initialData ? "Update" : "Upload"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

FileModalForm.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
};

export default FileModalForm;
