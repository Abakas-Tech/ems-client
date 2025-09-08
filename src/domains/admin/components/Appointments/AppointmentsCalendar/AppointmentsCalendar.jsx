import React, { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import styles from "./AppointmentsCalendar.module.css";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const statusColor = (status) => {
  switch (status) {
    case "confirmed":
      return "#198754"; // green
    case "cancelled":
      return "#dc3545"; // red
    default:
      return "#0d6efd"; // blue (pending/other)
  }
};

const AppointmentsCalendar = ({ events = [], onSelectEvent }) => {
  const [view, setView] = useState(Views.MONTH); // Default to Month view
  const [date, setDate] = useState(new Date()); // Current calendar date

  const mappedEvents = useMemo(
    () =>
      events.map((a) => ({
        id: a.id,
        title: a.title,
        start: new Date(a.start_time),
        end: new Date(a.end_time),
        resource: a,
        allDay: false,
      })),
    [events]
  );

  return (
    <div className={`${styles.calendarContainer} card shadow-sm py-4 px-0`}>
      <Calendar
        localizer={localizer}
        events={mappedEvents}
        startAccessor="start"
        endAccessor="end"
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        className={styles.calendar}
        popup
        onSelectEvent={(evt) => onSelectEvent?.(evt.resource)}
        eventPropGetter={(event) => {
          const bg = statusColor(event.resource?.status);
          return {
            style: {
              backgroundColor: bg,
              borderColor: bg,
              color: "#fff",
              cursor: "pointer", // Pointer cursor for clickable events
            },
          };
        }}
        tooltipAccessor={(e) =>
          `${e.title}\n${new Date(e.start).toLocaleString()} → ${new Date(
            e.end
          ).toLocaleString()}`
        }
      />
    </div>
  );
};

export default AppointmentsCalendar;
