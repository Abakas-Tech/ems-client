import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useloader from "../../../../../../context/Loader/useLoader";
import useResponse from "../../../../../../context/Response/useResponse";
import BackButton from "../../../../../../shared/components/BackButton/BackButton";
import { createCoc } from "../../../../api/worker.api";

function Coc() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();

  const [formData, setFormData] = useState({
    coc_number: "",
    coc_assessment_center: "",
    coc_assessment_date: "",
    coc_issue_date: "",
    coc_expiry_date: "",
  });

  const [cocDocument, setCocDocument] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

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

    const assessmentDateRaw = formData.coc_assessment_date;
    const issueDateRaw = formData.coc_issue_date;
    const expiryDateRaw = formData.coc_expiry_date;

    if (!assessmentCenter) {
      return "COC assessment center is required";
    }

    if (cocNumber && (cocNumber.length < 3 || cocNumber.length > 50)) {
      return "COC number must be between 3 and 50 characters";
    }

    const assessmentDate = new Date(assessmentDateRaw);
    const issueDate = new Date(issueDateRaw);
    const expiryDate = new Date(expiryDateRaw);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(assessmentDate.getTime())) {
      return "COC assessment date must be a valid date";
    }

    if (assessmentDate > today) {
      return "COC assessment date cannot be in the future";
    }

    if (isNaN(issueDate.getTime())) {
      return "COC issue date must be a valid date";
    }

    if (issueDate > today) {
      return "COC issue date cannot be in the future";
    }

    if (isNaN(expiryDate.getTime())) {
      return "COC expiry date must be a valid date";
    }

    if (expiryDate <= issueDate) {
      return "COC expiry date must be after issue date";
    }

    if (!cocDocument) {
      return "COC document file is required";
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];

    if (!allowedTypes.includes(cocDocument.type)) {
      return "COC document must be an image or PDF file";
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

      if (formData.coc_number) {
        dataToSend.append("coc_number", formData.coc_number);
      }

      dataToSend.append(
        "coc_assessment_center",
        formData.coc_assessment_center,
      );
      dataToSend.append("coc_assessment_date", formData.coc_assessment_date);
      dataToSend.append("coc_issue_date", formData.coc_issue_date);
      dataToSend.append("coc_expiry_date", formData.coc_expiry_date);
      dataToSend.append("coc_document_url", cocDocument);

      const response = await createCoc(id, dataToSend);

      addMessage(
        response?.success,
        response?.message || "COC created successfully",
      );

      setFormData({
        coc_number: "",
        coc_assessment_center: "",
        coc_assessment_date: "",
        coc_issue_date: "",
        coc_expiry_date: "",
      });
      setCocDocument(null);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      setSubmitLoading(false);
      hideLoader();
    }
  };

  return (
    <section className="dashboard-wraper">
      <BackButton onClick={goBack} />

      <form className="form-submit" onSubmit={handleSubmit}>
        <h2 className="fw-bold text-dark mb-3">
          Worker Certificate of Competency (COC)
        </h2>

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
            <label>
              Assessment Center <span className="text-danger">*</span>
            </label>
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
            <label>
              Assessment Date <span className="text-danger">*</span>
            </label>
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
            <label>
              Issue Date <span className="text-danger">*</span>
            </label>
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
            <label>
              Expiry Date <span className="text-danger">*</span>
            </label>
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
            <label>
              COC Document <span className="text-danger">*</span>
            </label>
            <input
              type="file"
              name="coc_document"
              className="form-control"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              required
            />
          </div>
        </div>

        <div className="submit-section mt-4">
          <button
            type="submit"
            className="btn btn-main px-5 rounded"
            disabled={submitLoading}
          >
            Add COC
          </button>
        </div>
      </form>
    </section>
  );
}

export default Coc;
