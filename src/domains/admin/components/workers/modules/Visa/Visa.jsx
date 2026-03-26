import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import useLoader from "../../../../../../context/Loader/useLoader";
import useResponse from "../../../../../../context/Response/useResponse";
import BackButton from "../../../../../../shared/components/BackButton/BackButton";
import { createVisa, updateVisa } from "../../../../api/worker.api";

function Visa() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const existingVisa = location.state?.visa || null;
  const isEditMode = Boolean(existingVisa);
  const isCreate = !isEditMode;

  const [formData, setFormData] = useState({
    visa_number: existingVisa?.visa_number || "",
    visa_issue_date: existingVisa?.issue_date || "",
    visa_expiry_date: existingVisa?.expiry_date || "",
    visa_reference_number: existingVisa?.reference_number || "",
    visa_reference_date: existingVisa?.reference_date || "",
  });

  const [visaFile, setVisaFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [existingVisaUrl, setExistingVisaUrl] = useState(
    existingVisa?.document?.url || null,
  );

  const goBack = () => navigate(-1);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setVisaFile(file);
    }
  };

  /* VALIDATION BASED ON JOI */
  const validateVisa = () => {
    if (formData.visa_number && formData.visa_number.length > 100)
      return "Visa number cannot exceed 100 characters";

    if (
      formData.visa_reference_number &&
      formData.visa_reference_number.length > 100
    )
      return "Reference number cannot exceed 100 characters";

    if (formData.visa_issue_date && formData.visa_expiry_date) {
      if (
        new Date(formData.visa_expiry_date) <=
        new Date(formData.visa_issue_date)
      )
        return "Visa expiry date must be greater than issue date";
    }

    if (!isEditMode && !visaFile) return "Visa scan document is required";

    if (visaFile) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/pdf",
      ];

      if (!allowedTypes.includes(visaFile.type))
        return "Visa scan must be JPEG, PNG, JPG, or PDF";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateVisa();

    if (error) {
      addMessage(false, error);
      return;
    }

    setSubmitLoading(true);
    showLoader();

    try {
      const dataToSend = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key]) dataToSend.append(key, formData[key]);
      });

      if (visaFile) {
        dataToSend.append("visa_url", visaFile);
      }

      const response = isEditMode
        ? await updateVisa(id, dataToSend)
        : await createVisa(id, dataToSend);

      addMessage(
        response?.success,
        response?.message ||
          (isEditMode
            ? "Visa updated successfully"
            : "Visa created successfully"),
      );

      navigate(-1);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      setSubmitLoading(false);
      hideLoader();
    }
  };

  const title = isEditMode ? "Edit Visa Information" : "Add Visa Information";
  const buttonText = isEditMode ? "Update Visa" : "Add Visa";

  return (
    <section className="dashboard-wraper">
      <BackButton onClick={goBack} />

      <form className="form-submit" onSubmit={handleSubmit}>
        <h2 className="fw-bold text-dark mb-3">{title}</h2>

        <div className="row">
          {/* VISA NUMBER */}
          <div className="form-group col-md-6">
            <label>Visa Number</label>

            <input
              type="text"
              name="visa_number"
              className="form-control"
              value={formData.visa_number}
              onChange={handleChange}
            />
          </div>

          {/* ISSUE DATE */}
          <div className="form-group col-md-6">
            <label>Issue Date</label>

            <input
              type="date"
              name="visa_issue_date"
              className="form-control"
              value={formData.visa_issue_date}
              onChange={handleChange}
            />
          </div>

          {/* EXPIRY DATE */}
          <div className="form-group col-md-6">
            <label>Expiry Date</label>

            <input
              type="date"
              name="visa_expiry_date"
              className="form-control"
              value={formData.visa_expiry_date}
              onChange={handleChange}
            />
          </div>

          {/* REFERENCE NUMBER */}
          <div className="form-group col-md-6">
            <label>Reference Number</label>

            <input
              type="text"
              name="visa_reference_number"
              className="form-control"
              value={formData.visa_reference_number}
              onChange={handleChange}
            />
          </div>

          {/* REFERENCE DATE */}
          <div className="form-group col-md-6">
            <label>Reference Date</label>

            <input
              type="date"
              name="visa_reference_date"
              className="form-control"
              value={formData.visa_reference_date}
              onChange={handleChange}
            />
          </div>

          {/* FILE */}
          <div className="form-group col-md-6">
            <label>
              Visa Scan {!isEditMode && <span className="text-danger">*</span>}
            </label>

            <input
              type="file"
              className="form-control"
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              onChange={handleFileChange}
              required={!isEditMode}
            />

            <label>
              {isEditMode && existingVisaUrl && (
                <small className="d-block text-muted">
                  Current Visa:{" "}
                  <a
                    href={existingVisaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </a>
                </small>
              )}
            </label>
          </div>
        </div>

        <div className="submit-section mt-4">
          <button
            type="submit"
            className="btn btn-main px-5 rounded"
            disabled={submitLoading}
          >
            {buttonText}
          </button>
        </div>
      </form>
    </section>
  );
}

export default Visa;
