import React, { useState, useEffect } from "react";
import { createTransaction, updateTransaction } from "../../../api/finance.api";
import useProfile from "../../../../../context/Profile/useProfile";
import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import Badge from "../../../../../shared/components/Badge/Badge";

const RecordTransaction = ({
  isEditMode = false,
  initialData = null,
  onSuccess,
  onCancel,
}) => {
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();
  const { profile } = useProfile();

  const [formData, setFormData] = useState({
    // 1. Priority: Edit data > Incoming Worker data > null (Company transaction)
    user_id: initialData?.userId || initialData?.user_id || null,
    amount: initialData?.amount || "",
    // 2. Default to 'commission' if coming from a worker profile, else empty
    category: initialData?.userId ? "income" : initialData?.category || "",
    transaction_date: new Date().toISOString().split("T")[0],
    reference: initialData?.reference || "",
    description: initialData?.description || "",
  });

  const [submitLoading, setSubmitLoading] = useState(false);

  // Sync initial data for Edit Mode
  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        user_id: initialData.user_id || profile.id,
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
    if (
      new Date(formData.transaction_date) >
      new Date(new Date().toISOString().split("T")[0])
    ) {
      return addMessage(false, "Transaction date cannot be in the future");
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

      addMessage(
        response?.success || false,
        response?.message || "Transaction saved successfully",
      );
      onSuccess();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      setSubmitLoading(false);
      hideLoader();
    }
  };

  return (
    <section className="dashboard-wraper ">
      <form className="form-submit" onSubmit={handleSubmit}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center">
            <h2 className="text-dark fw-bold mb-2">
              {isEditMode ? "Edit Transaction" : "Record New Transaction"}
            </h2>

            <BackButton onClick={onCancel}  />
          </div>
        </div>
        <div className="submit-section">
          <div className="row">
            {formData.user_id && !isEditMode && (
              <div className="form-group col-md-12">
                <div className="alert alert-info py-2">
                  Recording transaction for {initialData?.userRole}{" "}
                  {initialData?.userName && !isEditMode && (
                    <Badge content={initialData.userName} color="blue" />
                  )}
                </div>
              </div>
            )}
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
              <label>Reference</label>
              <input
                type="text"
                name="reference"
                className="form-control"
                placeholder="Receipt # or Invoice #"
                value={formData.reference}
                onChange={handleChange}
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
          <button
            className="btn btn-main px-4 rounded"
            type="submit"
            disabled={submitLoading}
          >
            {isEditMode ? "Update Record" : "Save Transaction"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default RecordTransaction;
