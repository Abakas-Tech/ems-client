import React from "react";
import cvHeader from "../../../../../../assets/img/cv/cv-header.png";

function SampleCV() {
  return (
    <>
      <img src={cvHeader} alt="CV Header" className="w-full h-auto img-fluid" />
      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th colSpan="3" className="text-center fw-bold">
              Application for Employment طلب التوظيف 
            </th>

            {/* empty header cell for photo column */}
            <th />
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Reference No</td>
            <td>Ahmed</td>
            <td>رقم المرجع</td>

            <td rowSpan="5" className="text-center align-middle">
              <img
                alt="Candidate"
                className="img-fluid"
                style={{
                  width: "120px",
                  height: "160px",
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
            <td>راتب العاقد</td>
          </tr>

          <tr>
            <td>Contract Period</td>
            <td>P1234567</td>
            <td>مدة العقد</td>
          </tr>

         
        </tbody>
      </table>
    </>
  );
}

export default SampleCV;
