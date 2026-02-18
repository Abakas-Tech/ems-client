import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
// Removed useNavigate because we want to switch 'views', not change URLs
import { createTransaction } from "../../../api/finance.api";
import useLoader from "../../../../../context/Loader/UseLoader";
import useResponse from "../../../../../context/response/UseResponse";

const RecordTransaction = ({
  isEditMode = false,
  initialData = null,
  onSuccess,
  onCancel,
}) => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (isEditMode && initialData) {
      reset({
        ...initialData,
        transaction_date: initialData.transaction_date?.split("T")[0],
      });
    }
  }, [isEditMode, initialData, reset]);

  const onSubmit = async (data) => {
    showLoader();
    try {
      let response;
      const payload = {
        ...data,
        amount: parseFloat(data.amount),
        // Logic: income & commission are 'income', others are 'expense'
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

      // CALL SUCCESS PROP INSTEAD OF NAVIGATE
      onSuccess();
    } catch (error) {
      addMessage(false, error.message);
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="dashboard-wraper">
      <div className="form-submit">
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-2">
              {isEditMode ? "Update Transaction" : "Record New Transaction"}
            </h2>
          </div>
          {/* TRIGGER ONCANCEL PROP */}
          <button
            type="button"
            onClick={onCancel}
            className="border rounded-circle d-flex align-items-center justify-content-center btn btn-light shadow-sm"
            style={{
              width: "40px",
              height: "40px",
              background: "var(--maincolor)",
              color: "#fff",
            }}
          >
            ←
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="submit-section bg-white p-4 rounded shadow-sm">
            <div className="row">
              <div className="form-group col-md-6 mb-3">
                <label className="fw-bold mb-1">Amount (ETB)</label>
                <input
                  type="number"
                  step="0.01"
                  className={`form-control ${errors.amount ? "is-invalid" : ""}`}
                  {...register("amount", { required: "Amount is required" })}
                />
              </div>

              <div className="form-group col-md-6 mb-3">
                <label className="fw-bold mb-1">Category</label>
                <select
                  className={`form-control ${errors.category ? "is-invalid" : ""}`}
                  {...register("category", {
                    required: "Please select a category",
                  })}
                >
                  <option value="">Select Category</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="commission">Commission</option>
                  <option value="vat">VAT</option>
                </select>
              </div>

              <div className="form-group col-md-6 mb-3">
                <label className="fw-bold mb-1">Transaction Date</label>
                <input
                  type="date"
                  className={`form-control ${errors.transaction_date ? "is-invalid" : ""}`}
                  {...register("transaction_date", {
                    required: "Date is required",
                  })}
                />
              </div>

              <div className="form-group col-md-6 mb-3">
                <label className="fw-bold mb-1">Reference</label>
                <input
                  type="text"
                  className="form-control"
                  {...register("reference")}
                />
              </div>

              <div className="form-group col-md-12 mb-3">
                <label className="fw-bold mb-1">Description</label>
                <textarea
                  className="form-control"
                  rows="4"
                  {...register("description")}
                ></textarea>
              </div>

              <div className="form-group col-lg-12 text-start mt-4">
                <button
                  type="submit"
                  className="btn btn-main px-5 py-2 rounded fw-bold text-white"
                  style={{ backgroundColor: "var(--maincolor)" }}
                >
                  {isEditMode ? "Update Record" : "Save Transaction"}
                </button>
                {/* TRIGGER ONCANCEL PROP */}
                <button
                  type="button"
                  className="btn btn-outline-secondary ms-3 px-4 py-2"
                  onClick={onCancel}
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
