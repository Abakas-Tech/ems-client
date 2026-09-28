import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchInvoiceDetails } from "../../../api/invoice.api";
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
import BackButton from "../../../../../shared/components/BackButton/BackButton";

// Print-only bank fields — never sent to any API and never persisted.
// Labels/defaults match exactly what's rendered on the printed invoice
// (see InvoicePrint.jsx's BANK_FIELD_LABELS) — every field stays fully
// editable (or clearable) right before printing.
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

// Same muted field fill as the Letter toolkit, kept compact
const FIELD_STYLE = {
  backgroundColor: "#f5f7fa",
  height: 34,
  fontSize: "0.85rem",
};

const SectionLabel = ({ children }) => (
  <label className="small mb-1 d-block" style={{ textAlign: "left" }}>
    {children}
  </label>
);

// Invoice print page — the invoice preview on the left and the print
// options toolkit on the right, same layout as the Letter page. Opened
// from the invoice detail's "Print Invoice" button
// (/admin/invoices/:id/print-invoice). Everything here is print-time only: nothing
// is saved to the invoice.
const InvoicePrintPreview = ({ invoiceId }) => {
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();

  const [invoice, setInvoice] = useState(null);

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

  const goBack = () => navigate("/admin/invoices", { state: { invoiceId } });

  useEffect(() => {
    if (!invoiceId) return;
    let cancelled = false;
    showLoader();
    fetchInvoiceDetails(invoiceId)
      .then((res) => !cancelled && setInvoice(res.data))
      .catch((err) => {
        addMessage(false, err.message);
        navigate("/admin/invoices");
      })
      .finally(() => hideLoader());
    return () => {
      cancelled = true;
    };
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
    if (!isAdmin || orgSettings !== null) return;
    fetchOrganizationSettings()
      .then((res) => setOrgSettings(res?.data || {}))
      .catch(() => setOrgSettings({}));
  }, [isAdmin, orgSettings]);

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

  // Preview iframe: drag/resize/remove the attached stamp/signature on the
  // actual invoice page. Re-attached on every (re)load of the preview.
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

  const handleBankFieldChange = (key, value) => {
    setBankInfo((prev) => ({ ...prev, [key]: value }));
  };

  const currentBankOptions = {
    enabled: includeBankInfo,
    fields: bankInfo,
  };

  const handlePrint = () => {
    printInvoiceDocument(invoice, currentBankOptions, {
      elements: isAdmin ? printElements : [],
      fileName,
    });
  };

  if (!invoice) return null;

  const missingImages = orgSettings
    ? ["stamp", "signature"].filter((kind) => !orgSettings[`${kind}_url`])
    : [];

  return (
    <div className="dashboard-wraper">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <h2 className="fw-bold text-dark mb-0">Print Invoice</h2>
        <BackButton onClick={goBack} />
      </div>
      <div className="row g-4">
        <div className="col-lg-9 order-2 order-lg-1">
          <p className="text-muted mb-3">
            Invoice {invoice.invoice_number} — this is how it will print.
          </p>

          <div
            style={{
              border: "1px solid #dde5f5",
              borderRadius: "12px",
              padding: "10px",
              background: "#fff",
              boxShadow: "0 1px 4px rgba(26,60,110,0.06)",
            }}
          >
            <iframe
              ref={previewFrameRef}
              title="Invoice print preview"
              srcDoc={buildInvoiceDocumentHtml(invoice, currentBankOptions, {
                preview: true,
              })}
              onLoad={handlePreviewLoad}
              style={{
                width: "100%",
                height: "850px",
                border: "none",
                display: "block",
                borderRadius: "8px",
              }}
            />
          </div>
        </div>

        <div className="col-lg-3 order-1 order-lg-2">
          <div style={{ textAlign: "left" }}>
            <h6 className="fw-bold small text-uppercase text-muted mb-2">
              Toolkit
            </h6>

            <div className="mb-3">
              <SectionLabel>File Name</SectionLabel>
              <div className="input-group input-group-sm">
                <input
                  id="invoiceFileName"
                  type="text"
                  className="form-control"
                  style={FIELD_STYLE}
                  value={fileName}
                  maxLength={120}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder={DEFAULT_INVOICE_FILE_NAME}
                />
                <span
                  className="input-group-text"
                  style={{ height: 34, fontSize: "0.85rem" }}
                >
                  .pdf
                </span>
              </div>
            </div>

            {isAdmin && (
              <div className="mb-3">
                <SectionLabel>Stamp &amp; Signature</SectionLabel>
                {["stamp", "signature"].map((kind) => (
                  <div className="form-check form-switch mb-1" key={kind}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id={`attach-${kind}-switch`}
                      checked={isAttached(kind)}
                      disabled={!orgSettings?.[`${kind}_url`]}
                      onChange={(e) =>
                        handleToggleAttachment(kind, e.target.checked)
                      }
                    />
                    <label
                      className="form-check-label small"
                      htmlFor={`attach-${kind}-switch`}
                    >
                      Attach {ELEMENT_LABELS[kind]}
                    </label>
                  </div>
                ))}
                {missingImages.length > 0 && (
                  <p className="small text-muted mb-1">
                    No {missingImages.join(" or ")} uploaded yet — add{" "}
                    {missingImages.length > 1 ? "them" : "it"} in{" "}
                    <a href="/admin/settings">Settings</a>.
                  </p>
                )}
                {printElements.length > 0 && (
                  <>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary w-100 mt-1"
                      onClick={handleResetToBottomCenter}
                    >
                      <i className="bi bi-align-bottom me-1"></i>
                      Reset to bottom center
                    </button>
                    <p className="small text-muted mb-0 mt-1">
                      Drag to move, drag the blue corner to resize, × or
                      Delete to remove.
                    </p>
                  </>
                )}
              </div>
            )}

            <div className="mb-3">
              <div className="form-check form-switch mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="includeBankInfoSwitch"
                  checked={includeBankInfo}
                  onChange={(e) => setIncludeBankInfo(e.target.checked)}
                />
                <label
                  className="form-check-label small"
                  htmlFor="includeBankInfoSwitch"
                >
                  Include bank information
                </label>
              </div>

              {includeBankInfo && (
                <div className="d-flex flex-column gap-2">
                  {BANK_FIELDS.map((field) => (
                    <div key={field.key}>
                      <label
                        className="text-muted mb-0 d-block"
                        style={{ fontSize: "0.7rem" }}
                        htmlFor={`bank-${field.key}`}
                      >
                        {field.label}
                      </label>
                      <input
                        id={`bank-${field.key}`}
                        type="text"
                        className="form-control form-control-sm"
                        style={FIELD_STYLE}
                        value={bankInfo[field.key]}
                        onChange={(e) =>
                          handleBankFieldChange(field.key, e.target.value)
                        }
                        placeholder={field.label}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="btn btn-main btn-sm w-100"
              onClick={handlePrint}
            >
              <i className="bi bi-printer me-1"></i> Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrintPreview;
