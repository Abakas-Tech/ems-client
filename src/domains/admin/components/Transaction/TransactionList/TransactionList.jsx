// domains/finance/components/TransactionList.jsx
import React from "react";
import BottomPagination from "../../../../../shared/components/BottomPagination/BottomPagination";

const TransactionList = ({ transactions, pagination, onPageChange }) => {
  return (
    <div className="card shadow-sm">
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className={`table table-hover align-middle`}>
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {transactions?.map((t, index) => (
                <tr key={t.id}>
                  <td>
                    {(pagination.page - 1) * pagination.limit + index + 1}
                  </td>
                  <td>{new Date(t.transaction_date).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={`badge bg-${t.category === "income" ? "success" : "danger"}`}
                    >
                      {t.category}
                    </span>
                  </td>
                  <td>{t.amount?.toLocaleString()} SR</td>
                  <td>{t.description}</td>
                  <td>{t.reference || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination?.total > pagination?.limit && (
        <BottomPagination pagination={pagination} onPageChange={onPageChange} />
      )}
    </div>
  );
};

export default TransactionList;
