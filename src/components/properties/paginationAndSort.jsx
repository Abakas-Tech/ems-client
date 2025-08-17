import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const PaginationAndSort = ({
  pagination,
  onPageChange,
  onSortChange,
  total,
}) => {
  const [open, setOpen] = useState(false);

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = pagination.page;

  const sortOptions = [
    { value: "created_at:desc", label: "Newest" },
    { value: "created_at:asc", label: "Oldest" },
  ];

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handleSortChange = (value) => {
    onSortChange(value);
    setOpen(false); // close menu on selection
  };

  // Generate pagination numbers (max 5 visible)
  let startPage = Math.max(currentPage - 2, 1);
  let endPage = Math.min(startPage + 4, totalPages);
  if (endPage - startPage < 4) {
    startPage = Math.max(endPage - 4, 1);
  }

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

  return (
    <div
      className="d-flex flex-column flex-md-row justify-content-between align-items-center my-2 p-2"
      style={{ backgroundColor: "#fff", borderRadius: "5px" }}
    >
      {/* First row: Results + Pagination */}
      <div className="d-flex justify-content-between align-items-center w-100 mb-2 mb-md-0">
        {/* Results Text */}
        <div style={{ fontWeight: 500, fontSize: "clamp(12px,1.2vw,14px)" }}>
          Showing {(pagination.page - 1) * pagination.limit + 1}-
          {Math.min(pagination.page * pagination.limit, total)} of {total}{" "}
          results
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-center flex-grow-1">
          <ul
            style={{
              display: "flex",
              gap: "10px",
              padding: 0,
              margin: 0,
              listStyle: "none",
              fontSize: "clamp(12px,1.2vw,14px)",
            }}
          >
            {pageNumbers.map((page) => (
              <li
                key={page}
                onClick={() => handlePageChange(page)}
                style={{
                  cursor: "pointer",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border:
                    page === currentPage
                      ? "2px solid #007bff"
                      : "2px solid #ddd",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: page === currentPage ? "#e6f0ff" : "#fff",
                  color: page === currentPage ? "#007bff" : "#333",
                  fontWeight: 500,
                  transition: "all 0.2s",
                }}
              >
                {page}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Second row (on small) / Right (on large): Custom Sort Dropdown */}
      <div className="d-flex align-items-center justify-content-center justify-content-md-end w-100 w-md-auto position-relative">
        <div
          className="border rounded d-flex align-items-center position-relative p-3"
          style={{
            backgroundColor: "#fff",
            minWidth: "140px",
            cursor: "pointer",
          }}
          onClick={() => setOpen(!open)}
        >
          <div
            className="flex-grow-1 px-2"
            style={{ fontSize: "clamp(12px,1.2vw,14px)" }}
          >
            {sortOptions.find((opt) => opt.value === pagination.sort)?.label ||
              "Sort By"}
          </div>
          {open ? (
            <FaChevronUp className="me-2 text-muted" />
          ) : (
            <FaChevronDown className="me-2 text-muted" />
          )}

          {/* Dropdown Menu */}
          <ul
            className={`position-absolute top-100 start-0 w-100 bg-white border rounded mt-1 shadow-sm p-0 list-unstyled overflow-hidden transition-all`}
            style={{
              maxHeight: open ? "200px" : "0",
              opacity: open ? 1 : 0,
              visibility: open ? "visible" : "hidden",
              transform: open ? "translateY(0)" : "translateY(-5px)",
              transition: "all 0.25s ease",
              zIndex: 1000,
            }}
          >
            {sortOptions.map((option) => (
              <li
                key={option.value}
                className="px-3 py-2 hover-bg-light"
                style={{
                  cursor: "pointer",
                  fontSize: "clamp(12px,1.2vw,14px)",
                  backgroundColor:
                    option.value === pagination.sort ? "#f1f1f1" : "#fff",
                }}
                onClick={() => handleSortChange(option.value)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaginationAndSort;
