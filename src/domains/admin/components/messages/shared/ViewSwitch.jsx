import styles from "./ViewSwitch.module.css";

/* Segmented switch shown in the Messages page header:
   Website messages ⇄ Notifications */
function ViewSwitch({ value, onChange, options }) {
  return (
    <div className={styles.switch} role="tablist" aria-label="Choose inbox">
      <span
        className={styles.thumb}
        style={{
          width: `calc((100% - 8px) / ${options.length})`,
          transform: `translateX(${options.findIndex((o) => o.key === value) * 100}%)`,
        }}
        aria-hidden="true"
      />
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          role="tab"
          aria-selected={value === o.key}
          className={`${styles.option} ${value === o.key ? styles.on : ""}`}
          onClick={() => onChange(o.key)}
        >
          <i className={`bi ${o.icon}`} />
          <span className={styles.label}>{o.label}</span>
          {o.short && <span className={styles.short}>{o.short}</span>}
          {o.count > 0 && <span className={styles.count}>{o.count > 99 ? "99+" : o.count}</span>}
        </button>
      ))}
    </div>
  );
}

export default ViewSwitch;
