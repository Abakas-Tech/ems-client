import React, { useState, useEffect } from "react";
import TransactionFilters from "../../transactions/TransactionFilters/TransactionFilters";
import RecordTransaction from "../../transactions/RecordTransaction/RecordTransaction.jsx";
import TransactionDetail from "../../transactions/TransactionDetail/TransactionDetail";
import { fetchTransactions, deleteTransaction } from "../../../api/finance.api";
import useLoader from "../../../../../context/Loader/UseLoader";
import useResponse from "../../../../../context/response/UseResponse";
import { useDelete } from "../../../../../context/Delete/UseDelete.jsx";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import Badge from "../../../../../shared/components/Badge/Badge.jsx";

const FinancePage = () => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();

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

  useEffect(() => {
    if (view === "list") loadTransactions();
  }, [filters, view]);

  const loadTransactions = async () => {
    showLoader();
    try {
      const data = await fetchTransactions(filters);
      setTransactions(data);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  const handleDelete = (id) => {
    openModal(async () => {
      showLoader();
      try {
        await deleteTransaction(id);
        addMessage(true, "Transaction deleted successfully");
        loadTransactions();
      } catch (err) {
        addMessage(false, err.message);
      } finally {
        hideLoader();
      }
    });
  };

  if (view === "create" || view === "edit") {
    return (
      <RecordTransaction
        isEditMode={view === "edit"}
        initialData={editingTransaction}
        onSuccess={() => {
          setView("list");
          setEditingTransaction(null);
        }}
        onCancel={() => setView("list")}
      />
    );
  }

  if (view === "detail") {
    return (
      <TransactionDetail
        transactionId={selectedTransactionId}
        onBack={() => setView("list")}
      />
    );
  }

  return (
    <div className="dashboard-wraper">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-2">Finance Management</h2>
          <p className="text-muted mb-0">
            Track agency revenue, expenses, and VAT records.
          </p>
        </div>
        <div className="mt-3 mt-md-0">
          <button
            className="btn btn-main px-4 py-2 rounded-3 shadow-sm fw-semibold text-white"
            onClick={() => setView("create")}
          >
            + New Transaction
          </button>
        </div>
      </div>

      <ListingComponent
        filtersComponent={
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
        }
        data={transactions.data}
        columns={[
          {
            header: "Date",
            render: (row) =>
              new Date(row.transaction_date).toLocaleDateString(),
          },
          { header: "Reference", accessor: "reference" },
          {
            header: "Category",
            render: (row) => (
              <>
                <Badge
                  content={row.category.toUpperCase()}
                  color={row.category === "income" ? "green" : "red"}
                />
              </>
            ),
          },
          {
            header: "Amount",
            accessor: "amount",
          },
        ]}
        actions={[
          {
            type: "view",
            onClick: (row) => {
              setSelectedTransactionId(row.id);
              setView("detail");
            },
          },
          {
            type: "edit",
            onClick: (row) => {
              setEditingTransaction(row);
              setView("edit");
            },
          },
          {
            type: "delete",
            onClick: (row) => handleDelete(row.id),
          },
        ]}
        pagination={{
          page: filters.page,
          limit: filters.limit,
          total: transactions.meta?.total || 0,
          onPageChange: (p) => setFilters({ ...filters, page: p }),
        }}
        emptyState={{
          title: "No transactions found",
          subtitle: "Start by recording your first agency transaction.",
        }}
      />
    </div>
  );
};

export default FinancePage;
