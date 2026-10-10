import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import useProfile from "../../../../context/Profile/useProfile";
import BackButton from "../../../../shared/components/BackButton/BackButton";
import { matchesAccessRule } from "../../../../utils/menuAccess";
import MANUAL_MODULES, { MANUAL_GROUPS } from "./manualContent";
import MANUAL_SHOTS from "./manualShots";
import styles from "./UserManual.module.css";

const ROLE_NAMES = { 1: "Admin", 2: "Staff", 3: "Partner" };

// --- helpers ---------------------------------------------------------------

const normalize = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

// Modules and topics the logged-in user may read: a topic is kept only when
// its module rule and its own rule both pass (same rules as the sidebar).
const useVisibleModules = (profile) =>
  useMemo(() => {
    if (!profile?.role_id) return [];
    return MANUAL_MODULES.filter((m) => matchesAccessRule(profile, m.access))
      .map((m) => ({
        ...m,
        topics: m.topics.filter((t) => matchesAccessRule(profile, t.access)),
      }))
      .filter((m) => m.topics.length > 0);
  }, [profile]);

// Simple word search: every typed word must appear somewhere in the topic.
// Titles and keywords weigh more than step text.
const searchTopics = (modules, query) => {
  const words = normalize(query).split(" ").filter(Boolean);
  if (!words.length) return [];
  const results = [];
  modules.forEach((module) => {
    module.topics.forEach((topic) => {
      const fields = {
        title: normalize(`${topic.title} ${module.title}`),
        keywords: normalize((topic.keywords || []).join(" ")),
        body: normalize(
          [
            topic.summary,
            topic.where,
            ...(topic.steps || []),
            ...(topic.notes || []).map((n) => n.text),
          ].join(" "),
        ),
      };
      let score = 0;
      for (const word of words) {
        const inTitle = fields.title.includes(word);
        const inKeywords = fields.keywords.includes(word);
        const inBody = fields.body.includes(word);
        if (!inTitle && !inKeywords && !inBody) return;
        score += (inTitle ? 4 : 0) + (inKeywords ? 2 : 0) + (inBody ? 1 : 0);
      }
      results.push({ module, topic, score });
    });
  });
  return results.sort((a, b) => b.score - a.score);
};

const Highlight = ({ text, query }) => {
  const words = normalize(query)
    .split(" ")
    .filter((w) => w.length > 1);
  if (!words.length) return text;
  const pattern = new RegExp(
    `(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi",
  );
  return String(text)
    .split(pattern)
    .map((part, i) =>
      i % 2 === 1 ? (
        <mark key={i} className={styles.mark}>
          {part}
        </mark>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      ),
    );
};

// --- pieces ----------------------------------------------------------------

const Screenshot = ({ shot, onZoom }) => {
  const size = MANUAL_SHOTS[shot.id];
  if (!size) return null;
  const src = `/user-manual/${shot.id}.webp`;
  return (
    <figure
      className={`${styles.figure} ${shot.mobile ? styles.figureMobile : ""}`}
    >
      <button
        type="button"
        className={styles.shotButton}
        onClick={() => onZoom({ ...shot, src, ...size })}
        aria-label={`Enlarge screenshot: ${shot.caption}`}
      >
        <img
          src={src}
          alt={shot.caption}
          width={size.w}
          height={size.h}
          loading="lazy"
          decoding="async"
          className={styles.shot}
        />
        <span className={styles.zoomHint}>
          <i className="bi bi-arrows-fullscreen" /> Bigger
        </span>
      </button>
      <figcaption className={styles.caption}>{shot.caption}</figcaption>
    </figure>
  );
};

const Note = ({ note }) => (
  <div
    className={`${styles.note} ${note.type === "warning" ? styles.noteWarning : styles.noteTip}`}
    role="note"
  >
    <i
      className={`bi ${note.type === "warning" ? "bi-exclamation-triangle-fill" : "bi-lightbulb-fill"}`}
    />
    <div>
      <strong>{note.type === "warning" ? "Be careful: " : "Tip: "}</strong>
      {note.text}
    </div>
  </div>
);

const Topic = ({ topic, onZoom }) => (
  <article id={`topic-${topic.id}`} className={styles.topic}>
    <h3 className={styles.topicTitle}>{topic.title}</h3>
    <p className={styles.topicSummary}>{topic.summary}</p>

    {topic.where && (
      <div className={styles.where}>
        <i className="bi bi-signpost-split" />
        <span>
          <span className={styles.whereLabel}>Where:</span> {topic.where}
        </span>
      </div>
    )}

    {topic.flow && (
      <div className={styles.flow} aria-label="Steps in order">
        {topic.flow.map((step, i) => (
          <Fragment key={step}>
            <span className={styles.flowStep}>
              <span className={styles.flowNum}>{i + 1}</span>
              {step}
            </span>
            {i < topic.flow.length - 1 && (
              <i className={`bi bi-arrow-right ${styles.flowArrow}`} />
            )}
          </Fragment>
        ))}
      </div>
    )}

    <ol className={styles.steps}>
      {topic.steps.map((step, i) => (
        <li key={i}>{step}</li>
      ))}
    </ol>

    {topic.shots?.length > 0 && (
      <div className={styles.shots}>
        {topic.shots.map((shot) => (
          <Screenshot key={shot.id} shot={shot} onZoom={onZoom} />
        ))}
      </div>
    )}

    {topic.notes?.map((note, i) => (
      <Note key={i} note={note} />
    ))}
  </article>
);

// --- page ------------------------------------------------------------------

const UserManual = () => {
  const { profile } = useProfile();
  const modules = useVisibleModules(profile);
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [zoom, setZoom] = useState(null);

  // Large screens: the Toolkit is pinned (position: fixed) on the right,
  // lined up with its grid column — same approach as the Worker form's
  // section tree. The column is re-measured whenever it moves or resizes
  // (window resize, sidebar collapse), so the panel never drifts.
  const DESKTOP_QUERY = "(min-width: 992px)";
  const [isDesktop, setIsDesktop] = useState(
    () =>
      typeof window !== "undefined" && window.matchMedia(DESKTOP_QUERY).matches,
  );
  const toolkitColRef = useRef(null);
  const menuScrollRef = useRef(null);
  const [toolkitRect, setToolkitRect] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => setIsDesktop(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!isDesktop || !toolkitColRef.current) return undefined;
    const col = toolkitColRef.current;
    const measure = () => {
      const rect = col.getBoundingClientRect();
      setToolkitRect({ left: rect.left, width: rect.width });
    };
    requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    let observer = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(measure);
      observer.observe(col);
      if (col.parentElement) observer.observe(col.parentElement);
    }
    return () => {
      window.removeEventListener("resize", measure);
      observer?.disconnect();
    };
  }, [isDesktop]);

  const moduleId = searchParams.get("module");
  const topicId = searchParams.get("topic");
  const activeModule = modules.find((m) => m.id === moduleId) || null;

  const groups = MANUAL_GROUPS.filter((g) =>
    modules.some((m) => m.group === g.key),
  );
  const groupModules =
    group === "all" ? modules : modules.filter((m) => m.group === group);
  const results = useMemo(
    () => (query.trim() ? searchTopics(groupModules, query) : []),
    [groupModules, query],
  );
  const searching = query.trim().length > 0;

  const open = (nextModuleId, nextTopicId) => {
    const params = {};
    if (nextModuleId) params.module = nextModuleId;
    if (nextTopicId) params.topic = nextTopicId;
    setSearchParams(params);
    setQuery("");
    setMenuOpen(false);
  };

  // Scroll to the chosen topic, or back to the top when a module or the
  // overview opens. A deep link (?topic=…) scrolls on first load too; a
  // plain first load stays where the browser put it.
  const firstRender = useRef(true);
  useEffect(() => {
    const isFirst = firstRender.current;
    firstRender.current = false;
    if (searching || !profile) return;
    if (topicId) {
      requestAnimationFrame(() =>
        document.getElementById(`topic-${topicId}`)?.scrollIntoView({
          behavior: isFirst ? "auto" : "smooth",
          block: "start",
        }),
      );
    } else if (!isFirst) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [moduleId, topicId, searching, profile]);

  // Keep the open module visible inside the Toolkit's menu scroller.
  useEffect(() => {
    const box = menuScrollRef.current;
    const item = box?.querySelector('[aria-current="page"]');
    if (!box || !item) return;
    const top = item.offsetTop - box.offsetTop;
    if (top < box.scrollTop || top > box.scrollTop + box.clientHeight - 60) {
      box.scrollTo({ top: Math.max(0, top - 12), behavior: "smooth" });
    }
  }, [moduleId]);

  // Keep the group chip in step with the open module.
  useEffect(() => {
    if (activeModule && group !== "all" && activeModule.group !== group) {
      setGroup(activeModule.group);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModule?.id]);

  const moduleIndex = activeModule ? modules.indexOf(activeModule) : -1;
  const prevModule = moduleIndex > 0 ? modules[moduleIndex - 1] : null;
  const nextModule =
    moduleIndex >= 0 && moduleIndex < modules.length - 1
      ? modules[moduleIndex + 1]
      : null;
  const topicCount = modules.reduce((sum, m) => sum + m.topics.length, 0);

  // ---- main column content ----
  const renderHome = () => (
    <>
      <div className={styles.welcome}>
        <div className={styles.welcomeIcon}>
          <i className="bi bi-journal-bookmark" />
        </div>
        <div>
          <h3 className={styles.welcomeTitle}>
            Welcome
            {profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
          </h3>
          <p className="text-muted mb-0">
            This manual shows the {topicCount} topics you can use as{" "}
            <strong>{ROLE_NAMES[profile?.role_id] || "user"}</strong>. Pick a
            part below, or use Search in the Toolkit.
          </p>
        </div>
      </div>

      <div className="row g-3">
        {groupModules.map((m) => (
          <div key={m.id} className="col-12 col-md-6 col-xxl-4">
            <button
              type="button"
              className={styles.moduleCard}
              onClick={() => open(m.id)}
            >
              <span className={styles.moduleCardIcon}>
                <i className={`bi ${m.icon}`} />
              </span>
              <span className="d-block">
                <span className={styles.moduleCardTitle}>{m.title}</span>
                <span className={styles.moduleCardText}>{m.summary}</span>
                <span className={styles.moduleCardCount}>
                  {m.topics.length} {m.topics.length === 1 ? "topic" : "topics"}
                </span>
              </span>
            </button>
          </div>
        ))}
      </div>
    </>
  );

  const renderResults = () => (
    <>
      <p className={styles.resultCount} aria-live="polite">
        {results.length} {results.length === 1 ? "result" : "results"} for “
        {query.trim()}”
      </p>
      {results.length === 0 ? (
        <div className={styles.empty}>
          <i className="bi bi-search" />
          <p className="fw-semibold mb-1">Nothing found</p>
          <p className="text-muted small mb-3">
            Try another word, for example “invoice”, “passport” or “password”.
          </p>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => {
              setQuery("");
              setGroup("all");
            }}
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {results.map(({ module, topic }) => (
            <button
              key={`${module.id}-${topic.id}`}
              type="button"
              className={styles.result}
              onClick={() => open(module.id, topic.id)}
            >
              <span className={styles.resultModule}>
                <i className={`bi ${module.icon}`} /> {module.title}
              </span>
              <span className={styles.resultTitle}>
                <Highlight text={topic.title} query={query} />
              </span>
              <span className={styles.resultText}>
                <Highlight text={topic.summary} query={query} />
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  );

  const renderModule = () => (
    <>
      <div className={styles.crumbs} role="navigation" aria-label="Breadcrumb">
        <button type="button" onClick={() => open(null)}>
          User Manual
        </button>
        <i className="bi bi-chevron-right" />
        <span>{activeModule.title}</span>
      </div>

      <header className={styles.moduleHeader}>
        <span className={styles.moduleHeaderIcon}>
          <i className={`bi ${activeModule.icon}`} />
        </span>
        <div>
          <h3 className={styles.moduleTitle}>{activeModule.title}</h3>
          <p className="text-muted mb-0">{activeModule.summary}</p>
        </div>
      </header>

      {activeModule.topics.map((topic) => (
        <Topic key={topic.id} topic={topic} onZoom={setZoom} />
      ))}

      <div className={styles.pager}>
        {prevModule ? (
          <button
            type="button"
            className={styles.pagerBtn}
            onClick={() => open(prevModule.id)}
          >
            <i className="bi bi-arrow-left" />
            <span>
              <small>Back</small>
              {prevModule.title}
            </span>
          </button>
        ) : (
          <span />
        )}
        {nextModule && (
          <button
            type="button"
            className={`${styles.pagerBtn} ${styles.pagerNext}`}
            onClick={() => open(nextModule.id)}
          >
            <span>
              <small>Next</small>
              {nextModule.title}
            </span>
            <i className="bi bi-arrow-right" />
          </button>
        )}
      </div>
    </>
  );

  // ---- toolkit (right side on desktop, top on phones) ----
  const renderToolkit = () => (
    <aside
      className={`${styles.toolkit} ${isDesktop ? styles.toolkitFixed : ""}`}
      style={
        isDesktop && toolkitRect.width
          ? { left: toolkitRect.left, width: toolkitRect.width }
          : undefined
      }
      aria-label="Manual toolkit"
    >
      <div className={styles.toolkitHead}>
        <h6 className={styles.toolkitTitle}>Toolkit</h6>

        <label htmlFor="manual-search" className={styles.toolkitLabel}>
          Search
        </label>
        <div className={styles.searchWrap}>
          <i className={`bi bi-search ${styles.searchIcon}`} />
          <input
            id="manual-search"
            type="search"
            className={styles.searchInput}
            placeholder="Page, feature or job…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              className={styles.searchClear}
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <i className="bi bi-x-lg" />
            </button>
          )}
        </div>

        <span className={styles.toolkitLabel}>Show</span>
        <div className={styles.chips} role="group" aria-label="Filter by group">
          {[{ key: "all", label: "All", icon: "bi-grid" }, ...groups].map(
            (g) => (
              <button
                key={g.key}
                type="button"
                className={`${styles.chip} ${group === g.key ? styles.chipActive : ""}`}
                aria-pressed={group === g.key}
                onClick={() => setGroup(g.key)}
              >
                <i className={`bi ${g.icon}`} /> {g.label}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          className={styles.menuToggle}
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="manual-menu"
        >
          <span>
            <i className="bi bi-list-nested me-2" />
            Manual Menu
            {activeModule && (
              <span className={styles.menuToggleCurrent}>
                {" "}
                · {activeModule.title}
              </span>
            )}
          </span>
          <i
            className={`bi ${menuOpen ? "bi-chevron-up" : "bi-chevron-down"}`}
          />
        </button>
      </div>

      <div
        id="manual-menu"
        className={`${styles.menu} ${menuOpen ? styles.menuOpen : ""}`}
      >
        <span className={`${styles.toolkitLabel} ${styles.menuLabel}`}>
          Manual Menu
        </span>
        <div className={styles.menuScroll} ref={menuScrollRef}>
          <ul className={styles.menuList}>
            <li>
              <button
                type="button"
                className={`${styles.menuItem} ${!activeModule && !searching ? styles.menuItemActive : ""}`}
                onClick={() => open(null)}
              >
                <span className={styles.menuIcon}>
                  <i className="bi bi-house" />
                </span>
                Overview
              </button>
            </li>
            {groupModules.map((m) => {
              const isActive = activeModule?.id === m.id && !searching;
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    className={`${styles.menuItem} ${isActive ? styles.menuItemActive : ""}`}
                    onClick={() => open(m.id)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className={styles.menuIcon}>
                      <i className={`bi ${m.icon}`} />
                    </span>
                    <span className="flex-grow-1 text-start">{m.title}</span>
                    <span className={styles.menuCount}>{m.topics.length}</span>
                  </button>
                  {isActive && (
                    <ul className={styles.subList}>
                      {m.topics.map((t) => (
                        <li key={t.id}>
                          <button
                            type="button"
                            className={`${styles.subItem} ${topicId === t.id ? styles.subItemActive : ""}`}
                            onClick={() => open(m.id, t.id)}
                          >
                            {t.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="dashboard-wraper">
      <div className="mb-4">
        {/* Same placement as every other page: top-right of the page card */}
        {(searching || activeModule) && (
          <BackButton
            onClick={() => (searching ? setQuery("") : open(null))}
          />
        )}
        <h2 className="fw-bold text-dark mb-2">User Manual</h2>
        <p className="text-muted mb-0">
          Simple steps and real screenshots for every page you can use.
        </p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-8 col-xl-9 order-2 order-lg-1">
          <div className={styles.main}>
            {modules.length === 0
              ? null
              : searching
                ? renderResults()
                : activeModule
                  ? renderModule()
                  : renderHome()}
          </div>
        </div>
        <div
          ref={toolkitColRef}
          className="col-12 col-lg-4 col-xl-3 order-1 order-lg-2"
        >
          {renderToolkit()}
        </div>
      </div>

      <Modal
        show={!!zoom}
        onHide={() => setZoom(null)}
        size="xl"
        centered
        fullscreen="md-down"
        dialogClassName={styles.zoomDialog}
        contentClassName={styles.zoomContent}
        backdropClassName={styles.zoomBackdrop}
        className={styles.zoomModal}
      >
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-semibold">
            {zoom?.caption}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.zoomBody}>
          {zoom && (
            <img
              src={zoom.src}
              alt={zoom.caption}
              width={zoom.w}
              height={zoom.h}
              className={`${styles.zoomImg} ${zoom.mobile ? styles.zoomImgMobile : ""}`}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default UserManual;
