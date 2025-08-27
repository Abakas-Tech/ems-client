import React, { useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
} from "react-icons/fa";

const PaginationAndSort = ({
  pagination,
  onPageChange,
  onSortChange,
  onTitleSearch,
  total,
}) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

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
    setOpen(false);
  };

  const handleTitleChange = (e) => {
    const value = e.target.value.trim();
    setTitle(e.target.value);
    onTitleSearch(value === "" ? undefined : value);
  };

  // Pagination range
  let startPage = Math.max(currentPage - 2, 1);
  let endPage = Math.min(startPage + 2, totalPages);
  if (endPage - startPage < 2) startPage = Math.max(endPage - 2, 1);
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

  return (
    <div
      className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center my-2 p-2"
      style={{ backgroundColor: "#fff", borderRadius: "5px" }}
    >
      {/* Title Search - on top for small screens, left for md+ */}
      <div
        className="position-relative mb-2 mb-md-0 order-1 order-md-0"
        style={{ minWidth: "180px" }}
      >
        <input
          type="text"
          className="form-control rounded-3 ps-4 "
          placeholder="Search by title…"
          value={title}
          onChange={handleTitleChange}
        />
        <FaSearch
          className="position-absolute mx-2"
          style={{
            left: "0",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#0987F5",
          }}
        />
      </div>

      {/* Left: Results text */}
      <div
        className="d-flex align-items-center mb-2 mb-md-0 order-0 order-md-1"
        style={{ fontWeight: 500, fontSize: "clamp(12px,1.2vw,14px)" }}
      >
        Showing {(pagination.page - 1) * pagination.limit + 1}-
        {Math.min(pagination.page * pagination.limit, total)} of {total} results
      </div>

      {/* Center: Pagination */}
      <div className="d-flex justify-content-center flex-wrap my-2 my-md-0 order-2">
        <ul
          style={{
            display: "flex",
            gap: "8px",
            padding: 0,
            margin: 0,
            listStyle: "none",
            fontSize: "clamp(12px,1.2vw,14px)",
          }}
        >
          {totalPages > 3 && (
            <li
              onClick={() => handlePageChange(currentPage - 1)}
              style={{
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "2px solid #ddd",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: currentPage === 1 ? "#ccc" : "#333",
              }}
            >
              <FaChevronLeft />
            </li>
          )}
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
                  page === currentPage ? "2px solid #007bff" : "2px solid #ddd",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: page === currentPage ? "#e6f0ff" : "#fff",
                color: page === currentPage ? "#007bff" : "#333",
                fontWeight: 500,
              }}
            >
              {page}
            </li>
          ))}
          {totalPages > 3 && (
            <li
              onClick={() => handlePageChange(currentPage + 1)}
              style={{
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "2px solid #ddd",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: currentPage === totalPages ? "#ccc" : "#333",
              }}
            >
              <FaChevronRight />
            </li>
          )}
        </ul>
      </div>

      {/* Right: Sort Dropdown */}
      <div className="d-flex align-items-center position-relative mt-2 mt-md-0 order-3">
        <div
          className="border rounded d-flex align-items-center position-relative p-2 px-3"
          style={{
            backgroundColor: "#fff",
            minWidth: "140px",
            cursor: "pointer",
          }}
          onClick={() => setOpen(!open)}
        >
          <div className="flex-grow-1 p-2">
            {sortOptions.find((opt) => opt.value === pagination.sort)?.label ||
              "Sort By"}
          </div>
          {open ? <FaChevronUp /> : <FaChevronDown />}

          <ul
            className="position-absolute top-100 start-0 w-100 bg-white border rounded mt-1 p-0 list-unstyled overflow-hidden shadow-sm"
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
                className="px-3 py-2"
                style={{
                  cursor: "pointer",
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
