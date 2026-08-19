import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import useLoader from "../../../../../../context/Loader/useLoader";
import useResponse from "../../../../../../context/Response/useResponse";
import BackButton from "../../../../../../shared/components/BackButton/BackButton";
import { createGuarantor, updateGuarantor } from "../../../../api/worker.api";

// helper function
const renderLabel = (text, required = false) => {
  return (
    <label>
      {text} {required && <span className="text-danger">*</span>}
    </label>
  );
};

function Guarantor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const existingGuarantor = location.state?.guarantor || null;
  const isEditMode = Boolean(existingGuarantor);
  const isCreate = !isEditMode;

  const [formData, setFormData] = useState({
    guarantor_name: existingGuarantor?.guarantor_name || "",
    relation: existingGuarantor?.relation || "",
    guarantor_address: existingGuarantor?.guarantor_address || "",
    guarantor_phone_number: existingGuarantor?.guarantor_phone_number || "",
  });

  const [submitLoading, setSubmitLoading] = useState(false);

  const goBack = () => navigate(-1);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const title = isEditMode ? "Edit Emergency Contact" : "Add Emergency Contact";
  const buttonText = isEditMode ? "Update Emergency" : "Add Emergency";

  return (
    <section className="dashboard-wraper">
      <BackButton onClick={goBack} />

      <form className="form-submit" onSubmit={handleSubmit}>
        <h2 className="fw-bold text-dark mb-3">{title}</h2>

        <div className="row">
          {/* GUARANTOR NAME */}
          <div className="form-group col-md-6">
            {renderLabel("Name", isCreate)}

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
            {renderLabel("Phone Number", isCreate)}

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

export default Guarantor;
