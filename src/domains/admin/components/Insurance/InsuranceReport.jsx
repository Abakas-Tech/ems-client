// components/InsuranceReport/insuranceReport.util.js
import { getInsuranceParticulars } from "../../api/insurance.api"; 
import { buildInsuranceReportHtml } from "./InsuranceReportTemplate";

import agencyLogo from "../../../../assets/img/insurance/nyala.jpg"; 
import centerGraphic from "../../../../assets/img/insurance/nyala-mid.jpg"; 

export async function printInsuranceParticulars(workerIds) {
  if (!Array.isArray(workerIds) || workerIds.length === 0) {
    throw new Error(
      "Select at least one employee to print an insurance form for.",
    );
  }

  const res = await getInsuranceParticulars(workerIds);
  const documents = res?.data?.documents || [];

  if (!documents.length) {
    throw new Error(
      "No insurance particulars found for the selected employee(s).",
    );
  }

  const html = buildInsuranceReportHtml(documents, {
    agencyLogoUrl: agencyLogo,
    centerImageUrl: centerGraphic,
  });

  const win = window.open("", "_blank", "width=900,height=1000");
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);

  return res?.data?.missingWorkerIds || [];
}
