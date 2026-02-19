import React, { useState, useEffect } from "react";
import TransactionList from "../../Transaction/TransactionList/TransactionList";
import TransactionFilters from "../../Transaction/TransactionFilters/TransactionFilters";
import RecordTransaction from "../../Transaction/RecordTransaction/RecordTransaction.jsx";
import TransactionDetail from "../../Transaction/TransactionDetail/TransactionDetail"; // Added this
import { fetchTransactions } from "../../../api/finance.api";
import useLoader from "../../../../../context/Loader/UseLoader";
import useResponse from "../../../../../context/response/UseResponse";

const FinancePage = () => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  // --- View Control ---
  // 'list', 'create', 'edit', 'detail'
  const [view, setView] = useState("list");

  const [transactions, setTransactions] = useState({ data: [], meta: {} });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    category: "",
    date_from: "",
    date_to: "",
  });

  const [editingTransaction, setEditingTransaction] = useState(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);

  // Fetch list when filters change or when returning to list view
  useEffect(() => {
    if (view === "list") {
      loadTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, view]);

  const loadTransactions = async () => {
    showLoader();
    try {
      const data = await fetchTransactions(filters);
      setTransactions(data);
    } catch (err) {
      addMessage("error", err.message);
    } finally {
      hideLoader();
    }
  };

  // --- Navigation Handlers ---

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setView("edit");
  };

  const handleViewDetails = (id) => {
    setSelectedTransactionId(id);
    setView("detail");
  };

  const handleBackToList = () => {
    setEditingTransaction(null);
    setSelectedTransactionId(null);
    setView("list");
  };

  // --- Rendering Logic ---

  const renderContent = () => {
    switch (view) {
      case "create":
      case "edit":
        return (
          <RecordTransaction
            isEditMode={view === "edit"}
            initialData={editingTransaction}
            onSuccess={() => {
              setView("list");
              loadTransactions();
            }}
            onCancel={handleBackToList}
          />
        );

      case "detail":
        return (
          <TransactionDetail
            transactionId={selectedTransactionId}
            onBack={handleBackToList}
          />
        );

      case "list":
      default:
        return (
          <>
            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
              <div>
                <h2 className="fw-bold text-dark mb-2">Finance Management</h2>
                <p className="text-muted mb-0">
                  Track agency revenue, expenses, commissions, and VAT records.
                </p>
              </div>
              <div className="mt-3 mt-md-0">
                <button
                  className="btn px-4 py-2 rounded-3 shadow-sm fw-semibold text-white"
                  onClick={() => setView("create")}
                  style={{ backgroundColor: "var(--maincolor)" }}
                >
                  + New Transaction
                </button>
              </div>
            </div>

            {/* Filters */}
            <TransactionFilters
              filters={filters}
              onFilterChange={(e) =>
                setFilters({
                  ...filters,
                  [e.target.name]: e.target.value,
                  page: 1,
                })
              }
              onClear={() =>
                setFilters({
                  page: 1,
                  limit: 10,
                  category: "",
                  date_from: "",
                  date_to: "",
                })
              }
            />

            {/* List Table */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body p-0">
                <TransactionList
                  transactions={transactions.data}
                  pagination={transactions.meta}
                  onPageChange={(p) => setFilters({ ...filters, page: p })}
                  onEdit={handleEdit}
                  onView={handleViewDetails} // Passed to show eye icon
                />
              </div>
            </div>
          </>
        );
    }
  };

  return <div className="dashboard-wraper">{renderContent()}</div>;
};

export default FinancePage;
