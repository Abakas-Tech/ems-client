import React, { useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

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
    <div className="card shadow-sm p-3" style={{ height: 600 }}>
      <Calendar
        localizer={localizer}
        events={mappedEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 540 }}
        popup
        onSelectEvent={(evt) => onSelectEvent?.(evt.resource)}
        eventPropGetter={(event) => {
          const bg = statusColor(event.resource?.status);
          return {
            style: {
              backgroundColor: bg,
              borderColor: bg,
              color: "#fff",
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
