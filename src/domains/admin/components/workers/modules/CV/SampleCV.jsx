import React from "react";
import cvHeader from "../../../../../../assets/img/cv/cv-header.png";

function SampleCV() {
  return (
    <>
      <img src={cvHeader} alt="CV Header" className="w-full h-auto img-fluid" />
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Reference No</th>
            <th>Passport No</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Ahmed Ali</td>
            <td>P1234567</td>
            <td>Medical</td>
          </tr>

          <tr>
            <td>Mohammed Hassan</td>
            <td>P2345678</td>
            <td>Embassy</td>
          </tr>

          <tr>
            <td>Abebe Bekele</td>
            <td>P3456789</td>
            <td>Visa Issued</td>
          </tr>

          <tr>
            <td>Yonas Tesfaye</td>
            <td>P4567890</td>
            <td>Ticket</td>
          </tr>

          <tr>
            <td>Khalid Omar</td>
            <td>P5678901</td>
            <td>Departed</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

export default SampleCV;
