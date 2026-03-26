import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import useLoader from "../../../../../../context/Loader/useLoader";
import useResponse from "../../../../../../context/Response/useResponse";
import BackButton from "../../../../../../shared/components/BackButton/BackButton";
import { createLmis, updateLmis } from "../../../../api/worker.api";

// helper function
const renderLabel = (text, required = false) => {
  return (
    <label>
      {text} {required && <span className="text-danger">*</span>}
    </label>
  );
};

function Lmis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const existingLmis = location.state?.lmis || null;
  const isEditMode = Boolean(existingLmis);
  const isCreate = !isEditMode;

  const [formData, setFormData] = useState({
    lmis_labour_id: existingLmis?.labour_id || "",
    approval_date: existingLmis?.approval_date || "",
  });

  const [qrFile, setQrFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const goBack = () => navigate(-1);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files?.length) {
      setQrFile(e.target.files[0]);
    }
  };

  const validateLmis = () => {
    const labourId = formData.lmis_labour_id.trim();

    if (labourId.length > 100) {
      return "LMIS labour ID cannot exceed 100 characters";
    }

    if (!isEditMode && !qrFile) {
      return "LMIS QR code file is required";
    }

    if (qrFile) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/pdf",
      ];

      if (!allowedTypes.includes(qrFile.type)) {
        return "LMIS QR code must be a JPEG, PNG, or PDF file";
      }
    }

    if (formData.approval_date) {
      const approvalDate = new Date(formData.approval_date);

      if (isNaN(approvalDate.getTime())) {
        return "Approval date must be a valid date";
      }
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateLmis();
    if (error) {
      addMessage(false, error);
      return;
    }

    setSubmitLoading(true);
    showLoader();

    try {
      const dataToSend = new FormData();

      dataToSend.append("lmis_labour_id", formData.lmis_labour_id);

      if (formData.approval_date) {
        dataToSend.append("approval_date", formData.approval_date);
      }

      if (qrFile) {
        dataToSend.append("lmis_qr_code_url", qrFile);
      }

      const response = isEditMode
        ? await updateLmis(id, dataToSend)
        : await createLmis(id, dataToSend);

      addMessage(
        response?.success,
        response?.message ||
          (isEditMode
            ? "LMIS information updated successfully"
            : "LMIS information created successfully"),
      );

      navigate(-1);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      setSubmitLoading(false);
      hideLoader();
    }
  };

  const title = isEditMode ? "Edit LMIS Information" : "Add LMIS Information";
  const buttonText = isEditMode ? "Update LMIS" : "Add LMIS";

  return (
    <section className="dashboard-wraper">
      <BackButton onClick={goBack} />

      <form className="form-submit" onSubmit={handleSubmit}>
        <h2 className="fw-bold text-dark mb-3">{title}</h2>

        <div className="row">
          <div className="form-group col-md-6">
            {renderLabel("Labour Id", isCreate)}

            <input
              type="text"
              name="lmis_labour_id"
              className="form-control"
              value={formData.lmis_labour_id}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group col-md-6">
            <label>Approval Date</label>

            <input
              type="date"
              name="approval_date"
              className="form-control"
              value={formData.approval_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group col-md-6">
            {renderLabel("QR Code", isCreate)}

            <input
              type="file"
              className="form-control"
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              onChange={handleFileChange}
              required={!isEditMode}
            />
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

export default Lmis;
