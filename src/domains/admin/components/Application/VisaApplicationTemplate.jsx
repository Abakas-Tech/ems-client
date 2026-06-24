import { forwardRef, useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

const PLACEHOLDER_PHOTO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='150'>
      <rect width='100%' height='100%' fill='#e9ecef'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#6c757d' font-family='Arial' font-size='13'>No Photo</text>
    </svg>`,
  );

const PLACEHOLDER_LOGO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'>
      <rect width='100%' height='100%' fill='#f1f3f5' stroke='#adb5bd'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#495057' font-family='Arial' font-size='10'>LOGO</text>
    </svg>`,
  );

const Barcode = ({ value, height = 28 }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !value || value === "—") return;
    try {
      JsBarcode(svgRef.current, value, {
        format: "CODE128",
        displayValue: false,
        height,
        margin: 0,
        width: 1,
      });
    } catch (err) {
      console.warn("Barcode render skipped:", err);
    }
  }, [value, height]);

  return <svg ref={svgRef} style={{ height: "28px", marginBottom: "1px" }} />;
};

const VisaApplicationTemplate = forwardRef(({ data, logoSrc }, ref) => {
  const d = data || {};

  const PURPOSES = [
    "Work",
    "Transit",
    "Visit",
    "Umrah",
    "Residence",
    "Hajj",
    "Diplomacy",
    "Other",
  ];

  const styles = {
    // Main container
    container: {
      width: "800px",
      margin: "0 auto",
      padding: "12px",
      backgroundColor: "#fff",
      color: "#000",
      fontFamily: "'Tahoma', 'Arial', 'Noto Naskh Arabic', sans-serif",
      fontSize: "9px",
      lineHeight: "1.25",
      boxSizing: "border-box",
    },

    // Header styles
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "1px",
      gap: "8px",
    },
    headerLeft: {
      flex: "0 0 auto",
      display: "flex",
      flexDirection: "column",
      gap: "2px",
      alignItems: "flex-start",
    },
    headerCenter: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "1px",
      textAlign: "center",
    },
    headerRight: {
      flex: "0 0 auto",
      display: "flex",
      flexDirection: "column",
      gap: "2px",
      alignItems: "flex-end",
    },
    embassyAr: {
      fontSize: "9px",
      direction: "rtl",
      textAlign: "center",
      fontWeight: "600",
    },
    embassyEn: {
      fontSize: "10px",
      fontWeight: "700",
      textAlign: "center",
    },
    consularAr: {
      fontSize: "9px",
      direction: "rtl",
      textAlign: "center",
      fontWeight: "600",
    },
    consularEn: {
      fontSize: "10px",
      fontWeight: "700",
      textAlign: "center",
    },
    visaLabel: {
      fontSize: "7px",
      fontWeight: "600",
    },
    visaNumber: {
      fontSize: "8px",
      fontWeight: "700",
    },
    agentRef: {
      fontSize: "8px",
      fontWeight: "600",
      textAlign: "right",
    },

    // Agent name
    agentName: {
      textAlign: "center",
      fontWeight: "700",
      fontSize: "10px",
      margin: "2px 0 4px",
      padding: "2px 0",
    },

    // Top info section
    topInfo: {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "flex-start",
      gap: "12px",
      marginBottom: "0px",
      padding: "3px 0",
    },
    photo: {
      width: "70px",
      height: "85px",
      objectFit: "cover",
      border: "1px solid #666",
      display: "block",
    },
    logo: {
      width: "54px",
      height: "54px",
      objectFit: "contain",
      display: "block",
    },
    sponsorInfo: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      gap: "1px",
    },
    sponsorLabel: {
      fontSize: "9px",
      fontWeight: "600",
    },
    sponsorValue: {
      fontSize: "9px",
      fontWeight: "700",
    },

    // Field row
    fieldRow: {
      display: "flex",
      gap: 0,
      marginBottom: 0,
      minHeight: "32px",
      borderTop: "1px solid #000",
    },
    fieldRowLast: {
      borderBottom: "1px solid #000",
    },
    field: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: "1px",
      padding: "2px 4px",
      lineHeight: "1.2",
      borderRight: "1px solid #000",
    },
    fieldLast: {
      borderRight: "none",
    },
    fieldFull: {
      flex: "1 1 100%",
    },
    fieldLabel: {
      fontSize: "8px",
      fontWeight: "600",
      color: "#000",
      lineHeight: "1.1",
    },
    fieldLabelAr: {
      fontSize: "8px",
      fontWeight: "600",
      direction: "rtl",
      textAlign: "right",
      color: "#000",
      lineHeight: "1.1",
    },
    fieldValue: {
      fontSize: "9px",
      color: "#000",
      minHeight: "11px",
      lineHeight: "1.2",
      wordWrap: "break-word",
    },
    signatureSpace: {
      minHeight: "16px",
    },

    // Purpose list
    purposeList: {
      display: "flex",
      gap: "3px",
      flexWrap: "wrap",
      fontSize: "8px",
      marginTop: "2px",
    },
    purposeItem: {
      padding: "1px 4px",
      border: "1px solid #999",
      borderRadius: "2px",
      backgroundColor: "#fff",
      color: "#000",
      fontSize: "8px",
      fontWeight: "500",
      textAlign: "center",
      minWidth: "38px",
    },
    purposeItemSelected: {
      backgroundColor: "#000",
      color: "#fff",
      borderColor: "#000",
      fontWeight: "700",
    },

    // Dependents table
    dependentsTable: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "2px",
      fontSize: "8px",
      backgroundColor: "#fff",
    },
    tableTh: {
      border: "1px solid #000",
      padding: "2px 3px",
      textAlign: "center",
      fontWeight: "600",
      fontSize: "8px",
      height: "14px",
      backgroundColor: "#f5f5f5",
    },
    tableTd: {
      border: "1px solid #000",
      padding: "1px 3px",
      textAlign: "center",
      height: "13px",
      fontSize: "8px",
    },
    tdName: {
      textAlign: "left",
      width: "35%",
    },
    tdSex: {
      width: "15%",
    },
    tdDob: {
      width: "25%",
    },
    tdRelationship: {
      width: "25%",
    },

    // Certification
    certification: {
      margin: "4px 0",
      padding: "3px 5px",
      borderTop: "1px solid #000",
      borderBottom: "1px solid #000",
      fontSize: "8px",
      lineHeight: "1.35",
    },
    certEn: {
      margin: "0 0 3px 0",
      textAlign: "left",
      direction: "ltr",
      fontSize: "8px",
    },
    certAr: {
      margin: 0,
      textAlign: "right",
      direction: "rtl",
      fontSize: "8px",
    },

    // Official header
    officialHeader: {
      fontWeight: "700",
      fontSize: "9px",
      margin: "5px 0 2px 0",
      padding: "3px 0",
      borderTop: "2px solid #000",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },

    // Footer
    footer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: "7px",
      marginTop: "6px",
      padding: "3px 0",
      borderTop: "1px solid #000",
      color: "#000",
    },
    footerSpan: {
      flex: 1,
      textAlign: "center",
    },
    footerSpanFirst: {
      textAlign: "left",
    },
    footerSpanLast: {
      textAlign: "right",
    },

    // Signature row
    signatureRow: {
      minHeight: "36px",
    },
  };

  return (
    <div ref={ref} style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Barcode value={d.visaNo} />
          <div style={styles.visaLabel}>VISA No:</div>
          <div style={styles.visaNumber}>{d.visaNo || "—"}</div>
        </div>

        <div style={styles.headerCenter}>
          <div style={styles.embassyAr}>سفارة المملكة العربية السعودية</div>
          <div style={styles.embassyEn}>EMBASSY OF SAUDI ARABIA</div>
          <div style={styles.consularAr}>القسم القنصلي</div>
          <div style={styles.consularEn}>CONSULAR SECTION</div>
        </div>

        <div style={styles.headerRight}>
          <Barcode value={d.agentRef} />
          <div style={styles.agentRef}>{d.agentRef || "—"}</div>
        </div>
      </div>

      {/* Agent Name */}
      <div style={styles.agentName}>MMH FOREIGN EMPLOYMENT AGENT</div>

      {/* Photo, Logo, Sponsor Info */}
      <div style={styles.topInfo}>
        <div>
          <img
            src={d.photoUrl || PLACEHOLDER_PHOTO}
            alt="Applicant"
            style={styles.photo}
            crossOrigin="anonymous"
          />
        </div>

        <div>
          <img
            src={logoSrc || PLACEHOLDER_LOGO}
            alt="Agency logo"
            style={styles.logo}
          />
        </div>

        <div style={styles.sponsorInfo}>
          <span style={styles.sponsorLabel}>Sponsor :</span>
          <span style={styles.sponsorValue}>{d.sponsorName || "—"}</span>
        </div>
      </div>

      {/* Full Name */}
      <div style={styles.fieldRow}>
        <div
          style={{ ...styles.field, ...styles.fieldFull, ...styles.fieldLast }}
        >
          <div style={styles.fieldLabel}>Full Name :</div>
          <div style={styles.fieldLabelAr}>الاسم الكامل</div>
          <div style={styles.fieldValue}>{d.fullName || "—"}</div>
        </div>
      </div>

      {/* Date of Birth & Place of Birth */}
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <div style={styles.fieldLabel}>Date of Birth :</div>
          <div style={styles.fieldLabelAr}>تاريخ الميلاد</div>
          <div style={styles.fieldValue}>{d.dateOfBirth || "—"}</div>
        </div>
        <div style={{ ...styles.field, ...styles.fieldLast }}>
          <div style={styles.fieldLabel}>Place of Birth :</div>
          <div style={styles.fieldLabelAr}>مكان الميلاد</div>
          <div style={styles.fieldValue}>{d.placeOfBirth || "—"}</div>
        </div>
      </div>

      {/* Nationality */}
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <div style={styles.fieldLabel}>Past Nationality :</div>
          <div style={styles.fieldLabelAr}>الجنسية السابقة</div>
          <div style={styles.fieldValue}>{d.pastNationality || "—"}</div>
        </div>
        <div style={{ ...styles.field, ...styles.fieldLast }}>
          <div style={styles.fieldLabel}>Current Nationality :</div>
          <div style={styles.fieldLabelAr}>الجنسية الحالية</div>
          <div style={styles.fieldValue}>{d.currentNationality || "—"}</div>
        </div>
      </div>

      {/* Sex & Marital Status */}
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <div style={styles.fieldLabel}>Sex :</div>
          <div style={styles.fieldLabelAr}>الجنس</div>
          <div style={styles.fieldValue}>{d.sex || "—"}</div>
        </div>
        <div style={{ ...styles.field, ...styles.fieldLast }}>
          <div style={styles.fieldLabel}>Marital Status :</div>
          <div style={styles.fieldLabelAr}>الحالة الاجتماعية</div>
          <div style={styles.fieldValue}>{d.maritalStatus || "—"}</div>
        </div>
      </div>

      {/* Sect & Religion */}
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <div style={styles.fieldLabel}>Sect :</div>
          <div style={styles.fieldValue}>{d.sect || "—"}</div>
        </div>
        <div style={{ ...styles.field, ...styles.fieldLast }}>
          <div style={styles.fieldLabel}>Religion :</div>
          <div style={styles.fieldLabelAr}>الديانة</div>
          <div style={styles.fieldValue}>{d.religion || "—"}</div>
        </div>
      </div>

      {/* Qualification & Profession */}
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <div style={styles.fieldLabel}>Qualification :</div>
          <div style={styles.fieldLabelAr}>المؤهل العلمى</div>
          <div style={styles.fieldValue}>{d.qualification || "—"}</div>
        </div>
        <div style={{ ...styles.field, ...styles.fieldLast }}>
          <div style={styles.fieldLabel}>Profession :</div>
          <div style={styles.fieldLabelAr}>المهنة</div>
          <div style={styles.fieldValue}>{d.profession || "—"}</div>
        </div>
      </div>

      {/* Home Address */}
      <div style={styles.fieldRow}>
        <div
          style={{ ...styles.field, ...styles.fieldFull, ...styles.fieldLast }}
        >
          <div style={styles.fieldLabel}>Home address and telephone No. :</div>
          <div style={styles.fieldLabelAr}>عنوان السكن</div>
          <div style={styles.fieldValue}>{d.homeAddress || "—"}</div>
        </div>
      </div>

      {/* Business Address */}
      <div style={styles.fieldRow}>
        <div
          style={{ ...styles.field, ...styles.fieldFull, ...styles.fieldLast }}
        >
          <div style={styles.fieldLabel}>
            Business address and telephone No. :
          </div>
          <div style={styles.fieldLabelAr}>عنوان العمل ورقم الهاتف</div>
          <div style={styles.fieldValue}>{d.businessAddress || "—"}</div>
        </div>
      </div>

      {/* Purpose of Travel */}
      <div style={styles.fieldRow}>
        <div
          style={{ ...styles.field, ...styles.fieldFull, ...styles.fieldLast }}
        >
          <div style={styles.fieldLabel}>Purpose Of Travel</div>
          <div style={styles.fieldLabelAr}>الغرض</div>
          <div style={styles.purposeList}>
            {PURPOSES.map((p) => (
              <span
                key={p}
                style={{
                  ...styles.purposeItem,
                  ...(d.purposeOfTravel === p
                    ? styles.purposeItemSelected
                    : {}),
                }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Passport Info */}
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <div style={styles.fieldLabel}>Place of Issue :</div>
          <div style={styles.fieldLabelAr}>مكان الاصدار</div>
          <div style={styles.fieldValue}>{d.placeOfIssue || "—"}</div>
        </div>
        <div style={styles.field}>
          <div style={styles.fieldLabel}>Date of Issue :</div>
          <div style={styles.fieldLabelAr}>تاريخ الاصدار</div>
          <div style={styles.fieldValue}>{d.dateOfIssue || "—"}</div>
        </div>
        <div style={{ ...styles.field, ...styles.fieldLast }}>
          <div style={styles.fieldLabel}>Pasport No:</div>
          <div style={styles.fieldLabelAr}>رقم الجواز</div>
          <div style={styles.fieldValue}>{d.passportNo || "—"}</div>
        </div>
      </div>

      {/* Date of Expiry */}
      <div style={styles.fieldRow}>
        <div
          style={{ ...styles.field, ...styles.fieldFull, ...styles.fieldLast }}
        >
          <div style={styles.fieldLabel}>Date of Expiry :</div>
          <div style={styles.fieldLabelAr}>تاريخ الانتهاء</div>
          <div style={styles.fieldValue}>{d.dateOfExpiry || "—"}</div>
        </div>
      </div>

      {/* Stay Information */}
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <div style={styles.fieldLabel}>Duration of stay in the Kingdom :</div>
          <div style={styles.fieldLabelAr}>مدة الاقامه بالمملكة</div>
          <div style={styles.fieldValue}>{d.durationOfStay || "—"}</div>
        </div>
        <div style={styles.field}>
          <div style={styles.fieldLabel}>Date of arrival :</div>
          <div style={styles.fieldLabelAr}>تاريخ الوصول</div>
          <div style={styles.fieldValue}>{d.dateOfArrival || "—"}</div>
        </div>
        <div style={{ ...styles.field, ...styles.fieldLast }}>
          <div style={styles.fieldLabel}>Date of departuer :</div>
          <div style={styles.fieldLabelAr}>تاريخ المغادرة</div>
          <div style={styles.fieldValue}>{d.dateOfDeparture || "—"}</div>
        </div>
      </div>

      {/* Payment Information */}
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <div style={styles.fieldLabel}>Mode of Payment :</div>
          <div style={styles.fieldLabelAr}>طريقة الدفع</div>
          <div style={styles.fieldValue}>{d.modeOfPayment || "—"}</div>
        </div>
        <div style={styles.field}>
          <div style={styles.fieldLabel}>Payment No :</div>
          <div style={styles.fieldLabelAr}>رقم الدفع</div>
          <div style={styles.fieldValue}>{d.paymentNo || "—"}</div>
        </div>
        <div style={{ ...styles.field, ...styles.fieldLast }}>
          <div style={styles.fieldLabel}>Date :</div>
          <div style={styles.fieldLabelAr}>تاريخ</div>
          <div style={styles.fieldValue}>{d.paymentDate || "—"}</div>
        </div>
      </div>

      {/* Relationship */}
      <div style={styles.fieldRow}>
        <div
          style={{ ...styles.field, ...styles.fieldFull, ...styles.fieldLast }}
        >
          <div style={styles.fieldLabel}>Relationship :</div>
          <div style={styles.fieldValue}>{d.relationship || "—"}</div>
        </div>
      </div>

      {/* Name Dealer & Destination */}
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <div style={styles.fieldLabel}>Name Dealer :</div>
          <div style={styles.fieldLabelAr}>اسم البائع</div>
          <div style={styles.fieldValue}>{d.dealerName || "—"}</div>
        </div>
        <div style={{ ...styles.field, ...styles.fieldLast }}>
          <div style={styles.fieldLabel}>Destination :</div>
          <div style={styles.fieldLabelAr}>المكان المقصود</div>
          <div style={styles.fieldValue}>{d.destination || "—"}</div>
        </div>
      </div>

      {/* Dependents Section */}
      <div style={styles.fieldRow}>
        <div
          style={{ ...styles.field, ...styles.fieldFull, ...styles.fieldLast }}
        >
          <div style={styles.fieldLabel}>
            Dependents traveling in the same passport:
          </div>
          <div style={styles.fieldLabelAr}>
            إيضاحات تخص أفراد العائله المضافين على نفس جواز السفر
          </div>
          <table style={styles.dependentsTable}>
            <thead>
              <tr>
                <th style={{ ...styles.tableTh, textAlign: "left" }}>
                  Full Name
                </th>
                <th style={styles.tableTh}>Sex</th>
                <th style={styles.tableTh}>Date of Birth</th>
                <th style={styles.tableTh}>Relationship</th>
              </tr>
            </thead>
            <tbody>
              {(d.dependents && d.dependents.length > 0
                ? d.dependents
                : [{}, {}]
              ).map((dep, i) => (
                <tr key={i}>
                  <td style={{ ...styles.tableTd, textAlign: "left" }}>
                    {dep.fullName || ""}
                  </td>
                  <td style={styles.tableTd}>{dep.sex || ""}</td>
                  <td style={styles.tableTd}>{dep.dateOfBirth || ""}</td>
                  <td style={styles.tableTd}>{dep.relationship || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Company in Kingdom */}
      <div style={styles.fieldRow}>
        <div
          style={{ ...styles.field, ...styles.fieldFull, ...styles.fieldLast }}
        >
          <div style={styles.fieldLabel}>
            Name and address of company or individual in the Kingdom:
          </div>
          <div style={styles.fieldValue}>{d.companyInKingdom || "—"}</div>
        </div>
      </div>

      {/* Certification Section */}
      <div style={styles.certification}>
        <p style={styles.certEn}>
          The undersigned hereby certify that all the information I have
          provided are correct. I will abide by the lows of the Kingdom during
          the period of my residence in it.
        </p>
        <p style={styles.certAr}>
          قر انا الموقع أدناه بأن كل المعلومات التي دونتها صحيحه وسأكون ملتزما
          بقوانين المملكة أثناء فترة وجودي بها
        </p>
      </div>

      {/* Signature Section */}
      <div style={{ ...styles.fieldRow, ...styles.signatureRow }}>
        <div style={styles.field}>
          <div style={styles.fieldLabel}>Date :</div>
          <div style={styles.fieldValue}>{d.signDate || "—"}</div>
        </div>
        <div style={styles.field}>
          <div style={styles.fieldLabel}>Signature :</div>
          <div style={styles.fieldLabelAr}>التوقيع</div>
          <div style={{ ...styles.fieldValue, ...styles.signatureSpace }}>
            &nbsp;
          </div>
        </div>
        <div style={{ ...styles.field, ...styles.fieldLast }}>
          <div style={styles.fieldLabel}>Name :</div>
          <div style={styles.fieldLabelAr}>الاسم الكامل</div>
          <div style={styles.fieldValue}>{d.fullName || "—"}</div>
        </div>
      </div>

      {/* Official Use Header */}
      <div style={styles.officialHeader}>
        <span>For offical use only:</span>
        <span style={{ direction: "rtl" }}>للاستخدام الرسمي فقط</span>
      </div>

      {/* Official Date & Authorization */}
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <div style={styles.fieldLabel}>Date :</div>
          <div style={styles.fieldLabelAr}>التاريخ</div>
          <div style={styles.fieldValue}>&nbsp;</div>
        </div>
        <div style={{ ...styles.field, ...styles.fieldLast }}>
          <div style={styles.fieldLabel}>Authorization :</div>
          <div style={styles.fieldLabelAr}>تفويض</div>
          <div style={styles.fieldValue}>&nbsp;</div>
        </div>
      </div>

      {/* Visit / Work For */}
      <div style={styles.fieldRow}>
        <div
          style={{ ...styles.field, ...styles.fieldFull, ...styles.fieldLast }}
        >
          <div style={styles.fieldLabel}>Visit / Work For :</div>
          <div style={styles.fieldLabelAr}>زيارة أو العمل من أجل</div>
          <div style={styles.fieldValue}>&nbsp;</div>
        </div>
      </div>

      {/* Type & Duration */}
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <div style={styles.fieldLabel}>Type</div>
          <div style={styles.fieldLabelAr}>نوع</div>
          <div style={styles.fieldValue}>&nbsp;</div>
        </div>
        <div style={{ ...styles.field, ...styles.fieldLast }}>
          <div style={styles.fieldLabel}>Duration :</div>
          <div style={styles.fieldLabelAr}>المدة الزمنية</div>
          <div style={styles.fieldValue}>&nbsp;</div>
        </div>
      </div>

      {/* Checked by & Head of consular */}
      <div style={{ ...styles.fieldRow, ...styles.fieldRowLast }}>
        <div style={styles.field}>
          <div style={styles.fieldLabel}>Checked by</div>
          <div style={styles.fieldLabelAr}>فحص بواسطة</div>
          <div style={styles.fieldValue}>&nbsp;</div>
        </div>
        <div style={{ ...styles.field, ...styles.fieldLast }}>
          <div style={styles.fieldLabel}>Head of consular section</div>
          <div style={styles.fieldLabelAr}>رئيس القسم القنصلي</div>
          <div style={styles.fieldValue}>&nbsp;</div>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <span style={{ ...styles.footerSpan, ...styles.footerSpanFirst }}>
          {d.agentEmail || ""}
        </span>
        <span style={styles.footerSpan}>{d.generatedDateLabel || ""}</span>
        <span style={{ ...styles.footerSpan, ...styles.footerSpanLast }}>
          {d.agentWebsite || ""}
        </span>
      </div>
    </div>
  );
});

VisaApplicationTemplate.displayName = "VisaApplicationTemplate";

export default VisaApplicationTemplate;
