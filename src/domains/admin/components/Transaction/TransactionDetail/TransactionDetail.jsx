import React from "react";

const TransactionDetail = ({ transaction }) => {
  if (!transaction) return null;

  return (
    <div className="p-3">
      <div className="row">
        <div className="col-md-6">
          <h6 className="text-muted">Involved Party</h6>
          <p className="fw-bold mb-1">{transaction.user?.name}</p>
          <span className="badge bg-secondary text-capitalize">
            {transaction.user?.role}
          </span>
        </div>
        <div className="col-md-6 text-md-end">
          <h6 className="text-muted">Amount</h6>
          <h4
            className={
              transaction.type === "income" ? "text-success" : "text-danger"
            }
          >
            {transaction.type === "income" ? "+" : "-"} {transaction.amount}
          </h4>
        </div>
      </div>
      <hr />
      <div className="mt-3">
        <h6>Transaction Details</h6>
        <table className="table table-sm">
          <tbody>
            <tr>
              <td>Category:</td>
              <td>{transaction.category}</td>
            </tr>
            <tr>
              <td>Reference:</td>
              <td>{transaction.reference || "N/A"}</td>
            </tr>
            <tr>
              <td>Date:</td>
              <td>{new Date(transaction.created_at).toLocaleString()}</td>
            </tr>
            <tr>
              <td>Description:</td>
              <td>{transaction.description}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionDetail;
