import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  differenceInCalendarDays,
  format,
  formatDistanceToNowStrict,
  isToday,
  isYesterday,
} from "date-fns";

import useSocket from "../../../../../context/Socket/useSocket";
import { useDelete } from "../../../../../context/Delete/useDelete";
import {
  deleteContactMessage,
  getContactMessages,
  markAllContactMessagesRead,
  setContactMessageRead,
  setContactMessageStarred,
} from "../../../api/contactMessage.api";
import styles from "./Inbox.module.css";

const PAGE_SIZE = 20;

const FILTERS = [
  { key: "all", label: "All", stat: "total" },
  { key: "unread", label: "Unread", stat: "unread" },
  { key: "starred", label: "Starred", stat: "starred" },
];

const AVATAR_GRADIENTS = [
  ["#8b5cf6", "#06b6d4"],
  ["#f43f5e", "#f59e0b"],
  ["#10b981", "#06b6d4"],
  ["#6366f1", "#ec4899"],
  ["#0ea5e9", "#6366f1"],
  ["#f97316", "#ef4444"],
  ["#14b8a6", "#84cc16"],
];

const EMPTY_STATS = { total: 0, unread: 0, starred: 0, today: 0, last_7_days: 0 };

/* ---------------------------------------------------------------- helpers */

const toDate = (value) => (value ? new Date(value) : null);

const displayName = (m) => (m?.name && m.name.trim()) || "Website visitor";

const initials = (m) => {
  const name = m?.name?.trim();
  if (!name) return "?";
  const parts = name.split(/\s+/).filter(Boolean);
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
};

const avatarStyle = (m) => {
  const seed = `${m?.name || ""}${m?.phone || ""}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  const [a, b] = AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
  return { background: `linear-gradient(135deg, ${a}, ${b})` };
};

const listTime = (value) => {
  const d = toDate(value);
  if (!d) return "";
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return "Yesterday";
  if (differenceInCalendarDays(new Date(), d) < 7) return format(d, "EEE");
  return format(d, "d MMM");
};

const groupLabel = (value) => {
  const d = toDate(value);
  if (!d) return "Earlier";
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  if (differenceInCalendarDays(new Date(), d) < 7) return "This week";
  return "Earlier";
};

const digitsOnly = (phone = "") => phone.replace(/\D/g, "");

/* ---------------------------------------------------------------- views */

function Avatar({ message, size = "md" }) {
  return (
    <span
      className={`${styles.avatar} ${styles[`avatar_${size}`]}`}
      style={avatarStyle(message)}
      aria-hidden="true"
    >
      {initials(message) === "?" ? <i className="bi bi-person" /> : initials(message)}
    </span>
  );
}

function StatCard({ icon, label, value, tone, active, onClick, hint }) {
  return (
    <button
      type="button"
      className={`${styles.stat} ${styles[`tone_${tone}`]} ${active ? styles.statActive : ""}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <span className={styles.statIcon}>
        <i className={`bi ${icon}`} />
      </span>
      <span className={styles.statBody}>
        <span className={styles.statValue}>{value}</span>
        <span className={styles.statLabel}>{label}</span>
      </span>
      {hint && <span className={styles.statHint}>{hint}</span>}
    </button>
  );
}

function EmptyList({ filter, search }) {
  const copy = search
    ? {
        icon: "bi-search",
        title: "No matches",
        text: `Nothing matches “${search}”. Try a name, phone number or a word from the message.`,
      }
    : filter === "unread"
      ? {
          icon: "bi-check2-circle",
          title: "You're all caught up",
          text: "Every message has been read. New ones will appear here instantly.",
        }
      : filter === "starred"
        ? {
            icon: "bi-star",
            title: "No starred messages",
            text: "Star important inquiries to keep them one click away.",
          }
        : {
            icon: "bi-envelope-open-heart",
            title: "No messages yet",
            text: "When visitors use the contact form on your website, their messages will land here — live.",
          };
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

function ListSkeleton() {
  return (
    <ul className={styles.list} aria-busy="true">
      {Array.from({ length: 6 }, (_, i) => (
        <li key={i} className={styles.skelRow}>
          <span className={`${styles.skel} ${styles.skelAvatar}`} />
          <span className={styles.skelLines}>
            <span className={`${styles.skel} ${styles.skelLine}`} style={{ width: "45%" }} />
            <span className={`${styles.skel} ${styles.skelLine}`} style={{ width: "90%" }} />
            <span className={`${styles.skel} ${styles.skelLine}`} style={{ width: "70%" }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function Detail({ message, onBack, onToggleStar, onToggleRead, onDelete, onCopy }) {
  if (!message) {
    return (
      <div className={styles.placeholder}>
        <div className={styles.placeholderArt} aria-hidden="true">
          <i className="bi bi-envelope-paper-heart" />
        </div>
        <h3>Select a message</h3>
        <p>Pick a conversation from the list to read it, reply by email, call or chat on WhatsApp.</p>
        <span className={styles.kbdHint}>
          Tip: use <kbd>↑</kbd> <kbd>↓</kbd> to move through messages
        </span>
      </div>
    );
  }

  const received = toDate(message.created_at);
  const subject = encodeURIComponent("Re: Your inquiry");
  const body = encodeURIComponent(
    `\n\n---\nOn ${received ? format(received, "d MMM yyyy, HH:mm") : ""}, ${displayName(message)} wrote:\n${message.message}`,
  );
  const wa = digitsOnly(message.phone);

  return (
    <article className={styles.detail} key={message.id}>
      <header className={styles.detailHead}>
        <button type="button" className={styles.back} onClick={onBack}>
          <i className="bi bi-arrow-left" /> Inbox
        </button>

        <div className={styles.detailTools}>
          <button
            type="button"
            className={`${styles.iconBtn} ${message.is_starred ? styles.starOn : ""}`}
            onClick={() => onToggleStar(message)}
            title={message.is_starred ? "Remove star" : "Star"}
            aria-label={message.is_starred ? "Remove star" : "Star message"}
          >
            <i className={`bi ${message.is_starred ? "bi-star-fill" : "bi-star"}`} />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => onToggleRead(message)}
            title={message.is_read ? "Mark as unread" : "Mark as read"}
            aria-label={message.is_read ? "Mark as unread" : "Mark as read"}
          >
            <i className={`bi ${message.is_read ? "bi-envelope" : "bi-envelope-open"}`} />
          </button>
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.danger}`}
            onClick={() => onDelete(message)}
            title="Delete"
            aria-label="Delete message"
          >
            <i className="bi bi-trash3" />
          </button>
        </div>
      </header>

      <div className={styles.sender}>
        <Avatar message={message} size="lg" />
        <div className={styles.senderInfo}>
          <h2>{displayName(message)}</h2>
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
        <span
          className={`${styles.deliveryPill} ${message.email_sent ? styles.deliveryOk : styles.deliveryWarn}`}
          title={
            message.email_sent
              ? "A copy was emailed to the agency inbox"
              : "The notification email could not be delivered — this dashboard is the only copy"
          }
        >
          <i className={`bi ${message.email_sent ? "bi-envelope-check" : "bi-envelope-exclamation"}`} />
          {message.email_sent ? "Emailed to inbox" : "Dashboard only"}
        </span>
      </div>

      <div className={styles.chips}>
        <div className={styles.chip}>
          <i className="bi bi-telephone" />
          <a href={`tel:${message.phone}`} dir="ltr">
            {message.phone}
          </a>
          <button type="button" onClick={() => onCopy(message.phone, "Phone number")} aria-label="Copy phone number">
            <i className="bi bi-copy" />
          </button>
        </div>
        {message.email ? (
          <div className={styles.chip}>
            <i className="bi bi-at" />
            <a href={`mailto:${message.email}`} dir="ltr">
              {message.email}
            </a>
            <button type="button" onClick={() => onCopy(message.email, "Email")} aria-label="Copy email">
              <i className="bi bi-copy" />
            </button>
          </div>
        ) : (
          <div className={`${styles.chip} ${styles.chipMuted}`}>
            <i className="bi bi-at" /> No email provided
          </div>
        )}
      </div>

      <div className={styles.bubble}>
        <i className={`bi bi-quote ${styles.quoteMark}`} aria-hidden="true" />
        <p dir="auto">{message.message}</p>
      </div>

      <footer className={styles.actions}>
        {message.email && (
          <a className={`${styles.action} ${styles.actionPrimary}`} href={`mailto:${message.email}?subject=${subject}&body=${body}`}>
            <i className="bi bi-reply-fill" /> Reply by email
          </a>
        )}
        <a className={styles.action} href={`tel:${message.phone}`}>
          <i className="bi bi-telephone-outbound" /> Call
        </a>
        {wa && (
          <a
            className={`${styles.action} ${styles.actionWa}`}
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="bi bi-whatsapp" /> WhatsApp
          </a>
        )}
      </footer>
    </article>
  );
}

/* ---------------------------------------------------------------- inbox */

function Inbox() {
  const socket = useSocket();
  const { openModal } = useDelete();

  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filter, setFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [mobileDetail, setMobileDetail] = useState(false);
  const [fresh, setFresh] = useState(() => new Set());
  const listRef = useRef(null);
  const requestId = useRef(0);

  const selected = useMemo(
    () => messages.find((m) => m.id === selectedId) || null,
    [messages, selectedId],
  );

  /* Debounce the search box */
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(
    async ({ page = 1, append = false, quiet = false } = {}) => {
      const id = ++requestId.current;
      if (!append && !quiet) setStatus("loading");
      if (append) setLoadingMore(true);
      try {
        const res = await getContactMessages({ page, limit: PAGE_SIZE, filter, search });
        if (id !== requestId.current) return;
        const data = res?.data || {};
        setMessages((prev) => (append ? [...prev, ...(data.messages || [])] : data.messages || []));
        setStats(data.stats || EMPTY_STATS);
        setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
        setStatus("ready");
      } catch (err) {
        if (id !== requestId.current) return;
        if (!append) setStatus("error");
        toast.error(err.message || "Could not load messages");
      } finally {
        if (append) setLoadingMore(false);
      }
    },
    [filter, search],
  );

  useEffect(() => {
    load();
  }, [load]);

  /* ---- local updates ---- */
  const patchMessage = (id, changes) =>
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...changes } : m)));

  const markRead = useCallback(async (message, isRead) => {
    if (!message || Boolean(message.is_read) === isRead) return;
    patchMessage(message.id, { is_read: isRead ? 1 : 0 });
    setStats((s) => ({ ...s, unread: Math.max(0, s.unread + (isRead ? -1 : 1)) }));
    try {
      await setContactMessageRead(message.id, isRead);
    } catch (err) {
      patchMessage(message.id, { is_read: isRead ? 0 : 1 });
      setStats((s) => ({ ...s, unread: Math.max(0, s.unread + (isRead ? 1 : -1)) }));
      toast.error(err.message);
    }
  }, []);

  const open = (message) => {
    setSelectedId(message.id);
    setMobileDetail(true);
    if (!message.is_read) markRead(message, true);
  };

  const toggleStar = async (message) => {
    const next = !message.is_starred;
    patchMessage(message.id, { is_starred: next ? 1 : 0 });
    setStats((s) => ({ ...s, starred: Math.max(0, s.starred + (next ? 1 : -1)) }));
    try {
      await setContactMessageStarred(message.id, next);
      if (filter === "starred" && !next) {
        setMessages((prev) => prev.filter((m) => m.id !== message.id));
      }
    } catch (err) {
      patchMessage(message.id, { is_starred: next ? 0 : 1 });
      setStats((s) => ({ ...s, starred: Math.max(0, s.starred + (next ? -1 : 1)) }));
      toast.error(err.message);
    }
  };

  const toggleRead = (message) => markRead(message, !message.is_read);

  const remove = (message) =>
    openModal(
      async () => {
        try {
          await deleteContactMessage(message.id);
          const idx = messages.findIndex((m) => m.id === message.id);
          const remaining = messages.filter((m) => m.id !== message.id);
          setMessages((prev) => prev.filter((m) => m.id !== message.id));
          if (selectedId === message.id) {
            // Keep reading flow: select the next message in the list
            setSelectedId(remaining[Math.min(idx, remaining.length - 1)]?.id ?? null);
            if (!remaining.length) setMobileDetail(false);
          }
          setStats((s) => ({
            ...s,
            total: Math.max(0, s.total - 1),
            unread: Math.max(0, s.unread - (message.is_read ? 0 : 1)),
            starred: Math.max(0, s.starred - (message.is_starred ? 1 : 0)),
          }));
          setPagination((p) => ({ ...p, total: Math.max(0, p.total - 1) }));
          toast.success("Message deleted");
        } catch (err) {
          toast.error(err.message);
        }
      },
      { title: `Delete the message from ${displayName(message)}?`, confirmText: "Delete" },
    );

  const markAll = async () => {
    try {
      await markAllContactMessagesRead();
      setMessages((prev) =>
        filter === "unread" ? [] : prev.map((m) => ({ ...m, is_read: 1 })),
      );
      setStats((s) => ({ ...s, unread: 0 }));
      toast.success("All messages marked as read");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const copy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  /* ---- live updates ---- */
  useEffect(() => {
    if (!socket) return undefined;

    const onNew = (message) => {
      if (!message?.id) return;
      setStats((s) => ({
        ...s,
        total: s.total + 1,
        unread: s.unread + 1,
        today: s.today + 1,
        last_7_days: s.last_7_days + 1,
      }));
      if (!search && filter !== "starred") {
        setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [message, ...prev]));
        setPagination((p) => ({ ...p, total: p.total + 1 }));
        setFresh((prev) => new Set(prev).add(message.id));
        setTimeout(
          () =>
            setFresh((prev) => {
              const next = new Set(prev);
              next.delete(message.id);
              return next;
            }),
          6000,
        );
      }
      toast(`New message from ${displayName(message)}`, { icon: "✉️" });
    };

    // Changes made by any admin (including this tab) — apply idempotently
    const onChanged = (e) => {
      if (!e) return;
      if (typeof e.unread === "number") setStats((s) => ({ ...s, unread: e.unread }));
      const id = e.id;
      if (e.action === "read-all") setMessages((prev) => prev.map((m) => ({ ...m, is_read: 1 })));
      if (e.action === "read") patchMessage(id, { is_read: 1 });
      if (e.action === "unread") patchMessage(id, { is_read: 0 });
      if (e.action === "starred") patchMessage(id, { is_starred: 1 });
      if (e.action === "unstarred") patchMessage(id, { is_starred: 0 });
      if (e.action === "deleted") {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        setSelectedId((cur) => (cur === id ? null : cur));
      }
    };

    socket.on("contact:new", onNew);
    socket.on("contact:changed", onChanged);
    return () => {
      socket.off("contact:new", onNew);
      socket.off("contact:changed", onChanged);
    };
  }, [socket, filter, search]);

  /* ---- keyboard navigation on the list ---- */
  const onListKey = (e) => {
    if (!["ArrowDown", "ArrowUp"].includes(e.key) || !messages.length) return;
    e.preventDefault();
    const idx = messages.findIndex((m) => m.id === selectedId);
    const nextIdx =
      e.key === "ArrowDown" ? Math.min(messages.length - 1, idx + 1) : Math.max(0, idx - 1);
    const next = messages[idx === -1 ? 0 : nextIdx];
    open(next);
    listRef.current?.querySelector(`[data-id="${next.id}"]`)?.scrollIntoView({ block: "nearest" });
  };

  /* ---- grouped list ---- */
  const groups = useMemo(() => {
    const out = [];
    messages.forEach((m) => {
      const label = groupLabel(m.created_at);
      const last = out[out.length - 1];
      if (last && last.label === label) last.items.push(m);
      else out.push({ label, items: [m] });
    });
    return out;
  }, [messages]);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroText}>
          <span className={styles.heroEyebrow}>
            <i className="bi bi-globe2" /> Website contact form
          </span>
          <h1>Messages</h1>
          <p>Inquiries sent by visitors from your public website — read, reply and follow up in one place.</p>
        </div>
        <div className={styles.heroActions}>
          <span className={`${styles.live} ${socket ? styles.liveOn : ""}`}>
            <span className={styles.liveDot} />
            {socket ? "Live" : "Offline"}
          </span>
          <button type="button" className={styles.heroBtn} onClick={() => load({ quiet: true })} title="Refresh">
            <i className="bi bi-arrow-clockwise" />
            <span>Refresh</span>
          </button>
          <button type="button" className={`${styles.heroBtn} ${styles.heroBtnSolid}`} onClick={markAll} disabled={!stats.unread}>
            <i className="bi bi-check2-all" />
            <span>Mark all read</span>
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.stats}>
        <StatCard icon="bi-inbox" label="Total messages" value={stats.total} tone="violet" active={filter === "all"} onClick={() => setFilter("all")} />
        <StatCard icon="bi-envelope-exclamation" label="Unread" value={stats.unread} tone="rose" active={filter === "unread"} onClick={() => setFilter("unread")} hint={stats.unread ? "Needs attention" : "All caught up"} />
        <StatCard icon="bi-star" label="Starred" value={stats.starred} tone="amber" active={filter === "starred"} onClick={() => setFilter("starred")} />
        <StatCard icon="bi-lightning-charge" label="Today" value={stats.today} tone="cyan" hint={`${stats.last_7_days} this week`} />
      </section>

      {/* Inbox */}
      <section className={`${styles.shell} ${mobileDetail ? styles.showDetail : ""}`}>
        <aside className={styles.listPane}>
          <div className={styles.listTools}>
            <label className={styles.search}>
              <i className="bi bi-search" />
              <input
                type="search"
                placeholder="Search name, phone, email or text…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button type="button" onClick={() => setSearchInput("")} aria-label="Clear search">
                  <i className="bi bi-x-lg" />
                </button>
              )}
            </label>
            <div className={styles.filters} role="tablist" aria-label="Filter messages">
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
              <h3>Couldn't load messages</h3>
              <p>Check your connection and try again.</p>
              <button type="button" className={styles.retry} onClick={() => load()}>
                <i className="bi bi-arrow-clockwise" /> Retry
              </button>
            </div>
          )}

          {status === "ready" && messages.length === 0 && <EmptyList filter={filter} search={search} />}

          {status === "ready" && messages.length > 0 && (
            <div className={styles.listScroll}>
              <ul
                className={styles.list}
                ref={listRef}
                tabIndex={0}
                onKeyDown={onListKey}
                aria-label="Messages"
              >
                {groups.map((g) => (
                  <li key={g.label} className={styles.group}>
                    <span className={styles.groupLabel}>{g.label}</span>
                    <ul className={styles.groupItems}>
                      {g.items.map((m) => (
                        <li key={m.id} data-id={m.id}>
                          <button
                            type="button"
                            className={`${styles.row} ${m.id === selectedId ? styles.rowOn : ""} ${
                              !m.is_read ? styles.rowUnread : ""
                            } ${fresh.has(m.id) ? styles.rowFresh : ""}`}
                            onClick={() => open(m)}
                            aria-current={m.id === selectedId}
                          >
                            <Avatar message={m} />
                            <span className={styles.rowBody}>
                              <span className={styles.rowTop}>
                                <span className={styles.rowName}>{displayName(m)}</span>
                                <span className={styles.rowTime}>{listTime(m.created_at)}</span>
                              </span>
                              <span className={styles.rowPhone} dir="ltr">
                                {m.phone}
                              </span>
                              <span className={styles.rowPreview} dir="auto">
                                {m.message}
                              </span>
                            </span>
                            <span className={styles.rowFlags}>
                              {!m.is_read && <span className={styles.unreadDot} title="Unread" />}
                              {Boolean(m.is_starred) && <i className={`bi bi-star-fill ${styles.rowStar}`} title="Starred" />}
                              {fresh.has(m.id) && <span className={styles.newTag}>New</span>}
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
                  {messages.length} of {pagination.total}
                </span>
                {pagination.page < pagination.pages && (
                  <button
                    type="button"
                    className={styles.more}
                    onClick={() => load({ page: pagination.page + 1, append: true })}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <span className={styles.spinner} /> Loading…
                      </>
                    ) : (
                      "Load more"
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </aside>

        <div className={styles.detailPane}>
          <Detail
            message={selected}
            onBack={() => setMobileDetail(false)}
            onToggleStar={toggleStar}
            onToggleRead={toggleRead}
            onDelete={remove}
            onCopy={copy}
          />
        </div>
      </section>
    </div>
  );
}

export default Inbox;
