import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useloader from "../../../../../../context/loader/useLoader";
import useResponse from "../../../../../../context/response/useResponse";
import BackButton from "../../../../../../shared/components/BackButton/BackButton";
import { createPassport } from "../../../../api/worker.api";

function Passport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showloader, hideloader } = useloader();
  const { addMessage } = useResponse();

  const [formData, setFormData] = useState({
    passport_number: "",
    passport_issue_date: "",
    passport_expiry_date: "",
    passport_issuing_country: "Ethiopia",
  });

  const [passportScan, setPassportScan] = useState(null);
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
   const issueDateRaw = formData.passport_issue_date;
   const expiryDateRaw = formData.passport_expiry_date;


  if (!passportNumber) {
    return "Passport number is required";
  }
   
   if (passportNumber.length < 5 || passportNumber.length > 50) {
     return "Passport number must be between 5 and 50 characters";
   }

   const issueDate = new Date(issueDateRaw);
   const expiryDate = new Date(expiryDateRaw);
   const today = new Date();
   today.setHours(0, 0, 0, 0); 

   if (isNaN(issueDate.getTime())) {
     return "Passport issue date must be a valid date";
   }

   if (issueDate > today) {
     return "Passport issue date cannot be in the future";
   }

   if (isNaN(expiryDate.getTime())) {
     return "Passport expiry date must be a valid date";
   }

   if (expiryDate <= issueDate) {
     return "Passport expiry date must be after issue date";
   }

   if (!passportScan) {
     return "Passport scan file is required";
   }

   const allowedTypes = [
     "image/jpeg",
     "image/png",
     "image/jpg",
     "application/pdf",
   ];

   if (!allowedTypes.includes(passportScan.type)) {
     return "Passport scan must be an image or PDF file";
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
    showloader();

    try {
      const dataToSend = new FormData();

      dataToSend.append("passport_number", formData.passport_number);
      dataToSend.append("passport_issue_date", formData.passport_issue_date);
      dataToSend.append("passport_expiry_date", formData.passport_expiry_date);
      dataToSend.append(
        "passport_issuing_country",
        formData.passport_issuing_country || "Ethiopia",
      );
      dataToSend.append("passport_scan_url", passportScan);

        const response = await createPassport(id, dataToSend);
      addMessage(
        response?.success,
        response?.message || "Passport created successfully",
      );

      setFormData({
        passport_number: "",
        passport_issue_date: "",
        passport_expiry_date: "",
        passport_issuing_country: "Ethiopia",
      });
      setPassportScan(null);
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
        <h2 className="fw-bold text-dark mb-3">Worker Passport Information</h2>

        <div className="row">
          <div className="form-group col-md-6">
            <label>
              Passport Number <span className="text-danger">*</span>
            </label>
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
            <label>Issuing Country</label>
            <input
              type="text"
              name="passport_issuing_country"
              className="form-control"
              value={formData.passport_issuing_country}
              onChange={handleChange}
            />
          </div>

          <div className="form-group col-md-6">
            <label>
              Issue Date <span className="text-danger">*</span>
            </label>
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
            <label>
              Expiry Date <span className="text-danger">*</span>
            </label>
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
            <label>
              Passport Scan <span className="text-danger">*</span>
            </label>
            <input
              type="file"
              name="passport_scan"
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
            Add Passport
          </button>
        </div>
      </form>
    </section>
  );
}

export default Passport;
