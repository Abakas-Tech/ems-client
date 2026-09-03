import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createInvoice,
  updateInvoice,
  massApplyInvoiceItems,
  updateInvoiceItem,
  deleteInvoiceItem,
  fetchCustomerOptions,
} from "../../../api/invoice.api";
import { listWorkers } from "../../../api/worker.api";

import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete.jsx";

import BackButton from "../../../../../shared/components/BackButton/BackButton";
import Badge from "../../../../../shared/components/Badge/Badge";

const todayIso = () => new Date().toISOString().split("T")[0];

const formatAmount = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Local-only id for items that don't exist in the DB yet (create mode) —
// mirrors the shape of a saved item so both modes share the same renderer.
let localItemSeq = 0;
const nextLocalId = () => `local-${Date.now()}-${localItemSeq++}`;

// Items only ever expose Description (optional) + Amount to the user.
// Under the hood quantity is always 1 and unit_price === amount, so
// amount = quantity * unit_price still holds for the backend/reports.
const InvoiceForm = ({
  isEditMode = false,
  initialData = null,
  workerIds = null,
  onSuccess,
  onCancel,
}) => {
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();
  const navigate = useNavigate();

  const invoiceId = isEditMode ? initialData?.id : null;

  const [header, setHeader] = useState({
    customer_user_id: initialData?.customer_user_id || "",
    invoice_date: initialData?.invoice_date?.split("T")[0] || todayIso(),
    due_date: initialData?.due_date?.split("T")[0] || "",
    discount_amount: initialData?.discount_amount || 0,
    vat_amount: initialData?.vat_amount || 0,
    notes: initialData?.notes || "",
  });

  const [items, setItems] = useState(
    isEditMode && Array.isArray(initialData?.items)
      ? initialData.items.map((item) => ({ ...item }))
      : [],
  );

  const [customers, setCustomers] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);

  // The fixed set of workers this invoice is for — {id, full_name, phone_number}
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  // Which of selectedWorkers the next "Apply" targets
  const [checkedWorkerIds, setCheckedWorkerIds] = useState([]);

  // Mass-apply controls
  const [massDescription, setMassDescription] = useState("");
  const [massAmount, setMassAmount] = useState("");
  const [massDuplicateAction, setMassDuplicateAction] = useState("skip");

  useEffect(() => {
    fetchCustomerOptions()
      .then((res) => setCustomers(res.data || []))
      .catch(() => setCustomers([]));
  }, []);

  // Resolve the worker set once, on mount: from the passed-in ids (create
  // mode) or from the invoice's own items (edit mode).
  useEffect(() => {
    const resolveWorkers = async () => {
      setLoadingWorkers(true);
      try {
        if (isEditMode) {
          const unique = [];
          const seen = new Set();
          (initialData?.items || []).forEach((item) => {
            if (item.user_id && !seen.has(item.user_id)) {
              seen.add(item.user_id);
              unique.push({ id: item.user_id, full_name: item.user_full_name });
            }
          });
          setSelectedWorkers(unique);
          setCheckedWorkerIds(unique.map((w) => w.id));
          return;
        }

        if (!workerIds || workerIds.length === 0) {
          setSelectedWorkers([]);
          return;
        }

        const res = await listWorkers({
          assignedWorkerIds: workerIds,
          page: 1,
          limit: workerIds.length,
        });
        const found = res?.data?.items || [];
        setSelectedWorkers(found);
        setCheckedWorkerIds(found.map((w) => w.id));
      } catch (err) {
        addMessage(false, err.message || "Failed to load selected employees");
      } finally {
        setLoadingWorkers(false);
      }
    };

    resolveWorkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const toggleChecked = (id) => {
    setCheckedWorkerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // ── Mass apply: create mode does this purely in local state;
  // edit mode calls the live endpoint and refreshes items from it. ──
  const handleApplyToChecked = async () => {
    if (checkedWorkerIds.length === 0) {
      return addMessage(false, "Select at least one employee first");
    }
    if (massAmount === "" || Number(massAmount) < 0 || isNaN(massAmount)) {
      return addMessage(false, "Amount must be a valid non-negative number");
    }

    const description = massDescription.trim();

    if (isEditMode) {
      showLoader();
      try {
        const res = await massApplyInvoiceItems(invoiceId, {
          user_ids: checkedWorkerIds,
          description,
          unit_price: Number(massAmount),
          quantity: 1,
          duplicate_action: massDuplicateAction,
        });
        setItems(res.data?.invoice?.items || []);
        addMessage(true, "Items applied to selected employees");
        setMassDescription("");
        setMassAmount("");
      } catch (err) {
        addMessage(false, err.message || "Failed to apply items");
      } finally {
        hideLoader();
      }
      return;
    }

    setItems((prev) => {
      const next = [...prev];

      checkedWorkerIds.forEach((userId) => {
        const worker = selectedWorkers.find((w) => w.id === userId);
        const existingIndex = next.findIndex(
          (item) => item.user_id === userId && item.description === description,
        );

        if (existingIndex !== -1 && massDuplicateAction === "skip") return;

        const unit_price = Number(massAmount);

        if (existingIndex !== -1 && massDuplicateAction === "update") {
          next[existingIndex] = {
            ...next[existingIndex],
            quantity: 1,
            unit_price,
          };
          return;
        }

        next.push({
          id: nextLocalId(),
          user_id: userId,
          user_full_name: worker?.full_name || "Unknown",
          description,
          quantity: 1,
          unit_price,
        });
      });

      return next;
    });

    addMessage(true, `Applied to ${checkedWorkerIds.length} employee(s)`);
    setMassDescription("");
    setMassAmount("");
  };

  // ── Per-item editing ─────────────────────────────────────────
  const handleItemFieldChange = (itemId, field, value) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item,
      ),
    );
  };

  const commitItemChange = async (item) => {
    if (!isEditMode) return; // create mode: local state is the source of truth until submit
    showLoader();
    try {
      const res = await updateInvoiceItem(invoiceId, item.id, {
        description: item.description || "",
        quantity: 1,
        unit_price: Number(item.unit_price) || 0,
      });
      setItems(res.data?.items || []);
    } catch (err) {
      addMessage(false, err.message || "Failed to update item");
    } finally {
      hideLoader();
    }
  };

  const handleRemoveItem = (item) => {
    if (!isEditMode) {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      return;
    }

    openModal(
      async () => {
        showLoader();
        try {
          const res = await deleteInvoiceItem(invoiceId, item.id);
          setItems(res.data?.items || []);
          addMessage(true, "Item removed");
        } catch (err) {
          addMessage(false, err.message || "Failed to remove item");
        } finally {
          hideLoader();
        }
      },
      { title: "Remove this item from the invoice?", confirmText: "Remove" },
    );
  };

  // ── Totals preview (server always recalculates the real numbers) ──
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.unit_price || 0),
    0,
  );
  const discount = Number(header.discount_amount) || 0;
  const vat = Number(header.vat_amount) || 0;
  const total = subtotal - discount + vat;

  // ── Submit header (create or update) ─────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!header.invoice_date) {
      return addMessage(false, "Invoice date is required");
    }
    if (
      header.due_date &&
      new Date(header.due_date) < new Date(header.invoice_date)
    ) {
      return addMessage(false, "Due date cannot be before the invoice date");
    }
    if (discount < 0 || vat < 0) {
      return addMessage(false, "Discount and VAT cannot be negative");
    }

    setSubmitLoading(true);
    showLoader();
    try {
      const payload = {
        customer_user_id: header.customer_user_id || null,
        invoice_date: header.invoice_date,
        due_date: header.due_date || null,
        discount_amount: discount,
        vat_amount: vat,
        notes: header.notes || null,
      };

      let response;
      if (isEditMode) {
        response = await updateInvoice(invoiceId, payload);
      } else {
        response = await createInvoice({
          ...payload,
          items: items.map((item) => ({
            user_id: item.user_id || null,
            description: item.description || "",
            quantity: 1,
            unit_price: Number(item.unit_price) || 0,
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

  // Group items by worker for display.
  const groupedItems = items.reduce((groups, item) => {
    const key = item.user_id || "unassigned";
    if (!groups[key]) {
      groups[key] = {
        label:
          item.user_full_name ||
          (item.user_id ? `Employee #${item.user_id}` : "Unassigned"),
        rows: [],
      };
    }
    groups[key].rows.push(item);
    return groups;
  }, {});

  // No workers to work with (arrived here without a selection, or a
  // direct link/refresh) — send them back to Active Employees instead of
  // rendering a blank/broken form.
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

        {/* Header card */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3">Invoice Details</h5>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Customer</label>
                <select
                  name="customer_user_id"
                  className="form-control"
                  value={header.customer_user_id}
                  onChange={handleHeaderChange}
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
                  name="invoice_date"
                  className="form-control"
                  value={header.invoice_date}
                  onChange={handleHeaderChange}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  name="due_date"
                  className="form-control"
                  value={header.due_date}
                  onChange={handleHeaderChange}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Discount</label>
                <input
                  type="number"
                  name="discount_amount"
                  step="0.01"
                  min="0"
                  className="form-control"
                  value={header.discount_amount}
                  onChange={handleHeaderChange}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">VAT</label>
                <input
                  type="number"
                  name="vat_amount"
                  step="0.01"
                  min="0"
                  className="form-control"
                  value={header.vat_amount}
                  onChange={handleHeaderChange}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Notes</label>
                <input
                  type="text"
                  name="notes"
                  className="form-control"
                  value={header.notes}
                  onChange={handleHeaderChange}
                  placeholder="Optional notes"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Selected employees + apply amount card */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3">
              Selected Employees{" "}
              <span className="text-muted fw-normal">
                ({selectedWorkers.length})
              </span>
            </h5>

            {loadingWorkers ? (
              <p className="text-muted mb-0">Loading employees…</p>
            ) : (
              <>
                <div className="d-flex flex-wrap gap-2 mb-4">
                  {selectedWorkers.map((worker) => (
                    <label
                      key={worker.id}
                      className="d-flex align-items-center gap-2 border rounded-3 px-3 py-2"
                      style={{ cursor: "pointer" }}
                    >
                      <input
                        type="checkbox"
                        checked={checkedWorkerIds.includes(worker.id)}
                        onChange={() => toggleChecked(worker.id)}
                      />
                      <span className="fw-semibold">{worker.full_name}</span>
                    </label>
                  ))}
                </div>

                <div className="row g-3 align-items-end">
                  <div className="col-md-5">
                    <label className="form-label">Description (optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={massDescription}
                      onChange={(e) => setMassDescription(e.target.value)}
                      placeholder="e.g. Visa Processing"
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      value={massAmount}
                      onChange={(e) => setMassAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">If already applied</label>
                    <select
                      className="form-control"
                      value={massDuplicateAction}
                      onChange={(e) => setMassDuplicateAction(e.target.value)}
                    >
                      <option value="skip">Skip</option>
                      <option value="update">Update amount</option>
                      <option value="add">Add another line</option>
                    </select>
                  </div>
                  <div className="col-md-2 d-grid">
                    <button
                      type="button"
                      className="btn btn-main"
                      onClick={handleApplyToChecked}
                    >
                      Apply ({checkedWorkerIds.length})
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Items card, grouped by worker */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3">Invoice Items</h5>

            {Object.keys(groupedItems).length === 0 && (
              <p className="text-muted mb-0">
                No items yet — check employees above and apply an amount.
              </p>
            )}

            {Object.entries(groupedItems).map(([key, group]) => (
              <div key={key} className="mb-4">
                <div className="fw-bold mb-2">{group.label}</div>
                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th style={{ width: 160 }}>Amount</th>
                        <th style={{ width: 60 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.rows.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Optional"
                              value={item.description || ""}
                              onChange={(e) =>
                                handleItemFieldChange(
                                  item.id,
                                  "description",
                                  e.target.value,
                                )
                              }
                              onBlur={() => commitItemChange(item)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="form-control form-control-sm"
                              value={item.unit_price}
                              onChange={(e) =>
                                handleItemFieldChange(
                                  item.id,
                                  "unit_price",
                                  e.target.value,
                                )
                              }
                              onBlur={() => commitItemChange(item)}
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleRemoveItem(item)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals card — one horizontal row instead of a stacked list */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">
            <div className="d-flex flex-wrap justify-content-between text-center gy-3">
              <div className="px-3 flex-fill">
                <div className="text-muted small text-uppercase">Subtotal</div>
                <div className="fw-bold fs-5">{formatAmount(subtotal)}</div>
              </div>
              <div className="px-3 flex-fill border-start">
                <div className="text-muted small text-uppercase">Discount</div>
                <div className="fw-bold fs-5">-{formatAmount(discount)}</div>
              </div>
              <div className="px-3 flex-fill border-start">
                <div className="text-muted small text-uppercase">VAT</div>
                <div className="fw-bold fs-5">+{formatAmount(vat)}</div>
              </div>
              <div className="px-3 flex-fill border-start">
                <div className="text-muted small text-uppercase">Total</div>
                <div className="fw-bold fs-4 text-primary">
                  {formatAmount(total)}
                </div>
              </div>
            </div>
            <div className="text-center mt-3">
              <Badge content="Server recalculates final totals" color="blue" />
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
