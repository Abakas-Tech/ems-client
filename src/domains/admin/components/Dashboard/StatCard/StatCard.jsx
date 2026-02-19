// components/Dashboard/StatCard.jsx
import React from "react";

const StatCard = ({ title, value, icon, colorClass, prefix = "" }) => {
  return (
    <div className="col-lg-3 col-md-6 col-sm-12 mb-4">
      <div className={`dashboard-stat ${colorClass}`}>
        <div className="dashboard-stat-content">
          <h4>
            {prefix}
            {typeof value === "number" ? value.toLocaleString() : value}
          </h4>
          <span>{title}</span>
        </div>
        <div className="dashboard-stat-icon">
          <i className={icon}></i>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
