import React, { useState, useRef, useCallback } from "react";
import BackButton from "../../../../shared/components/BackButton/BackButton";
import styles from "./FileSearch.module.css";

// helpers

const FILE_ICONS = {
  pdf: "bi-file-earmark-pdf",
  txt: "bi-file-earmark-text",
  doc: "bi-file-earmark-word",
  docx: "bi-file-earmark-word",
  csv: "bi-file-earmark-spreadsheet",
  json: "bi-file-earmark-code",
  md: "bi-markdown",
  default: "bi-file-earmark",
};

function getIcon(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  return FILE_ICONS[ext] ?? FILE_ICONS.default;
}

function getIconColor(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  const colors = {
    pdf: "text-danger",
    doc: "text-primary",
    docx: "text-primary",
    csv: "text-success",
    json: "text-warning",
    md: "text-secondary",
    txt: "text-info",
  };
  return colors[ext] ?? "text-info";
}

// extra plain text
async function extractText(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result ?? "");
    reader.onerror = () => resolve("");
    reader.readAsText(file);
  });
}

// Split text into paragraphs / lines for display 
function splitIntoChunks(text) {
  return text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

// Highlight a query inside a string — returns array of {text, highlight} parts 
function highlight(str, query) {
  if (!query) return [{ text: str, highlight: false }];
  const parts = [];
  const lower = str.toLowerCase();
  const q = query.toLowerCase();
  let cursor = 0;
  while (cursor < str.length) {
    const idx = lower.indexOf(q, cursor);
    if (idx === -1) {
      parts.push({ text: str.slice(cursor), highlight: false });
      break;
    }
    if (idx > cursor)
      parts.push({ text: str.slice(cursor, idx), highlight: false });
    parts.push({ text: str.slice(idx, idx + q.length), highlight: true });
    cursor = idx + q.length;
  }
  return parts;
}

// sub-components

function HighlightedLine({ text, query }) {
  const parts = highlight(text, query);
  return (
    <span>
      {parts.map((p, i) =>
        p.highlight ? (
          <mark key={i} className={styles.mark}>
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </span>
  );
}

function SearchView({ file, onBack }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const chunks = splitIntoChunks(file.content);

  const filtered =
    query.trim() === ""
      ? chunks
      : chunks.filter((c) => c.toLowerCase().includes(query.toLowerCase()));

  const matchCount = query.trim() !== "" ? filtered.length : null;

  return (
    <div className="dashboard-wraper">
      <BackButton onClick={onBack} />

      {/* Header */}
      <div className="mb-3">
        <div className="d-flex align-items-center gap-2 mb-1">
          <i
            className={`bi ${getIcon(file.name)} fs-4 ${getIconColor(file.name)}`}
          ></i>
          <h2 className="fw-bold mb-0">{file.title}</h2>
        </div>
        <p className="text-muted mb-0 small">{file.name}</p>
      </div>

      {/* Search bar */}
      <div className={`${styles.searchBar} mb-4`}>
        <i className="bi bi-search text-muted" />
        <input
          ref={inputRef}
          type="text"
          className={styles.searchInput}
          placeholder="Search inside file…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {query && (
          <button
            className={styles.clearBtn}
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
          >
            <i className="bi bi-x-lg" />
          </button>
        )}
      </div>

      {/* Result count */}
      {matchCount !== null && (
        <p
          className={`small mb-3 ${matchCount === 0 ? "text-danger" : "text-muted"}`}
        >
          {matchCount === 0
            ? "No results found"
            : `${matchCount} result${matchCount !== 1 ? "s" : ""}`}
        </p>
      )}

      {/* Content lines */}
      <div className={styles.contentArea}>
        {filtered.length === 0 && query.trim() !== "" ? (
          <div className={styles.emptyState}>
            <i className="bi bi-search fs-1 text-muted mb-3 d-block" />
            <p className="text-muted">Nothing matched "{query}"</p>
          </div>
        ) : (
          filtered.map((chunk, i) => (
            <div
              key={i}
              className={`${styles.chunk} ${query && styles.chunkMatch}`}
            >
              <HighlightedLine text={chunk} query={query} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}


const FileSearch = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = useCallback(async (e) => {
    const raw = Array.from(e.target.files ?? []);
    if (!raw.length) return;

    setUploading(true);
    try {
      const newFiles = await Promise.all(
        raw.map(async (f) => {
          const content = await extractText(f);
          return {
            id: crypto.randomUUID(),
            name: f.name,
            title: f.name.replace(/\.[^.]+$/, ""),
            size: f.size,
            uploadedAt: new Date().toISOString(),
            content,
          };
        }),
      );
      setFiles((prev) => [...prev, ...newFiles]);
    } finally {
      setUploading(false);
      // reset input so same file can be re-uploaded
      e.target.value = "";
    }
  }, []);

  const handleRemove = useCallback((id, e) => {
    e.stopPropagation();
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  if (selectedFile) {
    return (
      <SearchView file={selectedFile} onBack={() => setSelectedFile(null)} />
    );
  }

  return (
    <div className="dashboard-wraper">
      {/* Header */}
      <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-2">File Search</h2>
          <p className="text-muted mb-0">
            Upload files and search inside them — like searching in a channel.
          </p>
        </div>

        {/* Upload button */}
        <button
          className={`btn btn-info text-white d-flex align-items-center gap-2 ${styles.uploadBtn}`}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <span
                className="spinner-border spinner-border-sm"
                role="status"
              />
              Uploading…
            </>
          ) : (
            <>
              <i className="bi bi-upload" />
              Upload File
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt,.md,.csv,.json,.pdf,.doc,.docx"
          className="d-none"
          onChange={handleUpload}
        />
      </div>

      {/* Empty state */}
      {files.length === 0 && (
        <div className={styles.emptyState}>
          <i className="bi bi-folder2-open fs-1 text-muted mb-3 d-block" />
          <p className="text-muted">No files yet. Upload one to get started.</p>
          <button
            className="btn btn-outline-info mt-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <i className="bi bi-upload me-2" />
            Upload your first file
          </button>
        </div>
      )}

      {/* File cards */}
      {files.length > 0 && (
        <div className="row g-3">
          {files.map((file) => (
            <div key={file.id} className="col-12 col-md-6 col-lg-4">
              <button
                className={`w-100 p-4 border rounded-4 bg-white text-start ${styles.fileCard}`}
                onClick={() => setSelectedFile(file)}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center overflow-hidden">
                    <i
                      className={`bi ${getIcon(file.name)} fs-3 me-3 flex-shrink-0 ${getIconColor(file.name)}`}
                    />
                    <div className="overflow-hidden">
                      <h6 className="mb-1 fw-bold text-truncate">
                        {file.title}
                      </h6>
                      <small className="text-muted d-block text-truncate">
                        {file.name}
                      </small>
                      <small className="text-muted">
                        {splitIntoChunks(file.content).length} lines
                      </small>
                    </div>
                  </div>
                  <button
                    className={`btn btn-link text-muted p-0 ms-2 flex-shrink-0 ${styles.removeBtn}`}
                    onClick={(e) => handleRemove(file.id, e)}
                    title="Remove file"
                    aria-label="Remove file"
                  >
                    <i className="bi bi-trash3" />
                  </button>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileSearch;
