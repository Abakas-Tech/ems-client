const ORG = {
  insurerName: "Nyala Insurance S.C",
  insurerAmharic: "ኒያላ ኢንሹራንስ አ.ማ",
  insurerAddress: "Protection House, Miky Leland Street",
  insurerPOBox: "P.O. Box 12753",
  insurerPhone: "Tel: 251-116-626667, Fax: 251-116-626706",
  insurerWebsite: "www.nyalainsurance.com",
};

const val = (v) => (v === null || v === undefined ? "" : String(v));

const fmtDate = (v) =>
  v
    ? new Date(v).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
    : "";

const titleOption = (title, option) =>
  `<span class="${val(title).toLowerCase() === option.toLowerCase() ? "titleSel" : ""}">${option}</span>`;

const buildDocumentHtml = (doc, index, total, logos) => {
  const life = doc.particularsOfLifeAssured || {};
  const agency = doc.particularsOfTravelAgency || {};
  const beneficiaries = doc.beneficiaryInformation || [];
  const address = life.address || {};
  const emergency = life.emergencyContact || {};

  const beneficiaryRows = beneficiaries
    .map(
      (b) => `
      <div class="beneficiaryRow">
        <span class="beneficiaryIndex">${val(b.row)}.</span>
        <span class="beneficiaryCell colName"><span class="line">${val(b.fullName)}</span></span>
        <span class="beneficiaryCell colRel"><span class="line">${val(b.relationship)}</span></span>
        <span class="beneficiaryCell colPct center"><span class="line">${val(b.percentageShare)}</span></span>
        <span class="beneficiaryCell colAddr"><span class="line">${val(b.addressTelephone)}</span></span>
      </div>`,
    )
    .join("");

  return `
  <div class="page${index < total - 1 ? " pageBreak" : ""}">
    <div class="letterhead">
      <div class="agencyBlock">
        ${logos.agencyLogoUrl ? `<img src="${logos.agencyLogoUrl}" alt="Agency" class="agencyLogo" />` : ""}
      </div>
      <div class="centerBlock">
        ${logos.centerImageUrl ? `<img src="${logos.centerImageUrl}" alt="" class="centerImage" />` : ""}
      </div>
      <div class="insurerBlock">
        <div class="amharic">${ORG.insurerAmharic}</div>
        <div class="insurerName">${ORG.insurerName}</div>
        <div class="insurerMeta">${ORG.insurerPhone}</div>
        <div class="insurerMeta">${ORG.insurerPOBox} &nbsp; ${ORG.insurerAddress}</div>
        <div class="insurerMeta">${ORG.insurerWebsite}</div>
      </div>
    </div>

    <div class="formTitle">Foreign Employment Term Assurance (FETAP) Proposal Form</div>

    <div class="sectionHeading">1. Particulars of the Life Assured:</div>
    <div class="titleRow">
      <span class="label">Title:</span>
      ${titleOption(life.title, "Mr.")}/${titleOption(life.title, "Ms.")}/${titleOption(life.title, "Mrs.")}
      <span class="hint">(As printed in the passport)</span>
    </div>

    <div class="fieldRow">
      <span class="label">Name:</span><span class="line grow2">${val(life.name)}</span>
      <span class="label">Father's Name:</span><span class="line grow2">${val(life.fathersName)}</span>
      <span class="label">G. Father's Name:</span><span class="line grow2">${val(life.grandfathersName)}</span>
    </div>

    <div class="fieldRow">
      <span class="label">Date of Birth</span><span class="line grow2">${fmtDate(life.dateOfBirth)}</span>
      <span class="label">Place of Birth</span><span class="line grow2">${val(life.placeOfBirth)}</span>
      <span class="label">Passport Number</span><span class="line grow2">${val(life.passportNumber)}</span>
      <span class="label">Gender</span><span class="line grow1">${val(life.gender).charAt(0).toUpperCase()}</span>
    </div>

    <div class="fieldRow">
      <span class="label">Address - Region:</span><span class="line grow2">${val(address.region)}</span>
      <span class="label">City:</span><span class="line grow2">${val(address.city)}</span>
      <span class="label">Sub City:</span><span class="line grow2">${val(address.subCity)}</span>
      <span class="label">Woreda:</span><span class="line grow1">${val(address.woreda)}</span>
      <span class="label">Kebele:</span><span class="line grow1">${val(address.kebele)}</span>
      <span class="label">H. No.:</span><span class="line grow1">${val(address.houseNo)}</span>
    </div>

    <div class="fieldRow">
      <span class="label">Occupation:</span><span class="line grow2">${val(life.occupation)}</span>
      <span class="label">Marital Status:</span><span class="line grow2">${val(life.maritalStatus)}</span>
      <span class="label">Labor ID Number:</span><span class="line grow2">${val(life.laborIdNumber)}</span>
    </div>

    <div class="fieldRow">
      <span class="label">Contact Person in case of Emergency Name:</span><span class="line grow3">${val(emergency.name)}</span>
      <span class="label">Telephone:</span><span class="line grow2">${val(emergency.telephone)}</span>
    </div>

    <div class="sectionHeading">2. Particulars of the Travel</div>
    <div class="fieldRow">
      <span class="label">Agency Name:</span><span class="line grow2">${val(agency.name)}</span>
      <span class="label">Agency Contact Name:</span><span class="line grow2">${val(agency.agencyContactName)}</span>
      <span class="label">Telephone:</span><span class="line grow2">${val(agency.telephone)}</span>
    </div>
    <div class="fieldRow">
      <span class="label">Destination Country:</span><span class="line grow2">${val(agency.destinationCountry)}</span>
      <span class="label">Departure (Effective) Date:</span><span class="line grow2">${fmtDate(agency.departureDate)}</span>
    </div>

    <div class="sectionHeading">3. Beneficiary Information</div>
    <div class="beneficiaryNote">
      I hereby assign the policy benefits to the following beneficiaries. Policy benefit payments are subject to required claim documents, court order and liquidation report attested by the court.
    </div>

    <div class="beneficiaryHeaderRow">
      <span class="beneficiaryIndex"></span>
      <span class="beneficiaryCell colName">Full Name</span>
      <span class="beneficiaryCell colRel">Relationship</span>
      <span class="beneficiaryCell colPct center">Percentage Share</span>
      <span class="beneficiaryCell colAddr">Address/Telephone</span>
    </div>

    ${beneficiaryRows}

    <div class="beneficiaryRow totalRow">
      <span class="beneficiaryIndex"></span>
      <span class="beneficiaryCell colName"></span>
        <span class="beneficiaryCell colAddr"></span>
      <span class="beneficiaryCell colRel totalLabel">Total</span>
      <span class="beneficiaryCell colPct center"><span class="totalValue">100%</span></span>
    
    </div>

    <div class="attachNote">Please attach a copy of Passport and Kebele ID to this form.</div>

    <div class="signRow">
      <span class="label">Name of Life Assured:</span><span class="line grow2"></span>
      <span class="label">Signature:</span><span class="line grow2"></span>
      <span class="label">Date:</span><span class="line grow1"></span>
    </div>

    <div class="brandStrip">
      <svg viewBox="0 0 800 40" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,25 C150,5 300,38 450,20 C600,2 700,30 800,15 L800,40 L0,40 Z" fill="url(#brandGrad)"/>
        <defs>
          <linearGradient id="brandGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#f5a623"/>
            <stop offset="100%" stop-color="#8b1e3f"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  </div>`;
};

export const buildInsuranceReportHtml = (documents = [], logos = {}) => {
  const total = documents.length;
  const pages = documents
    .map((doc, i) => buildDocumentHtml(doc, i, total, logos))
    .join("\n");

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>Insurance Proposal Form</title>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  @page{size:A4;margin:0;}
  body{font-family:"Times New Roman",Times,serif;color:#111;background:#fff;print-color-adjust:exact;-webkit-print-color-adjust:exact;}
  .page{position:relative;width:210mm;min-height:297mm;padding:14mm 10mm;font-size:11.5pt;}
  .pageBreak{page-break-after:always;}

  .letterhead{display:flex;justify-content:space-between;align-items:center;padding-bottom:8px;margin-bottom:14px;gap:14px;}
  .agencyBlock{flex:0 0 auto;display:flex;align-items:center;}
  .agencyLogo{height:100px;width:100px;object-fit:contain;border-radius:50%;}
  .centerBlock{flex:1;display:flex;justify-content:center;align-items:center;}
  .centerImage{height:100px;object-fit:contain;}
  .insurerBlock{flex:0 0 auto;text-align:left;line-height:1.5;}
  .amharic{font-size:12pt;font-weight:700;color:#8b1e3f}
  .insurerName{font-size:14pt;font-weight:700;;}
  .insurerMeta{font-size:9pt;color:#D97D53;}

  .formTitle{text-align:center;font-weight:700;font-size:14pt;margin:12px 0 18px;}
  .sectionHeading{font-weight:700;;font-size:12pt;margin:18px 0 9px;}

  .titleRow{margin-bottom:14px;font-size:12pt;}
  .titleSel{font-weight:700;text-decoration:underline;}

  .fieldRow{display:flex;flex-wrap:wrap;align-items:flex-end;gap:7px;margin-bottom:16px;font-size:12pt;}
  .label{font-weight:600;white-space:nowrap;}
  .line{border-bottom:1px solid #000;min-width:40px;padding:0 4px;flex-grow:1;display:inline-block;}
  .grow1{flex-grow:0;} .grow2{flex-grow:1;} .grow3{flex-grow:2;}
  .hint{font-size:9pt;color:#555;margin-left:6px;}

  .beneficiaryNote{font-size:11.5pt;margin-bottom:14px;}

  /* Beneficiary block: header + rows share identical column widths so
     underlines in each row sit exactly beneath their header label. */
  .beneficiaryHeaderRow,.beneficiaryRow{display:flex;align-items:flex-end;gap:8px;}
  .beneficiaryHeaderRow{font-weight:700;font-size:10.5pt;margin-bottom:14px;}
  .beneficiaryRow{font-size:11.5pt;margin-bottom:12px;}

  .beneficiaryIndex{width:20px;flex:0 0 20px;font-weight:600;}
  .beneficiaryCell{display:flex;}
  .colName{flex:0 0 28%;}
  .colRel{flex:0 0 18%;}
  .colPct{flex:0 0 16%;}
  .colAddr{flex:0 0 28%;}
  .beneficiaryCell .line{width:100%;}
  .center{text-align:center;justify-content:center;}

  .totalRow{margin-top:4px;}
  .totalLabel{font-weight:700;text-align:right;padding-right:6px;}
  .totalValue{font-weight:700;text-align:center;}

  .attachNote{font-size:9.5pt;margin:18px 0 18px;}
  .signRow{display:flex;gap:10px;align-items:flex-end;font-size:11.5pt;}

  .brandStrip{position:absolute;left:0;right:0;bottom:0;height:62px;line-height:0;}
  .brandStrip svg{width:100%;height:100%;display:block;}
</style>
</head><body>${pages}</body></html>`;
};
