// Month-week helpers shared by the dashboard filter and header.
// Weeks are CONSTANT 7-day blocks inside a month - how the offices
// actually talk about weekly reports:
//   Week 1 = days 1-7, Week 2 = 8-14, Week 3 = 15-21,
//   Week 4 = 22-end of month (absorbs the 29th/30th/31st).
// Must stay in sync with monthWeekRange() in the backend service.

// The constant month weeks for the filter dropdown.
export const MONTH_WEEKS = [
  { value: 1, label: "Week 1 (1 – 7)" },
  { value: 2, label: "Week 2 (8 – 14)" },
  { value: 3, label: "Week 3 (15 – 21)" },
  { value: 4, label: "Week 4 (22 – end of month)" },
];

// Which constant week "today" falls in (defaults for the filter).
export const getCurrentMonthWeek = (date = new Date()) =>
  Math.min(4, Math.ceil(date.getDate() / 7));

// "Sep 1 – Sep 7" (or "Sep 22 – Sep 30" for week 4) for the header.
export const monthWeekLabel = (year, month, week) => {
  const safeYear = Number(year) || new Date().getFullYear();
  const safeMonth = Math.min(Math.max(Number(month) || 1, 1), 12);
  const safeWeek = Math.min(Math.max(Number(week) || 1, 1), 4);

  const lastDay = new Date(Date.UTC(safeYear, safeMonth, 0)).getUTCDate();
  const startDay = (safeWeek - 1) * 7 + 1;
  const endDay = safeWeek === 4 ? lastDay : Math.min(safeWeek * 7, lastDay);

  const fmt = (day) =>
    new Date(Date.UTC(safeYear, safeMonth - 1, day)).toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric", timeZone: "UTC" },
    );

  return `${fmt(startDay)} – ${fmt(endDay)}`;
};
