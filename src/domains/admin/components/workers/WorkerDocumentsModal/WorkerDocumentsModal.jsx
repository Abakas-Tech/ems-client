import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import {
  listWorkerDocuments,
  deleteWorkerDocument,
} from "../../../api/worker.api";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete";
import styles from "./WorkerDocumentsModal.module.css";

Modal.setAppElement("#root");

const IMAGE_TYPES = ["jpg", "jpeg", "png", "gif", "webp"];

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
  const [documents, setDocuments] = useState([]);
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
        if (!cancelled) setDocuments(response?.data || []);
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

  const handleDelete = (document) => {
    openModal(
      async () => {
        try {
          await deleteWorkerDocument(worker.id, document.id);
          setDocuments((previous) =>
            previous.filter((item) => item.id !== document.id),
          );
          if (selected?.id === document.id) setSelected(null);
          addMessage(true, "Document deleted successfully");
        } catch (error) {
          addMessage(false, error.message);
        }
      },
      {
        title: `Delete "${document.file_name}"? This cannot be undone.`,
        confirmText: "Delete",
      },
    );
  };

  return (
    <Modal
      isOpen={show}
      onRequestClose={onClose}
      className={styles.modal}
      overlayClassName={styles.overlay}
      closeTimeoutMS={200}
    >
      <div className={styles.header}>
        <h4 className={styles.title}>
          Documents{worker?.full_name ? ` — ${worker.full_name}` : ""}
        </h4>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      {selected ? (
        <div className={styles.detail}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => setSelected(null)}
          >
            <i className="fa-solid fa-arrow-left"></i> Back to all documents
          </button>

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
                >
                  <i className="fa-solid fa-eye"></i> Open
                </a>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(selected)}
                >
                  <i className="fa-solid fa-trash"></i> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className={styles.emptyState}>Loading documents…</div>
      ) : documents.length === 0 ? (
        <div className={styles.emptyState}>
          No documents uploaded for this worker yet.
        </div>
      ) : (
        <div className={styles.grid}>
          {documents.map((document) => (
            <button
              type="button"
              key={document.id}
              className={styles.card}
              onClick={() => setSelected(document)}
            >
              <div className={styles.thumb}>
                {IMAGE_TYPES.includes(
                  (document.file_type || "").toLowerCase(),
                ) ? (
                  <img src={document.file_url} alt={document.file_name} />
                ) : (
                  <i className={fileIconClass(document.file_type)}></i>
                )}
              </div>
              <span className={styles.cardBadge}>{document.category}</span>
              <span className={styles.cardName} title={document.file_name}>
                {document.file_name}
              </span>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default WorkerDocumentsModal;
