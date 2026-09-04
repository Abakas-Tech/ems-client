import { useState, useEffect } from "react";
import styles from "./StatCard.module.css";

// Helper to format numbers (1000 -> 1K, 1000000 -> 1M)
const formatNumber = (num) => {
  if (num >= 1000000)
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return num;
};

// Column classes per card size. "default" keeps the original dashboard
// proportions. "cv" is for the per-office report cards: 4 per row on
// large, 3 on medium, 2 on small phones - wide enough for the breakdown
// row, never as cramped as 6-per-row. "compact" is kept for compatibility.
const COLUMN_CLASSES = {
  default: "col-lg-3 col-md-6 col-sm-12",
  cv: "col-lg-3 col-md-4 col-sm-6",
  compact: "col-lg-2 col-md-4 col-sm-6",
};

const StatCard = ({
  title,
  value,
  icon,
  colorClass,
  subtitle,
  details,
  size = "default",
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const targetValue = parseInt(value) || 0;

    // If the displayed value is already what we want, do nothing
    if (displayValue === targetValue) return;

    // Animation speed settings
    const duration = 500; // ms
    const frameRate = 30; // ms
    const totalFrames = duration / frameRate;

    // Calculate how much to change per frame
    const increment = (targetValue - displayValue) / totalFrames;

    let current = displayValue;
    const timer = setInterval(() => {
      current += increment;

      // Check if we've reached or passed the target
      if (
        (increment > 0 && current >= targetValue) ||
        (increment < 0 && current <= targetValue) ||
        increment === 0
      ) {
        clearInterval(timer);
        setDisplayValue(targetValue);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [value]); // Note: displayValue is omitted here to prevent infinite loops

  const total = Number(value) || 0;

  return (
    <div className={`${COLUMN_CLASSES[size] || COLUMN_CLASSES.default} mb-4`}>
      <div
        className={`stat-card-v2 ${colorClass} ${
          size === "cv" ? styles.cvCard : ""
        }`}
      >
        <div className="stat-card-body">
          <div className="stat-info">
            {/* Added || 0 just in case to prevent empty h3 */}
            <h3 className="fw-bold mb-0">{formatNumber(displayValue)}</h3>
            <p className="text-muted small fw-bold text-uppercase mb-0">
              {title}
            </p>
            {/* Optional secondary line. Existing usages that pass nothing
                are unaffected. */}
            {subtitle ? (
              <p className="text-muted small mb-0">{subtitle}</p>
            ) : null}

            {/* Structured breakdown (e.g. inexperienced / experienced) -
                colored dot + bold number + small label per item, instead
                of one cramped subtitle line. */}
            {details && details.length > 0 ? (
              <div className={styles.detailsRow}>
                {details.map((detail, index) => (
                  <span
                    key={detail.label}
                    className={styles.detailItem}
                    title={`${detail.label}: ${detail.value}`}
                  >
                    <span
                      className={`${styles.dot} ${
                        index % 2 === 0 ? styles.dotBlue : styles.dotGold
                      }`}
                    />
                    <span className={styles.detailValue}>
                      {formatNumber(Number(detail.value) || 0)}
                    </span>
                    <span className={styles.detailLabel}>{detail.label}</span>
                  </span>
                ))}
              </div>
            ) : null}

            {/* Slim proportion bar when the breakdown has exactly two
                    parts (bar only makes sense with a non-zero total). */}
            {details && details.length === 2 && total > 0 ? (
              <div
                className={styles.splitNew}
                style={{
                  width: `${((Number(details[0].value) || 0) / total) * 100}%`,
                }}
              />
            ) : null}
          </div>
          <div className="stat-icon-circle">
            <i className={icon}></i>
          </div>
        </div>
        <div className="stat-border-line"></div>
      </div>
    </div>
  );
};

export default StatCard;
