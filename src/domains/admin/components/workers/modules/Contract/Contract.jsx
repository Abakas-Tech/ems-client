import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import useLoader from "../../../../../../context/Loader/useLoader";
import useResponse from "../../../../../../context/Response/useResponse";
import BackButton from "../../../../../../shared/components/BackButton/BackButton";
import { createContract, updateContract } from "../../../../api/worker.api";
import { getUsers } from "../../../../api/user.api"; // added

function Contract() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const existingContract = location.state?.contract?.[0] || null;
  const isEditMode = Boolean(existingContract);

  const [employers, setEmployers] = useState([]);
  const [partners, setPartners] = useState([]);

  const [formData, setFormData] = useState({
    employer_id: existingContract?.employer_id || "",
    partner_id: existingContract?.partner_id || "",
    contract_start_date: existingContract?.contract_start_date || "",
    contract_end_date: existingContract?.contract_end_date || "",
    monthly_salary: existingContract?.monthly_salary || "",
    status: existingContract?.status || "pending",
  });

  const [contractFile, setContractFile] = useState(null);
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
      setContractFile(e.target.files[0]);
    }
  };

  /* FETCH EMPLOYERS AND PARTNERS */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        showLoader();

        const employerRes = await getUsers({ role_id: 5 });
        const partnerRes = await getUsers({ role_id: 3 });

        setEmployers(employerRes?.data || []);
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
    if (
      !Number.isInteger(Number(formData.employer_id)) ||
      Number(formData.employer_id) <= 0
    )
      return "Employer ID must be a positive integer";

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

    if (!isEditMode && !contractFile) return "Contract file is required";

    if (contractFile) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/pdf",
      ];

      if (!allowedTypes.includes(contractFile.type))
        return "Contract file must be JPEG, PNG, or PDF";
    }

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

      if (contractFile) {
        dataToSend.append("contract_upload_url", contractFile);
      }

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

  return (
    <section className="dashboard-wraper">
      <BackButton onClick={goBack} />

      <form className="form-submit" onSubmit={handleSubmit}>
        <h2 className="fw-bold text-dark mb-3">Contract Information</h2>

        <div className="row">
          {/* EMPLOYER SELECT */}
          <div className="form-group col-md-6">
            <label>
              Employer ID <span className="text-danger">*</span>
            </label>
            <select
              name="employer_id"
              className="form-control"
              required
              value={formData.employer_id}
              onChange={handleChange}
            >
              <option value="">Select Employer</option>
              {employers.map((emp) => (
                <option key={emp.employer_id} value={Number(emp.employer_id)}>
                  {emp.full_name || emp.email}
                </option>
              ))}
            </select>
          </div>

          {/* PARTNER SELECT */}
          <div className="form-group col-md-6">
            <label>Partner ID</label>
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
            <label>
              Monthly Salary <span className="text-danger">*</span>
            </label>
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
            <label>
              Status {!isEditMode && <span className="text-danger">*</span>}
            </label>
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

          <div className="form-group col-md-6">
            <label>
              Contract File{" "}
              {!isEditMode && <span className="text-danger">*</span>}
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
            {isEditMode ? "Update Contract" : "Add Contract"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default Contract;
