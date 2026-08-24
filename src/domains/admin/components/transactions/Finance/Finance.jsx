import React, { useState, useEffect } from "react";
import TransactionFilters from "../../transactions/TransactionFilters/TransactionFilters";
import RecordTransaction from "../../transactions/RecordTransaction/RecordTransaction.jsx";
import TransactionDetail from "../../transactions/TransactionDetail/TransactionDetail";
import {
  fetchTransactions,
  deleteTransaction,
  fetchCurrentPeriod,
  fetchPeriods,
  fetchPeriodTransactions,
  closePeriod,
  deletePeriod,
} from "../../../api/finance.api";
import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete.jsx";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import Badge from "../../../../../shared/components/Badge/Badge.jsx";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import CreateModal from "../../../../../shared/components/CreateModal/CreateModal";
import FinanceReportSummary from "../FinancialReport/FinancialReport.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import useProfile from "../../../../../context/Profile/useProfile.jsx";
import ClosePeriodModal from "../../../../../shared/components/ClosePeriodModal/ClosePeriodModal.jsx";
import { generatePeriodReport } from "../../../../../shared/components/Report/PeriodReport.jsx";

const formatDate = (value, withTime = false) => {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    ...(withTime && { hour: "2-digit", minute: "2-digit" }),
  });
};

const FinancePage = () => {
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();
  const location = useLocation();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const ADMIN_ROLE_ID = 1;
  const isAdmin = Number(profile?.role_id) === ADMIN_ROLE_ID;

  const [view, setView] = useState("list");
  // NOTE: the transactions this page fetches on the main "list" view are
  // always scoped server-side to the currently OPEN period only — closed
  // periods' transactions are never shown here, only inside the
  // "periods" view after explicitly opening a specific (closed) period.
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

  // ── Financial periods (open/close books) state ──────────────
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [periods, setPeriods] = useState({ data: [], meta: {} });
  const [periodsFilters, setPeriodsFilters] = useState({ page: 1, limit: 10 });
  const [selectedPeriod, setSelectedPeriod] = useState(null); // viewing one (open or closed) period's transactions

  // CHANGED: periods are auto-numbered ("Period 1", "Period 2", ...) —
  // closing one only needs a closing note, collected via the shared
  // CreateModal instead of a bare inline form.
  const [showCloseModal, setShowCloseModal] = useState(false);

  // Data backing the on-screen period summary (view === "summary") — the
  // full transaction set for the period, fetched on demand so the totals
  // match the printed report exactly.
  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => {
    if (view === "list") loadTransactions();
  }, [filters, view]);

  useEffect(() => {
    // Keep the "current open period" banner fresh whenever we're on the
    // main list or the periods view.
    if (view === "list" || view === "periods") loadCurrentPeriod();
  }, [view]);

  useEffect(() => {
    if (view === "periods" && !selectedPeriod) loadPeriods();
  }, [periodsFilters, view, selectedPeriod]);

  useEffect(() => {
    // Re-fetch the currently open period's transaction list whenever the
    // filters (category/date range) change, same as the main list.
    if (view === "periods" && selectedPeriod) {
      loadPeriodTransactions(selectedPeriod, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.date_from, filters.date_to]);

  const loadTransactions = async () => {
    showLoader();
    try {
      const data = await fetchTransactions(filters);
      //  Process the transactions
      const response = data;
      const processedTransactions = response.data.map((transaction) => {
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
    } catch {
      console.error("Failed to fetch transactions:");
    } finally {
      hideLoader();
    }
  };

  // ── Period loaders ───────────────────────────────────────────
  const loadCurrentPeriod = async () => {
    try {
      const res = await fetchCurrentPeriod();
      setCurrentPeriod(res.data || null);
    } catch (err) {
      // No open period yet, or fetch failed silently — banner just won't show
      setCurrentPeriod(null);
    }
  };

  const loadPeriods = async () => {
    showLoader();
    try {
      const res = await fetchPeriods(periodsFilters);
      setPeriods(res);
    } catch (err) {
      addMessage(false, err.message || "Failed to load periods");
    } finally {
      hideLoader();
    }
  };

  // This is the only place a CLOSED period's transactions get rendered —
  // reached by explicitly opening that period from the Periods list.
  // Also used to view the currently OPEN period's transactions, in which
  // case edit/delete are still allowed (unlike closed periods).
  const loadPeriodTransactions = async (period, page = 1) => {
    showLoader();
    try {
      const res = await fetchPeriodTransactions(period.id, {
        page,
        limit: filters.limit,
        category: filters.category,
        date_from: filters.date_from,
        date_to: filters.date_to,
      });
      const processedTransactions = res.data.map((transaction) => {
        const isCreator =
          Number(transaction.created_by) === Number(profile?.id);
        return { ...transaction, is_active: !!(isAdmin || isCreator) };
      });
      setTransactions({ ...res, data: processedTransactions });
      setSelectedPeriod(period);
    } catch (err) {
      addMessage(false, err.message || "Failed to load period transactions");
    } finally {
      hideLoader();
    }
  };

  // CHANGED: takes the closing note collected by CreateModal, then asks
  // for final confirmation (same openModal pattern used everywhere else
  // in this page) before actually closing the books.
  const handleClosePeriod = async ({ closing_note }) => {
    showLoader();
    try {
      const res = await closePeriod({ closing_note });
      addMessage(
        true,
        `Period closed. "${res.data?.newPeriod?.title}" is now open.`,
      );
      setShowCloseModal(false);
      loadCurrentPeriod();
      loadPeriods();
    } catch (err) {
      addMessage(false, err.message || "Failed to close period");
    } finally {
      hideLoader();
    }
  };

  const handleGeneratePeriodReport = async () => {
    if (!selectedPeriod) return;
    showLoader();
    try {
      const total = transactions.meta?.total || 1000;
      const res = await fetchPeriodTransactions(selectedPeriod.id, {
        page: 1,
        limit: total > 0 ? total : 1000,
      });
      generatePeriodReport({
        period: selectedPeriod,
        transactions: res.data || [],
      });
    } catch (err) {
      addMessage(false, err.message || "Failed to generate report");
    } finally {
      hideLoader();
    }
  };

  // Loads the full (unpaginated) transaction set for the selected period —
  // same fetch pattern as handleGeneratePeriodReport — then hands it to the
  // TransactionDetail summary view instead of printing it directly.
  const handleViewSummary = async () => {
    if (!selectedPeriod) return;
    showLoader();
    try {
      const total = transactions.meta?.total || 1000;
      const res = await fetchPeriodTransactions(selectedPeriod.id, {
        page: 1,
        limit: total > 0 ? total : 1000,
      });
      setSummaryData({ period: selectedPeriod, transactions: res.data || [] });
      setView("summary");
    } catch (err) {
      addMessage(false, err.message || "Failed to load period summary");
    } finally {
      hideLoader();
    }
  };
  // NEW: deleting a period also deletes all of its transactions — the
  // confirmation copy makes that explicit before anything happens.
  const handleDeletePeriod = (period) => {
    openModal(
      async () => {
        showLoader();
        try {
          await deletePeriod(period.id);
          addMessage(true, `${period.title} and its transactions were deleted`);
          loadPeriods();
        } catch (err) {
          addMessage(false, err.message || "Failed to delete period");
        } finally {
          hideLoader();
        }
      },
      {
        title: `Delete ${period.title}? This permanently removes the period AND every transaction recorded in it. This cannot be undone.`,
        confirmText: "Delete Period",
      },
    );
  };

  const handleDelete = (id) => {
    openModal(
      async () => {
        showLoader();
        try {
          await deleteTransaction(id);
          addMessage(true, "Transaction deleted successfully");
          if (selectedPeriod) {
            loadPeriodTransactions(selectedPeriod, filters.page);
          } else {
            loadTransactions();
          }
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
    if (selectedPeriod) {
      loadPeriodTransactions(selectedPeriod, newPage);
      setFilters((prev) => ({ ...prev, page: newPage }));
    } else {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
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
          const cameFromWorker = !!location.state?.userId;
          setEditingTransaction(null);
          // Clear location state so refresh doesn't trigger create mode again
          window.history.replaceState({}, document.title);
          if (cameFromWorker) {
            // Transaction was for a specific worker — go back to their listing
            navigate(-1);
            return;
          }
          if (selectedPeriod) {
            // Editing a transaction from inside a period view (the open
            // period) — go back into that same period instead of the
            // main list, and refresh its transactions.
            loadPeriodTransactions(selectedPeriod, filters.page);
            setView("periods");
            return;
          }
          setView("list");
        }}
        onCancel={() => setView(selectedPeriod ? "periods" : "list")}
      />
    );
  }

  if (view === "detail") {
    return (
      <TransactionDetail
        transactionId={selectedTransactionId}
        onBack={() => setView(selectedPeriod ? "periods" : "list")}
      />
    );
  }

  if (view === "summary") {
    // Same page shell/flow as viewing a single transaction's receipt —
    // just fed period-summary data instead of a transaction id.
    return (
      <TransactionDetail
        mode="summary"
        summaryPeriod={summaryData?.period}
        summaryTransactions={summaryData?.transactions}
        onBack={() => setView("periods")}
      />
    );
  }

  if (view === "report") {
    // Legacy summary route — no longer linked from the UI (the period
    // Summary button now uses view === "summary" / TransactionDetail
    // instead). Left in place in case it's wired up again elsewhere.
    const reportFilters = selectedPeriod
      ? {
          ...filters,
          startDate: selectedPeriod.started_at,
          endDate: selectedPeriod.closed_at || new Date().toISOString(),
        }
      : {
          ...filters,
          startDate: filters.date_from, // Map date_from to startDate
          endDate: filters.date_to, // Map date_to to endDate
        };
    return (
      <FinanceReportSummary
        filters={reportFilters}
        onBack={() => setView(selectedPeriod ? "periods" : "list")}
      />
    );
  }

  // ── Periods view — list periods, open one to see its transactions.
  // Closed periods are ONLY ever rendered here, after navigating in. ──
  if (view === "periods") {
    // The currently open period already has its own hero card above the
    // table (see below), so we exclude it from the periods table itself
    // to avoid showing it twice, and adjust the pagination total to match.
    const openPeriodPresent = periods.data?.some(
      (p) => p.id === currentPeriod?.id,
    );
    const periodsListData = (periods.data || []).filter(
      (p) => p.id !== currentPeriod?.id,
    );
    const periodsAdjustedTotal =
      (periods.meta?.total || 0) - (openPeriodPresent ? 1 : 0);

    if (selectedPeriod) {
      const isClosed = selectedPeriod.status === "closed";
      // The currently active/open period's transactions can still be
      // edited or deleted (same as the main list) — only closed periods
      // are locked to view-only, since they represent frozen books.
      const isCurrentOpenPeriod = !isClosed;

      return (
        <div className="dashboard-wraper">
          {/* Page header action — Back only. Generate Report now lives in
              the hero card below, alongside the period title/duration. */}
          <div className="mb-3">
            <BackButton
              onClick={() => {
                setSelectedPeriod(null);
                setFilters((prev) => ({ ...prev, page: 1 }));
              }}
            />
          </div>
          {/* Period header — same hero-gradient card style as the transaction receipt */}
          <div
            className="card border-0 rounded-4 shadow-sm mb-4 overflow-hidden"
            style={{
              background: isClosed
                ? "linear-gradient(135deg, #fdeeee 0%, #ffffff 60%)"
                : "linear-gradient(135deg, #e9fbf0 0%, #ffffff 60%)",
            }}
          >
            <div className="card-body p-4 p-md-5">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div>
                  <div className="d-flex gap-2 mb-3">
                    <Badge
                      content={
                        isClosed
                          ? selectedPeriod.status?.toUpperCase()
                          : "Currently Active Period"
                      }
                      color={isClosed ? "red" : "green"}
                    />
                  </div>
                  <h2 className="fw-bold text-dark mb-1">
                    {selectedPeriod.title}
                  </h2>
                  {selectedPeriod.description && (
                    <p className="text-muted mb-0">
                      {selectedPeriod.description}
                    </p>
                  )}
                </div>

                <div className="text-md-end">
                  {/* Summary + Generate Report — shown only here, in the
                      period transactions header, alongside the title/duration. */}
                  <div className="d-flex gap-2 justify-content-md-end mb-2 flex-wrap">
                    <button
                      className="btn btn-outline-primary btn-sm px-4 rounded-3 fw-semibold"
                      onClick={handleViewSummary}
                      title="View a summary of this period's transactions"
                    >
                      <i className="bi bi-bar-chart-line me-2"></i>
                      Summary
                    </button>
                    <button
                      className="btn btn-main btn-sm px-4 rounded-3 shadow-sm fw-semibold text-white"
                      onClick={handleGeneratePeriodReport}
                      title="Generate the complete financial report for this period"
                    >
                      <i className="bi bi-file-earmark-text me-2"></i>
                      Generate Report
                    </button>
                  </div>
                  {isClosed ? (
                    <>
                      <div className="fw-semibold">
                        {formatDate(selectedPeriod.started_at)} –{" "}
                        {formatDate(selectedPeriod.closed_at)}
                      </div>
                      <div className="text-muted small mt-1">
                        Closed by{" "}
                        <span className="fw-semibold">
                          {selectedPeriod.closed_by_name || "—"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="fw-semibold">
                      Open since {formatDate(selectedPeriod.started_at)}
                    </div>
                  )}
                </div>
              </div>

              {isClosed && selectedPeriod.closing_note && (
                <div className="mt-4 pt-4 border-top">
                  <h6 className="text-uppercase text-muted small fw-bold mb-2">
                    Closing Note
                  </h6>
                  <p className="mb-0">{selectedPeriod.closing_note}</p>
                </div>
              )}
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
                  <Badge
                    content={row.category.toUpperCase()}
                    color={row.category === "income" ? "green" : "red"}
                  />
                ),
              },
              { header: "Amount", accessor: "amount" },
            ]}
            actions={[
              {
                type: "view",
                onClick: (row) => {
                  setSelectedTransactionId(row.id);
                  setView("detail");
                },
              },
              // Edit/Delete only apply to the currently open period's
              // transactions — closed periods stay frozen/read-only.
              ...(isCurrentOpenPeriod
                ? [
                    {
                      type: "edit",
                      onClick: (row) => {
                        setEditingTransaction(row);
                        setView("edit");
                      },
                      showOn: (row) => row.is_active,
                    },
                    {
                      type: "delete",
                      onClick: (row) => handleDelete(row.id),
                      showOn: (row) => row.is_active,
                    },
                  ]
                : []),
            ]}
            pagination={{
              page: filters.page,
              limit: filters.limit,
              total: transactions.meta?.total || 0,
              onPageChange: handlePageChange,
            }}
            emptyState={{
              title: "No transactions in this period",
              subtitle: "Nothing was recorded during this time interval.",
            }}
            onPageChange={handlePageChange}
          />
        </div>
      );
    }

    return (
      <div className="dashboard-wraper">
        <div className="d-flex justify-content-end mb-3">
          <BackButton onClick={() => setView("list")} />
        </div>

        <div className="mb-4">
          <h2 className="fw-bold text-dark mb-2">Financial Periods</h2>
          <p className="text-muted mb-0">
            Each period is a closed time interval of the books, numbered in
            order. Close the current period after an audit to freeze its totals
            and start fresh — nothing is deleted unless you remove a period
            explicitly.
          </p>
        </div>

        {currentPeriod && (
          <div
            className="card border-0 rounded-4 shadow-sm mb-4 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #e9fbf0 0%, #ffffff 60%)",
            }}
          >
            <div className="card-body p-4 p-md-5">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div>
                  <div className="d-flex gap-2 mb-3">
                    <Badge content="Currently Active Period" color="green" />
                  </div>
                  <h2 className="fw-bold text-dark mb-1">
                    {currentPeriod.title}
                  </h2>
                  <p className="text-muted mb-0">
                    Open since {formatDate(currentPeriod.started_at)}
                  </p>
                </div>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-primary btn-sm px-4"
                    onClick={() => loadPeriodTransactions(currentPeriod, 1)}
                  >
                    View Transactions
                  </button>
                  {isAdmin && (
                    <button
                      className="btn btn-main btn-sm px-4"
                      onClick={() => setShowCloseModal(true)}
                    >
                      Close Current Period
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <ClosePeriodModal
          show={showCloseModal}
          onClose={() => setShowCloseModal(false)}
          onConfirm={handleClosePeriod}
          periodTitle={currentPeriod?.title}
        />

        <ListingComponent
          data={periodsListData}
          columns={[
            {
              header: "Period",
              render: (row) => <div className="fw-semibold">{row.title}</div>,
            },
            {
              header: "Status",
              render: (row) => (
                <Badge
                  content={row.status.toUpperCase()}
                  color={row.status === "open" ? "green" : "red"}
                />
              ),
            },
            {
              header: "Started",
              render: (row) => formatDate(row.started_at),
            },
            {
              header: "Closed",
              render: (row) => formatDate(row.closed_at),
            },
            {
              header: "Closed By",
              render: (row) => row.closed_by_name || "—",
            },
            {
              header: "Closing Note",
              render: (row) =>
                row.closing_note ? (
                  <span
                    className="d-inline-block text-truncate"
                    style={{ maxWidth: 220 }}
                    title={row.closing_note}
                  >
                    {row.closing_note}
                  </span>
                ) : (
                  "—"
                ),
            },
            {
              header: "Net Profit",
              render: (row) =>
                row.net_profit !== null && row.net_profit !== undefined
                  ? row.net_profit
                  : "—",
            },
            {
              header: "Transactions",
              render: (row) => row.transaction_count ?? "—",
            },
          ]}
          actions={[
            {
              type: "view",
              onClick: (row) => loadPeriodTransactions(row, 1),
            },
            ...(isAdmin
              ? [
                  {
                    type: "delete",
                    onClick: (row) => handleDeletePeriod(row),
                    showOn: (row) => row.status === "closed",
                  },
                ]
              : []),
          ]}
          pagination={{
            page: periodsFilters.page,
            limit: periodsFilters.limit,
            total: periodsAdjustedTotal,
            onPageChange: (p) =>
              setPeriodsFilters((prev) => ({ ...prev, page: p })),
          }}
          emptyState={{
            title: "No closed periods yet",
            subtitle:
              "Closed periods will appear here once you close the books.",
          }}
        />
      </div>
    );
  }

  return (
    <div className="dashboard-wraper">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-2">Finance Management</h2>
          <p className="text-muted mb-0">
            Track agency revenue, expenses, and VAT records.{" "}
            <span className="text-muted mb-0">
              <Badge content=" Currently Active Period" color="green" />
            </span>
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
            className="btn btn-outline-secondary px-4 py-2 rounded-3 mt-2 mt-sm-0"
            onClick={() => setView("periods")}
          >
            Periods
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
