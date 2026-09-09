import React, { useEffect, useState } from "react";
import {
  listWorkerDocuments,
  deleteWorkerDocument,
} from "../../../api/worker.api";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete";
import CreateModal from "../../../../../shared/components/CreateModal/CreateModal";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import styles from "./WorkerDocumentsModal.module.css";

const IMAGE_TYPES = ["jpg", "jpeg", "png", "gif", "webp"];

// Well below CreateModal's own overlay z-index, but explicit/inline so it's
// never in doubt against ConfirmDeleteModal's (see the overlayZIndex prop).
const OVERLAY_Z_INDEX = 10001;

// Font Awesome icon per file type, for the non-image thumbnails in the grid.
const fileIconClass = (fileType) => {
  const type = (fileType || "").toLowerCase();
  if (type === "pdf") return "fa-solid fa-file-pdf";
  if (["doc", "docx"].includes(type)) return "fa-solid fa-file-word";
  if (["xls", "xlsx"].includes(type)) return "fa-solid fa-file-excel";
  return "fa-solid fa-file";
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const WorkerDocumentsModal = ({ show, onClose, worker }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  const { addMessage } = useResponse();
  const { openModal } = useDelete();

  useEffect(() => {
    if (!show || !worker?.id) return;

    let cancelled = false;
    setLoading(true);
    setSelected(null);

    listWorkerDocuments(worker.id)
      .then((response) => {
        if (!cancelled) setItems(response?.data || []);
      })
      .catch((error) => {
        if (!cancelled) addMessage(false, error.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, worker?.id]);

  // Fetches the file as a blob first - a plain <a download> is unreliable
  // for a cross-origin Cloudinary URL (most browsers just navigate to it
  // instead of downloading), a blob URL forces an actual download.
  const handleDownload = async (item) => {
    try {
      const response = await fetch(item.file_url, { mode: "cors" });
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = item.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download document:", error);
      addMessage(false, "Failed to download file");
    }
  };

  const handleDelete = (item) => {
    openModal(
      async () => {
        try {
          await deleteWorkerDocument(worker.id, item.id);
          setItems((previous) => previous.filter((doc) => doc.id !== item.id));
          if (selected?.id === item.id) setSelected(null);
          addMessage(true, "Document deleted successfully");
        } catch (error) {
          addMessage(false, error.message);
        }
      },
      {
        title: `Are you sure you want to delete ${item.file_name}?`,
        confirmText: "Delete",
      },
    );
  };

  return (
    <CreateModal
      show={show}
      onClose={onClose}
      title={`Documents${worker?.full_name ? ` — ${worker.full_name}` : ""}`}
      maxWidth="740px"
      overlayZIndex={OVERLAY_Z_INDEX}
    >
      {/* Single control: goes back to the grid while viewing one document's
          detail, or closes the whole modal from the grid itself - avoids
          needing a second, separate close button alongside it. */}
      <div className={styles.headerRow}>
        <BackButton
          onClick={() => (selected ? setSelected(null) : onClose())}
        />
      </div>

      {selected ? (
        <div className={styles.detailBody}>
          {IMAGE_TYPES.includes((selected.file_type || "").toLowerCase()) ? (
            <img
              src={selected.file_url}
              alt={selected.file_name}
              className={styles.detailImage}
            />
          ) : (
            <div className={styles.detailFileIcon}>
              <i className={fileIconClass(selected.file_type)}></i>
            </div>
          )}

          <div className={styles.detailInfo}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>File name</span>
              <span>{selected.file_name}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Category</span>
              <span className={styles.badge}>{selected.category}</span>
            </div>
            {selected.description && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Description</span>
                <span>{selected.description}</span>
              </div>
            )}
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Uploaded</span>
              <span>{formatDate(selected.created_at)}</span>
            </div>

            <div className={styles.detailActions}>
              <a
                href={selected.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-info"
                title="View"
                aria-label="View"
              >
                <i className="fa-solid fa-eye"></i>
              </a>
              <button
                type="button"
                className="btn btn-sm btn-outline-info"
                title="Download"
                aria-label="Download"
                onClick={() => handleDownload(selected)}
              >
                <i className="fa-solid fa-download"></i>
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                title="Delete"
                aria-label="Delete"
                onClick={() => handleDelete(selected)}
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className={styles.emptyState}>Loading documents…</div>
      ) : items.length === 0 ? (
        <div className={styles.emptyState}>
          No documents uploaded for this worker yet.
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => (
            <button
              type="button"
              key={item.id}
              className={styles.card}
              onClick={() => setSelected(item)}
            >
              <div className={styles.thumb}>
                {IMAGE_TYPES.includes((item.file_type || "").toLowerCase()) ? (
                  <img src={item.file_url} alt={item.file_name} />
                ) : (
                  <i className={fileIconClass(item.file_type)}></i>
                )}
              </div>
              <span className={styles.cardBadge}>{item.category}</span>
              <span className={styles.cardName} title={item.file_name}>
                {item.file_name}
              </span>
            </button>
          ))}
        </div>
      )}
    </CreateModal>
  );
};

export default WorkerDocumentsModal;
