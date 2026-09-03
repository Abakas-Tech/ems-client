import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createInvoice,
  updateInvoice,
  massApplyInvoiceItems,
  deleteInvoiceItem,
  fetchCustomerOptions,
} from "../../../api/invoice.api";
import { listWorkers } from "../../../api/worker.api";

import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";

import BackButton from "../../../../../shared/components/BackButton/BackButton";

const todayIso = () => new Date().toISOString().split("T")[0];

const formatAmount = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// As simple as an invoice gets: Customer, Invoice Date, Notes, and one
// Amount applied to every selected employee. No description, no due
// date, no discount/VAT — those columns still exist on the backend
// (always 0/empty from here on) but this page never touches them.
//
// `workerIds`, when provided, always wins for resolving who's on the
// invoice — this is what lets a round trip through Active Employees
// (add/remove there, then come back) update an invoice already being
// edited, instead of only being usable for a brand new one.
const InvoiceForm = ({
  isEditMode = false,
  initialData = null,
  workerIds = null,
  onSuccess,
  onCancel,
}) => {
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();
  const navigate = useNavigate();

  const invoiceId = isEditMode ? initialData?.id : null;
  const firstItem = isEditMode ? initialData?.items?.[0] : null;

  const [customerUserId, setCustomerUserId] = useState(
    initialData?.customer_user_id || "",
  );
  const [invoiceDate, setInvoiceDate] = useState(
    initialData?.invoice_date?.split("T")[0] || todayIso(),
  );
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [amount, setAmount] = useState(firstItem?.unit_price ?? "");

  const [customers, setCustomers] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);

  useEffect(() => {
    fetchCustomerOptions()
      .then((res) => setCustomers(res.data || []))
      .catch(() => setCustomers([]));
  }, []);

  // Resolve the worker set: an explicit `workerIds` prop always wins
  // (covers create mode, and edit mode returning from Active Employees
  // with an updated selection); otherwise, in edit mode, derive the set
  // from the invoice's existing items.
  useEffect(() => {
    const resolveWorkers = async () => {
      setLoadingWorkers(true);
      try {
        let idsToResolve = workerIds && workerIds.length ? workerIds : null;

        if (!idsToResolve && isEditMode) {
          idsToResolve = Array.from(
            new Set(
              (initialData?.items || [])
                .map((item) => item.user_id)
                .filter(Boolean),
            ),
          );
        }

        if (!idsToResolve || idsToResolve.length === 0) {
          setSelectedWorkers([]);
          return;
        }

        const res = await listWorkers({
          assignedWorkerIds: idsToResolve,
          page: 1,
          limit: idsToResolve.length,
        });
        setSelectedWorkers(res?.data?.items || []);
      } catch (err) {
        addMessage(false, err.message || "Failed to load selected employees");
      } finally {
        setLoadingWorkers(false);
      }
    };

    resolveWorkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerIds]);

  const handleRemoveWorker = (worker) => {
    setSelectedWorkers((prev) => prev.filter((w) => w.id !== worker.id));
  };

  // Jump to Active Employees with the current selection pre-checked so
  // more can be added (or some deselected) there, then routed straight
  // back here. Create mode has nothing to "return" to yet, so it silently
  // saves a draft first — nothing is lost, and it becomes an edit from
  // that point on.
  const handleAddEmployee = async () => {
    let targetInvoiceId = invoiceId;

    if (!isEditMode) {
      if (!invoiceDate) {
        return addMessage(
          false,
          "Invoice date is required before adding employees",
        );
      }

      showLoader();
      try {
        const response = await createInvoice({
          customer_user_id: customerUserId || null,
          invoice_date: invoiceDate,
          notes: notes || null,
          items: selectedWorkers.map((w) => ({
            user_id: w.id,
            description: "",
            quantity: 1,
            unit_price: Number(amount) || 0,
          })),
        });
        targetInvoiceId = response?.data?.id;
        addMessage(true, "Draft saved — continue adding employees");
      } catch (err) {
        addMessage(false, err.message || "Failed to save draft");
        return;
      } finally {
        hideLoader();
      }
    }

    navigate("/admin/employees", {
      state: {
        preSelectedWorkerIds: selectedWorkers.map((w) => w.id),
        returnInvoiceId: targetInvoiceId,
      },
    });
  };

  const perWorkerAmount = Number(amount) || 0;
  const total = perWorkerAmount * selectedWorkers.length;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedWorkers.length === 0) {
      return addMessage(false, "No employees selected");
    }
    if (!invoiceDate) {
      return addMessage(false, "Invoice date is required");
    }
    if (amount === "" || Number(amount) < 0 || isNaN(amount)) {
      return addMessage(false, "Amount must be a valid non-negative number");
    }

    setSubmitLoading(true);
    showLoader();
    try {
      const payload = {
        customer_user_id: customerUserId || null,
        invoice_date: invoiceDate,
        notes: notes || null,
      };

      let response;
      if (isEditMode) {
        response = await updateInvoice(invoiceId, payload);

        // Reconcile items against the invoice's original set: delete
        // items for anyone no longer selected, then create/update the
        // rest in one call — massApplyItems inserts for anyone who
        // doesn't already have an item and updates whoever does.
        const currentIds = new Set(selectedWorkers.map((w) => w.id));
        const removedItems = (initialData?.items || []).filter(
          (item) => item.user_id && !currentIds.has(item.user_id),
        );

        for (const item of removedItems) {
          await deleteInvoiceItem(invoiceId, item.id);
        }

        if (selectedWorkers.length > 0) {
          await massApplyInvoiceItems(invoiceId, {
            user_ids: selectedWorkers.map((w) => w.id),
            description: "",
            unit_price: perWorkerAmount,
            quantity: 1,
            duplicate_action: "update",
          });
        }
      } else {
        response = await createInvoice({
          ...payload,
          items: selectedWorkers.map((w) => ({
            user_id: w.id,
            description: "",
            quantity: 1,
            unit_price: perWorkerAmount,
          })),
        });
      }

      addMessage(
        response?.success,
        response?.message || "Invoice saved successfully",
      );
      onSuccess(response?.data);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      setSubmitLoading(false);
      hideLoader();
    }
  };

  if (!isEditMode && !loadingWorkers && selectedWorkers.length === 0) {
    return (
      <section className="dashboard-wraper">
        <div className="d-flex align-items-center mb-3">
          <h2 className="text-dark fw-bold mb-2">New Invoice</h2>
          <BackButton onClick={onCancel} />
        </div>
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <p className="text-muted mb-3">
            No employees were selected. Start an invoice by selecting employees
            from Active Employees, then choosing <strong>Create Invoice</strong>
            .
          </p>
          <button
            className="btn btn-main px-4 mx-auto"
            style={{ maxWidth: 260 }}
            onClick={() => navigate("/admin/employees")}
          >
            Go to Active Employees
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-wraper">
      <form className="form-submit" onSubmit={handleSubmit}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <h2 className="text-dark fw-bold mb-0">
              {isEditMode
                ? `Edit Invoice ${initialData?.invoice_number || ""}`
                : "New Invoice"}
            </h2>
            <BackButton onClick={onCancel} />
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Customer</label>
                <select
                  className="form-control"
                  value={customerUserId}
                  onChange={(e) => setCustomerUserId(e.target.value)}
                >
                  <option value="">Select customer (partner)</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">
                  Invoice Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">
                  Amount (per employee) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label">Notes</label>
                <input
                  type="text"
                  className="form-control"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">
                Employees{" "}
                <span className="text-muted fw-normal">
                  ({selectedWorkers.length})
                </span>
              </h5>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={handleAddEmployee}
              >
                <i className="bi bi-person-plus me-1"></i> Add Employee
              </button>
            </div>

            {loadingWorkers ? (
              <p className="text-muted mb-0">Loading employees…</p>
            ) : selectedWorkers.length === 0 ? (
              <p className="text-muted mb-0">
                No employees on this invoice yet — use Add Employee to pick
                some.
              </p>
            ) : (
              <div className="d-flex flex-wrap gap-2">
                {selectedWorkers.map((worker) => (
                  <span
                    key={worker.id}
                    className="badge rounded-pill text-bg-light border px-3 py-2 fw-semibold d-flex align-items-center gap-2"
                  >
                    {worker.full_name}
                    <button
                      type="button"
                      className="btn-close"
                      style={{ fontSize: "0.6rem" }}
                      aria-label={`Remove ${worker.full_name}`}
                      onClick={() => handleRemoveWorker(worker)}
                    ></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4 text-center">
            <div className="text-muted small text-uppercase">Total</div>
            <div className="fw-bold fs-3 text-primary">
              {formatAmount(total)}
            </div>
          </div>
        </div>

        <button
          className="btn btn-main px-4 rounded"
          type="submit"
          disabled={submitLoading}
        >
          {isEditMode ? "Save Changes" : "Save Draft"}
        </button>
      </form>
    </section>
  );
};

export default InvoiceForm;
