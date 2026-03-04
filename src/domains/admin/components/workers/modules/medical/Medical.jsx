import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useloader from "../../../../../../context/loader/useLoader";
import useResponse from "../../../../../../context/response/useResponse";
import BackButton from "../../../../../../shared/components/BackButton/BackButton";
import { createMedicalRecord } from "../../../../api/worker.api";

function Medical() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showloader, hideloader } = useloader();
  const { addMessage } = useResponse();

  const [formData, setFormData] = useState({
    medical_status: "",
    medical_center: "",
    medical_report_number: "",
    issue_date: "",
    expiry_date: "",
  });

  const [medicalFile, setMedicalFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

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
   

   const { medical_status, issue_date, expiry_date } = formData;

   if (!["fit", "unfit", "pending"].includes(medical_status)) {
     return "Medical status must be fit, unfit, or pending";
   }

   const today = new Date();
   today.setHours(0, 0, 0, 0);

   if (issue_date) {
     const issue = new Date(issue_date);

     if (isNaN(issue.getTime())) {
       return "Issue date must be a valid date";
     }

     if (issue > today) {
       return "Issue date cannot be in the future";
     }
   }

   if (expiry_date) {
     const expiry = new Date(expiry_date);

     if (isNaN(expiry.getTime())) {
       return "Expiry date must be a valid date";
     }
   }

   if (issue_date && expiry_date) {
     const issue = new Date(issue_date);
     const expiry = new Date(expiry_date);

     if (expiry <= issue) {
       return "Expiry date must be after issue date";
     }
   }

   if (!medicalFile) {
     return "Medical file is required";
   }

   const allowedTypes = [
     "image/jpeg",
     "image/png",
     "image/jpg",
     "application/pdf",
   ];

   if (!allowedTypes.includes(medicalFile.type)) {
     return "Medical file must be an image or PDF";
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
    showloader();

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

      if (formData.issue_date) {
        dataToSend.append("issue_date", formData.issue_date);
      }

      if (formData.expiry_date) {
        dataToSend.append("expiry_date", formData.expiry_date);
      }

      dataToSend.append("medical_file_url", medicalFile);

      const response = await createMedicalRecord(id, dataToSend);

      addMessage(
        response?.success,
        response?.message || "Medical information created successfully",
      );

      setFormData({
        medical_status: "",
        medical_center: "",
        medical_report_number: "",
        issue_date: "",
        expiry_date: "",
      });
      setMedicalFile(null);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      setSubmitLoading(false);
      hideloader();
    }
  };

  return (
    <section className="dashboard-wraper">
      <BackButton onClick={goBack} />

      <form className="form-submit" onSubmit={handleSubmit}>
        <h2 className="fw-bold text-dark mb-3">Worker Medical Information</h2>

        <div className="row">
          <div className="form-group col-md-6">
            <label>
              Medical Status <span className="text-danger">*</span>
            </label>
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
              name="issue_date"
              className="form-control"
              value={formData.issue_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group col-md-6">
            <label>Expiry Date</label>
            <input
              type="date"
              name="expiry_date"
              className="form-control"
              value={formData.expiry_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group col-md-6">
            <label>
              Medical File <span className="text-danger">*</span>
            </label>
            <input
              type="file"
              name="medical_file"
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
            Add Medical Information
          </button>
        </div>
      </form>
    </section>
  );
}

export default Medical;
