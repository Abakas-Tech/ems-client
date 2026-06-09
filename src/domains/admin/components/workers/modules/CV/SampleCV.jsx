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
          <tr>
            <td colSpan="4" className="p-0">
              <div className="row g-0">
                <div className="col-6 border-end p-2">Left Side Content</div>

                <div className="col-6 p-2">Right Side Content</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

export default SampleCV;