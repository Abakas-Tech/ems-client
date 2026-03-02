import { useState, useEffect } from "react";

// Helper to format numbers (1000 -> 1K, 1000000 -> 1M)
const formatNumber = (num) => {
  if (num >= 1000000)
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return num;
};

const StatCard = ({ title, value, icon, colorClass }) => {
  const [displayValue, setDisplayValue] = useState(0);

  // Animated Counter Logic
  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (start === end) return;

    let timer = setInterval(() => {
      start += Math.ceil(end / 20); // Increment speed
      if (start >= end) {
        clearInterval(timer);
        setDisplayValue(end);
      } else {
        setDisplayValue(start);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="col-lg-3 col-md-6 col-sm-12 mb-4">
      <div className={`stat-card-v2 ${colorClass}`}>
        <div className="stat-card-body">
          <div className="stat-info">
            <h3 className="fw-bold mb-0">{formatNumber(displayValue) || 0}</h3>
            <p className="text-muted small fw-bold text-uppercase mb-0">
              {title}
            </p>
          </div>
          <div className="stat-icon-circle">
            <i className={icon}></i>
          </div>
        </div>
        {/* Full square decorative border/accent */}
        <div className="stat-border-line"></div>
      </div>
    </div>
  );
};

export default StatCard;
