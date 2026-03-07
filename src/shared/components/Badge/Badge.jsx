import React, { useMemo } from "react";

// Define text color mappings for non-solid badges
const TEXT_COLORS = {
  green: "text-success border-success",
  blue: "text-primary border-primary",
  yellow: "text-warning border-warning",
  red: "text-danger border-danger",
  cyan: "text-info border-info",
  gray: "text-muted border-secondary",
  dark: "text-dark border-dark",
  purple: "text-secondary border-secondary",
};

// Define background color mappings for solid badges
const BG_COLORS = {
  green: "bg-success text-white border-success",
  blue: "bg-primary text-white border-primary",
  yellow: "bg-warning text-dark border-warning",
  red: "bg-danger text-white border-danger",
  gray: "bg-secondary text-white border-secondary",
  dark: "bg-dark text-white border-dark",
  cyan: "bg-info text-white border-info",
};

//
const Badge = ({ content, color = "gray", solid = false, onDelete }) => {
  const badgeClass = useMemo(() => {
    const activeMap = solid ? BG_COLORS : TEXT_COLORS;
    return activeMap[color] || activeMap.gray;
  }, [color, solid]);

  const displayContent = content ? String(content).toUpperCase() : "—";

  // Determine close button color based on badge style
  const closeBtnColor = solid ? "inherit" : "text-danger";

  return (
    <span
      className={`badge border fw-semibold d-inline-flex align-items-center ${badgeClass}`}
      style={{
        gap: "4px",
        paddingRight: onDelete ? "4px" : "8px",
        verticalAlign: "middle",
      }}
    >
      {displayContent}

      {onDelete && (
        <button
          type="button"
          className={`btn p-0 d-flex align-items-center justify-content-center ${closeBtnColor}`}
          style={{
            width: "14px",
            height: "14px",
            fontSize: "16px",
            lineHeight: "0",
            border: "none",
            background: "transparent",
            color: "currentColor",
            paddingBottom: "2px", 
            outline: "none",
            boxShadow: "none",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          &times;
        </button>
      )}
    </span>
  );
};

export default Badge;
