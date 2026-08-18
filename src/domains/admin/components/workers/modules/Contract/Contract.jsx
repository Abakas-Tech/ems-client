import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import useLoader from "../../../../../../context/Loader/useLoader";
import useResponse from "../../../../../../context/Response/useResponse";
import BackButton from "../../../../../../shared/components/BackButton/BackButton";
import { createContract, updateContract } from "../../../../api/worker.api";
import { getUsers } from "../../../../api/user.api";

// helper function
const renderLabel = (text, required = false) => {
  return (
    <label>
      {text} {required && <span className="text-danger">*</span>}
    </label>
  );
};

function Contract() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const existingContract = location.state?.contract?.[0] || null;
  const isEditMode = Boolean(existingContract);
  const isCreate = !isEditMode;

  const [partners, setPartners] = useState([]);

  const [formData, setFormData] = useState({
    employer: existingContract?.employer || "",
    partner_id: existingContract?.partner_id || "",
    contract_start_date: existingContract?.contract_start_date || "",
    contract_end_date: existingContract?.contract_end_date || "",
    monthly_salary: existingContract?.monthly_salary || "",
    status: existingContract?.status || "pending",
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


  /* FETCH EMPLOYERS AND PARTNERS */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        showLoader();


        const partnerRes = await getUsers({ role_id: 3 });


        setPartners(partnerRes?.data || []);
      } catch (err) {
        addMessage(false, err.message);
      } finally {
        hideLoader();
      }
    };

    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateContract = () => {
 if (!formData.employer || !formData.employer.trim())
   return "Employer name is required";

 if (formData.partner_id) {
   if (
     !Number.isInteger(Number(formData.partner_id)) ||
     Number(formData.partner_id) <= 0
   )
     return "Partner ID must be a positive integer or empty";
 }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = formData.contract_start_date
      ? new Date(formData.contract_start_date)
      : null;

    const endDate = formData.contract_end_date
      ? new Date(formData.contract_end_date)
      : null;

    /* END DATE CANNOT EXIST WITHOUT START DATE */
    if (!startDate && endDate)
      return "Contract start date must be provided if end date exists";

    /* VALIDATE START DATE IF PROVIDED */
    if (startDate) {
      if (isNaN(startDate.getTime()))
        return "Contract start date must be a valid date";

      startDate.setHours(0, 0, 0, 0);

      if (startDate < today) return "Contract start date cannot be in the past";
    }

    /* VALIDATE END DATE IF PROVIDED */
    if (endDate) {
      if (isNaN(endDate.getTime()))
        return "Contract end date must be a valid date";

      endDate.setHours(0, 0, 0, 0);

      if (endDate <= startDate)
        return "Contract end date must be after start date";
    }

    if (!formData.monthly_salary) return "Monthly salary is required";

    const salary = Number(formData.monthly_salary);

    if (isNaN(salary) || salary <= 0)
      return "Monthly salary must be a positive number";

    const decimalParts = formData.monthly_salary.toString().split(".");
    if (decimalParts[1]?.length > 2)
      return "Monthly salary cannot have more than 2 decimal places";

    const validStatuses = ["pending", "approved", "rejected", "terminated"];

    if (!formData.status || !validStatuses.includes(formData.status))
      return `Status must be one of: ${validStatuses.join(", ")}`;



    return null;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateContract();
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
        ? await updateContract(id, dataToSend)
        : await createContract(id, dataToSend);

      addMessage(
        response?.success,
        response?.message ||
          (isEditMode
            ? "Contract updated successfully"
            : "Contract created successfully"),
      );

      navigate(-1);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      setSubmitLoading(false);
      hideLoader();
    }
  };

    const title = isEditMode
      ? "Edit Contract Information"
      : "Add Contract Information";
  const buttonText = isEditMode ? "Update Contract" : "Add Contract";

  return (
    <section className="dashboard-wraper">
      <BackButton onClick={goBack} />

      <form className="form-submit" onSubmit={handleSubmit}>
        <h2 className="fw-bold text-dark mb-3">{title}</h2>

        <div className="row">
          {/* EMPLOYER SELECT */}
          <div className="form-group col-md-6">
            {renderLabel("Employer", isCreate)}
            <input
              name="employer"
              className="form-control"
              required
              value={formData.employer_full_name}
              onChange={handleChange}
            >
            </input>
          </div>

          {/* PARTNER SELECT */}
          <div className="form-group col-md-6">
            <label>Partner</label>
            <select
              name="partner_id"
              className="form-control"
              value={formData.partner_id}
              onChange={handleChange}
            >
              <option value="">Select Partner</option>
              {partners.map((partner) => (
                <option
                  key={partner.partner_id}
                  value={Number(partner.partner_id)}
                >
                  {partner.full_name || partner.email}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group col-md-6">
            <label>Start Date</label>
            <input
              type="date"
              name="contract_start_date"
              className="form-control"
              value={formData.contract_start_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group col-md-6">
            <label>End Date</label>
            <input
              type="date"
              name="contract_end_date"
              className="form-control"
              value={formData.contract_end_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group col-md-6">
            {renderLabel("Monthly Salary", isCreate)}
            <input
              type="number"
              step="0.01"
              name="monthly_salary"
              className="form-control"
              required
              value={formData.monthly_salary}
              onChange={handleChange}
            />
          </div>

          <div className="form-group col-md-6">
            {renderLabel("Status", isCreate)}
            <select
              name="status"
              className="form-control"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="terminated">Terminated</option>
            </select>
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

export default Contract;
