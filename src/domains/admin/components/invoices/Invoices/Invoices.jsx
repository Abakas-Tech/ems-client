import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import InvoiceFilters from "../InvoiceFilters/InvoiceFilters";
import InvoiceForm from "../InvoiceForm/InvoiceForm";
import InvoiceDetail from "../InvoiceDetail/InvoiceDetail";
import {
  fetchInvoices,
  deleteInvoice,
  issueInvoice,
  cancelInvoice,
} from "../../../api/invoice.api";

import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete.jsx";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import Badge from "../../../../../shared/components/Badge/Badge.jsx";

const formatAmount = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const STATUS_COLORS = {
  draft: "grey",
  issued: "blue",
  partially_paid: "orange",
  paid: "green",
  cancelled: "red",
};

const Invoices = () => {
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();
  const location = useLocation();

  const [view, setView] = useState("list");
  const [invoices, setInvoices] = useState({ data: [], pagination: {} });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "",
    payment_status: "",
    search: "",
    date_from: "",
    date_to: "",
  });

  const [editingInvoice, setEditingInvoice] = useState(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  // Worker ids handed off from Active Employees' bulk "Create Invoice" action
  const [prefillWorkerIds, setPrefillWorkerIds] = useState(null);

  useEffect(() => {
    if (view === "list") loadInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, view]);

  // Arriving here from Active Employees' bulk selection -> straight into
  // Create Invoice, same pattern Finance.jsx uses for "record transaction
  // for this worker". Arriving from a Finance transaction linked to an
  // invoice (invoice_id) -> straight into that invoice's detail view.
  useEffect(() => {
    if (location.state?.invoiceId) {
      setSelectedInvoiceId(location.state.invoiceId);
      setView("detail");
      return;
    }
    if (location.state?.workerIds?.length) {
      setPrefillWorkerIds(location.state.workerIds);
      setView("create");
    }
  }, [location.state]);

  const loadInvoices = async () => {
    showLoader();
    try {
      const res = await fetchInvoices(filters);
      setInvoices(res);
    } catch (err) {
      addMessage(false, err.message || "Failed to load invoices");
    } finally {
      hideLoader();
    }
  };

  const handleDelete = (row) => {
    openModal(
      async () => {
        showLoader();
        try {
          await deleteInvoice(row.id);
          addMessage(true, "Invoice deleted successfully");
          loadInvoices();
        } catch (err) {
          addMessage(false, err.message || "Failed to delete invoice");
        } finally {
          hideLoader();
        }
      },
      { title: "Delete this draft invoice?", confirmText: "Delete" },
    );
  };

  const handleIssue = (row) => {
    openModal(
      async () => {
        showLoader();
        try {
          await issueInvoice(row.id);
          addMessage(true, "Invoice issued");
          loadInvoices();
        } catch (err) {
          addMessage(false, err.message || "Failed to issue invoice");
        } finally {
          hideLoader();
        }
      },
      {
        title: "Issue this invoice? Financial values are locked after issuing.",
        confirmText: "Issue",
      },
    );
  };

  const handleCancel = (row) => {
    openModal(
      async () => {
        showLoader();
        try {
          await cancelInvoice(row.id);
          addMessage(true, "Invoice cancelled");
          loadInvoices();
        } catch (err) {
          addMessage(false, err.message || "Failed to cancel invoice");
        } finally {
          hideLoader();
        }
      },
      {
        title: "Cancel this invoice? This cannot be undone.",
        confirmText: "Cancel Invoice",
      },
    );
  };

  if (view === "create" || view === "edit") {
    return (
      <InvoiceForm
        isEditMode={view === "edit"}
        initialData={view === "edit" ? editingInvoice : null}
        workerIds={view === "create" ? prefillWorkerIds : null}
        onSuccess={(savedInvoice) => {
          setEditingInvoice(null);
          setPrefillWorkerIds(null);
          // Clear location state so a refresh doesn't re-trigger create mode
          window.history.replaceState({}, document.title);
          if (savedInvoice?.id) {
            setSelectedInvoiceId(savedInvoice.id);
            setView("detail");
            return;
          }
          setView("list");
        }}
        onCancel={() => {
          setPrefillWorkerIds(null);
          window.history.replaceState({}, document.title);
          setView("list");
        }}
      />
    );
  }

  if (view === "detail") {
    return (
      <InvoiceDetail
        invoiceId={selectedInvoiceId}
        onBack={() => setView("list")}
        onEdit={(invoice) => {
          setEditingInvoice(invoice);
          setView("edit");
        }}
      />
    );
  }

  return (
    <div className="dashboard-wraper">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-2">Invoice Management</h2>
          <p className="text-muted mb-0">
            Select employees from Active Employees to start a new invoice, then
            track payments here.
          </p>
        </div>
      </div>

      <ListingComponent
        filtersComponent={
          <InvoiceFilters
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
                status: "",
                payment_status: "",
                search: "",
                date_from: "",
                date_to: "",
              })
            }
          />
        }
        data={invoices.data}
        columns={[
          { header: "Invoice #", accessor: "invoice_number" },
          {
            header: "Customer",
            render: (row) => row.customer_full_name || "—",
          },
          {
            header: "Workers / Items",
            render: (row) =>
              `${row.worker_count ?? 0} / ${row.item_count ?? 0}`,
          },
          {
            header: "Date",
            render: (row) => new Date(row.invoice_date).toLocaleDateString(),
          },
          {
            header: "Due",
            render: (row) =>
              row.due_date ? new Date(row.due_date).toLocaleDateString() : "—",
          },
          { header: "Total", render: (row) => formatAmount(row.total_amount) },
          { header: "Paid", render: (row) => formatAmount(row.paid_amount) },
          {
            header: "Balance",
            render: (row) => formatAmount(row.balance_amount),
          },
          {
            header: "Status",
            render: (row) => (
              <Badge
                content={row.status.replace("_", " ").toUpperCase()}
                color={STATUS_COLORS[row.status]}
              />
            ),
          },
          {
            header: "Payment Status",
            render: (row) => (
              <Badge
                content={row.status === "paid" ? "PAID" : "NOT PAID"}
                color={row.status === "paid" ? "green" : "red"}
              />
            ),
          },
        ]}
        actions={[
          {
            type: "view",
            onClick: (row) => {
              setSelectedInvoiceId(row.id);
              setView("detail");
            },
          },
          {
            type: "edit",
            onClick: (row) => {
              setEditingInvoice(row);
              setView("edit");
            },
            showOn: (row) => row.status === "draft",
          },
          {
            type: "delete",
            onClick: (row) => handleDelete(row),
            showOn: (row) => row.status === "draft",
          },
          {
            type: "issue",
            onClick: (row) => handleIssue(row),
            showOn: (row) => row.status === "draft",
          },
          {
            type: "cancel",
            onClick: (row) => handleCancel(row),
            showOn: (row) => ["issued", "partially_paid"].includes(row.status),
          },
        ]}
        pagination={{
          page: filters.page,
          limit: filters.limit,
          total: invoices.pagination?.total || 0,
          onPageChange: (p) => setFilters({ ...filters, page: p }),
        }}
        emptyState={{
          title: "No invoices found",
          subtitle:
            "Select employees in Active Employees, then choose Create Invoice.",
        }}
        onPageChange={(p) => setFilters({ ...filters, page: p })}
      />
    </div>
  );
};

export default Invoices;
