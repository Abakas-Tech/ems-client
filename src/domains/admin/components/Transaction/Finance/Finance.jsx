import React, { useState, useEffect } from "react";
import TransactionList from "../../Transaction/TransactionList/TransactionList";
import TransactionFilters from "../../Transaction/TransactionFilters/TransactionFilters";
// This is now your normal Form component, not a modal
import RecordTransaction from "../../Transaction/RecordTransaction/RecordTransaction.jsx";
import { fetchTransactions } from "../../../api/finance.api";
import useLoader from "../../../../../context/Loader/UseLoader";
import useResponse from "../../../../../context/response/UseResponse";


const FinancePage = () => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  // --- View Control ---
  // 'list' = Table + Filters + Summary
  // 'create' = Add Form
  // 'edit' = Edit Form
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
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (view === "list") {
      loadTransactions();
      loadSummary();
    }
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

  const loadSummary = async () => {
    try {
      const data = await fetchFinanceSummary(); // Standardized summary fetching
      setSummary(data);
    } catch (err) {
      console.error("Summary failed:", err);
    }
  };

  // Switch to Edit Mode
  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setView("edit");
  };

  // Switch back to List
  const handleBackToList = () => {
    setEditingTransaction(null);
    setView("list");
  };

  return (
    <div className="container-fluid py-4">
      {/* 1. RENDER FORM COMPONENT (Create/Edit) */}
      {view !== "list" ? (
        <RecordTransaction
          isEditMode={view === "edit"}
          initialData={editingTransaction}
          onSuccess={() => {
            setView("list");
            loadTransactions();
          }}
          onCancel={handleBackToList}
        />
      ) : (
        /* 2. RENDER LIST VIEW */
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold">Finance Management</h2>
            <button
              className="btn btn-main px-4 text-white"
              style={{ backgroundColor: "var(--maincolor)" }}
              onClick={() => setView("create")}
            >
              + New Transaction
            </button>
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
          <div className="card shadow-sm border-0 mt-3">
            <TransactionList
              transactions={transactions.data}
              pagination={transactions.meta}
              onPageChange={(p) => setFilters({ ...filters, page: p })}
              onEdit={handleEdit} // Pass the edit trigger to the table rows
            />
          </div>
        </>
      )}
    </div>
  );
};

export default FinancePage;
