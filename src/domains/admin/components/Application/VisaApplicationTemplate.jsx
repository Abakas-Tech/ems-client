import { forwardRef, useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import agencyLogo from "../../../../assets/img/visa/visa.png";
import styles from "./VisaApplicationTemplate.module.css";

const PLACEHOLDER_PHOTO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='150'>
      <rect width='100%' height='100%' fill='#e9ecef'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#6c757d' font-family='Arial' font-size='13'>No Photo</text>
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

  return (
    <div ref={ref} className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        {/* Left: VISA barcode -> VISA No. -> Sponsor */}
        <div className={styles.headerLeft}>
          <Barcode value={d.visaNo} />
          <div className={styles.visaLabel}>
            <div>VISA No:</div>
            <div className={styles.visaNumber}>{d.visaNo}</div>
          </div>

          <div className={styles.sponsorInfo}>
            <span className={styles.sponsorLabel}>Sponsor :</span>
            <span className={styles.sponsorValue}>{d.sponsorName} </span>
          </div>
        </div>

        {/* Right: Agent barcode -> Agent Ref -> Embassy/Consular -> MMH name */}
        <div className={styles.headerRight}>
          <Barcode value={d.agentRef} />
          <div className={styles.agentRef}>{d.agentRef}</div>
          <div className={styles.embassyAr}>سفارة المملكة العربية السعودية</div>
          <div className={styles.embassyEn}>EMBASSY OF SAUDI ARABIA</div>
          <div className={styles.consularAr}>القسم القنصلي</div>
          <div className={styles.consularEn}>CONSULAR SECTION</div>
          <div className={styles.agentName}>Al_Itisalat FOREIGN EMPLOYMENT AGENT</div>
        </div>
      </div>

      {/* Photo (left) + Logo (centered), horizontally aligned to each other */}
      <div className={styles.topInfo}>
        <div className={styles.photoWrap}>
          <img
            src={d.photoUrl || PLACEHOLDER_PHOTO}
            alt="Applicant"
            className={styles.photo}
            crossOrigin="anonymous"
          />
        </div>

        <img
          src={logoSrc || agencyLogo}
          alt="Agency logo"
          className={styles.logo}
        />
      </div>

      {/* Full Name */}
      <div className={`${styles.fieldRow} ${styles.fieldRowTop}`}>
        <div
          className={`${styles.field} ${styles.fieldFull} ${styles.fieldLast}`}
        >
          <div className={styles.fieldLabel}>Full Name :</div>
          <div className={styles.fieldValue}>{d.fullName}</div>
          <div className={styles.fieldLabelAr}>الاسم الكامل</div>
        </div>
      </div>

      {/* Date of Birth & Place of Birth */}
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>Date of Birth :</div>
          <div className={styles.fieldValue}>{d.dateOfBirth}</div>
          <div className={styles.fieldLabelAr}>تاريخ الميلاد</div>
        </div>
        <div className={`${styles.field} ${styles.fieldLast}`}>
          <div className={styles.fieldLabel}>Place of Birth :</div>
          <div className={styles.fieldValue}>{d.placeOfBirth}</div>
          <div className={styles.fieldLabelAr}>مكان الميلاد</div>
        </div>
      </div>

      {/* Nationality */}
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>Past Nationality :</div>
          <div className={styles.fieldValue}>{d.pastNationality}</div>
          <div className={styles.fieldLabelAr}>الجنسية السابقة</div>
        </div>
        <div className={`${styles.field} ${styles.fieldLast}`}>
          <div className={styles.fieldLabel}>Current Nationality :</div>
          <div className={styles.fieldValue}>{d.currentNationality}</div>
          <div className={styles.fieldLabelAr}>الجنسية الحالية</div>
        </div>
      </div>

      {/* Sex & Marital Status */}
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>Sex :</div>
          <div className={styles.fieldValue}>{d.sex}</div>
          <div className={styles.fieldLabelAr}>الجنس</div>
        </div>
        <div className={`${styles.field} ${styles.fieldLast}`}>
          <div className={styles.fieldLabel}>Marital Status :</div>
          <div className={styles.fieldValue}>{d.maritalStatus}</div>
          <div className={styles.fieldLabelAr}>الحالة الاجتماعية</div>
        </div>
      </div>

      {/* Sect & Religion */}
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>Sect :</div>
          <div className={styles.fieldValue}>{d.sect}</div>
        </div>
        <div className={`${styles.field} ${styles.fieldLast}`}>
          <div className={styles.fieldLabel}>Religion :</div>
          <div className={styles.fieldValue}>{d.religion}</div>
          <div className={styles.fieldLabelAr}>الديانة</div>
        </div>
      </div>

      {/* Qualification & Profession */}
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>Qualification :</div>
          <div className={styles.fieldValue}>{d.qualification}</div>
          <div className={styles.fieldLabelAr}>المؤهل العلمى</div>
        </div>
        <div className={`${styles.field} ${styles.fieldLast}`}>
          <div className={styles.fieldLabel}>Profession :</div>
          <div className={styles.fieldValue}>{d.profession}</div>
          <div className={styles.fieldLabelAr}>المهنة</div>
        </div>
      </div>

      {/* Home Address */}
      <div className={styles.fieldRow}>
        <div
          className={`${styles.field} ${styles.fieldFull} ${styles.fieldLast}`}
        >
          <div className={styles.fieldLabel}>
            Home address and telephone No. :
          </div>
          <div className={styles.fieldValue}>{d.homeAddress}</div>
          <div className={styles.fieldLabelAr}>عنوان السكن</div>
        </div>
      </div>

      {/* Business Address */}
      <div className={styles.fieldRow}>
        <div
          className={`${styles.field} ${styles.fieldFull} ${styles.fieldLast}`}
        >
          <div className={styles.fieldLabel}>
            Business address and telephone No. :
          </div>
          <div className={styles.fieldValue}>{d.businessAddress}</div>
          <div className={styles.fieldLabelAr}>عنوان العمل ورقم الهاتف</div>
        </div>
      </div>

      {/* Purpose of Travel */}
      <div className={styles.fieldRow}>
        <div
          className={`${styles.field} ${styles.fieldColumn} ${styles.fieldFull} ${styles.fieldLast}`}
        >
          <div className={styles.fieldLabelRow}>
            <div className={styles.fieldLabel}>Purpose Of Travel</div>
            <div className={styles.purposeList}>
              {PURPOSES.map((p) => (
                <span
                  key={p}
                  className={
                    d.purposeOfTravel === p
                      ? `${styles.purposeItem} ${styles.purposeItemSelected}`
                      : styles.purposeItem
                  }
                >
                  {p}
                </span>
              ))}
            </div>
            <div className={styles.fieldLabelAr}>الغرض</div>
          </div>
        </div>
      </div>

      {/* Passport Info */}
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>Place of Issue :</div>
          <div className={styles.fieldValue}>{d.placeOfIssue}</div>
          <div className={styles.fieldLabelAr}>مكان الاصدار</div>
        </div>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>Date of Issue :</div>
          <div className={styles.fieldValue}>{d.dateOfIssue}</div>
          <div className={styles.fieldLabelAr}>تاريخ الاصدار</div>
        </div>
        <div className={`${styles.field} ${styles.fieldLast}`}>
          <div className={styles.fieldLabel}>Pasport No:</div>
          <div className={styles.fieldValue}>{d.passportNo}</div>
          <div className={styles.fieldLabelAr}>رقم الجواز</div>
        </div>
      </div>

      {/* Date of Expiry */}
      <div className={styles.fieldRow}>
        <div
          className={`${styles.field} ${styles.fieldFull} ${styles.fieldLast}`}
        >
          <div className={styles.fieldLabel}>Date of Expiry :</div>
          <div className={styles.fieldValue}>{d.dateOfExpiry}</div>
          <div className={styles.fieldLabelAr}>تاريخ الانتهاء</div>
        </div>
      </div>

      {/* Stay Information */}
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>
            Duration of stay in the Kingdom :
          </div>
          <div className={styles.fieldValue}>{d.durationOfStay}</div>
          <div className={styles.fieldLabelAr}>مدة الاقامه بالمملكة</div>
        </div>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>Date of arrival :</div>
          <div className={styles.fieldValue}>{d.dateOfArrival}</div>
          <div className={styles.fieldLabelAr}>تاريخ الوصول</div>
        </div>
        <div className={`${styles.field} ${styles.fieldLast}`}>
          <div className={styles.fieldLabel}>Date of departuer :</div>
          <div className={styles.fieldValue}>{d.dateOfDeparture}</div>
          <div className={styles.fieldLabelAr}>تاريخ المغادرة</div>
        </div>
      </div>

      {/* Payment Information */}
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>Mode of Payment :</div>
          <div className={styles.fieldValue}>{d.modeOfPayment}</div>
          <div className={styles.fieldLabelAr}>طريقة الدفع</div>
        </div>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>Payment No :</div>
          <div className={styles.fieldValue}>{d.paymentNo}</div>
          <div className={styles.fieldLabelAr}>رقم الدفع</div>
        </div>
        <div className={`${styles.field} ${styles.fieldLast}`}>
          <div className={styles.fieldLabel}>Date :</div>
          <div className={styles.fieldValue}>{d.paymentDate}</div>
          <div className={styles.fieldLabelAr}>تاريخ</div>
        </div>
      </div>

      {/* Relationship */}
      <div className={styles.fieldRow}>
        <div
          className={`${styles.field} ${styles.fieldFull} ${styles.fieldLast}`}
        >
          <div className={styles.fieldLabel}>Relationship :</div>
          <div className={styles.fieldValue}>{d.relationship}</div>
        </div>
      </div>

      {/* Name Dealer & Destination */}
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>Name Dealer :</div>
          <div className={styles.fieldValue}>{d.dealerName}</div>
          <div className={styles.fieldLabelAr}>اسم البائع</div>
        </div>
        <div className={`${styles.field} ${styles.fieldLast}`}>
          <div className={styles.fieldLabel}>Destination :</div>
          <div className={styles.fieldValue}>{d.destination}</div>
          <div className={styles.fieldLabelAr}>المكان المقصود</div>
        </div>
      </div>

      {/* Dependents Section */}
      <div className={styles.fieldRow}>
        <div
          className={`${styles.field} ${styles.fieldColumn} ${styles.fieldFull} ${styles.fieldLast}`}
        >
          <div className={styles.fieldLabelRow}>
            <div className={styles.fieldLabel}>
              Dependents traveling in the same passport:
            </div>
            <div className={styles.fieldLabelAr}>
              إيضاحات تخص أفراد العائله المضافين على نفس جواز السفر
            </div>
          </div>
          <table className={styles.dependentsTable}>
            <thead>
              <tr>
                <th className={`${styles.tableTh} ${styles.tableThLeft}`}>
                  Full Name
                </th>
                <th className={styles.tableTh}>Sex</th>
                <th className={styles.tableTh}>Date of Birth</th>
                <th className={styles.tableTh}>Relationship</th>
              </tr>
            </thead>
            <tbody>
              {(d.dependents && d.dependents.length > 0
                ? d.dependents
                : [{}, {}]
              ).map((dep, i) => (
                <tr key={i}>
                  <td className={`${styles.tableTd} ${styles.tableTdLeft}`}>
                    {dep.fullName || ""}
                  </td>
                  <td className={styles.tableTd}>{dep.sex || ""}</td>
                  <td className={styles.tableTd}>{dep.dateOfBirth || ""}</td>
                  <td className={styles.tableTd}>{dep.relationship || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Company in Kingdom */}
      <div className={`${styles.fieldRow} ${styles.fieldRowTop}`}>
        <div
          className={`${styles.field} ${styles.fieldFull} ${styles.fieldLast}`}
        >
          <div className={styles.fieldLabel}>
            Name and address of company or individual in the Kingdom:
          </div>
          <div className={styles.fieldValue}>{d.companyInKingdom}</div>
        </div>
      </div>

      {/* Certification Section */}
      <div className={styles.certification}>
        <p className={styles.certEn}>
          The undersigned hereby certify that all the information I have
          provided are correct. I will abide by the lows of the Kingdom during
          the period of my residence in it.
        </p>
        <p className={styles.certAr}>
          قر انا الموقع أدناه بأن كل المعلومات التي دونتها صحيحه وسأكون ملتزما
          بقوانين المملكة أثناء فترة وجودي بها
        </p>
      </div>

      {/* Signature Section */}
      <div className={`${styles.fieldRow} ${styles.signatureRow}`}>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>Date :</div>
          <div className={styles.fieldValue}>{d.signDate}</div>
        </div>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>Signature :</div>
          <div className={`${styles.fieldValue} ${styles.signatureSpace}`}>
            &nbsp;
          </div>
          <div className={styles.fieldLabelAr}>التوقيع</div>
        </div>
        <div className={`${styles.field} ${styles.fieldLast}`}>
          <div className={styles.fieldLabel}>Name :</div>
          <div className={styles.fieldValue}>{d.fullName}</div>
          <div className={styles.fieldLabelAr}>الاسم الكامل</div>
        </div>
      </div>

      {/* Official Use Header */}
      <div className={styles.officialHeader}>
        <span>For offical use only:</span>
        <span className={styles.officialHeaderAr}>للاستخدام الرسمي فقط</span>
      </div>

      {/* Official Date & Authorization */}
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>Date :</div>
          <div className={styles.fieldValue}>&nbsp;</div>
          <div className={styles.fieldLabelAr}>التاريخ</div>
        </div>
        <div className={`${styles.field} ${styles.fieldLast}`}>
          <div className={styles.fieldLabel}>Authorization :</div>
          <div className={styles.fieldValue}>&nbsp;</div>
          <div className={styles.fieldLabelAr}>تفويض</div>
        </div>
      </div>

      {/* Visit / Work For */}
      <div className={styles.fieldRow}>
        <div
          className={`${styles.field} ${styles.fieldFull} ${styles.fieldLast}`}
        >
          <div className={styles.fieldLabel}>Visit / Work For :</div>
          <div className={styles.fieldValue}>&nbsp;</div>
          <div className={styles.fieldLabelAr}>زيارة أو العمل من أجل</div>
        </div>
      </div>

      {/* Type & Duration */}
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>Type</div>
          <div className={styles.fieldValue}>&nbsp;</div>
          <div className={styles.fieldLabelAr}>نوع</div>
        </div>
        <div className={`${styles.field} ${styles.fieldLast}`}>
          <div className={styles.fieldLabel}>Duration :</div>
          <div className={styles.fieldValue}>&nbsp;</div>
          <div className={styles.fieldLabelAr}>المدة الزمنية</div>
        </div>
      </div>

      {/* Checked by & Head of consular */}
      <div className={`${styles.fieldRow} ${styles.fieldRowLast}`}>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>Checked by</div>
          <div className={styles.fieldValue}>&nbsp;</div>
          <div className={styles.fieldLabelAr}>فحص بواسطة</div>
        </div>
        <div className={`${styles.field} ${styles.fieldLast}`}>
          <div className={styles.fieldLabel}>Head of consular section</div>
          <div className={styles.fieldValue}>&nbsp;</div>
          <div className={styles.fieldLabelAr}>رئيس القسم القنصلي</div>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <span className={`${styles.footerSpan} ${styles.footerSpanFirst}`}>
          {d.agentEmail || ""}
        </span>
        <span className={styles.footerSpan}>{d.generatedDateLabel || ""}</span>
        <span className={`${styles.footerSpan} ${styles.footerSpanLast}`}>
          {d.agentWebsite || ""}
        </span>
      </div>
    </div>
  );
});

VisaApplicationTemplate.displayName = "VisaApplicationTemplate";

export default VisaApplicationTemplate;
