import React from "react";

const PaginationAndSort = ({
  pagination,
  onPageChange,
  onSortChange,
  total,
}) => {
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

  const handleSortChange = (e) => {
    onSortChange(e.target.value);
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
      className="d-flex justify-content-between align-items-center my-2 flex-wrap p-1"
      style={{ backgroundColor: "#fff", borderRadius: "5px" }}
    >
      {/* Results Text - Left */}
      <div style={{ fontWeight: 500 }}>
        Showing {(pagination.page - 1) * pagination.limit + 1}-
        {Math.min(pagination.page * pagination.limit, total)} of {total} results
      </div>

      {/* Pagination - Center */}
      <div className="d-flex justify-content-center flex-grow-1">
        <ul
          style={{
            display: "flex",
            gap: "10px",
            padding: 0,
            margin: 0,
            listStyle: "none",
          }}
        >
          {pageNumbers.map((page) => (
            <li
              key={page}
              onClick={() => handlePageChange(page)}
              style={{
                cursor: "pointer",
                width: "35px",
                height: "35px",
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
        </ul>
      </div>

      {/* Sort Dropdown - Right */}
      <div className="d-flex align-items-center ms-auto">
        <label className="me-2" style={{ fontWeight: 500 }}>
          Sort By:
        </label>
        <div
          className="shorting-by border rounded"
          style={{ backgroundColor: "#fff", padding: "2px 6px" }}
        >
          <select
            className="form-control rounded"
            id="shorty"
            onChange={handleSortChange}
            value={pagination.sort || ""}
            style={{ fontSize: "14px", minWidth: "120px", border: "none" }}
          >
            <option value="">Sort By</option>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default PaginationAndSort;
