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

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);

  return (
    <>
      {/* Pagination Text & Page Links */}
      <div className="col-lg-7 col-md-12 col-sm-12 order-lg-2 order-md-3 elco_bor col-sm-12">
        <div className="shorting_pagination d-flex justify-content-between align-items-center">
          <div className="shorting_pagination_laft">
            <h5>
              Showing {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, total)} of {total}{" "}
              results
            </h5>
          </div>
          <div className="shorting_pagination_right">
            <ul>
              {pageNumbers.map((page) => (
                <li
                  key={page}
                  className={page === currentPage ? "active" : ""}
                  onClick={() => handlePageChange(page)}
                  style={{ cursor: "pointer" }}
                >
                  <a>{page}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Sort Dropdown */}
      <div className="col-lg-3 col-md-6 col-sm-12 order-lg-3 order-md-2 col-sm-6 pe-0">
        <div className="shorting-right d-flex align-items-center">
          <label className="me-2">Short By:</label>
          <div className="shorting-by border rounded">
            <select
              className="form-control rounded"
              id="shorty"
              onChange={handleSortChange}
              value={pagination.sort || ""}
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
    </>
  );
};

export default PaginationAndSort;
