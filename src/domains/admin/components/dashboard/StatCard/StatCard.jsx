import { useEffect, useRef, useState } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import styles from "./StatCard.module.css";

const GRADIENTS = {
  cyan: "linear-gradient(135deg, #06b6d4, #3b82f6)",
  purple: "linear-gradient(135deg, #8b5cf6, #6366f1)",
  pink: "linear-gradient(135deg, #ec4899, #8b5cf6)",
  blue: "linear-gradient(135deg, #3b82f6, #06b6d4)",
};

const StatCard = ({
  icon,
  label,
  value,
  delta,
  gradient = "cyan",
  sparkline = [],
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const startRef = useRef(null);
  const frameRef = useRef(null);

  // Animate the number from 0 to `value` on mount
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      setAnimatedValue(value);
      return;
    }

    const duration = 900;
    startRef.current = null;

    const step = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setAnimatedValue(Math.round(eased * value));

      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value]);

  const isPositive = delta >= 0;
  const chartData = sparkline.map((v, i) => ({ i, v }));

  return (
    <div className={`card border-0 shadow-sm h-100 ${styles.statCard}`}>
      <div className="card-body d-flex flex-column">
        <div className="d-flex align-items-start justify-content-between mb-3">
          <div
            className={styles.iconBadge}
            style={{ background: GRADIENTS[gradient] }}
          >
            <i className={`bi ${icon}`} />
          </div>

          <span
            className={`${styles.deltaBadge} ${
              isPositive ? styles.deltaUp : styles.deltaDown
            }`}
          >
            <i
              className={`bi ${isPositive ? "bi-arrow-up-short" : "bi-arrow-down-short"}`}
            />
            {Math.abs(delta)}%
          </span>
        </div>

        <div className={styles.value}>{animatedValue.toLocaleString()}</div>
        <div className={styles.label}>{label}</div>

        {chartData.length > 0 && (
          <div className={styles.sparkline}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id={`spark-${label}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill={`url(#spark-${label})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
