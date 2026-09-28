import { useEffect, useRef, useState } from "react";
import {
  fetchInvoiceDetails,
  issueInvoice,
  cancelInvoice,
  recordInvoicePayment,
} from "../../../api/invoice.api";
import RecordTransaction from "../../transactions/RecordTransaction/RecordTransaction";
import {
  printInvoiceDocument,
  buildInvoiceDocumentHtml,
  DEFAULT_INVOICE_FILE_NAME,
  INVOICE_PAGE_WIDTH_MM,
  INVOICE_ELEMENT_WIDTH_MM,
  INVOICE_BOTTOM_CENTER_MM,
} from "../InvoicePrint/InvoicePrint";
import { fetchOrganizationSettings } from "../../../api/organizationSettings.api";
import {
  ELEMENT_LABELS,
  attachDocumentElementEditor,
  createBottomCenterElement,
  imageUrlToDataUri,
  loadImageAspect,
} from "../../../../../utils/documentElements.utils";
import useProfile from "../../../../../context/Profile/useProfile";

import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete.jsx";

import BackButton from "../../../../../shared/components/BackButton/BackButton";
import Badge from "../../../../../shared/components/Badge/Badge";

const STATUS_COLORS = {
  draft: "grey",
  issued: "blue",
  partially_paid: "orange",
  paid: "green",
  cancelled: "red",
};

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatAmount = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Print-only bank fields — shown in the inline print-options panel below,
// never sent to any API and never persisted. Labels/defaults match
// exactly what's rendered on the printed invoice (see InvoicePrint.jsx's
// BANK_FIELD_LABELS) — every field stays fully editable (or clearable)
// right before printing.
const DEFAULT_BANK_INFO = {
  account_number: "1000728351857",
  phone: "0911218293",
  bank_name: "COMMERTIAL BANK OF ETHIOPIA",
  swift_code: "CBETETAA",
  location: "ADDIS ABABA Ethiopia",
};

const BANK_FIELDS = [
  { key: "account_number", label: "ACCOUNT NUMBER" },
  { key: "phone", label: "TELE PHONE" },
  { key: "bank_name", label: "BANK NAME" },
  { key: "swift_code", label: "SWIFT CODE" },
  { key: "location", label: "LOCATION" },
];

const InvoiceDetail = ({ invoiceId, onBack }) => {
  const [invoice, setInvoice] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Print-options panel — purely transient UI state for a single print
  // action, rendered inline directly above the Print Invoice button (not
  // as a modal, not appended at the bottom of the page). includeBankInfo/
  // bankInfo are never read from or written to the invoice, the API, or
  // any persisted store; they only ever get passed straight into
  // printInvoiceDocument() at print time. Sender / Work Receiver / Total
  // Payment are NOT part of this panel — they're fixed/derived and always
  // rendered by InvoicePrint.jsx regardless of this form.
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [includeBankInfo, setIncludeBankInfo] = useState(false);
  const [bankInfo, setBankInfo] = useState(DEFAULT_BANK_INFO);
  // Name of the printed/saved file — the browser adds ".pdf".
  const [fileName, setFileName] = useState(DEFAULT_INVOICE_FILE_NAME);

  // Stamp & signature (Admin only): the organization images uploaded in
  // Settings, attached at the bottom center by default and positionable in
  // the preview — same mm-based elements as the Letter editor.
  const { profile } = useProfile();
  const isAdmin = Number(profile?.role_id) === 1;
  const [orgSettings, setOrgSettings] = useState(null);
  const [printElements, setPrintElements] = useState([]);
  const [selectedPrintElementId, setSelectedPrintElementId] = useState(null);
  // Kinds being attached right now (image loading) — shown as on meanwhile
  const [attachingKinds, setAttachingKinds] = useState([]);
  const previewFrameRef = useRef(null);
  const previewEditorRef = useRef(null);
  const printElementsRef = useRef(printElements);
  const selectedPrintElementRef = useRef(selectedPrintElementId);
  const orgImageCacheRef = useRef({});

  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();

  const loadInvoice = async () => {
    showLoader();
    try {
      const res = await fetchInvoiceDetails(invoiceId);
      setInvoice(res.data);
    } catch (err) {
      addMessage(false, err.message);
      onBack();
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    if (invoiceId) loadInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  useEffect(() => {
    printElementsRef.current = printElements;
    selectedPrintElementRef.current = selectedPrintElementId;
    previewEditorRef.current?.render();
  }, [printElements, selectedPrintElementId]);

  // Organization stamp/signature — only fetched for Admins (the API is
  // Admin-only as well).
  useEffect(() => {
    if (!isAdmin || !showPrintOptions || orgSettings !== null) return;
    fetchOrganizationSettings()
      .then((res) => setOrgSettings(res?.data || {}))
      .catch(() => setOrgSettings({}));
  }, [isAdmin, showPrintOptions, orgSettings]);

  // ── Record Payment — reuses RecordTransaction as-is; the only
  // difference is what submit calls (recordInvoicePayment instead of
  // createTransaction) and that category is locked to income. ──
  if (showPaymentForm && invoice) {
    return (
      <RecordTransaction
        title={`Record Payment — Invoice ${invoice.invoice_number}`}
        lockCategory
        initialData={{
          userId: invoice.customer_user_id,
          userName: invoice.customer_full_name,
          userRole: "partner",
          amount: invoice.balance_amount,
          category: "income",
          reference: invoice.invoice_number,
          description: `Payment for invoice ${invoice.invoice_number}`,
        }}
        onSubmit={(payload) => recordInvoicePayment(invoice.id, payload)}
        onSuccess={() => {
          setShowPaymentForm(false);
          loadInvoice();
        }}
        onCancel={() => setShowPaymentForm(false)}
      />
    );
  }

  if (!invoice) return null;

  const isProfit = invoice.status === "paid";
  const accent = invoice.status === "paid" ? "income" : "expense";

  const handleIssue = () => {
    openModal(
      async () => {
        showLoader();
        try {
          const res = await issueInvoice(invoice.id);
          addMessage(true, "Invoice issued");
          setInvoice(res.data);
        } catch (err) {
          addMessage(false, err.message || "Failed to issue invoice");
        } finally {
          hideLoader();
        }
      },
      {
        title: "Issue this invoice? Financial values are locked after issuing.",
        confirmText: "Issue",
      },
    );
  };

  const handleCancel = () => {
    openModal(
      async () => {
        showLoader();
        try {
          const res = await cancelInvoice(invoice.id);
          addMessage(true, "Invoice cancelled");
          setInvoice(res.data);
        } catch (err) {
          addMessage(false, err.message || "Failed to cancel invoice");
        } finally {
          hideLoader();
        }
      },
      {
        title: "Cancel this invoice? This cannot be undone.",
        confirmText: "Cancel Invoice",
      },
    );
  };

  const getOrgImage = async (kind) => {
    if (orgImageCacheRef.current[kind]) return orgImageCacheRef.current[kind];
    const url = orgSettings?.[`${kind}_url`];
    if (!url) throw new Error(`No organization ${kind} uploaded yet`);

    let src;
    try {
      src = await imageUrlToDataUri(url);
    } catch {
      src = url;
    }
    const aspect = await loadImageAspect(src);
    orgImageCacheRef.current[kind] = { src, aspect };
    return orgImageCacheRef.current[kind];
  };

  const isAttached = (kind) =>
    attachingKinds.includes(kind) ||
    printElements.some((el) => el.type === kind);

  const handleToggleAttachment = async (kind, checked) => {
    if (!isAdmin) return;
    if (!checked) {
      setPrintElements((prev) => prev.filter((el) => el.type !== kind));
      setSelectedPrintElementId(null);
      return;
    }
    setAttachingKinds((prev) => [...prev, kind]);
    try {
      const image = await getOrgImage(kind);
      const element = createBottomCenterElement({
        type: kind,
        src: image.src,
        aspect: image.aspect,
        width: INVOICE_ELEMENT_WIDTH_MM[kind],
        pageWidthMm: INVOICE_PAGE_WIDTH_MM,
        bottomMm: INVOICE_BOTTOM_CENTER_MM,
      });
      setPrintElements((prev) => [
        ...prev.filter((el) => el.type !== kind),
        element,
      ]);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      setAttachingKinds((prev) => prev.filter((k) => k !== kind));
    }
  };

  const handleResetToBottomCenter = () => {
    setPrintElements((prev) =>
      prev.map((el) => ({
        ...el,
        ...createBottomCenterElement({
          type: el.type,
          src: el.src,
          aspect: el.aspect,
          width: el.width,
          pageWidthMm: INVOICE_PAGE_WIDTH_MM,
          bottomMm: INVOICE_BOTTOM_CENTER_MM,
        }),
        id: el.id,
      })),
    );
  };

  // Preview iframe (print options): drag/resize/remove the attached
  // stamp/signature on the actual invoice page.
  const handlePreviewLoad = () => {
    const doc = previewFrameRef.current?.contentDocument;
    if (!doc) return;
    previewEditorRef.current?.destroy();
    previewEditorRef.current = attachDocumentElementEditor(doc, {
      pageWidthMm: INVOICE_PAGE_WIDTH_MM,
      getState: () => ({
        elements: printElementsRef.current,
        selectedId: selectedPrintElementRef.current,
        placement: null,
      }),
      onChange: setPrintElements,
      onSelect: setSelectedPrintElementId,
      onPlace: () => {},
    });
  };

  const currentBankOptions = {
    enabled: includeBankInfo,
    fields: bankInfo,
  };

  const handleConfirmPrint = () => {
    printInvoiceDocument(invoice, currentBankOptions, {
      elements: isAdmin ? printElements : [],
      fileName,
    });
    setShowPrintOptions(false);
  };

  // Single entry point for the whole print flow, via the one existing
  // button: first click opens the options panel right above this same
  // button; second click (while the panel is open) actually prints and
  // closes the panel. No second/separate print button is introduced.
  const handlePrintButtonClick = () => {
    if (showPrintOptions) {
      handleConfirmPrint();
    } else {
      setShowPrintOptions(true);
    }
  };

  const handleCancelPrintOptions = () => setShowPrintOptions(false);

  const handleBankFieldChange = (key, value) => {
    setBankInfo((prev) => ({ ...prev, [key]: value }));
  };

  const workerCount =
    invoice.worker_count ??
    new Set(
      (invoice.items || []).filter((i) => i.user_id).map((i) => i.user_id),
    ).size;

  const flatItems = [...(invoice.items || [])].sort((a, b) => {
    const nameA = a.user_full_name || "";
    const nameB = b.user_full_name || "";
    return nameA.localeCompare(nameB);
  });

  const canIssue = invoice.status === "draft";
  const canCancel = ["issued", "partially_paid"].includes(invoice.status);
  const canRecordPayment = ["issued", "partially_paid"].includes(
    invoice.status,
  );

  return (
    <div className="txn-receipt dashboard-wraper">
      <style>{`
        .txn-receipt .receipt-shell {
          border: 1px solid #e4e7ec;
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 1px 2px rgba(16,24,40,.04), 0 4px 12px rgba(16,24,40,.05);
          overflow: hidden;
        }
        .txn-receipt .receipt-topbar {
          padding: 2rem 2.25rem;
          display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-start; gap: 1.5rem;
          background: ${isProfit ? "linear-gradient(135deg, #e9fbf0 0%, #ffffff 60%)" : "linear-gradient(135deg, #fdeeee 0%, #ffffff 60%)"};
        }
        .txn-receipt .receipt-title { font-size: 1.6rem; font-weight: 800; color: #101828; margin: 0 0 .35rem; }
        .txn-receipt .receipt-amount { font-size: 2.2rem; font-weight: 800; color: var(--${accent}, #101828); }
        .txn-receipt .receipt-stats-strip {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          border-top: 1px solid #e4e7ec; border-bottom: 1px solid #e4e7ec; background: #f9fafb;
        }
        .txn-receipt .stat-item { padding: 1.1rem 1.4rem; border-right: 1px solid #e4e7ec; min-width: 0; }
        .txn-receipt .stat-item:last-child { border-right: none; }
        .txn-receipt .stat-label { display: block; font-size: .72rem; text-transform: uppercase; color: #667085; margin-bottom: .25rem; }
        .txn-receipt .stat-value { font-weight: 700; color: #101828; }
        .txn-receipt .receipt-body { padding: 1.75rem 2.25rem; }
        .txn-receipt .items-table th { background: #f9fafb; font-size: .78rem; text-transform: uppercase; color: #667085; }
        .txn-receipt .totals-row td { font-weight: 800; background: #eaf1fc; border-top: 2px solid #1a3c6e; font-size: 1rem; }

        /* Print-options panel — sits directly above the actions bar so it
           renders right above the Print Invoice button when opened. */
        .txn-receipt .print-options-inline {
          padding: 1.5rem 2.25rem;
          border-top: 1px solid #e4e7ec;
          background: #fafbfe;
        }

        /* Bottom action bar: Issue / Record Payment / Print — centered & horizontal on larger screens */
        .txn-receipt .receipt-actions-bottom {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 0.75rem;
          padding: 1.5rem 2.25rem 2rem;
          border-top: 1px solid #e4e7ec;
        }
        .txn-receipt .receipt-actions-bottom .btn {
          flex: 0 1 auto;
        }

        /* Smaller screens: let buttons wrap/stack and take available width without overflow */
        @media (max-width: 576px) {
          .txn-receipt .receipt-actions-bottom {
            flex-direction: column;
            align-items: stretch;
            gap: 0.6rem;
          }
          .txn-receipt .receipt-actions-bottom .btn {
            width: 100%;
          }
        }
      `}</style>

      <div className="mb-4 d-print-none ">
        <BackButton onClick={onBack} />
      </div>

      <div className="receipt-shell">
        <div className="receipt-topbar">
          <div>
            <Badge
              content={invoice.status.replace("_", " ").toUpperCase()}
              color={STATUS_COLORS[invoice.status]}
            />
            <h2 className="receipt-title mt-2">
              Invoice {invoice.invoice_number}
            </h2>
            <p className="text-muted mb-0">
              {formatDate(invoice.invoice_date)}
            </p>
          </div>
          <div className="text-end">
            <div className="receipt-amount">
              {formatAmount(invoice.total_amount)} USD
            </div>
            <div className="text-muted small">
              Paid {formatAmount(invoice.paid_amount)} · Balance{" "}
              {formatAmount(invoice.balance_amount)}
            </div>
          </div>
        </div>

        <div className="receipt-stats-strip">
          <div className="stat-item">
            <span className="stat-label">Partner</span>
            <span className="stat-value">
              {invoice.customer_full_name || "—"}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Created By</span>
            <span className="stat-value">{invoice.created_by_name || "—"}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Workers</span>
            <span className="stat-value">{workerCount}</span>
          </div>
        </div>

        <div className="receipt-body">
          <h6 className="fw-bold mb-3">Items</h6>

          {flatItems.length === 0 ? (
            <p className="text-muted">No items on this invoice.</p>
          ) : (
            <div className="table-responsive mb-4">
              <table className="table table-sm items-table">
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>Passport Number</th>
                    <th>Sponsor</th>
                    <th>Amount (USD)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {flatItems.map((row) => (
                    <tr key={row.id}>
                      <td>
                        {row.user_full_name || "Unassigned"}
                        {row.agent_name ? ` (${row.agent_name})` : ""}
                      </td>
                      <td>{row.passport_number || "—"}</td>
                      <td>{row.employer_full_name || "—"}</td>
                      <td>{formatAmount(row.unit_price)}</td>
                      <td>{row.status || "—"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="totals-row">
                    <td colSpan={3}>Total</td>
                    <td>{formatAmount(invoice.total_amount)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {invoice.notes && (
            <div className="mt-4">
              <h6 className="fw-bold">Notes</h6>
              <p className="text-muted">{invoice.notes}</p>
            </div>
          )}

          {/* Payment history — financial_transactions tagged with this invoice */}
          <div className="mt-5">
            <h6 className="fw-bold mb-3">Payments</h6>
            {(invoice.payments || []).length === 0 ? (
              <p className="text-muted">No payments recorded yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle items-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Description</th>
                      <th>Reference</th>
                      <th>Recorded By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.payments.map((payment) => (
                      <tr key={payment.id}>
                        <td>{formatDate(payment.transaction_date)}</td>
                        <td>{formatAmount(payment.amount)}</td>
                        <td>{payment.description}</td>
                        <td>{payment.reference || "—"}</td>
                        <td>{payment.created_by_name || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Print options — appears directly above the actions bar (and
            therefore directly above the Print Invoice button below) the
            moment Print is first clicked. Bank info here is transient UI
            state only; it is read once at print time and never saved
            anywhere. Sender / Work Receiver / Total Payment are NOT part
            of this panel — those are fixed/derived and always print
            regardless (see InvoicePrint.jsx). There is no separate print
            button inside this panel: the same Print Invoice button below
            confirms and prints once the panel is open. */}
        {showPrintOptions && (
          <div className="print-options-inline d-print-none">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Print Options</h6>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={handleCancelPrintOptions}
              >
                Cancel
              </button>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label" htmlFor="invoiceFileName">
                  File Name
                </label>
                <div className="input-group">
                  <input
                    id="invoiceFileName"
                    type="text"
                    className="form-control"
                    value={fileName}
                    maxLength={120}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder={DEFAULT_INVOICE_FILE_NAME}
                  />
                  <span className="input-group-text">.pdf</span>
                </div>
              </div>

              {isAdmin && (
                <div className="col-md-6">
                  <label className="form-label d-block">
                    Stamp &amp; Signature
                  </label>
                  <div className="d-flex flex-wrap gap-4">
                    {["stamp", "signature"].map((kind) => {
                      const available = Boolean(orgSettings?.[`${kind}_url`]);
                      return (
                        <div className="form-check form-switch" key={kind}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id={`attach-${kind}-switch`}
                            checked={isAttached(kind)}
                            disabled={!available}
                            onChange={(e) =>
                              handleToggleAttachment(kind, e.target.checked)
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`attach-${kind}-switch`}
                          >
                            Attach {ELEMENT_LABELS[kind]}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                  {orgSettings &&
                    (!orgSettings.stamp_url || !orgSettings.signature_url) && (
                      <small className="text-muted d-block mt-1">
                        Upload the organization{" "}
                        {!orgSettings.stamp_url && !orgSettings.signature_url
                          ? "stamp and signature"
                          : !orgSettings.stamp_url
                            ? "stamp"
                            : "signature"}{" "}
                        in <a href="/admin/settings">Settings</a> to attach{" "}
                        {!orgSettings.stamp_url && !orgSettings.signature_url
                          ? "them"
                          : "it"}
                        .
                      </small>
                    )}
                </div>
              )}
            </div>

            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="includeBankInfoSwitch"
                checked={includeBankInfo}
                onChange={(e) => setIncludeBankInfo(e.target.checked)}
              />
              <label
                className="form-check-label"
                htmlFor="includeBankInfoSwitch"
              >
                Include bank information
              </label>
            </div>

            <div className="row g-3">
              {BANK_FIELDS.map((field) => (
                <div className="col-md-6" key={field.key}>
                  <label className="form-label">{field.label}</label>
                  <input
                    type="text"
                    className="form-control"
                    value={bankInfo[field.key]}
                    onChange={(e) =>
                      handleBankFieldChange(field.key, e.target.value)
                    }
                    placeholder={field.label}
                    disabled={!includeBankInfo}
                  />
                </div>
              ))}
            </div>

            {isAdmin && printElements.length > 0 && (
              <div className="mt-3">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                  <small className="text-muted">
                    Placed at the bottom center. Drag to move, drag the blue
                    corner to resize, × or Delete to remove — the print
                    matches this preview.
                  </small>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={handleResetToBottomCenter}
                  >
                    <i className="bi bi-align-bottom me-1"></i>
                    Reset to bottom center
                  </button>
                </div>
                <iframe
                  ref={previewFrameRef}
                  title="Invoice print preview"
                  srcDoc={buildInvoiceDocumentHtml(
                    invoice,
                    currentBankOptions,
                    { preview: true },
                  )}
                  onLoad={handlePreviewLoad}
                  style={{
                    width: "100%",
                    height: "560px",
                    border: "1px solid #dde5f5",
                    borderRadius: "8px",
                    display: "block",
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Actions moved to the bottom: horizontally centered on larger screens,
            wrap/stack on smaller screens to avoid overflow or cramping. */}
        <div className="receipt-actions-bottom">
          {canIssue && (
            <button className="btn btn-main btn-sm" onClick={handleIssue}>
              Issue Invoice
            </button>
          )}
          {canCancel && (
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={handleCancel}
            >
              Cancel Invoice
            </button>
          )}
          {canRecordPayment && (
            <button
              className="btn btn-main btn-sm"
              onClick={() => setShowPaymentForm(true)}
            >
              Record Payment
            </button>
          )}
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={handlePrintButtonClick}
          >
            <i className="bi bi-printer me-2"></i>{" "}
            {showPrintOptions ? "Confirm & Print" : "Print Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
