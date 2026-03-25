import React, { useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import useloader from "../../../../../../context/Loader/useLoader";
import useResponse from "../../../../../../context/Response/useResponse";
import BackButton from "../../../../../../shared/components/BackButton/BackButton";
import { createPassport, updatePassport } from "../../../../api/worker.api";

// helper function
const renderLabel = (text, required = false) => {
  return (
    <label>
      {text} {required && <span className="text-danger">*</span>}
    </label>
  );
};

function Passport() {
  const fileInputRef = useRef(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();

  // Receive the raw passport object (same pattern as LMIS)
  const existingPassport = location.state?.passport || null;
  const isEditMode = Boolean(existingPassport);
  const isCreate = !isEditMode;

  const [formData, setFormData] = useState({
    passport_number: existingPassport?.passport_number || "",
    passport_issue_date: existingPassport?.issue_date || "",
    passport_expiry_date: existingPassport?.expiry_date || "",
    passport_issuing_country: existingPassport?.issuing_country || "Ethiopia",
  });

  const [passportScan, setPassportScan] = useState(null);
  const [existingScanUrl, setExistingScanUrl] = useState(
    existingPassport?.scan?.url || null,
  );

  const [submitLoading, setSubmitLoading] = useState(false);

  const goBack = () => navigate(-1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setPassportScan(e.target.files[0]);
    }
  };

  const validatePassport = () => {
    const passportNumber = formData.passport_number?.trim();

    if (!passportNumber) return "Passport number is required";
    if (passportNumber.length < 5 || passportNumber.length > 50)
      return "Passport number must be 5–50 characters";

    const issue = new Date(formData.passport_issue_date);
    const expiry = new Date(formData.passport_expiry_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(issue.getTime())) return "Invalid issue date";
    if (issue > today) return "Issue date cannot be in future";

    if (isNaN(expiry.getTime())) return "Invalid expiry date";
    if (expiry <= issue) return "Expiry must be after issue date";

    // File required only on create
    if (!isEditMode && !passportScan) return "Passport scan is required";

    if (passportScan) {
      const allowed = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/pdf",
      ];
      if (!allowed.includes(passportScan.type))
        return "Only JPG, PNG or PDF allowed";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validatePassport();
    if (error) {
      addMessage(false, error);
      return;
    }

    setSubmitLoading(true);
    showLoader();

    try {
      const dataToSend = new FormData();
      dataToSend.append("passport_number", formData.passport_number);
      dataToSend.append("passport_issue_date", formData.passport_issue_date);
      dataToSend.append("passport_expiry_date", formData.passport_expiry_date);
      dataToSend.append(
        "passport_issuing_country",
        formData.passport_issuing_country || "Ethiopia",
      );

      if (passportScan) {
        dataToSend.append("passport_scan_url", passportScan);
      }

      let response;
      if (isEditMode) {
        response = await updatePassport(id, dataToSend);
        addMessage(
          response?.success,
          response?.message || "Passport updated successfully",
        );
      } else {
        response = await createPassport(id, dataToSend);
        addMessage(
          response?.success,
          response?.message || "Passport created successfully",
        );
        // Reset only on create
        setFormData({
          passport_number: "",
          passport_issue_date: "",
          passport_expiry_date: "",
          passport_issuing_country: "Ethiopia",
        });
        setPassportScan(null);
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
    ? "Edit Passport Information"
    : "Add Passport Information";
  const buttonText = isEditMode ? "Update Passport" : "Add Passport";

  return (
    <section className="dashboard-wraper">
      <BackButton onClick={goBack} />

      <form className="form-submit" onSubmit={handleSubmit}>
        <h2 className="fw-bold text-dark mb-3">{title}</h2>

        <div className="row">
          <div className="form-group col-md-6">
            {renderLabel("Passport Number", isCreate)}
            <input
              type="text"
              name="passport_number"
              className="form-control"
              value={formData.passport_number}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group col-md-6">
            {renderLabel("Issuing Country", isCreate)}
            <input
              type="text"
              name="passport_issuing_country"
              className="form-control"
              value={formData.passport_issuing_country}
              onChange={handleChange}
            />
          </div>

          <div className="form-group col-md-6">
            {renderLabel("Issue Date", isCreate)}
            <input
              type="date"
              name="passport_issue_date"
              className="form-control"
              value={formData.passport_issue_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group col-md-6">
            {renderLabel("Expiry Date", isCreate)}
            <input
              type="date"
              name="passport_expiry_date"
              className="form-control"
              value={formData.passport_expiry_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group col-md-6">
            {renderLabel("Passport Scan", isCreate)}
            <input
              type="file"
              ref={fileInputRef}
              className="form-control"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              required={!isEditMode}
            />
            <label>
              {isEditMode && existingScanUrl && (
                <small className="d-block text-muted">
                  Current scan:{" "}
                  <a
                    href={existingScanUrl}
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

export default Passport;
