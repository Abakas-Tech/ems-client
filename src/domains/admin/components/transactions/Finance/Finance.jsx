import React, { useState, useEffect } from "react";
import TransactionFilters from "../../transactions/TransactionFilters/TransactionFilters";
import RecordTransaction from "../../transactions/RecordTransaction/RecordTransaction.jsx";
import TransactionDetail from "../../transactions/TransactionDetail/TransactionDetail";
import { fetchTransactions, deleteTransaction } from "../../../api/finance.api";
import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete.jsx";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import Badge from "../../../../../shared/components/Badge/Badge.jsx";
import FinanceReportSummary from "../FinancialReport/FinancialReport.jsx";
import { useLocation } from "react-router-dom";
import useProfile from "../../../../../context/Profile/useProfile.jsx";

const FinancePage = () => {
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();
  const location = useLocation();
  const { profile } = useProfile();
  const ADMIN_ROLE_ID = 1;

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
      //  Process the transactions
      const response = data;
      const processedTransactions = response.data.map((transaction) => {
        const isAdmin = Number(profile?.role_id) === 1;
        const isCreator =
          Number(transaction.created_by) === Number(profile?.id);

        return {
          ...transaction,
          // If they are Admin or Creator, is_active is true (showing icons)
          // Otherwise false (hiding icons)
          is_active: !!(isAdmin || isCreator),
        };
      });
      setTransactions({
        ...response,
        data: processedTransactions,
      });
    } catch{
    console.error("Failed to fetch transactions:");
    } finally {
      hideLoader();
    }
  };

  const handleDelete = (id) => {
    openModal(
      async () => {
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
      },
      {
        title: "Are you sure you want to delete this transaction?",
        confirmText: "Delete",
      },
    );
  };
  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  useEffect(() => {
    // If we arrived here with state (from Active Workers), go to create mode
    if (location.state?.userId) {
      setView("create");
    }
  }, [location.state]);

  // Pass the state to RecordTransaction
  if (view === "create" || view === "edit") {
    return (
      <RecordTransaction
        isEditMode={view === "edit"}
        initialData={view === "edit" ? editingTransaction : location.state} // Pass state here
        onSuccess={() => {
          setView("list");
          setEditingTransaction(null);
          // Clear location state so refresh doesn't trigger create mode again
          window.history.replaceState({}, document.title);
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

  if (view === "report") {
    return (
      <FinanceReportSummary
        filters={{
          ...filters,
          startDate: filters.date_from, // Map date_from to startDate
          endDate: filters.date_to, // Map date_to to endDate
        }}
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
            New Transaction
          </button>
          <span className="m-2"></span>
          <button
            className="btn btn-main px-4 py-2 rounded-3 shadow-sm fw-semibold text-white me-2 mt-2 mt-sm-0"
            onClick={() => setView("report")}
          >
            Generate Report
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
            showOn: true,
          },
          {
            type: "delete",
            onClick: (row) => handleDelete(row.id),
            showOn: true,
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
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default FinancePage;
