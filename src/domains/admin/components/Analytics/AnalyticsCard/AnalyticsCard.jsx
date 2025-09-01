import React from "react";
import PropTypes from "prop-types";
import styles from "./AnalyticsCard.module.css";

const AnalyticsCard = ({ title, count, lastAction, icon: Icon, onClick }) => {
  return (
    <div
      role="button"
      tabIndex={0}
      className={`card shadow-sm h-100 ${styles.analyticsCard}`}
      onClick={() => onClick?.(title.toLowerCase())}
      onKeyDown={(e) => e.key === "Enter" && onClick?.(title.toLowerCase())}
    >
      <div className="card-body d-flex align-items-center p-4">
        {/* Icon */}
        <div className={`${styles.iconWrapper} me-4 `}>
          {Icon && <Icon size={32} className="text-primary" />}{" "}
          {/* 👈 dynamic icon */}
        </div>

        {/* Text */}
        <div className="flex-grow-1 ">
          <h6 className="text-muted mb-1">{title}</h6>
          <h3 className="fw-bold mb-1 text-primary">{count || 0}</h3>
          <small className="text-muted">
            Last {title.toLowerCase()}:{" "}
            {lastAction ? new Date(lastAction).toLocaleDateString() : "N/A"}
          </small>
        </div>
      </div>
    </div>
  );
};

AnalyticsCard.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.number,
  lastAction: PropTypes.string,
  icon: PropTypes.elementType, // 👈 now expects a component, not string
  onClick: PropTypes.func,
};

export default AnalyticsCard;
