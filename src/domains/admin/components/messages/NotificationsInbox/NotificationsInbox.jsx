import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format, formatDistanceToNowStrict } from "date-fns";

import useResponse from "../../../../../context/Response/useResponse";
import useLoader from "../../../../../context/Loader/useLoader";
import useNotification from "../../../../../context/Notification/useNotification";
import useProfile from "../../../../../context/Profile/useProfile";
import CreateModal from "../../../../../shared/components/CreateModal/CreateModal";
import {
  markNotificationRead,
  sendManualNotification,
} from "../../../api/notification.api";
import { listWorkers } from "../../../api/worker.api";
import { getUsers } from "../../../api/user.api";
import { groupByDay, listTime, toDate } from "../shared/inboxUtils";
import { ListSkeleton, StatCard } from "../shared/InboxParts";
import styles from "../Inbox/Inbox.module.css";
import own from "./NotificationsInbox.module.css";

const FILTERS = [
  { key: "all", label: "All", stat: "total" },
  { key: "unread", label: "Unread", stat: "unread" },
];

// Roles that can send alerts (same as before: admin and staff)
const CAN_SEND = [1, 2];

/* A small icon per kind of alert, guessed from the text */
const KINDS = [
  { test: /\bcv/i, icon: "bi-file-earmark-person", label: "CV shared", tone: ["#8b5cf6", "#06b6d4"] },
  { test: /invoice|payment|paid/i, icon: "bi-receipt", label: "Billing", tone: ["#10b981", "#06b6d4"] },
  { test: /status|departed|visa|passport|medical/i, icon: "bi-arrow-repeat", label: "Status update", tone: ["#f59e0b", "#f97316"] },
  { test: /office|closed|holiday|meeting/i, icon: "bi-megaphone", label: "Announcement", tone: ["#f43f5e", "#f59e0b"] },
];
const DEFAULT_KIND = { icon: "bi-bell", label: "Notification", tone: ["#6366f1", "#8b5cf6"] };
const kindOf = (n) => KINDS.find((k) => k.test.test(n?.message || "")) || DEFAULT_KIND;

function KindIcon({ notification, size = "md" }) {
  const kind = kindOf(notification);
  return (
    <span
      className={`${styles.avatar} ${styles[`avatar_${size}`]}`}
      style={{ background: `linear-gradient(135deg, ${kind.tone[0]}, ${kind.tone[1]})` }}
      aria-hidden="true"
    >
      <i className={`bi ${kind.icon}`} />
    </span>
  );
}

function EmptyList({ filter, search }) {
  const copy = search
    ? { icon: "bi-search", title: "No matches", text: `Nothing matches “${search}”.` }
    : filter === "unread"
      ? { icon: "bi-check2-circle", title: "You're all caught up", text: "Every notification has been read." }
      : { icon: "bi-bell-slash", title: "No notifications yet", text: "Alerts sent to you by the system or your team will appear here." };
  return (
    <div className={styles.empty}>
      <span className={styles.emptyIcon}>
        <i className={`bi ${copy.icon}`} />
      </span>
      <h3>{copy.title}</h3>
      <p>{copy.text}</p>
    </div>
  );
}

function Detail({ notification, onBack, onCopy }) {
  if (!notification) {
    return (
      <div className={styles.placeholder}>
        <div className={`${styles.placeholderArt} ${own.placeholderArt}`} aria-hidden="true">
          <i className="bi bi-bell" />
        </div>
        <h3>Select a notification</h3>
        <p>Pick an alert from the list to read it in full.</p>
        <span className={styles.kbdHint}>
          Tip: use <kbd>↑</kbd> <kbd>↓</kbd> to move through notifications
        </span>
      </div>
    );
  }

  const kind = kindOf(notification);
  const received = toDate(notification.created_at);

  return (
    <article className={styles.detail} key={notification.id}>
      <header className={styles.detailHead}>
        <button type="button" className={styles.back} onClick={onBack}>
          <i className="bi bi-arrow-left" /> Notifications
        </button>
        <div className={styles.detailTools}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => onCopy(notification.message, "Notification text")}
            title="Copy text"
            aria-label="Copy notification text"
          >
            <i className="bi bi-copy" />
          </button>
        </div>
      </header>

      <div className={styles.sender}>
        <KindIcon notification={notification} size="lg" />
        <div className={styles.senderInfo}>
          <h2>{kind.label}</h2>
          <p>
            {received && (
              <>
                <i className="bi bi-clock" /> {format(received, "EEEE, d MMMM yyyy · HH:mm")}
                <span className={styles.dotSep}>•</span>
                {formatDistanceToNowStrict(received, { addSuffix: true })}
              </>
            )}
          </p>
        </div>
        <span className={`${styles.deliveryPill} ${styles.deliveryOk}`}>
          <i className="bi bi-check2-all" /> Read
        </span>
      </div>

      <div className={styles.bubble}>
        <i className={`bi bi-bell ${styles.quoteMark}`} aria-hidden="true" />
        <p dir="auto">{notification.message}</p>
      </div>
    </article>
  );
}

/* Notifications in the same layout as the website Messages inbox.
   Used on its own at /admin/notifications (staff, partners) and inside the
   Messages page behind the switcher (admins). */
function NotificationsInbox({ switcher = null }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { getNotifications } = useNotification();
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { profile } = useProfile();

  const addMessageRef = useRef(addMessage);
  addMessageRef.current = addMessage;
  const notify = useCallback((ok, text) => addMessageRef.current(ok, text), []);
  const getRef = useRef(getNotifications);
  getRef.current = getNotifications;

  // Bulk selection handed over from the Users / Employees lists
  const incomingBulkIds = location.state?.bulkIds || null;
  const incomingType = location.state?.bulkType || null;
  const incomingName = location.state?.bulkName || null;

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");
  const [filter, setFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [mobileDetail, setMobileDetail] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const listRef = useRef(null);

  const load = useCallback(
    async ({ quiet = false } = {}) => {
      if (!quiet) setStatus("loading");
      try {
        const response = await getRef.current();
        setItems(response?.data?.data || []);
        setStatus("ready");
      } catch (err) {
        setStatus("error");
        notify(false, err.message || "Could not load notifications");
      }
    },
    [notify],
  );

  useEffect(() => {
    load();
  }, [load]);

  // Open the composer straight away when arriving with a selection
  useEffect(() => {
    if (incomingBulkIds && incomingBulkIds.length > 0) setShowCompose(true);
  }, [incomingBulkIds]);

  /* ---- derived ---- */
  const search = searchInput.trim().toLowerCase();
  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 6);
    weekAgo.setHours(0, 0, 0, 0);
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    return {
      total: items.length,
      unread: items.filter((n) => !n.is_read).length,
      today: items.filter((n) => toDate(n.created_at) >= today).length,
      week: items.filter((n) => toDate(n.created_at) >= weekAgo).length,
    };
  }, [items]);

  const visible = useMemo(
    () =>
      items.filter(
        (n) =>
          (filter === "all" || !n.is_read) &&
          (!search || (n.message || "").toLowerCase().includes(search)),
      ),
    [items, filter, search],
  );
  const groups = useMemo(() => groupByDay(visible), [visible]);
  const selected = useMemo(
    () => items.find((n) => n.id === selectedId) || null,
    [items, selectedId],
  );

  /* ---- actions ---- */
  const markRead = async (n) => {
    if (!n || n.is_read) return;
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: 1 } : x)));
    try {
      await markNotificationRead(n.id);
      getRef.current(); // refresh the app-wide unread count
    } catch (err) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: 0 } : x)));
      notify(false, err.message);
    }
  };

  const open = (n) => {
    setSelectedId(n.id);
    setMobileDetail(true);
    markRead(n);
  };

  const markAll = async () => {
    const unread = items.filter((n) => !n.is_read);
    if (!unread.length) return;
    setItems((prev) => prev.map((x) => ({ ...x, is_read: 1 })));
    const results = await Promise.allSettled(unread.map((n) => markNotificationRead(n.id)));
    const failed = results.filter((r) => r.status === "rejected").length;
    getRef.current();
    if (failed) {
      notify(false, `${failed} notification(s) could not be marked as read`);
      load({ quiet: true });
    } else {
      notify(true, "All notifications marked as read");
    }
  };

  const copy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      notify(true, `${label} copied`);
    } catch {
      notify(false, "Couldn't copy to clipboard");
    }
  };

  const onListKey = (e) => {
    if (!["ArrowDown", "ArrowUp"].includes(e.key) || !visible.length) return;
    e.preventDefault();
    const idx = visible.findIndex((n) => n.id === selectedId);
    const nextIdx = e.key === "ArrowDown" ? Math.min(visible.length - 1, idx + 1) : Math.max(0, idx - 1);
    const next = visible[idx === -1 ? 0 : nextIdx];
    open(next);
    listRef.current?.querySelector(`[data-id="${next.id}"]`)?.scrollIntoView({ block: "nearest" });
  };

  /* ---- composer (unchanged behaviour) ---- */
  const handleUserSearch = async (val, role) => {
    setSearchTerm(val);
    if (!role || val.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      if (role === "worker") {
        const response = await listWorkers({ search: val });
        setSearchResults(response?.data?.items || []);
      } else {
        const response = await getUsers({ search: val, role_id: role });
        setSearchResults(response?.data || []);
      }
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const handleSend = async (formValues) => {
    showLoader();
    try {
      const finalData = {
        ...formValues,
        recipient_id: incomingBulkIds ? incomingBulkIds : formValues.recipient_id,
      };
      // Role values the backend expects
      const ROLE_MAP = {
        2: "employee",
        3: "partner",
        5: "employer",
        worker: "employee",
        employee: "staff",
        partner: "partner",
        employer: "employer",
      };
      const currentType = finalData.recipient_type?.toString();
      finalData.recipient_type = ROLE_MAP[currentType] || currentType;

      await sendManualNotification(finalData);
      notify(
        true,
        `Sent successfully to ${Array.isArray(finalData.recipient_id) ? finalData.recipient_id.length : 1} recipient(s)!`,
      );
      setShowCompose(false);
      setSearchTerm("");
      navigate(location.pathname + location.search, { replace: true, state: {} });
      load({ quiet: true });
    } catch (err) {
      notify(false, err.message);
    } finally {
      hideLoader();
    }
  };

  const renderSearchField = (field, inputValues, handleChange) => {
    if (incomingBulkIds && incomingBulkIds.length === 1) {
      return (
        <div className="form-control d-flex align-items-center justify-content-between bg-light border-primary-subtle">
          <div>
            <i className="bi bi-person-fill text-primary me-2"></i>
            <span className="fw-bold text-primary"> {incomingName}</span>
          </div>
        </div>
      );
    }
    if (incomingBulkIds && incomingBulkIds.length > 1) {
      return (
        <div className="form-control d-flex align-items-center justify-content-between bg-light">
          <span className="text-primary fw-bold">
            <i className="bi bi-people-fill me-2"></i>
            {incomingBulkIds.length} Selected Recipients
          </span>
          <span className="badge bg-primary-subtle text-primary">Bulk Mode</span>
        </div>
      );
    }
    return (
      <>
        <input
          type="text"
          className="form-control"
          placeholder={inputValues.recipient_type ? "Type to search..." : "Choose a role first"}
          disabled={!inputValues.recipient_type}
          value={searchTerm}
          required={!inputValues.recipient_id}
          style={{ backgroundColor: "#EDF1FB", borderRadius: "8px" }}
          autoComplete="off"
          onChange={(e) => handleUserSearch(e.target.value, inputValues.recipient_type)}
        />
        {searchResults.length > 0 && (
          <div
            className="list-group position-absolute shadow-lg mt-1 z-3 w-auto"
            style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #dee2e6" }}
          >
            {searchResults.map((user) => (
              <button
                key={user.id}
                type="button"
                className="list-group-item list-group-item-action small py-2 px-5 ps-3 d-flex align-items-center w-100 overflow-hidden"
                onClick={() => {
                  handleChange("recipient_id", user.id);
                  setSearchTerm(user.name || `${user.full_name}`);
                  setSearchResults([]);
                }}
              >
                <div className="text-start w-100" style={{ minWidth: 0 }}>
                  <div className="fw-bold text-dark mb-0 text-truncate">{user.name || `${user.full_name}`}</div>
                  <div className="text-muted text-truncate" style={{ fontSize: "0.7rem", lineHeight: "1" }}>
                    {user.email || user.phone_number}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </>
    );
  };

  const fields = useMemo(() => {
    let idLabel = "Find User";
    if (incomingBulkIds) idLabel = incomingBulkIds.length === 1 ? "Recipient Info" : "Group Info";
    return [
      {
        name: "recipient_type",
        label: "Recipient Role",
        type: "select",
        disabled: !!incomingBulkIds,
        initialValue: incomingType?.toString() || "",
        options: [
          { value: "3", label: "Partner" },
          { value: "2", label: "Staff" },
        ],
      },
      { name: "recipient_id", label: idLabel, type: "custom" },
      { name: "message", label: "Message Body", type: "textarea", placeholder: "Write your message here..." },
    ];
  }, [incomingBulkIds, incomingType]);

  const canSend = CAN_SEND.includes(Number(profile?.role_id));

  return (
    <div className={styles.page}>
      <section className={`${styles.hero} ${own.hero}`}>
        <div className={styles.heroGlow} aria-hidden="true" />
        {switcher && <div className={styles.heroSwitch}>{switcher}</div>}
        <div className={styles.heroText}>
          <span className={styles.heroEyebrow}>
            <i className="bi bi-broadcast" /> System alerts
          </span>
          <h1>Notifications</h1>
          <p>Alerts sent to you by the system and your team — shared CVs, status changes and announcements.</p>
        </div>
        <div className={styles.heroActions}>
          <button type="button" className={styles.heroBtn} onClick={() => load({ quiet: true })} title="Refresh">
            <i className="bi bi-arrow-clockwise" />
            <span>Refresh</span>
          </button>
          <button type="button" className={styles.heroBtn} onClick={markAll} disabled={!stats.unread}>
            <i className="bi bi-check2-all" />
            <span>Mark all read</span>
          </button>
          {canSend && (
            <button
              type="button"
              className={`${styles.heroBtn} ${styles.heroBtnSolid}`}
              onClick={() => {
                setSearchTerm("");
                setShowCompose(true);
              }}
            >
              <i className="bi bi-send-plus" />
              <span>Send Alert</span>
            </button>
          )}
        </div>
      </section>

      <section className={styles.stats}>
        <StatCard icon="bi-bell" label="All notifications" value={stats.total} tone="violet" active={filter === "all"} onClick={() => setFilter("all")} />
        <StatCard icon="bi-bell-fill" label="Unread" value={stats.unread} tone="rose" active={filter === "unread"} onClick={() => setFilter("unread")} hint={stats.unread ? "New" : "All caught up"} />
        <StatCard icon="bi-lightning-charge" label="Today" value={stats.today} tone="cyan" />
        <StatCard icon="bi-calendar-week" label="This week" value={stats.week} tone="amber" />
      </section>

      <section className={`${styles.shell} ${mobileDetail ? styles.showDetail : ""}`}>
        <aside className={styles.listPane}>
          <div className={styles.listTools}>
            <label className={styles.search}>
              <i className="bi bi-search" />
              <input
                type="search"
                placeholder="Search notifications…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button type="button" onClick={() => setSearchInput("")} aria-label="Clear search">
                  <i className="bi bi-x-lg" />
                </button>
              )}
            </label>
            <div className={`${styles.filters} ${own.filters}`} role="tablist" aria-label="Filter notifications">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  role="tab"
                  aria-selected={filter === f.key}
                  className={`${styles.filter} ${filter === f.key ? styles.filterOn : ""}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                  <span className={styles.filterCount}>{stats[f.stat]}</span>
                </button>
              ))}
            </div>
          </div>

          {status === "loading" && <ListSkeleton />}

          {status === "error" && (
            <div className={styles.empty}>
              <span className={`${styles.emptyIcon} ${styles.emptyIconError}`}>
                <i className="bi bi-wifi-off" />
              </span>
              <h3>Couldn't load notifications</h3>
              <p>Check your connection and try again.</p>
              <button type="button" className={styles.retry} onClick={() => load()}>
                <i className="bi bi-arrow-clockwise" /> Retry
              </button>
            </div>
          )}

          {status === "ready" && visible.length === 0 && <EmptyList filter={filter} search={searchInput.trim()} />}

          {status === "ready" && visible.length > 0 && (
            <div className={styles.listScroll}>
              <ul className={styles.list} ref={listRef} tabIndex={0} onKeyDown={onListKey} aria-label="Notifications">
                {groups.map((g) => (
                  <li key={g.label} className={styles.group}>
                    <span className={styles.groupLabel}>{g.label}</span>
                    <ul className={styles.groupItems}>
                      {g.items.map((n) => (
                        <li key={n.id} data-id={n.id}>
                          <button
                            type="button"
                            className={`${styles.row} ${n.id === selectedId ? styles.rowOn : ""} ${!n.is_read ? styles.rowUnread : ""}`}
                            onClick={() => open(n)}
                            aria-current={n.id === selectedId}
                          >
                            <KindIcon notification={n} />
                            <span className={styles.rowBody}>
                              <span className={styles.rowTop}>
                                <span className={styles.rowName}>{kindOf(n).label}</span>
                                <span className={styles.rowTime}>{listTime(n.created_at)}</span>
                              </span>
                              <span className={styles.rowPreview} dir="auto">
                                {n.message}
                              </span>
                            </span>
                            <span className={styles.rowFlags}>
                              {!n.is_read && <span className={styles.unreadDot} title="Unread" />}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
              <div className={styles.listFoot}>
                <span>
                  {visible.length} of {items.length}
                </span>
              </div>
            </div>
          )}
        </aside>

        <div className={styles.detailPane}>
          <Detail notification={selected} onBack={() => setMobileDetail(false)} onCopy={copy} />
        </div>
      </section>

      {showCompose && (
        <CreateModal
          show={showCompose}
          onClose={() => {
            setShowCompose(false);
            if (incomingBulkIds && incomingBulkIds.length > 0) navigate(-1);
            else navigate(location.pathname + location.search, { replace: true, state: {} });
          }}
          onCreate={handleSend}
          title={
            incomingBulkIds
              ? incomingBulkIds.length === 1
                ? "Direct Notification"
                : "Bulk Notification"
              : "New Notification"
          }
          fields={fields}
          btnLabel={
            incomingBulkIds ? (incomingBulkIds.length === 1 ? "Send to User" : "Send to Group") : "Send Alert"
          }
          renderCustomField={renderSearchField}
        />
      )}
    </div>
  );
}

export default NotificationsInbox;
