// components/InsuranceReport/insuranceReport.util.js
import { getInsuranceParticulars } from "../../api/insurance.api"; // adjust to your actual path
import { buildInsuranceReportHtml } from "./InsuranceReportTemplate";

// Bundler-processed imports — these resolve to real, absolute URLs at build time
// (e.g. "/assets/mmh-logo-3f8a1c2.png"), which is what makes them work inside
// a window.open() document, unlike bare relative path strings.
import agencyLogo from "../../../../assets/img/logo/nyala.jpg"; // agency logo — swap filename to your actual left-side logo
import centerGraphic from "../../../../assets/img/logo/nyala-mid.jpg"; // center travel/insurance graphic

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
