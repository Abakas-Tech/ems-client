import React, { useState } from "react";

const InvoicePaymentModal = ({ show, onClose, onConfirm, balanceDue }) => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!show) return null;

  const reset = () => {
    setAmount("");
    setPaymentMethod("cash");
    setPaymentReference("");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setNotes("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setSubmitting(true);
    try {
      await onConfirm({
        amount: Number(amount),
        payment_method: paymentMethod,
        payment_reference: paymentReference || null,
        payment_date: paymentDate,
        notes: notes || null,
      });
      reset();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{ background: "rgba(16, 24, 40, 0.45)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 border-0 shadow">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title fw-bold">Record Payment</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              {balanceDue !== undefined && (
                <p className="text-muted mb-3">
                  Balance due: <strong>{Number(balanceDue).toLocaleString()}</strong>
                </p>
              )}

              <div className="form-group mb-3">
                <label>
                  Amount <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-control"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group mb-3">
                <label>
                  Payment Method <span className="text-danger">*</span>
                </label>
                <select
                  className="form-control"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group mb-3">
                <label>Reference</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Receipt / transfer reference"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                />
              </div>

              <div className="form-group mb-3">
                <label>
                  Payment Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <input
                  type="text"
                  className="form-control"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button className="btn btn-main" type="submit" disabled={submitting}>
                Record Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InvoicePaymentModal;
