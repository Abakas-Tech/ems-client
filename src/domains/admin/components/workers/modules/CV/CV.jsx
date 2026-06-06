/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { getWorkerCVData } from "../../../../api/worker.api";
import BackButton from "../../../../../../shared/components/BackButton/BackButton";
import { useParams, useNavigate } from "react-router-dom";
import useLoader from "../../../../../../context/Loader/useLoader";
import { uploadFile } from "../../../../api/file.api";
import useResponse from "../../../../../../context/Response/useResponse";
import useProfile from "../../../../../../context/Profile/useProfile";

// ── Logo import — swap path if needed ────────────────────────────────────────
import ethioSaudiLogo from "../../../../../../assets/img/logo/ethio_saudi_logo.png";

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL COLOR TOKENS  ← single place to restyle both templates
// ─────────────────────────────────────────────────────────────────────────────
const COLORS = {
  // Template 1 — Ethio Saudi
  t1Primary: "#7f7b94",
  t1Secondary: "#6a7375",
  t1Third: "#C93031",
  t1Gold: "#c8a84b",
  t1Border: "#666",
  t1Bg: "#ffffff",
  t1Text: "#000000",

  // Template 2 — Jomery
  t2Primary: "#1a5276",
  t2SectionBg: "#d0d0d0",
  t2Border: "#888",
  t2Bg: "#ffffff",
  t2Text: "#000000",
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const safeDate = (d) => (d ? d.slice(0, 10) : "");
const safeVal = (v) => v || "";
const calcAge = (dob) =>
  dob ? Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 3600e3)) : "";

// ─────────────────────────────────────────────────────────────────────────────
// SHARED CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const BASE_FONT = "'Trebuchet MS', 'Times New Roman', Times, serif";
const ARABIC_FONT = "'Tajawal', 'Arial', 'Helvetica Neue', sans-serif";
const FW = { width: "100%", borderCollapse: "collapse" };

// ─── Template-1 cell styles ──────────────────────────────────────────────────
const t1Cell = {
  border: `1px solid ${COLORS.t1Third}`,
  padding: "4px 7px",
  fontSize: "14px",
  fontFamily: BASE_FONT,
  fontWeight: "600",
  verticalAlign: "middle",
  color: COLORS.t1Text,
};
const t1CellAr = {
  ...t1Cell,
  textAlign: "right",
  fontFamily: ARABIC_FONT,
  fontWeight: "700",
};
const t1CellVal = { ...t1Cell, fontWeight: "700" };
const t1CbCell = {
  ...t1Cell,
  textAlign: "center",
  fontSize: "15px",
  padding: "3px 4px",
};

// ─── Template-2 cell styles ──────────────────────────────────────────────────
const t2Cell = {
  border: `1px solid ${COLORS.t2Border}`,
  padding: "3px 6px",
  fontSize: "14px",
  fontFamily: BASE_FONT,
  fontWeight: "600",
  verticalAlign: "middle",
  color: COLORS.t2Text,
};
const t2CellAr = {
  ...t2Cell,
  textAlign: "right",
  fontFamily: ARABIC_FONT,
  fontWeight: "700",
  fontSize: "10px",
};
const t2CellVal = { ...t2Cell, fontWeight: "700" };
const t2Th = { ...t2Cell, fontWeight: "800", background: "#f0f0f0" };

// =============================================================================
// TEMPLATE 1 — ETHIO SAUDI
// =============================================================================
const EthioSaudiTemplate = React.forwardRef(({ worker }, ref) => {
  const langs = worker.languages || [];
  const skills = worker.skills || [];
  const experience = worker.experience || [];

  const englishLevel =
    langs
      .find((l) => l.language?.toLowerCase() === "english")
      ?.level?.toLowerCase() || "";
  const arabicLevel =
    langs
      .find((l) => l.language?.toLowerCase() === "arabic")
      ?.level?.toLowerCase() || "";

  // 3-column bilingual row: EN label | value | AR label
  const bRow = (en, ar, val) => (
    <tr>
      <td style={{ ...t1Cell, width: "30%" }}>{en}</td>
      <td style={{ ...t1CellVal, width: "40%" }}>{val}</td>
      <td style={{ ...t1CellAr, width: "30%" }}>{ar}</td>
    </tr>
  );

  const cb = (yes) => (
    <span style={{ fontSize: "15px" }}>{yes ? "☑" : "☐"}</span>
  );

  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column" }}>
      {/* ══════════ PAGE 1 ══════════ */}
      <div style={s1.page}>
        {/* ── HEADER ──
            LEFT  : Arabic agency name + EN name stacked, then logo to their right
            RIGHT : "Application of Employment" with Arabic subtitle centred below  */}
        <div style={s1.header}>
          <div style={s1.headerLeft}>
            <div style={s1.agencyTextBlock}>
              <div style={s1.agencyAr}>
                مكتب عبدالله عبدالعزيز العنقري للإستقدام
              </div>
              <div style={s1.agencyEn}>
                ABDUALАЛAH ABDULAZIZ ALANGARI RECRUITMENT OFFICE
              </div>
            </div>
            {ethioSaudiLogo ? (
              <img src={ethioSaudiLogo} alt="logo" style={s1.logo} />
            ) : (
              <div style={s1.logoPlaceholder}>✦</div>
            )}
          </div>

          <div style={s1.headerRight}>
            <div style={s1.appTitleEn}>Application of Employment</div>
            <div style={s1.appTitleAr}>استمارة طلب عمل</div>
          </div>
        </div>
        <div style={s1.topSection}>
          <div style={s1.photoBox}>
            {worker.photo_3x4_url ? (
              <img
                src={worker.photo_3x4_url}
                alt="photo"
                style={s1.photo3x4}
                crossOrigin="anonymous"
              />
            ) : (
              <div style={s1.photoPlaceholder}>PHOTO</div>
            )}
          </div>

          <div style={s1.jobTablesCol}>
            {/* Sub-table A — Employee Name + Employee No */}
            <table style={{ ...FW, marginBottom: "12px" }}>
              <tbody>
                <tr>
                  <td style={{ ...t1Cell, width: "36%", fontSize: "14px" }}>
                    Employee Name
                  </td>
                  <td
                    style={{
                      ...t1CellVal,
                      width: "36%",
                      fontSize: "14px",
                      fontWeight: "800",
                    }}
                  >
                    {worker.full_name?.toUpperCase()}
                  </td>
                  <td style={{ ...t1CellAr, width: "28%", fontSize: "14px" }}>
                    اسم الموظفة
                  </td>
                </tr>
                <tr>
                  <td style={{ ...t1Cell, fontSize: "14px" }}>Employee No</td>
                  <td style={t1CellVal}></td>
                  <td style={{ ...t1CellAr, fontSize: "14px" }}>رقم الموظفة</td>
                </tr>
              </tbody>
            </table>

            {/* Sub-table B — Ref No / Job / Salary / Contract */}
            <table style={FW}>
              <tbody>
                <tr>
                  <td style={{ ...t1Cell, width: "36%", fontSize: "14px" }}>
                    Ref No
                  </td>
                  <td style={{ ...t1CellVal, width: "36%" }}></td>
                  <td style={{ ...t1CellAr, width: "28%", fontSize: "14px" }}>
                    الرقم المرجعي
                  </td>
                </tr>
                <tr>
                  <td style={{ ...t1Cell, fontSize: "14px" }}>
                    Job Description
                  </td>
                  <td style={{ ...t1CellVal }}>
                    {worker.primary_positions?.[0]?.toUpperCase() ||
                      "HOUSE MADE"}
                  </td>
                  <td style={{ ...t1CellAr, fontSize: "14px" }}>الوظيفة</td>
                </tr>
                <tr>
                  <td style={{ ...t1Cell, fontSize: "14px" }}>Salary</td>
                  <td style={t1CellVal}>{safeVal(worker.monthly_salary)}</td>
                  <td style={{ ...t1CellAr, fontSize: "14px" }}>
                    الراتب الشهري
                  </td>
                </tr>
                <tr>
                  <td style={{ ...t1Cell, fontSize: "14px" }}>
                    Contract Period
                  </td>
                  <td style={t1CellVal}></td>
                  <td style={{ ...t1CellAr, fontSize: "14px" }}>مدة العقد</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* APPLICANT DETAILS */}
        <T1Section en="APPLICANT DETAILS" ar="البيانات الشخصية" />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {/* Left Table: Nationality down to No. of children */}
          <table style={{ ...FW, width: "49%", borderCollapse: "collapse" }}>
            <tbody>
              {bRow(
                "Nationality",
                "الجنسية",
                safeVal(worker.nationality)?.toUpperCase(),
              )}
              {bRow(
                "Date of Birth",
                "تاريخ الميلاد",
                safeDate(worker.date_of_birth)?.toUpperCase(),
              )}
              {bRow(
                "Place of Birth",
                "مكان الميلاد",
                safeVal(worker.place_of_birth)?.toUpperCase(),
              )}
              {bRow(
                "Religion",
                "الديانة",
                safeVal(worker.religion)?.toUpperCase(),
              )}
              {bRow(
                "Marital Status",
                "الحالة الاجتماعية",
                safeVal(worker.marital_status)?.toUpperCase(),
              )}
              {bRow(
                "No. of children",
                "عدد الاطفال",
                String(worker.number_of_children ?? 0),
              )}
            </tbody>
          </table>

          {/* Right Table: Sex down to Qualification */}
          <table style={{ ...FW, width: "49%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ ...t1Cell, width: "30%" }}>Sex</td>
                <td style={{ ...t1CellVal, width: "40%" }}>
                  {safeVal(worker.sex?.toUpperCase())}
                </td>
                <td style={{ ...t1CellAr, width: "30%" }}>الجنس</td>
              </tr>
              <tr>
                <td style={t1Cell}>Age</td>
                <td style={t1CellVal}>{calcAge(worker.date_of_birth)}</td>
                <td style={t1CellAr}>العمر</td>
              </tr>
              <tr>
                <td style={t1Cell}>Height</td>
                <td style={t1CellVal}>{safeVal(worker.height_cm)}</td>
                <td style={t1CellAr}>الطول</td>
              </tr>
              <tr>
                <td style={t1Cell}>Weight</td>
                <td style={t1CellVal}>{safeVal(worker.weight_kg)}</td>
                <td style={t1CellAr}>الوزن</td>
              </tr>
              <tr>
                <td style={t1Cell}>Complexion</td>
                <td style={t1CellVal}></td>
                <td style={t1CellAr}>لون البشرة</td>
              </tr>
              <tr>
                <td style={t1Cell}>Qualification</td>
                <td style={t1CellVal}>{safeVal(worker.education)}</td>
                <td style={t1CellAr}>المؤهل</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── BODY: left form column + right standing-photo column ── */}
        <div style={s1.bodyRow}>
          {/* LEFT COLUMN */}
          <div style={s1.leftCol}>
            {/* TOP: 3×4 photo + two job-info sub-tables */}

            {/* PASSPORT DETAILS */}
            <T1Section en="PASSPORT DETAILS" ar="بيانات جواز السفر" />
            <table style={FW}>
              <tbody>
                {bRow(
                  "Passport No",
                  "رقم الجواز",
                  safeVal(worker.passport_number),
                )}
                {bRow(
                  "Date of Issue",
                  "تاريخ الاصدار",
                  safeDate(worker.passport_issue_date)?.toUpperCase(),
                )}
                {bRow(
                  "Place of Issue",
                  "مكان الاصدار",
                  safeVal(worker.place_of_birth)?.toUpperCase(),
                )}
                {bRow(
                  "Expiry Date",
                  "تاريخ الانتهاء",
                  safeDate(worker.passport_expiry_date)?.toUpperCase(),
                )}
              </tbody>
            </table>

            {/* LANGUAGE */}
            <T1Section en="LANGUAGE" ar="اللـغـات" />
            <table
              style={{ ...FW, marginBottom: "3px", borderCollapse: "collapse" }}
            >
              <thead>
                <tr>
                  <th
                    style={{ ...t1Cell, width: "15%", textAlign: "center" }}
                  ></th>
                  <th style={{ ...t1CbCell, width: "9%" }}>Y</th>
                  <th style={{ ...t1CbCell, width: "9%" }}>N</th>
                  <th
                    style={{ ...t1Cell, width: "23%", textAlign: "center" }}
                  ></th>
                  <th style={{ ...t1CbCell, width: "9%" }}>Y</th>
                  <th style={{ ...t1CbCell, width: "9%" }}>N</th>
                  <th
                    style={{ ...t1Cell, width: "26%", textAlign: "center" }}
                  ></th>
                </tr>
              </thead>
              <tbody>
                {/* Row 1: Poor */}
                <tr>
                  <td
                    style={{
                      ...t1Cell,
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                    rowSpan={3}
                  >
                    <div style={{ fontWeight: "700" }}>English</div>
                    <div style={{ fontFamily: ARABIC_FONT, fontSize: "10px" }}>
                      الإنجليزية
                    </div>
                  </td>
                  <td style={t1CbCell}>{englishLevel === "Poor" ? "✓" : ""}</td>
                  <td style={t1CbCell}>
                    {englishLevel && englishLevel !== "Poor" ? "✓" : ""}
                  </td>
                  <td
                    style={{ ...t1Cell, textAlign: "center", fontSize: "10px" }}
                  >
                    Poor / ضعيف
                  </td>
                  <td style={t1CbCell}>{arabicLevel === "poor" ? "✓" : ""}</td>
                  <td style={t1CbCell}>
                    {arabicLevel && arabicLevel !== "poor" ? "✓" : ""}
                  </td>
                  <td
                    style={{
                      ...t1Cell,
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                    rowSpan={3}
                  >
                    <div style={{ fontWeight: "700", fontFamily: ARABIC_FONT }}>
                      Arabic
                    </div>
                    <div style={{ fontFamily: ARABIC_FONT, fontSize: "10px" }}>
                      العربيـة
                    </div>
                  </td>
                </tr>

                {/* Row 2: Fair */}
                <tr>
                  <td style={t1CbCell}>
                    {englishLevel === "basic" ? "✓" : ""}
                  </td>
                  <td style={t1CbCell}>
                    {englishLevel && englishLevel !== "basic" ? "✓" : ""}
                  </td>
                  <td
                    style={{ ...t1Cell, textAlign: "center", fontSize: "10px" }}
                  >
                    Fair / وسط
                  </td>
                  <td style={t1CbCell}>{arabicLevel === "basic" ? "✓" : ""}</td>
                  <td style={t1CbCell}>
                    {arabicLevel && arabicLevel !== "basic" ? "" : ""}
                  </td>
                </tr>

                {/* Row 3: Fluent */}
                <tr>
                  <td style={t1CbCell}>
                    {englishLevel === "fluent" ? "✓" : ""}
                  </td>
                  <td style={t1CbCell}>
                    {englishLevel && englishLevel !== "fluent" ? "✓" : ""}
                  </td>
                  <td
                    style={{ ...t1Cell, textAlign: "center", fontSize: "10px" }}
                  >
                    Fluent / ممتاز
                  </td>
                  <td style={t1CbCell}>
                    {arabicLevel === "fluent" ? "✓" : ""}
                  </td>
                  <td style={t1CbCell}>
                    {arabicLevel && arabicLevel !== "fluent" ? "✓" : ""}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* WORK EXP. */}
            <T1Section en="WORK EXP." ar="خبرات العمل" />
            <table style={{ ...FW, marginBottom: "3px" }}>
              <tbody>
                {bRow(
                  "Country of Exp.",
                  "بلد الخبرة",
                  experience[0]?.country || "",
                )}
                {bRow(
                  "Years of Exp.",
                  "عدد سنين الخبرة",
                  experience[0]?.years || "",
                )}
              </tbody>
            </table>

            {/* FIELDS OF EXP. */}
            <T1Section en="FIELDS OF EXP." ar="مجالات الخبرة" />
            <table style={{ ...FW, marginBottom: "3px" }}>
              <tbody>
                <tr>
                  {["Baby Sitter", "Cooking", "Cleaning", "Washing"].map(
                    (sk) => (
                      <td
                        key={sk}
                        style={{ ...t1Cell, textAlign: "center", width: "25%" }}
                      >
                        {sk}
                      </td>
                    ),
                  )}
                </tr>
                <tr>
                  {(() => {
                    const extra = skills
                      .filter(
                        (s) =>
                          !["baby", "cook", "clean", "wash"].some((k) =>
                            s?.toLowerCase().includes(k),
                          ),
                      )
                      .slice(0, 4);
                    while (extra.length < 4) extra.push("");
                    return extra.map((s, i) => (
                      <td
                        key={i}
                        style={{ ...t1Cell, textAlign: "center", width: "25%" }}
                      >
                        {s}
                      </td>
                    ));
                  })()}
                </tr>
              </tbody>
            </table>

            {/* WORKER NO */}
            <table style={{ ...FW, marginBottom: "8px" }}>
              <tbody>{bRow("Worker NO", "رقم العاملة", "")}</tbody>
            </table>
          </div>
          {/* END LEFT COLUMN */}

          {/* RIGHT COLUMN: standing photo fixed container */}
          <div style={s1.rightCol}>
            <div style={s1.standingLabel}>APPLICANT PHOTO</div>
            {worker.photo_standing_url ? (
              <img
                src={worker.photo_standing_url}
                alt="standing"
                style={s1.standingPhoto}
                crossOrigin="anonymous"
              />
            ) : (
              <div
                style={{
                  ...s1.standingPhoto,
                  background: "#eee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  color: "#888",
                }}
              >
                PHOTO
              </div>
            )}
          </div>
        </div>
        {/* END BODY ROW */}

        {/* FOOTER */}
        <div style={s1.footer}>
          <span style={{ color: COLORS.t1Third }}>Location:</span> Saudi Arabia
          . Riyadh &nbsp;&nbsp;
          <span style={{ color: COLORS.t1Third }}>Telephone: </span>
          0096539111115 / 0112711115
        </div>
      </div>
      {/* END PAGE 1 */}

      {/* PAGE 2 — PASSPORT COPY */}
      <div style={{ ...s1.page, pageBreakBefore: "always" }}>
        <div style={s1.page2Title}>PASSPORT COPY</div>
        <div style={s1.page2Row}>
          <div style={s1.passportScanBox}>
            {worker.passport_scan_url ? (
              <img
                src={worker.passport_scan_url}
                alt="Passport Scan"
                style={s1.passportScan}
                crossOrigin="anonymous"
              />
            ) : (
              <div
                style={{
                  ...s1.passportScan,
                  background: "#eee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#999",
                }}
              >
                PASSPORT SCAN
              </div>
            )}
          </div>
          <div style={s1.page2PhotoBox}>
            {worker.photo_standing_url ? (
              <img
                src={worker.photo_standing_url}
                alt="Standing"
                style={s1.page2Photo}
                crossOrigin="anonymous"
              />
            ) : (
              <div
                style={{
                  ...s1.page2Photo,
                  background: "#eee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#999",
                }}
              >
                PHOTO
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── Template 1 section header ───────────────────────────────────────────────
const T1Section = ({ en, ar }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "15px",
      padding: "2px 6px",
      margin: "10px 0 0",
    }}
  >
    <span
      style={{
        fontWeight: "900",
        fontSize: "18px",
        color: COLORS.t1Primary,
        fontFamily: BASE_FONT,
      }}
    >
      {en}
    </span>
    <span
      style={{
        fontWeight: "800",
        fontSize: "20px",
        color: COLORS.t1Third,
        fontFamily: ARABIC_FONT,
      }}
    >
      {ar}
    </span>
  </div>
);

// ─── Template 1 styles ───────────────────────────────────────────────────────
const s1 = {
  page: {
    width: "730px",
    minHeight: "1123px",
    background: COLORS.t1Bg,
    fontFamily: BASE_FONT,
    padding: "18px 22px",
    boxSizing: "border-box",
    color: COLORS.t1Text,
    fontSize: "12px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    // borderBottom: `3px solid ${COLORS.t1Gold}`,
    paddingBottom: "10px",
    marginBottom: "10px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  agencyTextBlock: {
    display: "flex",
    flexDirection: "column",
  },
  agencyAr: {
    fontSize: "21px",
    fontWeight: "800",
    color: COLORS.t1Secondary,
    fontFamily: ARABIC_FONT,
    direction: "rtl",
    lineHeight: "1.3",
  },
  agencyEn: {
    fontSize: "10px",
    color: "#444",
    letterSpacing: "0.3px",
    marginTop: "2px",
    fontFamily: BASE_FONT,
  },
  logo: {
    height: "59px",
    width: "auto",
    objectFit: "contain",
  },
  logoPlaceholder: {
    width: "56px",
    height: "56px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    color: COLORS.t1Gold,
    border: `1px solid ${COLORS.t1Gold}`,
  },
  headerRight: {
    textAlign: "center",
  },
  appTitleEn: {
    fontSize: "18px",
    fontWeight: "900",
    color: COLORS.t1Primary,
    fontFamily: BASE_FONT,
  },
  appTitleAr: {
    fontSize: "19px",
    fontWeight: "900",
    color: COLORS.t1Third,
    fontFamily: ARABIC_FONT,
    direction: "rtl",
    marginTop: "2px",
    textAlign: "center",
  },
  bodyRow: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },
  leftCol: {
    flex: 1,
    minWidth: 0,
  },
  rightCol: {
    width: "260px",
    flexShrink: 0,
    textAlign: "center",
    marginTop: "16px",
  },
  topSection: {
    display: "flex",
    gap: "8px",
    alignItems: "flex-start",
  },
  photoBox: {
    width: "170px",
    flexShrink: 0,
    border: `2px solid ${COLORS.t1Third}`,
    overflow: "hidden",
  },
  photo3x4: {
    width: "100%",
    height: "165px",
    objectFit: "cover",
    display: "block",
  },
  photoPlaceholder: {
    width: "100%",
    height: "155px",
    background: "#eee",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    color: "#888",
  },
  jobTablesCol: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  standingLabel: {
    fontWeight: "800",
    fontSize: "15px",
    color: COLORS.t1Primary,
    marginBottom: "4px",
    fontFamily: BASE_FONT,
  },
  standingPhoto: {
    width: "100%",
    height: "480px",
    objectFit: "cover",
    objectPosition: "top",
    border: `2px solid ${COLORS.t1Border}`,
    borderLeft: `3px solid ${COLORS.t1Third}`,
    display: "block",
    margin: "0 auto",
  },
  footer: {
    textAlign: "center",
    fontSize: "11px",
    fontWeight: "700",
    borderTop: `1px solid ${COLORS.t1Text}`,
    paddingTop: "5px",
    marginTop: "8px",
    color: COLORS.t1Text,
    fontFamily: BASE_FONT,
  },
  page2Title: {
    fontWeight: "800",
    fontSize: "20px",
    marginBottom: "14px",
    color: COLORS.t1Text,
    fontFamily: BASE_FONT,
  },
  page2Row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  passportScanBox: { width: "50%", flexShrink: 0 },
  passportScan: {
    width: "100%",
    height: "380px",
    objectFit: "contain",
    border: `1px solid ${COLORS.t1Border}`,
    display: "block",
    borderRight: "none",
  },
  page2PhotoBox: {
    width: "50%",
    flexShrink: 0,
  },
  page2Photo: {
    width: "80%",
    height: "380px",
    objectFit: "cover",
    border: `1px solid ${COLORS.t1Border}`,
    borderLeft: "none",
    display: "block",
  },
};

// =============================================================================
// TEMPLATE 2 — JOMERY
// =============================================================================
const JomeryTemplate = React.forwardRef(({ worker }, ref) => {
  const langs = worker.languages || [];
  const skills = worker.skills || [];
  const experience = worker.experience || [];

  const englishLevel =
    langs
      .find((l) => l.language?.toLowerCase() === "english")
      ?.level?.toLowerCase() || "";
  const arabicLevel =
    langs
      .find((l) => l.language?.toLowerCase() === "arabic")
      ?.level?.toLowerCase() || "";

  const hasSkill = (kw) =>
    skills.some((s) => s?.toLowerCase().includes(kw.toLowerCase()));
  const cb = (yes) => (
    <span style={{ fontSize: "13px" }}>{yes ? "☑" : "☐"}</span>
  );

  const bRow2 = (en, ar, val) => (
    <tr>
      <td style={{ ...t2Cell, width: "35%" }}>{en}</td>
      <td style={{ ...t2CellVal, width: "40%" }}>{val}</td>
      <td style={{ ...t2CellAr, width: "25%" }}>{ar}</td>
    </tr>
  );

  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column" }}>
      {/* PAGE 1 */}
      <div style={s2.page}>
        {/* TOP ROW */}
        <div style={s2.topRow}>
          <div style={s2.photoBox}>
            {worker.photo_3x4_url ? (
              <img
                src={worker.photo_3x4_url}
                alt="photo"
                style={s2.photo}
                crossOrigin="anonymous"
              />
            ) : (
              <div
                style={{
                  ...s2.photo,
                  background: "#ddd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                PHOTO
              </div>
            )}
          </div>
          <table style={{ ...FW, flex: 1 }}>
            <tbody>
              {bRow2("Reference Number", "الرقم المرجعي", "")}
              {bRow2("Full Name", "الاسم", worker.full_name?.toUpperCase())}
              {bRow2(
                "Religion",
                "الديانة",
                safeVal(worker.religion)?.toUpperCase(),
              )}
              {bRow2(
                "Position Desired",
                "الوظيفة",
                worker.primary_positions?.[0]?.toUpperCase() || "HOUSE MAID",
              )}
              {bRow2("Salary", "الراتب", safeVal(worker.monthly_salary))}
              {bRow2("Age", "العمر", String(calcAge(worker.date_of_birth)))}
              {bRow2("Sex", "الجنس", safeVal(worker.sex))}
            </tbody>
          </table>
        </div>

        {/* TWO COLUMNS */}
        <div style={s2.twoCol}>
          <div style={s2.colLeft}>
            <T2Section en="Personal Information" ar="معلومات شخصية" />
            <table style={FW}>
              <tbody>
                {bRow2(
                  "Nationality",
                  "الجنسية",
                  safeVal(worker.nationality)?.toUpperCase(),
                )}
                {bRow2(
                  "Date of Birth",
                  "تاريخ الميلاد",
                  safeDate(worker.date_of_birth)?.toUpperCase(),
                )}
                {bRow2(
                  "Address",
                  "العنوان",
                  safeVal(worker.place_of_birth)?.toUpperCase(),
                )}
                {bRow2(
                  "Martial Status",
                  "الحالة الاجتماعية",
                  safeVal(worker.marital_status)?.toUpperCase(),
                )}
                {bRow2(
                  "No. of Children",
                  "عدد الأطفال",
                  String(worker.number_of_children ?? "NO"),
                )}
                {bRow2(
                  "Hight/Weight",
                  "الوزن والطول",
                  worker.height_cm
                    ? `${worker.height_cm}cm / ${worker.weight_kg}kg`
                    : "",
                )}
                {bRow2(
                  "Education",
                  "المستوى التعليمي",
                  safeVal(worker.education),
                )}
                {bRow2("Qualifications", "المؤهلات", "")}
                {bRow2(
                  "Tel. Number",
                  "رقم التواصل",
                  safeVal(worker.phone_number),
                )}
              </tbody>
            </table>
          </div>

          <div style={s2.colRight}>
            <T2Section en="Passport Information" ar="معلومات الجواز" />
            <table style={FW}>
              <tbody>
                {bRow2("Number", "رقم", safeVal(worker.passport_number))}
                {bRow2(
                  "Issue Date",
                  "تاريخ الإصدار",
                  safeDate(worker.passport_issue_date)?.toUpperCase(),
                )}
                {bRow2(
                  "Expiry Date",
                  "تاريخ الانتهاء",
                  safeDate(worker.passport_expiry_date)?.toUpperCase(),
                )}
                {bRow2(
                  "Issue place",
                  "مكان الإصدار",
                  safeVal(worker.place_of_birth)?.toUpperCase(),
                )}
                {bRow2(
                  "Next of Kin name",
                  "اسم شخص قريب",
                  safeVal(worker.guarantor_name),
                )}
                {bRow2(
                  "Next of Kin number",
                  "رقم القريب",
                  safeVal(worker.guarantor_phone_number),
                )}
              </tbody>
            </table>

            <div style={s2.standingRow}>
              {worker.photo_3x4_url && (
                <img
                  src={worker.photo_3x4_url}
                  alt="photo1"
                  style={s2.standingPhoto}
                  crossOrigin="anonymous"
                />
              )}
              {worker.photo_standing_url && (
                <img
                  src={worker.photo_standing_url}
                  alt="photo2"
                  style={s2.standingPhoto}
                  crossOrigin="anonymous"
                />
              )}
            </div>
          </div>
        </div>

        <div style={s2.remarksRow}>
          <span style={{ fontWeight: "700" }}>Remarks: </span>
        </div>

        <T2Section en="Overseas Experience" ar="خبرات سابقة" />
        <table style={{ ...FW, marginBottom: "6px" }}>
          <thead>
            <tr>
              <th style={t2Th}>Country</th>
              <th style={t2Th}>Period</th>
              <th style={t2Th}>Date</th>
            </tr>
          </thead>
          <tbody>
            {experience.length > 0
              ? experience.map((e, i) => (
                  <tr key={i}>
                    <td style={t2Cell}>{e.country}</td>
                    <td style={t2Cell}>{e.years} yrs</td>
                    <td style={t2Cell}></td>
                  </tr>
                ))
              : [0, 1, 2].map((i) => (
                  <tr key={i}>
                    <td style={t2Cell}>&nbsp;</td>
                    <td style={t2Cell}>&nbsp;</td>
                    <td style={t2Cell}>&nbsp;</td>
                  </tr>
                ))}
          </tbody>
        </table>

        <T2Section en="Skills" ar="المهارات" />
        <table style={{ ...FW, marginBottom: "6px" }}>
          <tbody>
            <tr>
              <td style={t2Cell}>
                {cb(hasSkill("cook"))} Cooking{" "}
                <span style={{ fontFamily: ARABIC_FONT, fontSize: "9px" }}>
                  الطبخ
                </span>
              </td>
              <td style={t2Cell}>
                {cb(hasSkill("baby"))} Baby Sitting{" "}
                <span style={{ fontFamily: ARABIC_FONT, fontSize: "9px" }}>
                  التعامل مع الأطفال
                </span>
              </td>
            </tr>
            <tr>
              <td style={t2Cell}>
                {cb(hasSkill("wash"))} Washing{" "}
                <span style={{ fontFamily: ARABIC_FONT, fontSize: "9px" }}>
                  الغسيل
                </span>
              </td>
              <td style={t2Cell}>
                {cb(hasSkill("sew"))} Sewing{" "}
                <span style={{ fontFamily: ARABIC_FONT, fontSize: "9px" }}>
                  الخياطة
                </span>
              </td>
            </tr>
            <tr>
              <td style={t2Cell}>
                {cb(hasSkill("clean"))} Cleaning{" "}
                <span style={{ fontFamily: ARABIC_FONT, fontSize: "9px" }}>
                  التنظيف
                </span>
              </td>
              <td style={t2Cell}>
                {cb(hasSkill("driv"))} Driving{" "}
                <span style={{ fontFamily: ARABIC_FONT, fontSize: "9px" }}>
                  سائق
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <T2Section en="Languages" ar="اللغات" />
        <table style={{ ...FW, marginBottom: "6px" }}>
          <thead>
            <tr>
              <th style={{ ...t2Th, width: "20%" }}></th>
              <th style={{ ...t2Th, width: "25%", textAlign: "center" }}>
                English{" "}
                <span style={{ fontFamily: ARABIC_FONT, fontSize: "9px" }}>
                  الإنجليزية
                </span>
              </th>
              <th style={{ ...t2Th, width: "25%", textAlign: "center" }}>
                Arabic{" "}
                <span style={{ fontFamily: ARABIC_FONT, fontSize: "9px" }}>
                  العربية
                </span>
              </th>
              <th
                style={{
                  ...t2Th,
                  width: "30%",
                  fontFamily: ARABIC_FONT,
                  textAlign: "right",
                }}
              ></th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Poor", ["poor", "basic"], "لا شيء"],
              ["Good", ["good"], "جيد"],
              ["Fluent", ["fluent", "native", "advanced"], "ممتاز"],
            ].map(([label, vals, ar]) => (
              <tr key={label}>
                <td style={t2Cell}>{label}</td>
                <td style={{ ...t2Cell, textAlign: "center" }}>
                  {cb(vals.includes(englishLevel))}
                </td>
                <td style={{ ...t2Cell, textAlign: "center" }}>
                  {cb(vals.includes(arabicLevel))}
                </td>
                <td style={t2CellAr}>{ar}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* END PAGE 1 */}

      {/* PAGE 2 — PASSPORT COPY */}
      <div style={{ ...s2.page, pageBreakBefore: "always" }}>
        <div style={s2.page2Title}>Passport Copy:</div>
        <div style={s2.page2Row}>
          <div style={s2.passportScanBox}>
            {worker.passport_scan_url ? (
              <img
                src={worker.passport_scan_url}
                alt="Passport Scan"
                style={s2.passportScan}
                crossOrigin="anonymous"
              />
            ) : (
              <div
                style={{
                  ...s2.passportScan,
                  background: "#eee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#999",
                }}
              >
                PASSPORT SCAN
              </div>
            )}
          </div>
          <div style={s2.page2PhotoBox}>
            {worker.photo_standing_url ? (
              <img
                src={worker.photo_standing_url}
                alt="Standing"
                style={s2.page2Photo}
                crossOrigin="anonymous"
              />
            ) : (
              <div
                style={{
                  ...s2.page2Photo,
                  background: "#eee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#999",
                }}
              >
                PHOTO
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── Template 2 section header ───────────────────────────────────────────────
const T2Section = ({ en, ar }) => (
  <div
    style={{
      background: COLORS.t2SectionBg,
      padding: "3px 6px",
      fontWeight: "800",
      fontSize: "11px",
      fontFamily: BASE_FONT,
      borderBottom: `1px solid ${COLORS.t2Border}`,
      marginTop: "5px",
      display: "flex",
      justifyContent: "space-between",
    }}
  >
    <span>{en}</span>
    <span style={{ fontFamily: ARABIC_FONT }}>{ar}</span>
  </div>
);

// ─── Template 2 styles ───────────────────────────────────────────────────────
const s2 = {
  page: {
    width: "794px",
    minHeight: "1123px",
    background: COLORS.t2Bg,
    fontFamily: BASE_FONT,
    padding: "16px 20px",
    boxSizing: "border-box",
    color: COLORS.t2Text,
    fontSize: "11px",
  },
  topRow: {
    display: "flex",
    marginBottom: "8px",
    border: `1px solid ${COLORS.t2Border}`,
    alignItems: "stretch",
  },
  photoBox: {
    width: "110px",
    flexShrink: 0,
    border: `1px solid ${COLORS.t2Border}`,
    overflow: "hidden",
  },
  photo: {
    width: "110px",
    height: "135px",
    objectFit: "cover",
    display: "block",
  },
  twoCol: {
    display: "flex",
    gap: "10px",
    marginBottom: "6px",
    alignItems: "flex-start",
  },
  colLeft: { flex: 1 },
  colRight: { flex: 1 },
  standingRow: {
    display: "flex",
    gap: "8px",
    marginTop: "10px",
    justifyContent: "center",
  },
  standingPhoto: {
    width: "112px",
    height: "170px",
    objectFit: "cover",
    border: `1px solid ${COLORS.t2Border}`,
  },
  remarksRow: {
    border: `1px solid ${COLORS.t2Border}`,
    padding: "5px 8px",
    marginBottom: "5px",
    minHeight: "22px",
    fontSize: "11px",
  },
  page2Title: {
    fontWeight: "800",
    fontSize: "14px",
    marginBottom: "12px",
    color: COLORS.t2Text,
    fontFamily: BASE_FONT,
  },
  page2Row: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
  },
  passportScanBox: { flex: 1 },
  passportScan: {
    width: "100%",
    height: "290px",
    objectFit: "contain",
    border: `1px solid ${COLORS.t2Border}`,
    display: "block",
  },
  page2PhotoBox: {
    width: "220px",
    flexShrink: 0,
  },
  page2Photo: {
    width: "100%",
    height: "350px",
    objectFit: "cover",
    border: `1px solid ${COLORS.t2Border}`,
    display: "block",
  },
};

// =============================================================================
// PICKER HELPERS
// =============================================================================
const pickerCard = {
  border: "2px solid #e0e0e0",
  borderRadius: "12px",
  overflow: "hidden",
  cursor: "pointer",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  background: "#fff",
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
};
const pickerBadge = (c) => ({
  background: c,
  color: "#fff",
  padding: "10px 16px",
  fontWeight: "700",
  fontSize: "14px",
});
const pickerPreview = {
  padding: "14px",
  background: "#fafafa",
  minHeight: "140px",
  borderBottom: "1px solid #eee",
};
const pickerBtn = (c) => ({
  background: "#f8f8f8",
  color: c,
  padding: "10px 16px",
  fontWeight: "700",
  fontSize: "12px",
  textAlign: "right",
});

// =============================================================================
// MAIN CV COMPONENT
// =============================================================================
const CV = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { profile } = useProfile();
  const cvRef = useRef(null);
  const isAdmin = profile?.role_id !== 4;

  const fetchWorkerData = useCallback(async () => {
    showLoader();
    try {
      const workerId = id || profile.id;
      const { data } = await getWorkerCVData(workerId);
      setWorker(data);
    } catch (err) {
      console.error(err);
    } finally {
      hideLoader();
    }
  }, [id || profile]);

  useEffect(() => {
    fetchWorkerData();
  }, [profile]);

  const handleGenerateAndUpload = async () => {
    if (!cvRef.current) return;
    showLoader();
    try {
      const element = cvRef.current;
      const orig = element.style.width;
      element.style.width = "794px";
      await new Promise((r) => setTimeout(r, 300));

      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: 2,
        windowWidth: 794,
        logging: false,
      });

      element.style.width = orig;

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();

      // 1123px per page × scale 2
      const pageHeightPx = 1123 * 2;
      const totalPages = Math.ceil(canvas.height / pageHeightPx);

      for (let p = 0; p < totalPages; p++) {
        if (p > 0) pdf.addPage();
        const strip = document.createElement("canvas");
        strip.width = canvas.width;
        strip.height = Math.min(pageHeightPx, canvas.height - p * pageHeightPx);
        strip.getContext("2d").drawImage(canvas, 0, -p * pageHeightPx);
        const imgData = strip.toDataURL("image/jpeg", 0.9);
        const imgH = (strip.height * pdfW) / strip.width;
        pdf.addImage(
          imgData,
          "JPEG",
          0,
          0,
          pdfW,
          Math.min(imgH, pdfH),
          undefined,
          "FAST",
        );
      }

      const pdfBlob = pdf.output("blob");
      const templateLabel =
        selectedTemplate === "ethio_saudi" ? "EthioSaudi" : "Jomery";
      const fileName = `${worker.full_name.replace(/\s+/g, "_")}_CV_${templateLabel}.pdf`;
      const file = new File([pdfBlob], fileName, { type: "application/pdf" });

      const fd = new FormData();
      fd.append("file", file);
      fd.append(
        "file_name",
        `${worker.full_name.replace(/\s+/g, "_")}_CV_${templateLabel}`,
      );
      fd.append("category", "CV");
      fd.append("is_private", 0);
      fd.append(
        "description",
        `CV for ${worker.full_name} — ${templateLabel} format`,
      );
      fd.append("worker_id", worker.id);

      await uploadFile(fd);
      addMessage(
        true,
        `CV ${worker.cv_url ? "updated" : "generated"} and uploaded successfully!`,
      );
    } catch (err) {
      addMessage(false, "Failed to generate PDF");
    } finally {
      hideLoader();
    }
  };

  if (!worker) return null;

  // ── TEMPLATE PICKER ──────────────────────────────────────────────────────
  if (!selectedTemplate) {
    return (
      <div className="dashboard-wraper">
        <div className="d-flex justify-content-between align-items-center pb-2">
          <h2 className="text-dark mb-2">{isAdmin ? "Employee" : "My"} CV</h2>
          {isAdmin && <BackButton onClick={() => navigate(-1)} />}
        </div>
        <p className="text-muted mb-4">
          Select the CV format your partner requires before generating.
        </p>

        <div className="row g-4">
          <div className="col-md-6">
            <div
              onClick={() => setSelectedTemplate("ethio_saudi")}
              style={pickerCard}
              className="picker-card"
            >
              <div style={pickerBadge(COLORS.t1Third)}>Ethio Saudi</div>
              <div style={pickerPreview}>
                <div
                  style={{
                    fontSize: "9px",
                    fontWeight: "700",
                    color: COLORS.t1Third,
                    borderBottom: `2px solid ${COLORS.t1Gold}`,
                    paddingBottom: "4px",
                    marginBottom: "6px",
                    fontFamily: ARABIC_FONT,
                  }}
                >
                  مكتب عبداله عبدالعزيز العنقري للإستقدام
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <div
                    style={{
                      width: "38px",
                      height: "48px",
                      background: "#ddd",
                      flexShrink: 0,
                      border: `2px solid ${COLORS.t1Primary}`,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    {["Employee Name", "Job Description", "Salary"].map((f) => (
                      <div
                        key={f}
                        style={{
                          fontSize: "8px",
                          borderBottom: "1px solid #ddd",
                          padding: "1px 0",
                        }}
                      >
                        {f}:{" "}
                        <span
                          style={{ color: COLORS.t1Third, fontWeight: "700" }}
                        >
                          ——
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  style={{
                    marginTop: "6px",
                    borderTop: `2px solid ${COLORS.t1Third}`,
                    borderBottom: `2px solid ${COLORS.t1Third}`,
                    color: COLORS.t1Third,
                    fontSize: "7px",
                    padding: "1px 4px",
                    fontWeight: "800",
                  }}
                >
                  APPLICANT DETAILS — البيانات الشخصية
                </div>
                <div
                  style={{
                    fontSize: "7px",
                    color: "#555",
                    marginTop: "4px",
                    textAlign: "center",
                  }}
                >
                  Abdualалah Abdulaziz Alangari Format · 2 pages
                </div>
              </div>
              <div style={pickerBtn(COLORS.t1Primary)}>
                Select This Format →
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div
              onClick={() => setSelectedTemplate("jomery")}
              style={pickerCard}
              className="picker-card"
            >
              <div style={pickerBadge(COLORS.t2Primary)}>Jomery</div>
              <div style={pickerPreview}>
                <div
                  style={{ display: "flex", gap: "6px", marginBottom: "6px" }}
                >
                  <div
                    style={{
                      width: "34px",
                      height: "44px",
                      background: "#ddd",
                      flexShrink: 0,
                      border: `1px solid ${COLORS.t2Border}`,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    {[
                      "Reference Number",
                      "Full Name",
                      "Religion",
                      "Position Desired",
                    ].map((f) => (
                      <div
                        key={f}
                        style={{
                          fontSize: "8px",
                          borderBottom: "1px solid #ddd",
                          padding: "1px 0",
                        }}
                      >
                        {f}:{" "}
                        <span
                          style={{ color: COLORS.t2Primary, fontWeight: "700" }}
                        >
                          ——
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  <div
                    style={{
                      flex: 1,
                      background: COLORS.t2SectionBg,
                      fontSize: "7px",
                      padding: "1px 3px",
                      fontWeight: "700",
                    }}
                  >
                    Personal Information
                  </div>
                  <div
                    style={{
                      flex: 1,
                      background: COLORS.t2SectionBg,
                      fontSize: "7px",
                      padding: "1px 3px",
                      fontWeight: "700",
                    }}
                  >
                    Passport Information
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "7px",
                    color: "#555",
                    marginTop: "8px",
                    textAlign: "center",
                  }}
                >
                  Jomery Agency Format · 2 pages
                </div>
              </div>
              <div style={pickerBtn(COLORS.t2Primary)}>
                Select This Format →
              </div>
            </div>
          </div>
        </div>

        <style>{`.picker-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,.15)!important}`}</style>
      </div>
    );
  }

  // ── CV PREVIEW ────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-wraper">
      <div className="d-flex justify-content-between align-items-center pb-2">
        <h2 className="text-dark mb-2">{isAdmin ? "Employee" : "My"} CV</h2>
        {isAdmin && <BackButton onClick={() => navigate(-1)} />}
      </div>

      {isAdmin && (
        <div className="d-flex gap-2 mb-3">
          <button
            className="btn btn-main px-4 text-white rounded d-flex align-items-center gap-2"
            onClick={handleGenerateAndUpload}
          >
            {worker.cv_url ? "Update CV" : "Generate & Upload CV"}
          </button>
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        {selectedTemplate === "ethio_saudi" ? (
          <EthioSaudiTemplate ref={cvRef} worker={worker} />
        ) : (
          <JomeryTemplate ref={cvRef} worker={worker} />
        )}
      </div>
    </div>
  );
};

export default CV;
