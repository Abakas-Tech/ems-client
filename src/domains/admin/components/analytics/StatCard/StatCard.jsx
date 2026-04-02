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

  return (
    <div className="col-lg-3 col-md-6 col-sm-12 mb-4">
      <div className={`stat-card-v2 ${colorClass}`}>
        <div className="stat-card-body">
          <div className="stat-info">
            {/* Added || 0 just in case to prevent empty h3 */}
            <h3 className="fw-bold mb-0">{formatNumber(displayValue)}</h3>
            <p className="text-muted small fw-bold text-uppercase mb-0">
              {title}
            </p>
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
