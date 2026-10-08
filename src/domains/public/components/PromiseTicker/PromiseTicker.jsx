import { useTranslation } from "react-i18next";
import styles from "./PromiseTicker.module.css";

/* Slow, endless strip of the agency's promises between hero and content. */
function PromiseTicker() {
  const { t } = useTranslation();
  const PROMISE_TICKER = t("ticker");
  const items = [...PROMISE_TICKER, ...PROMISE_TICKER];
  return (
    <div className={styles.band} dir="ltr">
      <ul className={styles.srOnly}>
        {PROMISE_TICKER.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <div className={styles.track} aria-hidden="true">
        {items.map((p, i) => (
          <span className={styles.item} key={`${p}-${i}`} dir="auto">
            <span className={styles.star}>✦</span>
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}

export default PromiseTicker;
