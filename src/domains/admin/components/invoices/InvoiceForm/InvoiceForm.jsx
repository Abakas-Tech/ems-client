import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  createInvoice,
  updateInvoice,
  massApplyInvoiceItems,
  deleteInvoiceItem,
  fetchCustomerOptions,
} from "../../../api/invoice.api";
import { listWorkers } from "../../../api/worker.api";
import {
  createWorkerAgent,
  updateWorkerAgent,
  deleteWorkerAgent,
  getAgents,
} from "../../../api/workerAgent.api.js";

import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";

import BackButton from "../../../../../shared/components/BackButton/BackButton";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import ActionButtons from "../../../../../shared/components/ActionButtons/ActionButtons";

const todayIso = () => new Date().toISOString().split("T")[0];

const formatAmount = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Each employee on an invoice can have a different amount — experience
// and deployed country are the kind of thing that changes what a given
// worker should be billed at, so pricing is entered per worker instead
// of once for the whole invoice. Customer, Invoice Date, and Notes are
// still invoice-level fields. No description, no due date, no
// discount/VAT — those columns still exist on the backend (always
// 0/empty from here on) but this page never touches them.
//
// `workerIds`, when provided, always wins for resolving who's on the
// invoice — this is what lets a round trip through Active Employees
// (add/remove there, then come back) update an invoice already being
// edited, instead of only being usable for a brand new one.
const InvoiceForm = ({
  isEditMode = false,
  initialData = null,
  workerIds = null,
  onSuccess,
  onCancel,
}) => {
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();
  const navigate = useNavigate();

  const invoiceId = isEditMode ? initialData?.id : null;

  const [customerUserId, setCustomerUserId] = useState(
    initialData?.customer_user_id || "",
  );
  const [invoiceDate, setInvoiceDate] = useState(
    initialData?.invoice_date?.split("T")[0] || todayIso(),
  );
  const [notes, setNotes] = useState(initialData?.notes || "");

  const [customers, setCustomers] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);

  // Per-worker amount entry: { [workerId]: "12.50" }. Never shared
  // across workers — each one is typed in individually via its own
  // Amount column input in the ListingComponent below. Amounts can be
  // positive, negative, or zero — e.g. a negative amount for a
  // deduction/credit against a worker — so this is never clamped to
  // >= 0 anywhere (input, validation, or the total below).
  const [workerAmounts, setWorkerAmounts] = useState({});

  // ---- Agent Information (per selected worker) ----------------------
  // Mirrors Worker Form's Agent Information module (see WorkerForm.jsx):
  // agent selection is a dropdown of every agent already on file — no
  // free-text name/phone entry, no creating a new agent from here.
  // Assigning/removing the assignment itself is handled from this row's
  // Action buttons rather than an inline "save" control, since the
  // dropdown here only stages *which* agent is picked; the actual
  // create/update/remove happens when the corresponding action is
  // clicked.
  //
  // { [workerId]: agentId|"" } — the agent currently selected in that
  // row's dropdown. Not yet persisted until the Assign action is clicked.
  const [selectedAgentId, setSelectedAgentId] = useState({});
  // { [workerId]: boolean } — whether a workers_agent_information record
  // already exists for that worker (from listWorkers' agent_id), which
  // decides createWorkerAgent vs updateWorkerAgent when Assign is
  // clicked, exactly like WorkerForm's `agentExists` decides POST vs PUT.
  const [workerAgentExists, setWorkerAgentExists] = useState({});
  // { [workerId]: agentId|null } — the agent actually persisted for that
  // worker right now (what's really assigned, as opposed to whatever the
  // dropdown is currently showing) — this is what the Assign/Remove
  // buttons compare the dropdown's selection against.
  const [workerCurrentAgentId, setWorkerCurrentAgentId] = useState({});
  // All agents on file, fetched once — sourced directly from the shared
  // agents table (not derived from worker assignments), so an agent with
  // no workers assigned yet still shows up here.
  const [allAgents, setAllAgents] = useState([]);
  // workerId currently mid Assign/Remove action, so that one row's
  // buttons can show a spinner and be disabled without affecting any
  // other row or the invoice submit button.
  const [savingAgentWorkerId, setSavingAgentWorkerId] = useState(null);

  // Which selected-worker row is currently hovered, so the Employee
  // column can reveal that worker's experience/deployed country. The
  // popover itself is rendered through a portal straight to
  // document.body (see below) so the table's own overflow/stacking
  // context — the scroll wrapper, the card, table cell stacking, etc. —
  // can never clip it or bury it underneath other content. `hoverPos`
  // is the hovered cell's on-screen position, captured on mouse-enter,
  // used to place the portaled popover directly under that cell.
  const [hoveredWorker, setHoveredWorker] = useState(null);
  const [hoverPos, setHoverPos] = useState({ top: 0, left: 0 });

  const handleWorkerHoverEnter = (worker, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPos({ top: rect.bottom + 8, left: rect.left });
    setHoveredWorker(worker);
  };

  const handleWorkerHoverLeave = () => {
    setHoveredWorker(null);
  };

  useEffect(() => {
    fetchCustomerOptions()
      .then((res) => setCustomers(res.data || []))
      .catch(() => setCustomers([]));
  }, []);

  // Load every agent on file (from the shared agents master table) to
  // power every worker's Agent dropdown — independent of edit/create
  // mode, fetched once. limit is set high since this powers a dropdown
  // that should show the full list, not one page of it.
  useEffect(() => {
    getAgents({ page: 1, limit: 1000 })
      .then((res) => setAllAgents(res?.data || []))
      .catch((err) => {
        console.error("Failed to load agent list:", err);
        setAllAgents([]);
      });
  }, []);

  // Resolve the worker set: an explicit `workerIds` prop always wins
  // (covers create mode, and edit mode returning from Active Employees
  // with an updated selection); otherwise, in edit mode, derive the set
  // from the invoice's existing items. This uses the exact same
  // listWorkers() call ActiveWorkers.jsx uses for its own list, so each
  // resolved worker carries the same real `status` field ActiveWorkers
  // reads for its "Current Status" column — nothing invoice-specific is
  // computed for it, and a status change picked up by ActiveWorkers is
  // picked up here the same way, the next time this resolves.
  useEffect(() => {
    const resolveWorkers = async () => {
      setLoadingWorkers(true);
      try {
        let idsToResolve = workerIds && workerIds.length ? workerIds : null;

        if (!idsToResolve && isEditMode) {
          idsToResolve = Array.from(
            new Set(
              (initialData?.items || [])
                .map((item) => item.user_id)
                .filter(Boolean),
            ),
          );
        }

        if (!idsToResolve || idsToResolve.length === 0) {
          setSelectedWorkers([]);
          setWorkerAmounts({});
          setSelectedAgentId({});
          setWorkerAgentExists({});
          setWorkerCurrentAgentId({});
          return;
        }

        const res = await listWorkers({
          assignedWorkerIds: idsToResolve,
          page: 1,
          limit: idsToResolve.length,
        });
        const workers = res?.data?.items || [];
        setSelectedWorkers(workers);

        // Existing invoice items carry each worker's previously saved
        // unit_price — use that as the starting amount when editing.
        // unit_price can be negative (e.g. a saved deduction), so this
        // is carried through as-is.
        const itemsByUserId = (initialData?.items || []).reduce((acc, item) => {
          if (item.user_id) acc[item.user_id] = item.unit_price;
          return acc;
        }, {});

        setWorkerAmounts((prev) => {
          const next = {};
          workers.forEach((w) => {
            if (prev[w.id] !== undefined) {
              // Preserve anything already typed in (e.g. round trip
              // through Active Employees shouldn't wipe entered values).
              next[w.id] = prev[w.id];
            } else if (itemsByUserId[w.id] !== undefined) {
              next[w.id] = String(itemsByUserId[w.id]);
            } else {
              next[w.id] = "";
            }
          });
          return next;
        });

        // Agent existence and current-agent id seed from listWorkers'
        // agent_id — same starting values WorkerForm would get from
        // getWorkerAgent(id), just already included on the worker record
        // here. The dropdown's selection defaults to whatever is
        // currently assigned; anything already selected (prev state) is
        // preserved, same as workerAmounts above.
        setWorkerAgentExists((prev) => {
          const next = {};
          workers.forEach((w) => {
            next[w.id] =
              prev[w.id] !== undefined ? prev[w.id] : Boolean(w.agent_id);
          });
          return next;
        });

        setWorkerCurrentAgentId((prev) => {
          const next = {};
          workers.forEach((w) => {
            next[w.id] =
              prev[w.id] !== undefined ? prev[w.id] : (w.agent_id ?? null);
          });
          return next;
        });

        setSelectedAgentId((prev) => {
          const next = {};
          workers.forEach((w) => {
            next[w.id] =
              prev[w.id] !== undefined
                ? prev[w.id]
                : w.agent_id != null
                  ? String(w.agent_id)
                  : "";
          });
          return next;
        });
      } catch (err) {
        addMessage(false, err.message || "Failed to load selected employees");
      } finally {
        setLoadingWorkers(false);
      }
    };

    resolveWorkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerIds]);

  const handleAmountChange = (workerId, value) => {
    setWorkerAmounts((prev) => ({ ...prev, [workerId]: value }));
  };

  // ---- Agent handlers --------------------------------------------------

  // Dropdown selection — just stages which agent this row should be
  // assigned to. Doesn't persist anything by itself; Assign/Remove in
  // the Actions column do the actual save.
  const handleAgentSelect = (workerId, agentId) => {
    setSelectedAgentId((prev) => ({ ...prev, [workerId]: agentId }));
  };

  // Whether the dropdown's current selection for this worker already
  // matches what's actually assigned — if so, there's nothing to Assign.
  const isSelectionAlreadyAssigned = (workerId) => {
    const selected = selectedAgentId[workerId];
    const current = workerCurrentAgentId[workerId];
    if (!selected) return false;
    return String(selected) === String(current ?? "");
  };

  // Assign action shows whenever a real selection is made that differs
  // from what's currently assigned — covers both "assign for the first
  // time" and "reassign to a different agent".
  const canAssignAgent = (workerId) =>
    Boolean(selectedAgentId[workerId]) && !isSelectionAlreadyAssigned(workerId);

  // Remove action shows whenever this worker currently has an assignment
  // at all, regardless of what the dropdown is showing.
  const canRemoveAgent = (workerId) => Boolean(workerAgentExists[workerId]);

  // Assign (or reassign) the selected agent to this worker. This never
  // creates a new agent — the payload is built from an agent already in
  // `allAgents`, so the backend's phone-based lookup always reuses that
  // existing agent rather than creating a duplicate.
  const handleAssignAgent = async (worker) => {
    const agentId = selectedAgentId[worker.id];
    if (!agentId || savingAgentWorkerId) return;

    const agent = allAgents.find((a) => String(a.id) === String(agentId));
    if (!agent) return;

    const agentPayload = {
      agent_name: agent.agent_name,
      agent_phone: agent.agent_phone,
    };

    setSavingAgentWorkerId(worker.id);
    try {
      const response = workerAgentExists[worker.id]
        ? await updateWorkerAgent(worker.id, agentPayload)
        : await createWorkerAgent(worker.id, agentPayload);

      setWorkerAgentExists((prev) => ({ ...prev, [worker.id]: true }));
      setWorkerCurrentAgentId((prev) => ({ ...prev, [worker.id]: agent.id }));

      addMessage(
        response?.success !== false,
        response?.message || `Agent assigned for ${worker.full_name}`,
      );
    } catch (err) {
      const statusCode = err?.response?.status || err?.status;
      if (statusCode === 409) {
        addMessage(
          false,
          `Agent information already exists for ${worker.full_name}.`,
        );
      } else if (statusCode === 404) {
        addMessage(
          false,
          `Worker not found while assigning agent for ${worker.full_name}.`,
        );
      } else {
        addMessage(
          false,
          err.message || `Failed to assign agent for ${worker.full_name}`,
        );
      }
    } finally {
      setSavingAgentWorkerId(null);
    }
  };

  // Remove this worker's current agent assignment. Only the assignment
  // is removed — the agent record itself is untouched, since the same
  // agent may still be assigned to other workers.
  const handleRemoveAgent = async (worker) => {
    if (savingAgentWorkerId) return;

    setSavingAgentWorkerId(worker.id);
    try {
      const response = await deleteWorkerAgent(worker.id);

      setWorkerAgentExists((prev) => ({ ...prev, [worker.id]: false }));
      setWorkerCurrentAgentId((prev) => ({ ...prev, [worker.id]: null }));
      setSelectedAgentId((prev) => ({ ...prev, [worker.id]: "" }));

      addMessage(
        response?.success !== false,
        response?.message || `Agent assignment removed for ${worker.full_name}`,
      );
    } catch (err) {
      addMessage(
        false,
        err.message ||
          `Failed to remove agent assignment for ${worker.full_name}`,
      );
    } finally {
      setSavingAgentWorkerId(null);
    }
  };

  const handleRemoveWorker = (worker) => {
    setSelectedWorkers((prev) => prev.filter((w) => w.id !== worker.id));
    setWorkerAmounts((prev) => {
      const next = { ...prev };
      delete next[worker.id];
      return next;
    });
    setSelectedAgentId((prev) => {
      const next = { ...prev };
      delete next[worker.id];
      return next;
    });
    setWorkerAgentExists((prev) => {
      const next = { ...prev };
      delete next[worker.id];
      return next;
    });
    setWorkerCurrentAgentId((prev) => {
      const next = { ...prev };
      delete next[worker.id];
      return next;
    });
  };

  // Jump to Active Employees with the current selection pre-checked so
  // more can be added (or some deselected) there, then routed straight
  // back here. Create mode has nothing to "return" to yet, so it silently
  // saves a draft first — nothing is lost, and it becomes an edit from
  // that point on.
  const handleAddEmployee = async () => {
    let targetInvoiceId = invoiceId;

    if (!isEditMode) {
      if (!invoiceDate) {
        return addMessage(
          false,
          "Invoice date is required before adding employees",
        );
      }

      showLoader();
      try {
        const response = await createInvoice({
          customer_user_id: customerUserId || null,
          invoice_date: invoiceDate,
          notes: notes || null,
          items: selectedWorkers.map((w) => ({
            user_id: w.id,
            description: "",
            quantity: 1,
            unit_price: Number(workerAmounts[w.id]) || 0,
          })),
        });
        targetInvoiceId = response?.data?.id;
        addMessage(true, "Draft saved — continue adding employees");
      } catch (err) {
        addMessage(false, err.message || "Failed to save draft");
        return;
      } finally {
        hideLoader();
      }
    }

    navigate("/admin/employees", {
      state: {
        preSelectedWorkerIds: selectedWorkers.map((w) => w.id),
        returnInvoiceId: targetInvoiceId,
      },
    });
  };

  // Sum stays plain addition — already correct for a mix of positive and
  // negative worker amounts, so nothing here changes to support negatives.
  const total = selectedWorkers.reduce(
    (sum, w) => sum + (Number(workerAmounts[w.id]) || 0),
    0,
  );

  // Agent assigning/removing is handled entirely by handleAssignAgent /
  // handleRemoveAgent, fired independently from each row's Action
  // buttons — invoice submit never creates, updates, or otherwise
  // touches agent assignments.
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedWorkers.length === 0) {
      return addMessage(false, "No employees selected");
    }
    if (!invoiceDate) {
      return addMessage(false, "Invoice date is required");
    }

    // Amount just needs to be a real number — positive, negative, or
    // zero are all valid (e.g. a negative amount for a deduction/credit
    // against a worker), so there's no >= 0 floor here.
    const invalidWorker = selectedWorkers.find((w) => {
      const val = workerAmounts[w.id];
      return val === "" || val === undefined || isNaN(Number(val));
    });
    if (invalidWorker) {
      return addMessage(
        false,
        `Enter a valid amount for ${invalidWorker.full_name}`,
      );
    }

    setSubmitLoading(true);
    showLoader();
    try {
      const payload = {
        customer_user_id: customerUserId || null,
        invoice_date: invoiceDate,
        notes: notes || null,
      };

      let response;
      if (isEditMode) {
        response = await updateInvoice(invoiceId, payload);

        // Reconcile items against the invoice's original set: delete
        // items for anyone no longer selected, then create/update the
        // rest. massApplyInvoiceItems applies one unit_price to a batch
        // of user_ids at a time, so — since each worker can now have a
        // different amount — selected workers are grouped by their
        // entered amount and applied group by group, rather than in one
        // call for everyone.
        const currentIds = new Set(selectedWorkers.map((w) => w.id));
        const removedItems = (initialData?.items || []).filter(
          (item) => item.user_id && !currentIds.has(item.user_id),
        );

        for (const item of removedItems) {
          await deleteInvoiceItem(invoiceId, item.id);
        }

        if (selectedWorkers.length > 0) {
          const groupsByAmount = new Map();
          selectedWorkers.forEach((w) => {
            const amt = Number(workerAmounts[w.id]) || 0;
            if (!groupsByAmount.has(amt)) groupsByAmount.set(amt, []);
            groupsByAmount.get(amt).push(w.id);
          });

          for (const [amt, userIds] of groupsByAmount.entries()) {
            await massApplyInvoiceItems(invoiceId, {
              user_ids: userIds,
              description: "",
              unit_price: amt,
              quantity: 1,
              duplicate_action: "update",
            });
          }
        }
      } else {
        response = await createInvoice({
          ...payload,
          items: selectedWorkers.map((w) => ({
            user_id: w.id,
            description: "",
            quantity: 1,
            unit_price: Number(workerAmounts[w.id]) || 0,
          })),
        });
      }

      addMessage(
        response?.success,
        response?.message || "Invoice saved successfully",
      );
      onSuccess(response?.data);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      setSubmitLoading(false);
      hideLoader();
    }
  };

  if (!isEditMode && !loadingWorkers && selectedWorkers.length === 0) {
    return (
      <section className="dashboard-wraper">
        <div className="d-flex align-items-center mb-3">
          <h2 className="text-dark fw-bold mb-2">New Invoice</h2>
          <BackButton onClick={onCancel} />
        </div>
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <p className="text-muted mb-3">
            No employees were selected. Start an invoice by selecting employees
            from Active Employees, then choosing <strong>Create Invoice</strong>
            .
          </p>
          <button
            className="btn btn-main px-4 mx-auto"
            style={{ maxWidth: 260 }}
            onClick={() => navigate("/admin/employees")}
          >
            Go to Active Employees
          </button>
        </div>
      </section>
    );
  }

  // Columns for the selected-workers ListingComponent instance. The
  // Employee column only tracks hover (worker + on-screen position) —
  // it never renders the popover itself inline, since anything drawn
  // inside the table can be clipped by the table's own scroll wrapper
  // or buried by cell stacking contexts. The popover is rendered once,
  // through a portal, outside the table. This never reaches into
  // ListingComponent's own markup or state, so ListingComponent's
  // existing behavior (rename-in-place, zebra rows, selection mode,
  // etc.) is untouched.
  const selectedWorkerColumns = [
    {
      header: "Employee",
      accessor: "full_name",
      render: (worker) => (
        <span
          className="worker-hover-target d-inline-block"
          onMouseEnter={(e) => handleWorkerHoverEnter(worker, e)}
          onMouseLeave={handleWorkerHoverLeave}
        >
          <span className="fw-bold">{worker.full_name}</span>
        </span>
      ),
    },
    {
      header: "Phone Number",
      accessor: "phone_number",
    },
    {
      // Amount is entered per worker, the same way ListingComponent
      // already renders inline form inputs (e.g. rename editing) —
      // just via a plain column render instead of the rename flow,
      // since each row needs its own always-visible input rather than
      // a click-to-edit one. No min="0" — a negative amount (e.g. a
      // deduction/credit for that worker) is a valid entry here.
      header: "Amount",
      accessor: "amount",
      render: (worker) => (
        <input
          type="number"
          step="0.01"
          className="form-control form-control-sm"
          style={{ width: 130 }}
          value={workerAmounts[worker.id] ?? ""}
          onChange={(e) => handleAmountChange(worker.id, e.target.value)}
          placeholder="0.00"
          required
        />
      ),
    },
    {
      // Agent — a single dropdown listing every agent on file as
      // "Name — Phone", same pattern as Worker Form's Agent field.
      // Selecting an option only stages the choice; committing it
      // (create/update the assignment) or removing the current one
      // happens via this row's Action buttons below.
      header: "Agent",
      accessor: "agent",
      render: (worker) => (
        <select
          className="form-control form-control-sm"
          style={{ minWidth: 200 }}
          value={selectedAgentId[worker.id] ?? ""}
          onChange={(e) => handleAgentSelect(worker.id, e.target.value)}
        >
          <option value="">Select an agent</option>
          {allAgents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.agent_name} — {a.agent_phone}
            </option>
          ))}
        </select>
      ),
    },
    {
      // Current Status — same column definition ActiveWorkers.jsx uses
      // (header: "Current Status", accessor: "status", no custom
      // render), reading straight off the worker record returned by the
      // same listWorkers() call. This is the worker's real current
      // status, never anything invoice-derived, and it reflects the
      // same value ActiveWorkers shows for that worker.
      header: "Current Status",
      accessor: "status",
    },
  ];

  // Remove reuses ActionButtons' existing "delete" action (trash icon,
  // outline-danger) rather than introducing a new action type — here it
  // means "remove this worker from the invoice", not delete the employee
  // record. bypassRole: true so it always renders here regardless of
  // which role's ACTION_ROLE_CONFIG entry "delete" normally checks.
  //
  // Assign/Remove Agent reuse ActionButtons' existing "custom" render
  // slot (the same extension point ApplicantReportGenerator uses)
  // instead of introducing a parallel agent-management UI. Each renders
  // nothing unless that row is actually in the state the action applies
  // to (a real, unsaved dropdown selection for Assign; an existing
  // assignment for Remove) — so a row can show either, both, or neither
  // depending on what's selected vs. what's actually assigned.
  const selectedWorkerActions = [
    {
      type: "delete",
      bypassRole: true,
      onClick: (worker) => handleRemoveWorker(worker),
    },
    {
      type: "custom",
      render: (worker) => {
        if (!canAssignAgent(worker.id)) return null;
        const isSaving = savingAgentWorkerId === worker.id;
        return (
          <button
            type="button"
            className="btn btn-sm btn-outline-success"
            onClick={() => handleAssignAgent(worker)}
            disabled={isSaving}
            title="Assign Agent"
            aria-label="Assign Agent"
          >
            {isSaving ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            ) : (
              <i className="fa-solid fa-user-check"></i>
            )}
          </button>
        );
      },
    },
    {
      type: "custom",
      render: (worker) => {
        if (!canRemoveAgent(worker.id)) return null;
        const isSaving = savingAgentWorkerId === worker.id;
        return (
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleRemoveAgent(worker)}
            disabled={isSaving}
            title="Remove Agent"
            aria-label="Remove Agent"
          >
            {isSaving ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            ) : (
              <i className="fa-solid fa-user-minus"></i>
            )}
          </button>
        );
      },
    },
  ];

  return (
    <section className="dashboard-wraper">
      <style>{`
        .worker-hover-popover {
          position: fixed;
          z-index: 2000;
          min-width: 220px;
          white-space: normal;
          background: #fff;
          border: 1px solid #e6e6f0;
          border-radius: 8px;
          padding: 10px 12px;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
          pointer-events: none;
        }
      `}</style>

      {/* Rendered via portal straight to document.body: position: fixed
          + a top-level z-index means this always draws above the table,
          its scroll wrapper, and any card around it — nothing in
          ListingComponent's own stacking context can clip or bury it. */}
      {hoveredWorker &&
        createPortal(
          <div
            className="worker-hover-popover"
            style={{ top: hoverPos.top, left: hoverPos.left }}
          >
            <div className="small text-muted mb-1">
              Deployed country:{" "}
              <span className="text-dark fw-semibold">
                {hoveredWorker.deployed_country || "—"}
              </span>
            </div>
            <div className="small text-muted">
              Experience:
              {hoveredWorker.experience &&
              hoveredWorker.experience.length > 0 ? (
                <ul className="mb-0 ps-1 d-inline">
                  {hoveredWorker.experience.map((exp, idx) => (
                    <li key={idx} className="text-dark d-inline">
                      {idx > 0 && ", "}
                      {exp.country}: {exp.years_of_experience} yr
                      {exp.years_of_experience === 1 ? "" : "s"}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-dark">—</span>
              )}
            </div>
          </div>,
          document.body,
        )}

      <form className="form-submit" onSubmit={handleSubmit}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <h2 className="text-dark fw-bold mb-0">
              {isEditMode
                ? `Edit Invoice ${initialData?.invoice_number || ""}`
                : "New Invoice"}
            </h2>
            <BackButton onClick={onCancel} />
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Customer</label>
                <select
                  className="form-control"
                  value={customerUserId}
                  onChange={(e) => setCustomerUserId(e.target.value)}
                >
                  <option value="">Select customer (partner)</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Invoice Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label">Notes</label>
                <input
                  type="text"
                  className="form-control"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">
                Employees{" "}
                <span className="text-muted fw-normal">
                  ({selectedWorkers.length})
                </span>
              </h5>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={handleAddEmployee}
              >
                <i className="bi bi-person-plus me-1"></i> Add Employee
              </button>
            </div>

            {loadingWorkers ? (
              <p className="text-muted mb-0">Loading employees…</p>
            ) : (
              <ListingComponent
                showCount={false}
                data={selectedWorkers}
                columns={selectedWorkerColumns}
                actions={selectedWorkerActions}
                emptyState={{
                  title:
                    "No employees on this invoice yet — use Add Employee to pick some.",
                }}
              />
            )}
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4 text-center">
            <div className="text-muted small text-uppercase">Total</div>
            <div className="fw-bold fs-3 text-primary">
              {formatAmount(total)}
            </div>
          </div>
        </div>

        <button
          className="btn btn-main px-4 rounded"
          type="submit"
          disabled={submitLoading}
        >
          {isEditMode ? "Save Changes" : "Save Draft"}
        </button>
      </form>
    </section>
  );
};

export default InvoiceForm;
