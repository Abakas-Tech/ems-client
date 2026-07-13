import { forwardRef } from "react";
import styles from "./ComplaintReportTemplate.module.css";

const ComplaintReportTemplate = forwardRef(({ data }, ref) => {
  const d = data || {};

  return (
    <div ref={ref} className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div className={styles.title}>Complaint Report</div>
          <div className={styles.subtitle}>Complaint ID: #{d.id}</div>
        </div>
        <div className={styles.statusBadge} data-status={d.status}>
          {d.status}
        </div>
      </div>

      {/* Employee Information */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Employee Information</div>
        <div className={styles.grid}>
          <div className={styles.row}>
            <span className={styles.label}>Full Name</span>
            <span className={styles.value}>
              {d.employeeFullName}
              {d.workerLinked && (
                <span className={styles.linkedTag}>Linked Worker</span>
              )}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Departure Date</span>
            <span className={styles.value}>{d.departureDate}</span>
          </div>
        </div>
      </div>

      {/* Complaint Information */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Complaint Information</div>
        <div className={styles.row}>
          <span className={styles.label}>Incident Description</span>
        </div>
        <div className={styles.paragraph}>{d.incidentDescription}</div>
        <div className={styles.grid}>
          <div className={styles.row}>
            <span className={styles.label}>Information Source</span>
            <span className={styles.value}>{d.informationSource}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Reliability</span>
            <span className={styles.value}>{d.informationReliability}</span>
          </div>
        </div>
      </div>

      {/* Complainants */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Complainant(s)</div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Relationship</th>
              <th>Phone Number</th>
            </tr>
          </thead>
          <tbody>
            {d.complainants.length ? (
              d.complainants.map((c, i) => (
                <tr key={i}>
                  <td>{c.complainant_full_name}</td>
                  <td>{c.complainant_relationship || "—"}</td>
                  <td>{c.complainant_phone_number}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className={styles.emptyCell}>
                  No complainant records
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Employer Information */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Employer Information</div>
        <div className={styles.grid}>
          <div className={styles.row}>
            <span className={styles.label}>Full Name</span>
            <span className={styles.value}>{d.employerFullName}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Phone Number</span>
            <span className={styles.value}>{d.employerPhoneNumber}</span>
          </div>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Address</span>
          <span className={styles.value}>{d.employerFullAddress}</span>
        </div>
      </div>

      {/* Resolution Information */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Resolution Attempts</div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Method</th>
              <th>Platform</th>
              <th>Notes</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {d.resolutionAttempts.length ? (
              d.resolutionAttempts.map((a, i) => (
                <tr key={i}>
                  <td>{a.method}</td>
                  <td>{a.platform || "—"}</td>
                  <td>{a.notes}</td>
                  <td>{a.attemptedAt}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className={styles.emptyCell}>
                  No resolution attempts recorded
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className={styles.row} style={{ marginTop: "8px" }}>
          <span className={styles.label}>Outcome</span>
          <span className={styles.value}>{d.complaintOutcome}</span>
        </div>
      </div>

      {/* Intake */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Complaint Intake</div>
        <div className={styles.row}>
          <span className={styles.label}>Date Received</span>
          <span className={styles.value}>{d.receivedDate}</span>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        Generated on {d.generatedDateLabel} — MMH Foreign Employment Agency
      </div>
    </div>
  );
});

ComplaintReportTemplate.displayName = "ComplaintReportTemplate";

export default ComplaintReportTemplate;
