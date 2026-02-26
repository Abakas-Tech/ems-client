import React, { useState, useEffect } from "react";
import { createTransaction } from "../../../api/finance.api";
import useLoader from "../../../../../context/Loader/UseLoader";
import useResponse from "../../../../../context/response/UseResponse";
import BackButton from "../../../../../shared/components/BackButton/BackButton";

const RecordTransaction = ({
  isEditMode = false,
  initialData = null,
  onSuccess,
  onCancel,
}) => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    transaction_date: new Date().toISOString().split("T")[0],
    reference: "",
    description: "",
  });

  const [submitLoading, setSubmitLoading] = useState(false);

  // Sync initial data for Edit Mode
  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        amount: initialData.amount || "",
        category: initialData.category || "",
        transaction_date: initialData.transaction_date?.split("T")[0] || "",
        reference: initialData.reference || "",
        description: initialData.description || "",
      });
    }
  }, [isEditMode, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend Validation (Matching Backend Joi Schema)
    if (parseFloat(formData.amount) <= 0 || isNaN(formData.amount)) {
      return addMessage(false, "Amount must be a positive number");
    }
    if (!formData.category) {
      return addMessage(false, "Category is required");
    }
    if (!formData.transaction_date) {
      return addMessage(false, "Transaction date is required");
    }
    if (!formData.reference.trim()) {
      return addMessage(false, "Reference is required");
    }
    if (!formData.description.trim()) {
      return addMessage(false, "Description is required");
    }
    if (formData.description.length > 500) {
      return addMessage(false, "Description cannot exceed 500 characters");
    }

    setSubmitLoading(true);
    showLoader();

    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      let response;
      if (isEditMode) {
        response = await updateTransaction(initialData.id, payload);
      } else {
        response = await createTransaction(payload);
      }

      addMessage(true, response.message || "Transaction saved successfully");
      onSuccess();
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Operation failed";
      addMessage(false, msg);
    } finally {
      setSubmitLoading(false);
      hideLoader();
    }
  };

  return (
    <section className="dashboard-wraper ">
      <form className="form-submit" onSubmit={handleSubmit}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>
            {isEditMode ? "Update Transaction" : "Record New Transaction"}
          </h3>
          <BackButton onClick={onCancel} />
        </div>

        <div className="submit-section">
          <div className="row">
            <div className="form-group col-md-6">
              <label>
                Amount <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                name="amount"
                step="0.01"
                className="form-control"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-group col-md-6">
              <label>
                Category <span className="text-danger">*</span>
              </label>
              <select
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="commission">Commission</option>
                <option value="vat">VAT</option>
              </select>
            </div>

            <div className="form-group col-md-6">
              <label>
                Transaction Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                name="transaction_date"
                className="form-control"
                value={formData.transaction_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group col-md-6">
              <label>
                Reference <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="reference"
                className="form-control"
                placeholder="Receipt # or Invoice #"
                value={formData.reference}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group col-md-12">
              <label>
                Description <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="description"
                className="form-control"
                placeholder="Brief summary of the transaction"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="submit-section mt-4">
          <div className="form-group col-lg-12 col-md-12">
            <button
              className="btn btn-main px-5 rounded fw-bold text-white"
              type="submit"
              disabled={submitLoading}
              style={{ backgroundColor: "var(--maincolor)" }}
            >
              {submitLoading
                ? "Processing..."
                : isEditMode
                  ? "Update Record"
                  : "Save Transaction"}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary ms-2 px-4 rounded"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};

export default RecordTransaction;
