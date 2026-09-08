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
  getWorkerAgents,
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

// Same phone format Worker Form's Agent Information module validates
// against (validateAgent in WorkerForm.jsx) — kept identical here so an
// agent's phone number is judged the same way in both places.
const guarantorPhoneRegex = /^(?:\+251[79]\d{8}|09\d{8})$/;

const emptyAgent = { agent_name: "", agent_phone: "" };

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
  // This mirrors Worker Form's Agent Information module exactly (see
  // WorkerForm.jsx: `agent`, `agentExists`, `allAgents`,
  // `currentAssignedAgentId`, handleAgentNameInputChange,
  // handleAgentOptionSelect, renderAgentFields, and the create/update
  // branch in handleSubmit) — just keyed per worker instead of there
  // being only one worker in the form. Assigning an agent is optional
  // per worker: leaving both fields blank for a worker simply means no
  // agent gets attached to them.
  //
  // { [workerId]: { agent_name, agent_phone } } — editable fields, live
  // as the person types.
  const [workerAgents, setWorkerAgents] = useState({});
  // { [workerId]: { agent_name, agent_phone } } — the last-saved value
  // for that worker's agent (what's actually persisted right now: the
  // value loaded from the worker record, or whatever a prior click of
  // that row's Create/Update Agent button last saved). Comparing
  // `workerAgents[id]` against this is how a single row's change is
  // detected independently of every other row, and independently of the
  // rest of the invoice form.
  const [workerAgentBaseline, setWorkerAgentBaseline] = useState({});
  // { [workerId]: boolean } — whether a workers_agent_information record
  // already exists for that worker (from listWorkers' agent_id), which
  // decides createWorkerAgent vs updateWorkerAgent per row, exactly like
  // WorkerForm's `agentExists` decides POST vs PUT.
  const [workerAgentExists, setWorkerAgentExists] = useState({});
  // { [workerId]: agentId|null } — mirrors WorkerForm's
  // `currentAssignedAgentId`, used only to highlight that worker's
  // currently-assigned agent as "Current Agent" in the suggestion list.
  const [workerCurrentAgentId, setWorkerCurrentAgentId] = useState({});
  // All agents on file, fetched once — same as WorkerForm's `allAgents`,
  // used to power every worker's Agent Name search/select suggestions.
  const [allAgents, setAllAgents] = useState([]);
  // workerId currently mid-save via its row's Create/Update Agent
  // button, so that one row's button can show a spinner and be disabled
  // without affecting any other row or the invoice submit button.
  const [savingAgentWorkerId, setSavingAgentWorkerId] = useState(null);
  // Which worker's Agent Name suggestion dropdown is open, plus the
  // on-screen position to portal it to (see the hover-popover comment
  // below for why this is portaled rather than positioned inline).
  const [agentDropdown, setAgentDropdown] = useState({
    workerId: null,
    top: 0,
    left: 0,
    width: 0,
  });

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

  // Same as WorkerForm's "load all agents on file" effect — independent
  // of edit/create mode, fetched once to power every worker's Agent Name
  // suggestions.
  useEffect(() => {
    getWorkerAgents()
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
          setWorkerAgents({});
          setWorkerAgentBaseline({});
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

        // Agent fields, existence, and current-agent id all seed from
        // listWorkers' agent_name/agent_phone/agent_id — same starting
        // values WorkerForm would get from getWorkerAgent(id), just
        // already included on the worker record here. Anything already
        // typed in for a worker (prev state) is preserved, same as
        // workerAmounts above.
        setWorkerAgents((prev) => {
          const next = {};
          workers.forEach((w) => {
            next[w.id] =
              prev[w.id] !== undefined
                ? prev[w.id]
                : {
                    agent_name: w.agent_name || "",
                    agent_phone: w.agent_phone || "",
                  };
          });
          return next;
        });

        // Baseline tracks the last-*saved* agent value for each worker
        // (what change detection compares against) — seeded from the
        // worker record once, then only ever moved forward by a
        // successful per-row Create/Update Agent save, never by typing.
        setWorkerAgentBaseline((prev) => {
          const next = {};
          workers.forEach((w) => {
            next[w.id] =
              prev[w.id] !== undefined
                ? prev[w.id]
                : {
                    agent_name: w.agent_name || "",
                    agent_phone: w.agent_phone || "",
                  };
          });
          return next;
        });

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

  // ---- Agent handlers — same shape as WorkerForm's, parameterized by
  // worker instead of operating on a single form-wide `agent` state. ----

  const uniqueAgentOptions = React.useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const a of allAgents) {
      const key = `${a.agent_name}||${a.agent_phone}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(a);
      }
    }
    return result;
  }, [allAgents]);

  const getFilteredAgentOptions = (workerId) => {
    const query =
      workerAgents[workerId]?.agent_name?.trim().toLowerCase() || "";
    if (!query) return uniqueAgentOptions;
    return uniqueAgentOptions.filter((a) =>
      a.agent_name?.toLowerCase().includes(query),
    );
  };

  const openAgentDropdownFor = (worker, target) => {
    const rect = target.getBoundingClientRect();
    setAgentDropdown({
      workerId: worker.id,
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  };

  const closeAgentDropdownFor = (workerId) => {
    setAgentDropdown((prev) =>
      prev.workerId === workerId
        ? { workerId: null, top: 0, left: 0, width: 0 }
        : prev,
    );
  };

  // Agent Name — same as WorkerForm's handleAgentNameInputChange: typing
  // just updates agent_name and opens the suggestion list; it never
  // touches agent_phone, so a manually-typed name doesn't clobber a
  // manually-typed phone.
  const handleAgentNameInputChange = (worker, value, e) => {
    setWorkerAgents((prev) => ({
      ...prev,
      [worker.id]: {
        ...(prev[worker.id] || emptyAgent),
        agent_name: value,
      },
    }));
    openAgentDropdownFor(worker, e.target);
  };

  // Agent Phone — plain controlled input, same pattern as WorkerForm's
  // handleAgentChange.
  const handleAgentPhoneChange = (workerId, value) => {
    setWorkerAgents((prev) => ({
      ...prev,
      [workerId]: {
        ...(prev[workerId] || emptyAgent),
        agent_phone: value,
      },
    }));
  };

  // Picking a suggestion autofills both fields from that agent's record
  // — same as WorkerForm's handleAgentOptionSelect.
  const handleAgentOptionSelect = (workerId, option) => {
    setWorkerAgents((prev) => ({
      ...prev,
      [workerId]: {
        agent_name: option.agent_name || "",
        agent_phone: option.agent_phone || "",
      },
    }));
    closeAgentDropdownFor(workerId);
  };

  // ---- Agent change detection + the per-row save action --------------
  //
  // A row's agent fields count as "changed" the moment either field
  // differs from that worker's baseline (their last-saved agent value).
  // This is deliberately independent per worker: editing one row's
  // Agent Name/Phone never affects any other row's button.
  const isAgentRowChanged = (workerId) => {
    const current = workerAgents[workerId] || emptyAgent;
    const baseline = workerAgentBaseline[workerId] || emptyAgent;
    return (
      (current.agent_name?.trim() || "") !==
        (baseline.agent_name?.trim() || "") ||
      (current.agent_phone?.trim() || "") !==
        (baseline.agent_phone?.trim() || "")
    );
  };

  // Returns "create" / "update" when that row's Create/Update Agent
  // button should be shown, or null when it should be hidden — no
  // change from baseline, or the fields aren't yet a valid, complete
  // agent (only one of name/phone filled in, or an invalid phone).
  const getAgentActionState = (workerId) => {
    const current = workerAgents[workerId] || emptyAgent;
    const name = current.agent_name?.trim();
    const phone = current.agent_phone?.trim();

    if (!name || !phone) return null;
    if (!guarantorPhoneRegex.test(phone)) return null;
    if (!isAgentRowChanged(workerId)) return null;

    return workerAgentExists[workerId] ? "update" : "create";
  };

  // Fires only from that row's action button — creates or updates the
  // agent for that single worker right away. This never touches the
  // invoice itself and never waits for (or triggers) the invoice's own
  // save/submit.
  const handleSaveAgent = async (worker) => {
    const state = getAgentActionState(worker.id);
    if (!state || savingAgentWorkerId) return;

    const current = workerAgents[worker.id] || emptyAgent;
    const agentPayload = {
      agent_name: current.agent_name.trim(),
      agent_phone: current.agent_phone.trim(),
    };

    setSavingAgentWorkerId(worker.id);
    try {
      const response =
        state === "update"
          ? await updateWorkerAgent(worker.id, agentPayload)
          : await createWorkerAgent(worker.id, agentPayload);

      if (state === "create") {
        setWorkerAgentExists((prev) => ({ ...prev, [worker.id]: true }));
      }

      // Baseline now matches what's persisted, so this row's button
      // disappears again until the fields are changed once more.
      setWorkerAgentBaseline((prev) => ({
        ...prev,
        [worker.id]: { ...agentPayload },
      }));

      const savedAgentId = response?.data?.id ?? response?.data?.agent_id;
      if (savedAgentId) {
        setWorkerCurrentAgentId((prev) => ({
          ...prev,
          [worker.id]: savedAgentId,
        }));
      }

      // Keep the shared suggestion list in sync so this newly
      // created/updated agent shows up for other workers immediately.
      setAllAgents((prev) => {
        if (savedAgentId) {
          const exists = prev.some(
            (a) => String(a.id) === String(savedAgentId),
          );
          if (exists) {
            return prev.map((a) =>
              String(a.id) === String(savedAgentId)
                ? { ...a, ...agentPayload }
                : a,
            );
          }
          return [...prev, { id: savedAgentId, ...agentPayload }];
        }
        return prev;
      });

      addMessage(
        response?.success !== false,
        response?.message ||
          `${state === "create" ? "Agent created" : "Agent updated"} for ${worker.full_name}`,
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
          `Worker not found while saving agent information for ${worker.full_name}.`,
        );
      } else {
        addMessage(
          false,
          err.message ||
            `Failed to save agent information for ${worker.full_name}`,
        );
      }
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
    setWorkerAgents((prev) => {
      const next = { ...prev };
      delete next[worker.id];
      return next;
    });
    setWorkerAgentBaseline((prev) => {
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
    closeAgentDropdownFor(worker.id);
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

  // Agent creation/updating is handled entirely by handleSaveAgent,
  // fired independently from each row's action button — invoice submit
  // never creates, updates, or otherwise touches agent records.
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
  // or buried by cell stacking contexts. The popover (and the Agent Name
  // suggestion dropdown, further down) are rendered once, through a
  // portal, outside the table. Either way this never reaches into
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
      // Agent Name doubles as search-existing / type-new, exactly like
      // Worker Form's Agent Name field — typing filters the suggestion
      // list (rendered via portal below), picking a suggestion autofills
      // Agent Phone too, and a name matching nothing is just treated as
      // a brand-new agent once both fields are filled. Any edit here is
      // what the Actions column's change-detection watches for this row.
      header: "Agent Name",
      accessor: "agent_name",
      render: (worker) => (
        <input
          type="text"
          className="form-control form-control-sm"
          style={{ minWidth: 170 }}
          autoComplete="off"
          value={workerAgents[worker.id]?.agent_name ?? ""}
          onChange={(e) =>
            handleAgentNameInputChange(worker, e.target.value, e)
          }
          onFocus={(e) => openAgentDropdownFor(worker, e.target)}
          onBlur={() => setTimeout(() => closeAgentDropdownFor(worker.id), 150)}
          placeholder="Search or type a new agent"
        />
      ),
    },
    {
      header: "Agent Phone",
      accessor: "agent_phone",
      render: (worker) => {
        const phone = workerAgents[worker.id]?.agent_phone ?? "";
        const showInvalidHint =
          phone.trim() && !guarantorPhoneRegex.test(phone.trim());
        return (
          <div style={{ width: 150 }}>
            <input
              type="text"
              className={`form-control form-control-sm${showInvalidHint ? " is-invalid" : ""}`}
              value={phone}
              onChange={(e) =>
                handleAgentPhoneChange(worker.id, e.target.value)
              }
              placeholder="09xxxxxxxx"
            />
            {showInvalidHint && (
              <div className="invalid-feedback d-block small mb-0">
                Invalid phone format
              </div>
            )}
          </div>
        );
      },
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
  // The agent action reuses ActionButtons' existing "custom" render slot
  // (the same extension point ApplicantReportGenerator uses) instead of
  // introducing a parallel agent-management UI: for each row it asks
  // getAgentActionState(worker.id) and renders nothing unless that row's
  // agent fields have actually changed into a valid, complete agent.
  // Icon-only, same visual language as the built-in "delete" action —
  // no visible label, just an icon plus a title/aria-label tooltip.
  const selectedWorkerActions = [
    {
      type: "delete",
      bypassRole: true,
      onClick: (worker) => handleRemoveWorker(worker),
    },
    {
      type: "custom",
      render: (worker) => {
        const state = getAgentActionState(worker.id);
        if (!state) return null;

        const isSaving = savingAgentWorkerId === worker.id;
        const label = state === "create" ? "Create Agent" : "Update Agent";

        return (
          <button
            type="button"
            className={`btn btn-sm ${state === "create" ? "btn-outline-success" : "btn-outline-primary"}`}
            onClick={() => handleSaveAgent(worker)}
            disabled={isSaving}
            title={label}
            aria-label={label}
          >
            {isSaving ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            ) : (
              <i
                className={`fa-solid ${state === "create" ? "fa-user-plus" : "fa-user-pen"}`}
              ></i>
            )}
          </button>
        );
      },
    },
  ];

  const agentDropdownOptions = agentDropdown.workerId
    ? getFilteredAgentOptions(agentDropdown.workerId)
    : [];

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
        .agent-dropdown-portal {
          position: fixed;
          z-index: 2000;
          max-height: 220px;
          overflow-y: auto;
          margin: 0;
          padding: 0;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
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

      {/* Agent Name suggestion dropdown — same content/behavior as Worker
          Form's own suggestion list (current agent highlighted, pick to
          autofill both fields), portaled for the same clipping reasons
          as the hover popover above. onMouseDown (not onClick) so the
          selection registers before the input's onBlur closes it. */}
      {agentDropdown.workerId &&
        agentDropdownOptions.length > 0 &&
        createPortal(
          <ul
            className="list-group agent-dropdown-portal shadow-sm"
            style={{
              top: agentDropdown.top,
              left: agentDropdown.left,
              width: agentDropdown.width,
            }}
          >
            {agentDropdownOptions.map((a) => {
              const currentAgentId =
                workerCurrentAgentId[agentDropdown.workerId];
              const isCurrent =
                currentAgentId != null &&
                String(a.id) === String(currentAgentId);
              return (
                <li
                  key={a.id}
                  className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  style={isCurrent ? { backgroundColor: "#e7f1ff" } : undefined}
                  role="button"
                  onMouseDown={() =>
                    handleAgentOptionSelect(agentDropdown.workerId, a)
                  }
                >
                  <span>
                    {a.agent_name}{" "}
                    <small className="text-muted">— {a.agent_phone}</small>
                  </span>
                </li>
              );
            })}
          </ul>,
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
