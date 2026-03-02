const BADGE_COLORS = {
  green: "text-success",
  blue: "text-primary",
  yellow: "text-warning",
  red: "text-danger",
  cyan: "text-info",
  gray: "text-muted",
  dark: "text-dark",
  purple: "text-secondary",
};

const Badge = ({ content = "—", color = "gray" }) => {
  const colorClass = BADGE_COLORS[color] || BADGE_COLORS.gray;

  return (
    <span className={`badge border fw-semibold ${colorClass}`}>
      {String(content).toUpperCase()}
    </span>
  );
};

export default Badge;
