import { PROMISE_TICKER } from "../../data/content";
import styles from "./PromiseTicker.module.css";

/* Slow, endless strip of the agency's promises between hero and content. */
function PromiseTicker() {
  const items = [...PROMISE_TICKER, ...PROMISE_TICKER];
  return (
    <div className={styles.band}>
      <ul className={styles.srOnly}>
        {PROMISE_TICKER.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <div className={styles.track} aria-hidden="true">
        {items.map((p, i) => (
          <span className={styles.item} key={`${p}-${i}`}>
            <span className={styles.star}>✦</span>
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}

export default PromiseTicker;
