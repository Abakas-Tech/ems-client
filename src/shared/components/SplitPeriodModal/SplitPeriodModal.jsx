import React, { useRef, useState, useEffect } from "react";
import Modal from "react-modal";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
// Reuses CreateModal's own CSS module (same as ClosePeriodModal) so this
// modal matches the rest of the modal system exactly.
import styles from "../CreateModal/CreateModal.module.css";
import {
  fetchPeriodSplit,
  createPeriodSplit,
  updatePeriodSplit,
} from "../../../domains/admin/api/finance.api";
import { useAdminOwnership } from "../../../utils/adminOwnership";

Modal.setAppElement("#root");

const shakeVariants = {
  idle: { x: 0 },
  shake: {
    x: [0, -10, 10, -8, 8, -4, 4, 0],
    transition: { duration: 0.5 },
  },
};

// Whole cents, so the three parts always add up to the final summary
// exactly (e.g. 900.10 - 400.05 - 300.02) — same math as the backend.
const toCents = (value) => Math.round(Number(value || 0) * 100);
const formatAmount = (cents) =>
  (cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Splits a CLOSED period's final summary (its net profit) into Deposit and
// Government (entered here) plus Partner Splitting, which is always the
// remainder and recalculated as the user types. The backend recomputes
// and re-validates everything on save. Admins can create/update/delete;
// everyone else sees the saved split read-only.
const SplitPeriodModal = ({
  show,
  onClose,
  period,
  canEdit: canEditProp,
  onSaved,
  onDeleteRequest,
  addMessage,
}) => {
  const modalRef = useRef(null);
  const [shake, setShake] = useState("idle");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingSplit, setExistingSplit] = useState(null);
  const [deposit, setDeposit] = useState("");
  const [government, setGovernment] = useState("");

  // Admin record ownership: a split saved by another admin is view-only
  // for this admin (the API enforces the same rule).
  const { canModify } = useAdminOwnership();
  const canEdit =
    canEditProp && (!existingSplit || canModify(existingSplit.created_by));

  // Load the period's saved split (if any) every time the modal opens.
  useEffect(() => {
    if (!show || !period?.id) return;

    let cancelled = false;
    setLoading(true);
    setExistingSplit(null);
    setDeposit("");
    setGovernment("");

    fetchPeriodSplit(period.id)
      .then((res) => {
        if (cancelled) return;
        const split = res?.data || null;
        setExistingSplit(split);
        if (split) {
          setDeposit(String(Number(split.deposit_amount)));
          setGovernment(String(Number(split.government_amount)));
        }
      })
      .catch((err) => {
        if (cancelled) return;
        // 404 just means this period hasn't been split yet.
        if (err?.status !== 404) {
          addMessage?.(false, err.message || "Failed to load period split");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, period?.id]);

  // Shake on clicking outside — identical behavior to CreateModal.
  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setShake("shake");
      setTimeout(() => setShake("idle"), 500);
    }
  };

  useEffect(() => {
    if (show) {
      document.addEventListener("mousedown", handleOverlayClick);
    } else {
      document.removeEventListener("mousedown", handleOverlayClick);
    }
    return () => document.removeEventListener("mousedown", handleOverlayClick);
  }, [show]);

  const finalCents = toCents(period?.net_profit);
  const depositCents = toCents(deposit);
  const governmentCents = toCents(government);
  const partnerCents = finalCents - depositCents - governmentCents;

  const nothingToSplit = finalCents < 0;
  // `period` goes null right after a successful save (handleSubmit calls
  // onClose(), which clears the parent's selected period) while the modal
  // is still mounted for its ~200ms close animation. Without this guard,
  // finalCents would momentarily read as 0 against the just-submitted
  // deposit/government values, flashing this error during the close.
  const exceedsFinal = Boolean(period) && partnerCents < 0;
  const readOnly = !canEdit || nothingToSplit;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    if (!form.checkValidity() || exceedsFinal || nothingToSplit) {
      setShake("shake");
      setTimeout(() => setShake("idle"), 500);
      form.reportValidity();
      return;
    }

    const payload = {
      deposit_amount: depositCents / 100,
      government_amount: governmentCents / 100,
    };

    setSubmitting(true);
    try {
      const res = existingSplit
        ? await updatePeriodSplit(period.id, payload)
        : await createPeriodSplit(period.id, payload);
      addMessage?.(true, res?.message || "Period split saved successfully");
      onSaved?.(res?.data);
      onClose();
    } catch (err) {
      addMessage?.(false, err.message || "Failed to save period split");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) return;
    onClose();
  };

  const amountInput = (label, value, onChange) => (
    <div className="form-group" style={{ marginBottom: "1rem" }}>
      <h6>
        {label} {!readOnly && <span className="text-danger">*</span>}
      </h6>
      <input
        type="number"
        className="form-control"
        min="0"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        disabled={readOnly || loading || submitting}
        style={{ backgroundColor: "#EDF1FB" }}
      />
    </div>
  );

  return (
    <Modal
      isOpen={show}
      shouldCloseOnOverlayClick={false}
      onRequestClose={() => {}}
      className={styles.modal}
      overlayClassName={styles.overlay}
      closeTimeoutMS={200}
    >
      <motion.div
        ref={modalRef}
        variants={shakeVariants}
        animate={shake}
        initial="idle"
        className={styles.modalInner}
      >
        <form onSubmit={handleSubmit} className="submit-section" noValidate>
          <h3 className={styles.modalTitle}>Split Final Summary</h3>

          <p
            className="text-muted text-center mb-3"
            style={{ fontSize: "0.9rem" }}
          >
            <strong>{period?.label || "Closed period"}</strong> — final summary{" "}
            <strong>{formatAmount(finalCents)} Birr</strong>
          </p>

          {nothingToSplit && (
            <p className="text-danger text-center small mb-3">
              This period's final summary is negative, so there is nothing to
              split.
            </p>
          )}

          {!canEdit && !loading && !existingSplit && (
            <p className="text-muted text-center small mb-3">
              This period has not been split yet.
            </p>
          )}

          {amountInput("Deposit", deposit, setDeposit)}
          {amountInput("Government", government, setGovernment)}

          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <h6>Partner Splitting</h6>
            <input
              type="text"
              className={`form-control ${exceedsFinal ? "is-invalid" : ""}`}
              value={formatAmount(partnerCents)}
              readOnly
              disabled
            />
          </div>

          {existingSplit?.updated_by_name && (
            <p className="text-muted small text-center mb-3">
              Last saved by {existingSplit.updated_by_name}
            </p>
          )}

          <div className={styles.modalActions} style={{ flexWrap: "wrap" }}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancel}
              disabled={submitting}
            >
              {readOnly ? "Close" : "Cancel"}
            </button>
            {canEdit && existingSplit && (
              <button
                type="button"
                className="btn btn-danger"
                style={{ borderRadius: "1rem", fontWeight: 500 }}
                onClick={() => onDeleteRequest?.(period)}
                disabled={submitting}
              >
                Delete
              </button>
            )}
            {!readOnly && (
              <button
                type="submit"
                className={styles.createButton}
                disabled={submitting || loading || exceedsFinal}
              >
                {submitting
                  ? "Saving..."
                  : existingSplit
                    ? "Update Split"
                    : "Save Split"}
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </Modal>
  );
};

export default SplitPeriodModal;
