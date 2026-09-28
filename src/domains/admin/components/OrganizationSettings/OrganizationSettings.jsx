import { useEffect, useRef, useState } from "react";
import useloader from "../../../../context/Loader/useLoader";
import useResponse from "../../../../context/Response/useResponse";
import { useDelete } from "../../../../context/Delete/useDelete";
import {
  fetchOrganizationSettings,
  uploadOrganizationImage,
  deleteOrganizationImage,
} from "../../api/organizationSettings.api";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

const IMAGE_KINDS = [
  {
    kind: "stamp",
    label: "Organization Stamp",
    hint: "Attached to letters and invoices by an Admin. A PNG with a transparent background looks best.",
  },
  {
    kind: "signature",
    label: "Organization Signature",
    hint: "Attached to letters and invoices by an Admin. A PNG with a transparent background looks best.",
  },
];

// Checkerboard so transparent PNGs are visible in the preview
const PREVIEW_BG = {
  backgroundColor: "#fff",
  backgroundImage:
    "linear-gradient(45deg,#f1f3f5 25%,transparent 25%),linear-gradient(-45deg,#f1f3f5 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#f1f3f5 75%),linear-gradient(-45deg,transparent 75%,#f1f3f5 75%)",
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0,0 8px,8px -8px,-8px 0",
};

function OrganizationImageCard({ kind, label, hint, url, onChanged }) {
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();

  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [localPreview, setLocalPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!file) {
      setLocalPreview(null);
      return undefined;
    }
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const resetInput = () => {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFileChange = (e) => {
    const picked = e.target.files?.[0];
    if (!picked) return resetInput();

    if (!ACCEPTED_TYPES.includes(picked.type)) {
      addMessage(false, "Only PNG, JPEG and WEBP images are allowed");
      return resetInput();
    }
    if (picked.size > MAX_SIZE) {
      addMessage(false, "Image must be less than 5MB");
      return resetInput();
    }
    setFile(picked);
  };

  const handleUpload = async () => {
    if (!file) return addMessage(false, `Choose a ${kind} image first`);

    setSaving(true);
    showLoader();
    try {
      const response = await uploadOrganizationImage(kind, file);
      addMessage(response?.success, response?.message);
      resetInput();
      onChanged(response?.data);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      setSaving(false);
      hideLoader();
    }
  };

  const handleDelete = () => {
    openModal(
      async () => {
        showLoader();
        try {
          const response = await deleteOrganizationImage(kind);
          addMessage(response?.success, response?.message);
          onChanged(response?.data);
        } catch (err) {
          addMessage(false, err.message);
        } finally {
          hideLoader();
        }
      },
      {
        title: `Do you want to delete the organization ${kind}?`,
        confirmText: "Delete",
      },
    );
  };

  const previewSrc = localPreview || url;

  return (
    <div className="col-md-6">
      <div className="border rounded-3 p-3 h-100 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h6 className="fw-bold mb-1">{label}</h6>
            <small className="text-muted">{hint}</small>
          </div>
          {url && !localPreview && (
            <span className="badge bg-success-subtle text-success">
              Uploaded
            </span>
          )}
          {localPreview && (
            <span className="badge bg-warning-subtle text-warning">
              Not saved
            </span>
          )}
        </div>

        <div
          className="rounded-3 border d-flex align-items-center justify-content-center my-2"
          style={{ ...PREVIEW_BG, height: 170 }}
        >
          {previewSrc ? (
            <img
              src={previewSrc}
              alt={label}
              style={{ maxHeight: 150, maxWidth: "90%", objectFit: "contain" }}
            />
          ) : (
            <span className="text-muted small">No {kind} uploaded</span>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          className="form-control mt-2"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleFileChange}
          aria-label={`${label} file`}
        />

        <div className="d-flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            className="btn btn-main btn-sm px-3"
            onClick={handleUpload}
            disabled={!file || saving}
          >
            <i className="bi bi-cloud-arrow-up me-1"></i>
            {url ? `Replace ${kind}` : `Upload ${kind}`}
          </button>
          {localPreview && (
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm px-3"
              onClick={resetInput}
              disabled={saving}
            >
              Cancel
            </button>
          )}
          {url && (
            <button
              type="button"
              className="btn btn-outline-danger btn-sm px-3"
              onClick={handleDelete}
              disabled={saving}
            >
              <i className="bi bi-trash me-1"></i>
              Delete {kind}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Organization Settings section of the Settings page. Rendered for Admins
// only (see ChangePassword.jsx); the API itself also rejects staff.
const OrganizationSettings = () => {
  const { addMessage } = useResponse();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchOrganizationSettings()
      .then((res) => setSettings(res?.data || {}))
      .catch((err) => {
        setSettings({});
        addMessage(false, err.message);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="dashboard-wraper mt-4">
      <div className="form-submit">
        <h3 className="fw-bold text-dark mb-2">Organization Settings</h3>
        <p className="text-muted">
          Upload the organization stamp and signature once. Admins can then
          attach them to letters and invoices without uploading again.
        </p>

        {settings === null ? (
          <p className="text-muted small mb-0">Loading…</p>
        ) : (
          <div className="row g-3">
            {IMAGE_KINDS.map((item) => (
              <OrganizationImageCard
                key={item.kind}
                {...item}
                url={settings?.[`${item.kind}_url`] || null}
                onChanged={(data) => data && setSettings(data)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationSettings;
