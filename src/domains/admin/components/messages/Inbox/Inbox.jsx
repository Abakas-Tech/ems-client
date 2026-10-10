import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format, formatDistanceToNowStrict } from "date-fns";

import useSocket from "../../../../../context/Socket/useSocket";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete";
import {
  deleteContactMessage,
  getContactMessages,
  markAllContactMessagesRead,
  setContactMessageRead,
  setContactMessageStarred,
} from "../../../api/contactMessage.api";
import { groupByDay, listTime, toDate } from "../shared/inboxUtils";
import { ListSkeleton, StatCard } from "../shared/InboxParts";
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

const EMPTY_STATS = {
  total: 0,
  unread: 0,
  starred: 0,
  today: 0,
  last_7_days: 0,
};

/* ---------------------------------------------------------------- helpers */

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
  for (let i = 0; i < seed.length; i += 1)
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  const [a, b] = AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
  return { background: `linear-gradient(135deg, ${a}, ${b})` };
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
      {initials(message) === "?" ? (
        <i className="bi bi-person" />
      ) : (
        initials(message)
      )}
    </span>
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

/* Reply by email: the system mail app (mailto) plus Gmail / Outlook on the
   web, since mailto does nothing on computers without a mail app set up. */
function ReplyMenu({ message, onCopy }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) =>
      root.current && !root.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const received = toDate(message.created_at);
  const to = message.email;
  const subject = "Re: Your inquiry";
  const body = `\n\n---\nOn ${received ? format(received, "d MMM yyyy, HH:mm") : ""}, ${displayName(message)} wrote:\n${message.message}`;
  const q = (v) => encodeURIComponent(v);

  const options = [
    {
      key: "app",
      icon: "bi-envelope-paper",
      label: "Default mail app",
      hint: "Outlook, Apple Mail, Thunderbird…",
      href: `mailto:${to}?subject=${q(subject)}&body=${q(body)}`,
    },
    {
      key: "gmail",
      icon: "bi-google",
      label: "Gmail",
      hint: "Opens a draft in your browser",
      href: `https://mail.google.com/mail/?view=cm&fs=1&to=${q(to)}&su=${q(subject)}&body=${q(body)}`,
      external: true,
    },
    {
      key: "outlook",
      icon: "bi-microsoft",
      label: "Outlook on the web",
      hint: "Outlook.com or Microsoft 365",
      href: `https://outlook.office.com/mail/deeplink/compose?to=${q(to)}&subject=${q(subject)}&body=${q(body)}`,
      external: true,
    },
  ];

  return (
    <div className={styles.reply} ref={root}>
      <button
        type="button"
        className={`${styles.action} ${styles.actionPrimary}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <i className="bi bi-reply-fill" /> Reply by email
        <i className={`bi bi-chevron-down ${styles.replyCaret}`} />
      </button>
      {open && (
        <div className={styles.replyMenu} role="menu">
          <span className={styles.replyTo}>
            Replying to <strong dir="ltr">{to}</strong>
          </span>
          {options.map((o) => (
            <a
              key={o.key}
              role="menuitem"
              className={styles.replyItem}
              href={o.href}
              {...(o.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              onClick={() => setOpen(false)}
            >
              <span
                className={`${styles.replyIcon} ${styles[`reply_${o.key}`]}`}
              >
                <i className={`bi ${o.icon}`} />
              </span>
              <span className={styles.replyText}>
                <strong>{o.label}</strong>
                <small>{o.hint}</small>
              </span>
              <i
                className={`bi ${o.external ? "bi-box-arrow-up-right" : "bi-arrow-right"} ${styles.replyGo}`}
              />
            </a>
          ))}
          <button
            type="button"
            role="menuitem"
            className={styles.replyItem}
            onClick={() => {
              onCopy(to, "Email address");
              setOpen(false);
            }}
          >
            <span className={`${styles.replyIcon} ${styles.reply_copy}`}>
              <i className="bi bi-copy" />
            </span>
            <span className={styles.replyText}>
              <strong>Copy email address</strong>
              <small>Paste it into any mail app</small>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

function Detail({
  message,
  onBack,
  onToggleStar,
  onToggleRead,
  onDelete,
  onCopy,
}) {
  if (!message) {
    return (
      <div className={styles.placeholder}>
        <div className={styles.placeholderArt} aria-hidden="true">
          <i className="bi bi-envelope-paper-heart" />
        </div>
        <h3>Select a message</h3>
        <p>
          Pick a conversation from the list to read it, reply by email, call or
          chat on WhatsApp.
        </p>
      </div>
    );
  }

  const received = toDate(message.created_at);
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
            <i
              className={`bi ${message.is_starred ? "bi-star-fill" : "bi-star"}`}
            />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => onToggleRead(message)}
            title={message.is_read ? "Mark as unread" : "Mark as read"}
            aria-label={message.is_read ? "Mark as unread" : "Mark as read"}
          >
            <i
              className={`bi ${message.is_read ? "bi-envelope" : "bi-envelope-open"}`}
            />
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
                <i className="bi bi-clock" />{" "}
                {format(received, "EEEE, d MMMM yyyy · HH:mm")}
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
          <i
            className={`bi ${message.email_sent ? "bi-envelope-check" : "bi-envelope-exclamation"}`}
          />
          {message.email_sent ? "Emailed to inbox" : "Dashboard only"}
        </span>
      </div>

      <div className={styles.chips}>
        <div className={styles.chip}>
          <i className="bi bi-telephone" />
          <a href={`tel:${message.phone}`} dir="ltr">
            {message.phone}
          </a>
          <button
            type="button"
            onClick={() => onCopy(message.phone, "Phone number")}
            aria-label="Copy phone number"
          >
            <i className="bi bi-copy" />
          </button>
        </div>
        {message.email ? (
          <div className={styles.chip}>
            <i className="bi bi-at" />
            <a href={`mailto:${message.email}`} dir="ltr">
              {message.email}
            </a>
            <button
              type="button"
              onClick={() => onCopy(message.email, "Email")}
              aria-label="Copy email"
            >
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
        {message.email && <ReplyMenu message={message} onCopy={onCopy} />}
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

function Inbox({ switcher = null }) {
  const socket = useSocket();
  const { openModal } = useDelete();
  const { addMessage } = useResponse();

  /* The app-wide success/error alerts. addMessage changes identity on every
     provider render, so go through a ref to keep callbacks stable. */
  const addMessageRef = useRef(addMessage);
  addMessageRef.current = addMessage;
  const notify = useCallback((ok, text) => addMessageRef.current(ok, text), []);

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
        const res = await getContactMessages({
          page,
          limit: PAGE_SIZE,
          filter,
          search,
        });
        if (id !== requestId.current) return;
        const data = res?.data || {};
        setMessages((prev) =>
          append ? [...prev, ...(data.messages || [])] : data.messages || [],
        );
        setStats(data.stats || EMPTY_STATS);
        setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
        setStatus("ready");
      } catch (err) {
        if (id !== requestId.current) return;
        if (!append) setStatus("error");
        notify(false, err.message || "Could not load messages");
      } finally {
        if (append) setLoadingMore(false);
      }
    },
    [filter, search, notify],
  );

  useEffect(() => {
    load();
  }, [load]);

  /* ---- local updates ---- */
  const patchMessage = (id, changes) =>
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...changes } : m)),
    );

  const markRead = useCallback(
    async (message, isRead) => {
      if (!message || Boolean(message.is_read) === isRead) return;
      patchMessage(message.id, { is_read: isRead ? 1 : 0 });
      setStats((s) => ({
        ...s,
        unread: Math.max(0, s.unread + (isRead ? -1 : 1)),
      }));
      try {
        await setContactMessageRead(message.id, isRead);
      } catch (err) {
        patchMessage(message.id, { is_read: isRead ? 0 : 1 });
        setStats((s) => ({
          ...s,
          unread: Math.max(0, s.unread + (isRead ? 1 : -1)),
        }));
        notify(false, err.message);
      }
    },
    [notify],
  );

  const open = (message) => {
    setSelectedId(message.id);
    setMobileDetail(true);
    if (!message.is_read) markRead(message, true);
  };

  const toggleStar = async (message) => {
    const next = !message.is_starred;
    patchMessage(message.id, { is_starred: next ? 1 : 0 });
    setStats((s) => ({
      ...s,
      starred: Math.max(0, s.starred + (next ? 1 : -1)),
    }));
    try {
      await setContactMessageStarred(message.id, next);
      if (filter === "starred" && !next) {
        setMessages((prev) => prev.filter((m) => m.id !== message.id));
      }
    } catch (err) {
      patchMessage(message.id, { is_starred: next ? 0 : 1 });
      setStats((s) => ({
        ...s,
        starred: Math.max(0, s.starred + (next ? -1 : 1)),
      }));
      notify(false, err.message);
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
            setSelectedId(
              remaining[Math.min(idx, remaining.length - 1)]?.id ?? null,
            );
            if (!remaining.length) setMobileDetail(false);
          }
          setStats((s) => ({
            ...s,
            total: Math.max(0, s.total - 1),
            unread: Math.max(0, s.unread - (message.is_read ? 0 : 1)),
            starred: Math.max(0, s.starred - (message.is_starred ? 1 : 0)),
          }));
          setPagination((p) => ({ ...p, total: Math.max(0, p.total - 1) }));
          notify(true, "Message deleted");
        } catch (err) {
          notify(false, err.message);
        }
      },
      {
        title: `Delete the message from ${displayName(message)}?`,
        confirmText: "Delete",
      },
    );

  const markAll = async () => {
    try {
      await markAllContactMessagesRead();
      setMessages((prev) =>
        filter === "unread" ? [] : prev.map((m) => ({ ...m, is_read: 1 })),
      );
      setStats((s) => ({ ...s, unread: 0 }));
      notify(true, "All messages marked as read");
    } catch (err) {
      notify(false, err.message);
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
        setMessages((prev) =>
          prev.some((m) => m.id === message.id) ? prev : [message, ...prev],
        );
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
      notify(true, `New message from ${displayName(message)}`);
    };

    // Changes made by any admin (including this tab) — apply idempotently
    const onChanged = (e) => {
      if (!e) return;
      if (typeof e.unread === "number")
        setStats((s) => ({ ...s, unread: e.unread }));
      const id = e.id;
      if (e.action === "read-all")
        setMessages((prev) => prev.map((m) => ({ ...m, is_read: 1 })));
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
  }, [socket, filter, search, notify]);

  /* ---- keyboard navigation on the list ---- */
  const onListKey = (e) => {
    if (!["ArrowDown", "ArrowUp"].includes(e.key) || !messages.length) return;
    e.preventDefault();
    const idx = messages.findIndex((m) => m.id === selectedId);
    const nextIdx =
      e.key === "ArrowDown"
        ? Math.min(messages.length - 1, idx + 1)
        : Math.max(0, idx - 1);
    const next = messages[idx === -1 ? 0 : nextIdx];
    open(next);
    listRef.current
      ?.querySelector(`[data-id="${next.id}"]`)
      ?.scrollIntoView({ block: "nearest" });
  };

  /* ---- grouped list ---- */
  const groups = useMemo(() => groupByDay(messages), [messages]);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        {switcher && <div className={styles.heroSwitch}>{switcher}</div>}
        <div className={styles.heroText}>
          <span className={styles.heroEyebrow}>
            <i className="bi bi-globe2" /> Website contact form
          </span>
          <h1>Messages</h1>
          <p>
            Inquiries sent by visitors from your public website — read, reply
            and follow up in one place.
          </p>
        </div>
        <div className={styles.heroActions}>
          <span className={`${styles.live} ${socket ? styles.liveOn : ""}`}>
            <span className={styles.liveDot} />
            {socket ? "Live" : "Offline"}
          </span>
          <button
            type="button"
            className={styles.heroBtn}
            onClick={() => load({ quiet: true })}
            title="Refresh"
          >
            <i className="bi bi-arrow-clockwise" />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className={`${styles.heroBtn} ${styles.heroBtnSolid}`}
            onClick={markAll}
            disabled={!stats.unread}
          >
            <i className="bi bi-check2-all" />
            <span>Mark all read</span>
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.stats}>
        <StatCard
          icon="bi-inbox"
          label="Total messages"
          value={stats.total}
          tone="violet"
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <StatCard
          icon="bi-envelope-exclamation"
          label="Unread"
          value={stats.unread}
          tone="rose"
          active={filter === "unread"}
          onClick={() => setFilter("unread")}
          hint={stats.unread ? "Needs attention" : "All caught up"}
        />
        <StatCard
          icon="bi-star"
          label="Starred"
          value={stats.starred}
          tone="amber"
          active={filter === "starred"}
          onClick={() => setFilter("starred")}
        />
        <StatCard
          icon="bi-lightning-charge"
          label="Today"
          value={stats.today}
          tone="cyan"
          hint={`${stats.last_7_days} this week`}
        />
      </section>

      {/* Inbox */}
      <section
        className={`${styles.shell} ${mobileDetail ? styles.showDetail : ""}`}
      >
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
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  aria-label="Clear search"
                >
                  <i className="bi bi-x-lg" />
                </button>
              )}
            </label>
            <div
              className={styles.filters}
              role="tablist"
              aria-label="Filter messages"
            >
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
              <button
                type="button"
                className={styles.retry}
                onClick={() => load()}
              >
                <i className="bi bi-arrow-clockwise" /> Retry
              </button>
            </div>
          )}

          {status === "ready" && messages.length === 0 && (
            <EmptyList filter={filter} search={search} />
          )}

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
                                <span className={styles.rowName}>
                                  {displayName(m)}
                                </span>
                                <span className={styles.rowTime}>
                                  {listTime(m.created_at)}
                                </span>
                              </span>
                              <span className={styles.rowPhone} dir="ltr">
                                {m.phone}
                              </span>
                              <span className={styles.rowPreview} dir="auto">
                                {m.message}
                              </span>
                            </span>
                            <span className={styles.rowFlags}>
                              {!m.is_read && (
                                <span
                                  className={styles.unreadDot}
                                  title="Unread"
                                />
                              )}
                              {Boolean(m.is_starred) && (
                                <i
                                  className={`bi bi-star-fill ${styles.rowStar}`}
                                  title="Starred"
                                />
                              )}
                              {fresh.has(m.id) && (
                                <span className={styles.newTag}>New</span>
                              )}
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
                    onClick={() =>
                      load({ page: pagination.page + 1, append: true })
                    }
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
