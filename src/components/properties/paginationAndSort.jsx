import React from "react";
import { Pagination, Form } from "react-bootstrap";

// PaginationAndSort component for pagination controls and sorting
const PaginationAndSort = ({
  pagination,
  onPageChange,
  onSortChange,
  total,
}) => {
  // Calculate total pages based on total items and limit
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = pagination.page;

  // Define sorting options
  const sortOptions = [
    { value: "created_at:desc", label: "Newest" },
    { value: "created_at:asc", label: "Oldest" },
  ];

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page); // Trigger page change callback
    }
  };

  // Handle sort change
  const handleSortChange = (e) => {
    onSortChange(e.target.value); // Trigger sort change callback
  };

  // Generate page numbers for display
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    // Container for pagination and sort controls
    <div className="d-flex justify-content-between align-items-center mt-4">
      // Results display
      <div
        className="font-weight-bold text-gray-800"
        style={{ fontSize: "16px" }}
      >
        {total || 0} Results Show // Display total properties count
      </div>
      // Pagination and sort container
      <div className="d-flex align-items-center">
        // Sorting dropdown
        <Form.Group className="me-3">
          <Form.Select
            onChange={handleSortChange}
            className="form-select border" // Match template's border style
            style={{ borderColor: "#ced4da", color: "#333", fontSize: "14px" }}
          >
            <option value="">Sort By</option>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} // Display sort option (e.g., Newest)
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        // Pagination controls
        <Pagination className="mb-0">
          // Previous button
          <Pagination.Prev
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="page-item"
          >
            <span
              className="page-link"
              style={{ borderColor: "#ced4da", color: "#333" }}
            >
              Previous
            </span>
          </Pagination.Prev>
          // Page numbers
          {pageNumbers.map((page) => (
            <Pagination.Item
              key={page}
              active={page === currentPage}
              onClick={() => handlePageChange(page)}
              className="page-item"
            >
              <span
                className="page-link"
                style={{
                  backgroundColor:
                    page === currentPage ? "#007bff" : "transparent",
                  color: page === currentPage ? "#fff" : "#333",
                  borderColor: "#ced4da",
                }}
              >
                {page} // Display page number
              </span>
            </Pagination.Item>
          ))}
          // Next button
          <Pagination.Next
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="page-item"
          >
            <span
              className="page-link"
              style={{ borderColor: "#ced4da", color: "#333" }}
            >
              Next
            </span>
          </Pagination.Next>
        </Pagination>
      </div>
    </div>
  );
};

export default PaginationAndSort; // Export the PaginationAndSort component
