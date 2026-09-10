// components/InsuranceReport/insuranceReport.util.js
import { getInsuranceParticulars } from "../../api/insurance.api";
import { buildInsuranceReportHtml } from "./InsuranceReportTemplate";

import agencyLogo from "../../../../assets/img/insurance/nyala.jpg";
import centerGraphic from "../../../../assets/img/insurance/nyala-mid.jpg";

// Same hidden-iframe + srcdoc + window.print() technique used by the
// other print modules (PrintInvoice.js, PeriodReport.jsx) — renders into
// a fully isolated, invisible document instead of window.open(), so no
// extra browser window/tab is left sitting behind the print dialog.
const openAndPrint = (html) => {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
  };

  iframe.onload = () => {
    const win = iframe.contentWindow;
    if (!win) return;

    win.focus();
    win.addEventListener("afterprint", cleanup);

    setTimeout(() => {
      try {
        win.print();
      } catch {
        cleanup();
      }
    }, 150);

    setTimeout(cleanup, 4000);
  };

  iframe.srcdoc = html;
  document.body.appendChild(iframe);
};

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

  openAndPrint(html);

  return res?.data?.missingWorkerIds || [];
}
