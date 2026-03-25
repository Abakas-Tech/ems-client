import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import useLoader from "../../../../../../context/Loader/useLoader";
import useResponse from "../../../../../../context/Response/useResponse";
import BackButton from "../../../../../../shared/components/BackButton/BackButton";
import { createGuarantor, updateGuarantor } from "../../../../api/worker.api";

function Guarantor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const existingGuarantor = location.state?.guarantor || null;
  const isEditMode = Boolean(existingGuarantor);

  const [formData, setFormData] = useState({
    guarantor_name: existingGuarantor?.guarantor_name || "",
    relation: existingGuarantor?.relation || "",
    guarantor_address: existingGuarantor?.guarantor_address || "",
    guarantor_phone_number: existingGuarantor?.guarantor_phone_number || "",
  });

  const [idScanFile, setIdScanFile] = useState(null);
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
      setIdScanFile(e.target.files[0]);
    }
  };

  /* VALIDATION FOLLOWING BACKEND JOI */
  const validateGuarantor = () => {
    if (formData.guarantor_name.length > 150)
      return "Name cannot exceed 150 characters";

    if (formData.relation && formData.relation.length > 200)
      return "Relation cannot exceed 200 characters";

    const phoneRegex = /^(?:\+251[79]\d{8}|09\d{8})$/;

    if (!phoneRegex.test(formData.guarantor_phone_number))
      return "Phone must be valid format";

    if (!isEditMode && !idScanFile) return "ID scan file is required";

    if (idScanFile) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/pdf",
      ];

      if (!allowedTypes.includes(idScanFile.type))
        return "ID scan must be JPEG, PNG, JPG, or PDF";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateGuarantor();

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

      if (idScanFile) {
        dataToSend.append("id_scan_url", idScanFile);
      }

      const response = isEditMode
        ? await updateGuarantor(id, dataToSend)
        : await createGuarantor(id, dataToSend);

      addMessage(
        response?.success,
        response?.message ||
          (isEditMode
            ? "Emergency contact updated successfully"
            : "Emergency contact created successfully"),
      );

      navigate(-1);
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
        <h2 className="fw-bold text-dark mb-3">Emergency Contact</h2>

        <div className="row">
          {/* GUARANTOR NAME */}
          <div className="form-group col-md-6">
            <label>
              Name <span className="text-danger">*</span>
            </label>

            <input
              type="text"
              name="guarantor_name"
              className="form-control"
              required
              value={formData.guarantor_name}
              onChange={handleChange}
            />
          </div>

          {/* RELATION */}
          <div className="form-group col-md-6">
            <label>Relation</label>

            <input
              type="text"
              name="relation"
              className="form-control"
              value={formData.relation}
              onChange={handleChange}
            />
          </div>

          {/* PHONE */}
          <div className="form-group col-md-6">
            <label>
              Phone Number <span className="text-danger">*</span>
            </label>

            <input
              type="text"
              name="guarantor_phone_number"
              className="form-control"
              required
              value={formData.guarantor_phone_number}
              onChange={handleChange}
            />
          </div>

          {/* ADDRESS */}
          <div className="form-group col-md-6">
            <label>Address</label>

            <input
              name="guarantor_address"
              className="form-control"
              rows="3"
              value={formData.guarantor_address}
              onChange={handleChange}
            />
          </div>

          {/* FILE */}
          <div className="form-group col-md-6">
            <label>
              ID Scan {!isEditMode && <span className="text-danger">*</span>}
            </label>

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
            {isEditMode ? "Update emergency contact " : "Add emergency conatct"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default Guarantor;
