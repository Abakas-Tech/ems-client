import { differenceInCalendarDays, format, isToday, isYesterday } from "date-fns";

/* Date helpers shared by the Messages and Notifications inboxes */

export const toDate = (value) => (value ? new Date(value) : null);

export const listTime = (value) => {
  const d = toDate(value);
  if (!d) return "";
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return "Yesterday";
  if (differenceInCalendarDays(new Date(), d) < 7) return format(d, "EEE");
  return format(d, "d MMM");
};

export const groupLabel = (value) => {
  const d = toDate(value);
  if (!d) return "Earlier";
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  if (differenceInCalendarDays(new Date(), d) < 7) return "This week";
  return "Earlier";
};

/* Group items (newest first) into Today / Yesterday / This week / Earlier */
export const groupByDay = (items) => {
  const out = [];
  items.forEach((item) => {
    const label = groupLabel(item.created_at);
    const last = out[out.length - 1];
    if (last && last.label === label) last.items.push(item);
    else out.push({ label, items: [item] });
  });
  return out;
};
