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
      return "#0d6efd"; // blue
  }
};

const AppointmentsCalendar = ({ events = [], onSelectEvent }) => {
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);

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

  // Custom Date Cell for small screens (≤576px)
  const DateCellWrapper = ({ value, children }) => {
    const isSmallScreen = window.innerWidth <= 576;
    if (!isSmallScreen) {
      return children; // Large/medium screens: Use default event rendering
    }

    // Small screen: Show appointment count badge
    const dayEvents = mappedEvents.filter(
      (evt) => evt.start.toDateString() === value.toDateString()
    );
    if (dayEvents.length === 0) return children;

    return (
      <div
        style={{
          textAlign: "center",
          cursor: "pointer",
          fontWeight: "bold",
          color: "#fff",
          backgroundColor: "#0d6efd",
          borderRadius: "50%",
          width: "28px",
          height: "28px",
          lineHeight: "28px",
          margin: "0 auto",
          marginTop: "30px",
          marginRight: "14px",

        }}
        onClick={() => setSelectedDayEvents(dayEvents)}
      >
        {dayEvents.length}
      </div>
    );
  };

  // Custom Event Component for large/medium screens
  const EventWrapper = ({ event }) => {
    return (
      <div
        className={styles.eventTitle}
        style={{
          marginTop: "2px",
        }}
      >
        {event.title.length > 12 ? event.title.slice(0, 12) + "…" : event.title}
      </div>
    );
  };

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
        components={{
          dateCellWrapper: DateCellWrapper,
          event: EventWrapper,
        }}
        eventPropGetter={(event) => {
          const bg = statusColor(event.resource?.status);
          return {
            style: {
              backgroundColor: bg,
              borderColor: bg,
              color: "#fff",
              cursor: "pointer",
              borderRadius: "3px",
              padding: "2px 4px",
              fontSize: "0.85rem",
            },
          };
        }}
      />

      {/* Small screen popup with compact event list */}
      {selectedDayEvents && (
        <div className={styles.dayPopup}>
          <div className={styles.popupContent}>
            <div className={styles.popupHeader}>
              <h6 className="fw-bold">Appointments</h6>
              <button
                className={styles.popupClose}
                onClick={() => setSelectedDayEvents(null)}
              >
                &times;
              </button>
            </div>
            <ul className={styles.eventList}>
              {selectedDayEvents.map((evt) => (
                <li
                  key={evt.id}
                  className={styles.eventItem}
                  style={{
                    borderLeft: `3px solid ${statusColor(
                      evt.resource?.status
                    )}`,
                  }}
                  onClick={() => {
                    onSelectEvent?.(evt.resource);
                    setSelectedDayEvents(null);
                  }}
                >
                  <div className={styles.eventTitle}>
                    {evt.title.length > 20
                      ? evt.title.slice(0, 20) + "…"
                      : evt.title}
                  </div>
                  <div className={styles.eventTime}>
                    {new Date(evt.start).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(evt.end).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsCalendar;
