import React from "react";
import cvHeader from "../../../../../../assets/img/cv/cv-header.png";

function SampleCV() {
  return (
    <>
      <img src={cvHeader} alt="CV Header" className="w-full h-auto img-fluid" />
      <table className="table table-bordered">
        <thead>
          <tr>
            <th colSpan="3" className="text-center fw-bold">
              Application for Employment التوظيف
            </th>

            {/* empty header cell for photo column */}
            <th />
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Reference No</td>
            <td>Ahmed</td>
            <td>الاسم الأول</td>

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
            <td>اسم الأب</td>
          </tr>

          <tr>
            <td>Monthly Salary</td>
            <td>Hassan</td>
            <td>اسم العائلة</td>
          </tr>

          <tr>
            <td>Contract Period</td>
            <td>P1234567</td>
            <td>رقم الجواز</td>
          </tr>

         
        </tbody>
      </table>
    </>
  );
}

export default SampleCV;
