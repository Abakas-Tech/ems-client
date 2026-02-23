import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import styles from "./BottomPagination.module.css";

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
      className={`${styles["bottom-pagination-wrapper"]} d-flex flex-column flex-md-row justify-content-between align-items-center`}
    >
      <div className="d-flex justify-content-center flex-grow-1">
        <ul className={styles["bottom-pagination-list"]}>
          {totalPages > 3 && (
            <li
              onClick={() => handlePageChange(currentPage - 1)}
              className={`${styles["pagination-item"]} ${
                currentPage === 1 ? styles["pagination-item-disabled"] : ""
              }`}
            >
              <FaChevronLeft />
            </li>
          )}

          {pageNumbers.map((page) => (
            <li
              key={page}
              onClick={() => handlePageChange(page)}
              className={`${styles["pagination-item"]} ${
                page === currentPage ? styles["pagination-item-active"] : ""
              }`}
            >
              {page}
            </li>
          ))}

          {totalPages > 3 && (
            <li
              onClick={() => handlePageChange(currentPage + 1)}
              className={`${styles["pagination-item"]} ${
                currentPage === totalPages
                  ? styles["pagination-item-disabled"]
                  : ""
              }`}
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
