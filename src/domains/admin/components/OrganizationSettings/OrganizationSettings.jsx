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
  { kind: "stamp", label: "Stamp" },
  { kind: "signature", label: "Signature" },
];

// Checkerboard so transparent PNGs are visible in the preview
const PREVIEW_BG = {
  backgroundColor: "#fff",
  backgroundImage:
    "linear-gradient(45deg,#f1f3f5 25%,transparent 25%),linear-gradient(-45deg,#f1f3f5 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#f1f3f5 75%),linear-gradient(-45deg,transparent 75%,#f1f3f5 75%)",
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0,0 8px,8px -8px,-8px 0",
};

// One image: preview, Upload / Replace (picking a file uploads it right
// away) and Delete.
function OrganizationImageCard({ kind, label, url, onChanged }) {
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();

  const inputRef = useRef(null);
  const [localPreview, setLocalPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  // Frees the object URL of the image being uploaded
  useEffect(
    () => () => localPreview && URL.revokeObjectURL(localPreview),
    [localPreview],
  );

  const pickFile = () => inputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      return addMessage(false, "Only PNG, JPEG and WEBP images are allowed");
    }
    if (file.size > MAX_SIZE) {
      return addMessage(false, "Image must be less than 5MB");
    }

    setLocalPreview(URL.createObjectURL(file));
    setSaving(true);
    showLoader();
    try {
      const response = await uploadOrganizationImage(kind, file);
      addMessage(response?.success, response?.message);
      onChanged(response?.data);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      setLocalPreview(null);
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
    <div className="col-sm-6">
      <div className="border rounded-3 p-3 h-100">
        <h6 className="fw-bold mb-2">{label}</h6>

        <button
          type="button"
          className="w-100 rounded-3 border d-flex align-items-center justify-content-center p-0"
          style={{ ...PREVIEW_BG, height: 160 }}
          onClick={pickFile}
          disabled={saving}
          title={url ? `Replace ${kind}` : `Upload ${kind}`}
        >
          {previewSrc ? (
            <img
              src={previewSrc}
              alt={label}
              style={{
                maxHeight: 140,
                maxWidth: "90%",
                objectFit: "contain",
                opacity: saving ? 0.5 : 1,
              }}
            />
          ) : (
            <span className="text-muted small">
              <i className="bi bi-image d-block fs-3 mb-1"></i>
              No {kind} yet
            </span>
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          className="d-none"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleFileChange}
          aria-label={`${label} image`}
        />

        <div className="d-flex gap-2 mt-3">
          <button
            type="button"
            className="btn btn-main btn-sm flex-fill"
            onClick={pickFile}
            disabled={saving}
          >
            <i className="bi bi-upload me-1"></i>
            {saving ? "Uploading…" : url ? "Replace" : "Upload"}
          </button>
          {url && (
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={handleDelete}
              disabled={saving}
              title={`Delete ${kind}`}
              aria-label={`Delete ${kind}`}
            >
              <i className="bi bi-trash"></i>
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
        <h3 className="fw-bold text-dark mb-3">Organization Settings</h3>

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
