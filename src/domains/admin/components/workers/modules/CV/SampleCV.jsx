import React from "react";
import cvHeader from "../../../../../../assets/img/cv/cv-header.png";
import samplePhoto from "../../../../../../assets/img/cv/sample-photo.jpg";

function SampleCV() {
  return (
    <>
      <img src={cvHeader} alt="CV Header" className="w-full h-auto img-fluid" />

      {/* ════════ TOP CV TABLE ════════ */}
      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th
              colSpan="3"
              className="text-center text-white fw-bold"
              style={{ backgroundColor: "#83632B" }}
            >
              Application for Employment طلب التوظيف
            </th>

            <th
              className="text-center fw-bold text-white"
              style={{ backgroundColor: "#83632B" }}
            >
              Personal Photo
            </th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Reference No</td>
            <td>Ahmed</td>
            <td>رقم المرجع</td>

            <td rowSpan="4" className="text-center align-middle">
              <img
                src={samplePhoto}
                alt="Candidate"
                className="img-fluid"
                style={{
                  width: "180px",
                  height: "180px",
                  objectFit: "cover",
                }}
              />
            </td>
          </tr>

          <tr>
            <td>Post Applied For</td>
            <td>Ali</td>
            <td>وظيفة</td>
          </tr>

          <tr>
            <td>Monthly Salary</td>
            <td>Hassan</td>
            <td>راتب شهري</td>
          </tr>

          <tr>
            <td>Contract Period</td>
            <td>P1234567</td>
            <td>مدة العقد</td>
          </tr>
        </tbody>
      </table>

      {/* ════════ MAIN 2-COLUMN SECTION ════════ */}
      <div className="d-flex" style={{ borderBottom: "1px solid #000" }}>
        {/* ── LEFT SIDE ── */}
        <div style={{ flex: 1, borderRight: "2px solid #000" }}>
          {/* Details of Applicant */}
          <table className="table table-bordered mb-0" style={{ fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{ backgroundColor: "#83632B" }}>
                  Details of Applicant
                </th>
                <th style={{ backgroundColor: "#83632B" }}></th>
                <th
                  style={{
                    backgroundColor: "#83632B",
                    direction: "rtl",
                    textAlign: "end",
                  }}
                >
                  بيانات الطلب
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Nationality</td>
                <td>{nat}</td>
                <td style={{ direction: "rtl" }}>الجنسيه</td>
              </tr>

              <tr>
                <td>Religion</td>
                <td>{rel}</td>
                <td style={{ direction: "rtl" }}>الديانه</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── RIGHT SIDE ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Passport */}
          <table className="table table-bordered mb-0" style={{ fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{ backgroundColor: "#83632B" }}>Passport Detail</th>
                <th style={{ backgroundColor: "#83632B" }}></th>
                <th
                  style={{
                    backgroundColor: "#83632B",
                    direction: "rtl",
                    textAlign: "end",
                  }}
                >
                  تفاصيل جواز
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Passport No</td>
                <td>{ppNo}</td>
                <td style={{ direction: "rtl" }}>رقم الجواز</td>
              </tr>
            </tbody>
          </table>

          {/* Standing Photo */}
          <div className="d-flex align-items-center justify-content-center flex-grow-1 p-2">
            {bodyUrl ? (
              <img
                src={bodyUrl}
                alt="full body"
                style={{ width: 160, height: 230, objectFit: "cover" }}
              />
            ) : (
              <div style={{ width: 160, height: 230, background: "#ddd" }} />
            )}
          </div>
        </div>
      </div>

      {/* ════════ REMARKS ════════ */}
      <div
        className="d-flex align-items-center gap-3 px-2 py-1"
        style={{ fontSize: 11 }}
      >
        <span className="fw-bold">Remarks</span>
        <span style={{ color: "#83632B" }}>{remarks}</span>
        <span style={{ color: "#83632B" }}>{remDate}</span>
      </div>
    </>
  );
}

export default SampleCV;
