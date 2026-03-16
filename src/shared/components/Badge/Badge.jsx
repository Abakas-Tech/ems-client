import React, { useMemo } from "react";
import styles from "./Badge.module.css";

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

const BG_COLORS = {
  green: "bg-success text-white border-success",
  blue: "bg-primary text-white border-primary",
  yellow: "bg-warning text-dark border-warning",
  red: "bg-danger text-white border-danger",
  gray: "bg-secondary text-white border-secondary",
  dark: "bg-dark text-white border-dark",
  cyan: "bg-info text-white border-info",
};

const Badge = ({ content, color = "gray", solid = false, onDelete }) => {
  const badgeClass = useMemo(() => {
    const activeMap = solid ? BG_COLORS : TEXT_COLORS;
    return activeMap[color] || activeMap.gray;
  }, [color, solid]);

  const displayContent = content ? String(content).toUpperCase() : "—";

  // Combine module classes with Bootstrap utilities
  const containerClasses = [
    "badge",
    "border",
    "fw-semibold",
    styles["badge-container"],
    onDelete ? styles["is-editable"] : "",
    badgeClass,
  ].join(" ");

  return <span className={containerClasses}>{displayContent}</span>;
};

export default Badge;
