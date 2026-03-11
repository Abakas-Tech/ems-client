import React, { useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import useloader from "../../../../../../context/Loader/useLoader";
import useResponse from "../../../../../../context/Response/useResponse";
import BackButton from "../../../../../../shared/components/BackButton/BackButton";
import {
  createMedicalRecord,
  updateMedicalRecord,
} from "../../../../api/worker.api";

// helper function
const renderLabel = (text, required = false) => {
  return (
    <label>
      {text} {required && <span className="text-danger">*</span>}
    </label>
  );
};

function Medical() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();

  // Receive raw medical object — same pattern as passport/coc
  const existingMedical = location.state?.medical || null;
  const isEditMode = Boolean(existingMedical);
  const isCreate = !isEditMode;

  const [formData, setFormData] = useState({
    medical_status: existingMedical?.medical_status || "",
    medical_center: existingMedical?.medical_center || "",
    medical_report_number: existingMedical?.medical_report_number || "",
    medical_issue_date: existingMedical?.issue_date || "",
    medical_expiry_date: existingMedical?.expiry_date || "",
  });

  const [medicalFile, setMedicalFile] = useState(null);
  const [existingFileUrl, setExistingFileUrl] = useState(
    existingMedical?.file?.url || null,
  );

  const [submitLoading, setSubmitLoading] = useState(false);

  const fileInputRef = useRef(null);

  const goBack = () => navigate(-1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setMedicalFile(e.target.files[0]);
    }
  };

  const validateMedical = () => {
    const { medical_status, medical_issue_date, medical_expiry_date } =
      formData;

    if (!["fit", "unfit", "pending"].includes(medical_status)) {
      return "Medical status must be fit, unfit, or pending";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (medical_issue_date) {
      const issue = new Date(medical_issue_date);
      if (isNaN(issue.getTime())) return "Issue date must be valid";
      if (issue > today) return "Issue date cannot be in the future";
    }

    if (medical_expiry_date) {
      const expiry = new Date(medical_expiry_date);
      if (isNaN(expiry.getTime())) return "Expiry date must be valid";
    }

    if (medical_issue_date && medical_expiry_date) {
      const issue = new Date(medical_issue_date);
      const expiry = new Date(medical_expiry_date);
      if (expiry <= issue) return "Expiry date must be after issue date";
    }

    // File required only on create
    if (!isEditMode && !medicalFile) return "Medical file is required";

    if (medicalFile) {
      const allowed = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/pdf",
      ];
      if (!allowed.includes(medicalFile.type))
        return "Medical file must be JPG, PNG or PDF";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateMedical();
    if (error) {
      addMessage(false, error);
      return;
    }

    setSubmitLoading(true);
    showLoader();

    try {
      const dataToSend = new FormData();

      dataToSend.append("medical_status", formData.medical_status);

      if (formData.medical_center) {
        dataToSend.append("medical_center", formData.medical_center);
      }
      if (formData.medical_report_number) {
        dataToSend.append(
          "medical_report_number",
          formData.medical_report_number,
        );
      }
      if (formData.medical_issue_date) {
        dataToSend.append("medical_issue_date", formData.medical_issue_date);
      }
      if (formData.medical_expiry_date) {
        dataToSend.append("medical_expiry_date", formData.medical_expiry_date);
      }

      // Append file only if new one selected
      if (medicalFile) {
        dataToSend.append("medical_file_url", medicalFile);
      }

      let response;
      if (isEditMode) {
        response = await updateMedicalRecord(id, dataToSend);
        addMessage(
          response?.success,
          response?.message || "Medical information updated successfully",
        );
      } else {
        response = await createMedicalRecord(id, dataToSend);
        addMessage(
          response?.success,
          response?.message || "Medical information created successfully",
        );

        // Reset only on create
        setFormData({
          medical_status: "",
          medical_center: "",
          medical_report_number: "",
          medical_issue_date: "",
          medical_expiry_date: "",
        });
        setMedicalFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }

      goBack();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      setSubmitLoading(false);
      hideLoader();
    }
  };

  const title = isEditMode
    ? "Edit Medical Information"
    : "Add Medical Information";
  const buttonText = isEditMode ? "Update Medical" : "Add Medical";

  return (
    <section className="dashboard-wraper">
      <BackButton onClick={goBack} />

      <form className="form-submit" onSubmit={handleSubmit}>
        <h2 className="fw-bold text-dark mb-3">{title}</h2>

        <div className="row">
          <div className="form-group col-md-6">
            {renderLabel("Medical Status", isCreate)}

            <select
              name="medical_status"
              className="form-control"
              value={formData.medical_status}
              onChange={handleChange}
              required
            >
              <option value="">Select status</option>
              <option value="fit">Fit</option>
              <option value="unfit">Unfit</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="form-group col-md-6">
            <label>Medical Center</label>
            <input
              type="text"
              name="medical_center"
              className="form-control"
              value={formData.medical_center}
              onChange={handleChange}
            />
          </div>

          <div className="form-group col-md-6">
            <label>Medical Report Number</label>
            <input
              type="text"
              name="medical_report_number"
              className="form-control"
              value={formData.medical_report_number}
              onChange={handleChange}
            />
          </div>

          <div className="form-group col-md-6">
            <label>Issue Date</label>
            <input
              type="date"
              name="medical_issue_date"
              className="form-control"
              value={formData.medical_issue_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group col-md-6">
            <label>Expiry Date</label>
            <input
              type="date"
              name="medical_expiry_date"
              className="form-control"
              value={formData.medical_expiry_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group col-md-6">
            {renderLabel(" Medical File", isCreate)}
            <input
              type="file"
              ref={fileInputRef}
              name="medical_file"
              className="form-control"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              required={!isEditMode}
            />
            <label>
              {isEditMode && existingFileUrl && (
                <small className="d-block text-muted">
                  Current file:{" "}
                  <a
                    href={existingFileUrl}
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

export default Medical;
