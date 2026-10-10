import styles from "../Inbox/Inbox.module.css";

/* Building blocks shared by the Messages and Notifications inboxes */

export function StatCard({ icon, label, value, tone, active, onClick, hint }) {
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

export function ListSkeleton() {
  return (
    <ul className={styles.list} aria-busy="true">
      {Array.from({ length: 6 }, (_, i) => (
        <li key={i} className={styles.skelRow}>
          <span className={`${styles.skel} ${styles.skelAvatar}`} />
          <span className={styles.skelLines}>
            <span
              className={`${styles.skel} ${styles.skelLine}`}
              style={{ width: "45%" }}
            />
            <span
              className={`${styles.skel} ${styles.skelLine}`}
              style={{ width: "90%" }}
            />
            <span
              className={`${styles.skel} ${styles.skelLine}`}
              style={{ width: "70%" }}
            />
          </span>
        </li>
      ))}
    </ul>
  );
}
