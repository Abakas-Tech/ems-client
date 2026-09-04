import React, { useEffect, useState } from "react";
import StatCard from "../StatCard/StatCard";
import {
  fetchWeeklyReport,
  buildDashboardParams
} from "../../../api/analytics.api";
import styles from "./WeeklyReport.module.css";

/* ------------------------------------------------------------------
   REPORT (ሪፖርት) — LIVE, computed from the database, and driven by
   the SAME filter as the rest of the dashboard. Structured exactly
   like the other dashboard sections (Employee Metrics, Financial
   Performance, Operations): one row per section -> col-12 heading ->
   stat cards.

   - Passports in hand / Inexperienced / Experienced: workers with a
     recorded passport who are not departed/deployed, split by
     experience. Live inventory snapshot - intentionally NOT
     period-filtered.
   - CVs Prepared per destination country: one sub-section per country
     (partner.country), office cards counting CV shares created within
     the SELECTED period (Link Partner records, revoked excluded).
     Offices are NOT hard-coded.

   The dashboard must never break because of this section: on any
   fetch failure it simply renders nothing (logged to console).
   ------------------------------------------------------------------ */
const PERIOD_LABELS = {
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

const WeeklyReport = ({ filters }) => {
  const [report, setReport] = useState(null);

  // Refetch whenever the dashboard's filter changes, sending only the
  // params the selected period actually uses.
  const cleanedParams = buildDashboardParams(filters || {});
  const filterKey = JSON.stringify(cleanedParams);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetchWeeklyReport(cleanedParams);
        if (!cancelled) {
          setReport(response?.data || null);
        }
      } catch (error) {
        console.error("Failed to load weekly report:", error);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  if (!report) return null;

  const { passports, destinations } = report;
  const periodBadge = PERIOD_LABELS[filters?.period] ?? "All time";

  return (
    <>
      {/* Passports section - identical pattern to "Employee Metrics" */}
      <div className="row mt-4">
        <div className="col-12">
          <h6 className="fw-bold text-muted text-uppercase mb-3">
            Report
            <span className={`ms-2 ${styles.liveBadge}`}>
              <span className={styles.liveDot} />
              {periodBadge}
            </span>
          </h6>
        </div>

        <StatCard
          title="Passports in Hand"
          value={passports.total}
          icon="bi bi-passport"
          colorClass="widget-1"
        />
        <StatCard
          title="Inexperienced"
          value={passports.inexperienced}
          icon="bi bi-person-plus"
          colorClass="widget-2"
        />
        <StatCard
          title="Experienced"
          value={passports.experienced}
          icon="bi bi-patch-check"
          colorClass="widget-3"
        />
      </div>

      {/* One sub-section per destination country - same heading + row
          pattern as "Financial Performance" / "Operations" */}
      {destinations.map((destination) => (
        <div className="row mt-2" key={destination.key}>
          <div className="col-12">
            <h6 className="fw-bold text-muted text-uppercase mb-3">
              CVs Prepared — {destination.label}
            </h6>
          </div>

          {destination.offices.map((office, index) => (
            <StatCard
              key={office.id}
              size="cv"
              title={office.name}
              value={office.total}
              icon="bi bi-building"
              colorClass={`widget-${(index % 6) + 1}`}
              details={[
                { label: "Inexperienced", value: office.inexperienced },
                { label: "Experienced", value: office.experienced },
              ]}
            />
          ))}
        </div>
      ))}
    </>
  );
};

export default WeeklyReport;
