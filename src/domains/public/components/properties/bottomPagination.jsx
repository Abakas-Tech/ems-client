import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const BottomPagination = ({ pagination, onPageChange }) => {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = pagination.page;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  // Generate pagination numbers (max 5 visible)
let startPage = Math.max(currentPage - 2, 1);
let endPage = Math.min(startPage + 2, totalPages);

if (endPage - startPage < 3) {
  startPage = Math.max(endPage - 2, 1);
}

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

  return (
    <div
      className="d-flex flex-column flex-md-row justify-content-between align-items-center my-2 p-2"
    >
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
            alignItems: "center",
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
                backgroundColor: "#fff",
                color: currentPage === 1 ? "#ccc" : "#333",
                fontWeight: 500,
                transition: "all 0.2s",
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
                transition: "all 0.2s",
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
                backgroundColor: "#fff",
                color: currentPage === totalPages ? "#ccc" : "#333",
                fontWeight: 500,
                transition: "all 0.2s",
              }}
            >
              <FaChevronRight />
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default BottomPagination;
