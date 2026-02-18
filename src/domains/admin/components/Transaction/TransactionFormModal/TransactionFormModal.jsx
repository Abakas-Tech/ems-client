import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { createTransaction } from "../../../api/finance.api";
import useLoader from "../../../../../context/Loader/UseLoader";
import useResponse from "../../../../../context/response/UseResponse";

const RecordTransaction = ({ isEditMode = false, initialData = null }) => {
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Handle Back Navigation
  const handleBack = () => {
    navigate("/admin/finance");
  };

  // Prefill data if in Edit Mode
  useEffect(() => {
    if (isEditMode && initialData) {
      reset({
        ...initialData,
        transaction_date: initialData.transaction_date?.split("T")[0], // Format for date input
      });
    }
  }, [isEditMode, initialData, reset]);

  const onSubmit = async (data) => {
    showLoader();
    try {
      let response;
      // Normalizing data: ensure user_id is passed correctly for agency logic
      const payload = {
        ...data,
        amount: parseFloat(data.amount),
        // type is derived from category for simplified UX, or can be a separate field
        type: ["income", "commission"].includes(data.category)
          ? "income"
          : "expense",
      };

      if (isEditMode) {
        response = await updateTransaction(initialData.id, payload);
      } else {
        response = await createTransaction(payload);
      }

      addMessage(true, response.message || "Transaction saved successfully");
      navigate("/admin/finance");
    } catch (error) {
      addMessage(false, error.message);
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="dashboard-wraper">
      <div className="form-submit">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-2">
              {isEditMode ? "Update Transaction" : "Record New Transaction"}
            </h2>
            <p className="text-muted">
              {isEditMode
                ? "Modify existing financial record details."
                : "Enter financial details for workers, employers, or agency operations."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleBack}
            className="border rounded-circle d-flex align-items-center justify-content-center btn btn-light shadow-sm"
            style={{ width: "40px", height: "40px" }}
          >
            ←
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="submit-section bg-white p-4 rounded shadow-sm">
            <div className="row">
              {/* Linked User (The Agency Logic: Who is this for?) */}
              <div className="form-group col-md-6 mb-3">
                <label className="fw-bold mb-1">
                  Target User ID (Worker/Employer/Admin)
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.user_id ? "is-invalid" : ""}`}
                  placeholder="Enter User ID"
                  {...register("user_id", {
                    required: "Associated User ID is required",
                  })}
                />
                {errors.user_id && (
                  <div className="invalid-feedback">
                    {errors.user_id.message}
                  </div>
                )}
              </div>

              {/* Amount */}
              <div className="form-group col-md-6 mb-3">
                <label className="fw-bold mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className={`form-control ${errors.amount ? "is-invalid" : ""}`}
                  placeholder="0.00"
                  {...register("amount", {
                    required: "Amount is required",
                    min: {
                      value: 0.01,
                      message: "Amount must be greater than 0",
                    },
                  })}
                />
                {errors.amount && (
                  <div className="invalid-feedback">
                    {errors.amount.message}
                  </div>
                )}
              </div>

              {/* Category */}
              <div className="form-group col-md-6 mb-3">
                <label className="fw-bold mb-1">Category</label>
                <select
                  className={`form-control ${errors.category ? "is-invalid" : ""}`}
                  {...register("category", {
                    required: "Please select a category",
                  })}
                >
                  <option value="">Select Category</option>
                  <optgroup label="Income">
                    <option value="income">Candidate Deposit</option>
                    <option value="commission">Employer Commission</option>
                    <option value="other_income">Other Income</option>
                  </optgroup>
                  <optgroup label="Expenses">
                    <option value="expense">Visa Processing Fee</option>
                    <option value="vat">Government VAT/Tax</option>
                    <option value="salary">Employee Salary</option>
                    <option value="office">Office/Logistics</option>
                  </optgroup>
                </select>
                {errors.category && (
                  <div className="invalid-feedback">
                    {errors.category.message}
                  </div>
                )}
              </div>

              {/* Date */}
              <div className="form-group col-md-6 mb-3">
                <label className="fw-bold mb-1">Transaction Date</label>
                <input
                  type="date"
                  className={`form-control ${errors.transaction_date ? "is-invalid" : ""}`}
                  {...register("transaction_date", {
                    required: "Date is required",
                  })}
                />
                {errors.transaction_date && (
                  <div className="invalid-feedback">
                    {errors.transaction_date.message}
                  </div>
                )}
              </div>

              {/* Reference */}
              <div className="form-group col-md-12 mb-3">
                <label className="fw-bold mb-1">
                  Reference Number (Receipt/Invoice ID)
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="REF-12345"
                  {...register("reference")}
                />
              </div>

              {/* Description */}
              <div className="form-group col-md-12 mb-3">
                <label className="fw-bold mb-1">Description / Notes</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Additional details regarding this transaction..."
                  {...register("description")}
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="form-group col-lg-12 text-start mt-4">
                <button
                  type="submit"
                  className="btn btn-main px-5 py-2 rounded fw-bold text-white"
                  style={{ backgroundColor: "var(--maincolor)" }}
                >
                  {isEditMode ? "Update Record" : "Save Transaction"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary ms-3 px-4 py-2"
                  onClick={handleBack}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordTransaction;
