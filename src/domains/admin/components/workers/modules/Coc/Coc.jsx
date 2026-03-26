import React, { useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import useloader from "../../../../../../context/Loader/useLoader";
import useResponse from "../../../../../../context/Response/useResponse";
import BackButton from "../../../../../../shared/components/BackButton/BackButton";
import { createCoc, updateCoc } from "../../../../api/worker.api";

// helper function
const renderLabel = (text, required = false) => {
  return (
    <label>
      {text} {required && <span className="text-danger">*</span>}
    </label>
  );
};

function Coc() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();

  // Receive raw coc object — same as passport/lmis
  const existingCoc = location.state?.coc || null;
  const isEditMode = Boolean(existingCoc);
  const isCreate = !isEditMode;

  const [formData, setFormData] = useState({
    coc_number: existingCoc?.coc_number || "",
    coc_assessment_center: existingCoc?.assessment_center || "",
    coc_assessment_date: existingCoc?.assessment_date || "",
    coc_issue_date: existingCoc?.issue_date || "",
    coc_expiry_date: existingCoc?.expiry_date || "",
  });

  const [cocDocument, setCocDocument] = useState(null);
  const [existingDocumentUrl] = useState(
    existingCoc?.document?.url || null,
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
      setCocDocument(e.target.files[0]);
    }
  };

  const validateCoc = () => {
    const assessmentCenter = formData.coc_assessment_center?.trim();
    const cocNumber = formData.coc_number?.trim();

    if (!assessmentCenter) return "Assessment center is required";

    if (cocNumber && (cocNumber.length < 3 || cocNumber.length > 50))
      return "COC number must be 3–50 characters";

    const assessmentDate = new Date(formData.coc_assessment_date);
    const issueDate = new Date(formData.coc_issue_date);
    const expiryDate = new Date(formData.coc_expiry_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(assessmentDate.getTime())) return "Invalid assessment date";
    if (assessmentDate > today) return "Assessment date cannot be in future";

    if (isNaN(issueDate.getTime())) return "Invalid issue date";
    if (issueDate > today) return "Issue date cannot be in future";

    if (isNaN(expiryDate.getTime())) return "Invalid expiry date";
    if (expiryDate <= issueDate) return "Expiry must be after issue date";

    // File required only on create
    if (!isEditMode && !cocDocument) return "COC document is required";

    if (cocDocument) {
      const allowed = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/pdf",
      ];
      if (!allowed.includes(cocDocument.type))
        return "COC document must be JPG, PNG or PDF";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateCoc();
    if (error) {
      addMessage(false, error);
      return;
    }

    setSubmitLoading(true);
    showLoader();

    try {
      const dataToSend = new FormData();

      dataToSend.append(
        "coc_assessment_center",
        formData.coc_assessment_center,
      );

      if (formData.coc_number) {
        dataToSend.append("coc_number", formData.coc_number);
      }

      if (formData.coc_assessment_date) {
        dataToSend.append("coc_assessment_date", formData.coc_assessment_date);
      }
      if (formData.coc_issue_date) {
        dataToSend.append("coc_issue_date", formData.coc_issue_date);
      }
      if (formData.coc_expiry_date) {
        dataToSend.append("coc_expiry_date", formData.coc_expiry_date);
      }

      // Append file only if new one selected
      if (cocDocument) {
        dataToSend.append("coc_document_url", cocDocument);
      }

      let response;
      if (isEditMode) {
        response = await updateCoc(id, dataToSend);
        addMessage(
          response?.success,
          response?.message || "COC updated successfully",
        );
      } else {
        response = await createCoc(id, dataToSend);
        addMessage(
          response?.success,
          response?.message || "COC created successfully",
        );

        // Reset only on create
        setFormData({
          coc_number: "",
          coc_assessment_center: "",
          coc_assessment_date: "",
          coc_issue_date: "",
          coc_expiry_date: "",
        });
        setCocDocument(null);
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

  const title = isEditMode ? "Edit COC Information" : "Add COC Information";
  const buttonText = isEditMode ? "Update COC" : "Add COC";

  return (
    <section className="dashboard-wraper">
      <BackButton onClick={goBack} />

      <form className="form-submit" onSubmit={handleSubmit}>
        <h2 className="fw-bold text-dark mb-3">{title}</h2>

        <div className="row">
          <div className="form-group col-md-6">
            <label>COC Number</label>
            <input
              type="text"
              name="coc_number"
              className="form-control"
              value={formData.coc_number}
              onChange={handleChange}
            />
          </div>

          <div className="form-group col-md-6">
            {renderLabel("Assessment Center", isCreate)}
            <input
              type="text"
              name="coc_assessment_center"
              className="form-control"
              value={formData.coc_assessment_center}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group col-md-6">
            {renderLabel("Assessment Date", isCreate)}
            <input
              type="date"
              name="coc_assessment_date"
              className="form-control"
              value={formData.coc_assessment_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group col-md-6">
            {renderLabel("Issue Date ", isCreate)}
            <input
              type="date"
              name="coc_issue_date"
              className="form-control"
              value={formData.coc_issue_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group col-md-6">
            {renderLabel(" Expiry Date  ", isCreate)}
            <input
              type="date"
              name="coc_expiry_date"
              className="form-control"
              value={formData.coc_expiry_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group col-md-6">
            {renderLabel(" COC Document  ", isCreate)}
            <input
              type="file"
              ref={fileInputRef}
              name="coc_document"
              className="form-control"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              required={!isEditMode}
            />
            <label>
              {isEditMode && existingDocumentUrl && (
                <small className="d-block text-muted">
                  Current document:{" "}
                  <a
                    href={existingDocumentUrl}
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

        <div className="submit-section">
          <button
            type="submit"
            className="btn btn-main px-4 rounded"
            disabled={submitLoading}
          >
            {buttonText}
          </button>
        </div>
      </form>
    </section>
  );
}

export default Coc;
