import { forwardRef } from "react";
import styles from "./ComplaintReportTemplate.module.css";
import { companyInfo } from "./companyInfo";
import logo from "../../../../../assets/img/logo/logo-nbg.png";

const ComplaintReportTemplate = forwardRef(({ data }, ref) => {
  const d = data || {};

  return (
    <div ref={ref} className={styles.container}>
      {/* Letterhead: logo left, company details right-aligned */}
      <div className={styles.letterhead}>
        <img
          src={logo}
          alt={`${companyInfo.name} logo`}
          className={styles.logo}
        />
        <div className={styles.companyBlock}>
          <div className={styles.companyName}>{companyInfo.name}</div>
          <div className={styles.companyLine}>{companyInfo.address}</div>
          <div className={styles.companyLine}>Phone: {companyInfo.phone}</div>
          <div className={styles.companyLine}>{companyInfo.email}</div>
        </div>
      </div>

      {/* Title block: bold rule + centered title, like the source form */}
      <div className={styles.titleBlock}>
        <div className={styles.titleRule}></div>
        <div className={styles.title}>Complaint Report</div>
      </div>

      {/* 1. Worker Information */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Worker Information</div>
        <div className={styles.grid}>
          <div className={styles.row}>
            <span className={styles.label}>Full Name</span>
            <span className={styles.value}>{d.employeeFullName}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Departure Date</span>
            <span className={styles.value}>{d.departureDate}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Destination Country</span>
            <span className={styles.value}>{d.destinationCountry}</span>
          </div>
        </div>
      </div>

      {/* 2. Complaint Information */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Complaint Information</div>
        <div className={`${styles.row} ${styles.rowFull}`}>
          <span className={styles.label}>Incident Description</span>
          <span className={styles.value}>{d.incidentDescription}</span>
        </div>
        <div className={styles.grid}>
          <div className={styles.row}>
            <span className={styles.label}>
              Information Source and Reliability
            </span>
            <span className={styles.value}>{d.informationSource}</span>
          </div>
        </div>
      </div>

      {/* 3. Complainant(s) — one horizontal row per complainant */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Complainant(s)</div>
        {d.complainants.length ? (
          <div className={styles.entryList}>
            {d.complainants.map((c, i) => (
              <div className={styles.entry} key={i}>
                <div className={styles.row}>
                  <span className={styles.label}>Full Name</span>
                  <span className={styles.value}>
                    {c.complainant_full_name}
                  </span>
                </div>
                <div className={styles.row}>
                  <span className={styles.label}>Relationship</span>
                  <span className={styles.value}>
                    {c.complainant_relationship || "—"}
                  </span>
                </div>
                <div className={styles.row}>
                  <span className={styles.label}>Phone Number</span>
                  <span className={styles.value}>
                    {c.complainant_phone_number}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyText}>No complainant records</div>
        )}
      </div>

      {/* 4. Office Use Only — Employer Information, Resolution Attempts, Complaint Intake */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Office Use Only</div>
        <div className={styles.officeUseBox}>
          {/* Employer Information */}
          <div className={styles.subsection}>
            <div className={styles.subsectionTitle}>Employer Information</div>
            <div className={styles.grid}>
              <div className={styles.row}>
                <span className={styles.label}>Full Name</span>
                <span className={styles.value}>{d.employerFullName}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.label}>Phone Number</span>
                <span className={styles.value}>{d.employerPhoneNumber}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.label}>Address</span>
                <span className={styles.value}>{d.employerFullAddress}</span>
              </div>
            </div>
          </div>

          {/* Resolution Attempts — one horizontal row per attempt, notes omitted */}
          <div className={styles.subsection}>
            <div className={styles.subsectionTitle}>Resolution Attempts</div>
            {d.resolutionAttempts.length ? (
              <div className={styles.entryList}>
                {d.resolutionAttempts.map((a, i) => (
                  <div className={styles.entry} key={i}>
                    <div className={styles.row}>
                      <span className={styles.label}>Method</span>
                      <span className={styles.value}>{a.method}</span>
                    </div>
                    <div className={styles.row}>
                      <span className={styles.label}>Platform</span>
                      <span className={styles.value}>{a.platform || "—"}</span>
                    </div>
                    <div className={styles.row}>
                      <span className={styles.label}>Date</span>
                      <span className={styles.value}>{a.attemptedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyText}>
                No resolution attempts recorded
              </div>
            )}
            <div
              className={`${styles.row} ${styles.rowFull}`}
              style={{ marginTop: "8px" }}
            >
              <span className={styles.label}>Outcome</span>
              <span className={styles.value}>{d.complaintOutcome}</span>
            </div>
          </div>

          {/* Complaint Intake */}
          <div className={styles.subsection}>
            <div className={styles.subsectionTitle}>Complaint Intake</div>
            <div className={styles.row}>
              <span className={styles.label}>Date Received</span>
              <span className={styles.value}>{d.receivedDate}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Received By</span>
              <span className={styles.value}>{d.receivedBy}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Signature</span>
              <div className={styles.value}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        Generated on {d.generatedDateLabel} — {companyInfo.name}
      </div>
    </div>
  );
});

ComplaintReportTemplate.displayName = "ComplaintReportTemplate";

export default ComplaintReportTemplate;
