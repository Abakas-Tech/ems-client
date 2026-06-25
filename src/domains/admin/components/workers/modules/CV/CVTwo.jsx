import React, { useState, useEffect, useCallback, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { getWorkerCVData } from "../../../../api/worker.api";
import { uploadFile } from "../../../../api/file.api";
import BackButton from "../../../../../../shared/components/BackButton/BackButton";
import useLoader from "../../../../../../context/Loader/useLoader";
import useResponse from "../../../../../../context/Response/useResponse";
import useProfile from "../../../../../../context/Profile/useProfile";
import { useParams, useNavigate } from "react-router-dom";
import brandLogo from "../../../../../../assets/img/logo/brand-header.png";
const safeText = (v, fallback = "—") =>
  v !== undefined && v !== null && String(v).trim() !== ""
    ? String(v)
    : fallback;

const safeDate = (d, fallback = "—") => {
  if (!d) return fallback;
  const s = String(d);
  return s.includes("T") ? s.slice(0, 10) : s;
};

const yesNo = (v, fallback = "") => {
  if (v === true || v === "YES" || v === "Yes" || v === "yes" || v === 1)
    return "YES";
  if (v === false || v === "NO" || v === "No" || v === "no" || v === 0)
    return "NO";
  return fallback;
};

const CV = () => {
  const { id } = useParams();
  const cvRef = useRef(null);
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { profile } = useProfile();

  const fetchWorkerData = useCallback(async () => {
    showLoader();
    try {
      const workerId = id ? id : profile.id;
      const { data } = await getWorkerCVData(workerId);
      setWorker(data);
    } catch (err) {
      console.error(err);
      addMessage(false, "Failed to load CV data");
    } finally {
      hideLoader();
    }
  }, [id, profile, showLoader, hideLoader, addMessage]);

  useEffect(() => {
    if (profile?.id || id) {
      fetchWorkerData();
    }
  }, []);

  const handleGenerateAndUpload = async () => {
    if (!cvRef.current || !worker) return;

    showLoader();
    try {
      const element = cvRef.current;
      const originalWidth = element.style.width;
      element.style.width = "794px";

      await new Promise((resolve) => setTimeout(resolve, 400));

      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: 2,
        backgroundColor: "#ffffff",
        windowWidth: 794,
        scrollX: 0,
        scrollY: 0,
      });

      element.style.width = originalWidth;

      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = 210;
      const pageHeight = 287;
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(
        imgData,
        "JPEG",
        0,
        position,
        imgWidth,
        imgHeight,
        undefined,
        "FAST",
      );
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          imgData,
          "JPEG",
          0,
          position,
          imgWidth,
          imgHeight,
          undefined,
          "FAST",
        );
        heightLeft -= pageHeight;
      }

      const pdfBlob = pdf.output("blob");
      const fileName = `${worker.full_name.replace(/\s+/g, "_")}_CV.pdf`;

      const file = new File([pdfBlob], fileName, { type: "application/pdf" });

      const originalName = `${worker.full_name.replace(/\s+/g, "_")}_CV`;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("file_name", originalName);
      formData.append("category", "CV");
      formData.append("is_private", 0);
      formData.append(
        "description",
        `CV for ${safeText(worker.full_name, "Worker")}`,
      );
      formData.append("worker_id", worker.id);

      await uploadFile(formData);

      const responseType = worker.cv_url ? "updated" : "generated";
      addMessage(true, `CV ${responseType} and uploaded successfully!`);
    } catch (err) {
      console.error(err);
      addMessage(false, "Failed to generate PDF");
    } finally {
      hideLoader();
    }
  };

  // calculate contract period in year or month
  const subtractDate = (d1, d2) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    const diff = date1.getTime() - date2.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    return years > 0 ? `${years} years` : `${months} months`;
  };
  if (!worker) return null;

  console.log(worker);
  const clientData = {
    referenceNo: safeText(worker.reference_no, ""),
    postAppliedFor: safeText(worker.skills[0], ""),
    monthlySalary: safeText(
      worker.monthly_salary ? `${worker.monthly_salary} SR` : "",
      "",
    ),
    contractPeriod: safeText(
      worker.contract_start_date && worker.contract_end_date
        ? subtractDate(worker.contract_end_date, worker.contract_start_date)
        : worker.contract_period,
      "",
    ),
    phoneNo: safeText(worker.phone_number, ""),
    applicantName: safeText(worker.full_name, "—"),
    nationality: safeText(worker.nationality, ""),
    religion: safeText(worker.religion, ""),
    dateOfBirth: safeDate(worker.date_of_birth, ""),
    placeOfBirth: safeText(worker.place_of_birth, ""),
    age: safeText(worker.age, "24"),
    address: safeText(worker.address, ""),
    maritalStatus: safeText(worker.marital_status, ""),
    childrenCount: safeText(worker.number_of_children, ""),
    height: safeText(worker.height_cm, ""),
    weight: safeText(worker.weight_kg, ""),
    english: safeText(
      worker.languages?.find((l) =>
        String(l.language).toLowerCase().includes("english"),
      )?.level,
      "",
    ),
    arabic: safeText(
      worker.languages?.find((l) =>
        String(l.language).toLowerCase().includes("arabic"),
      )?.level,
      "",
    ),
    education: safeText(worker.education, ""),
    experiencePeriod: safeText(
      worker.experience
        ?.map((e) => `${safeText(e.years, "")} ${e.years ? "Years" : ""}`)
        .join(" / "),
      "",
    ),
    experienceCountry: safeText(
      worker.experience?.map((e) => safeText(e.country, "")).join(" / "),
      "",
    ),
    cooking: yesNo(worker.skills?.includes("Cooking"), ""),
    cleaning: yesNo(worker.skills?.includes("Cleaning"), ""),
    washing: yesNo(worker.skills?.includes("Washing"), ""),
    ironing: yesNo(worker.skills?.includes("Ironing"), ""),
    babysitting: yesNo(worker.skills?.includes("Babysitting"), ""),
    childrenCare: yesNo(worker.skills?.includes("Children Care"), ""),
    arabicCooking: yesNo(worker.skills?.includes("Arabic Cooking"), ""),
    sewing: yesNo(worker.skills?.includes("Sewing"), ""),
    passportNo: safeText(worker.passport_number, ""),
    issueDate: safeDate(worker.passport_issue_date, ""),
    issuePlace: safeText(worker.passport_issuing_country, ""),
    expiryDate: safeDate(worker.passport_expiry_date, ""),
    remarks: safeText(worker.remarks, worker.guarantor_name, ""),
    personalPhoto:
      worker.photo_3x4_url || "https://via.placeholder.com/130x155?text=Photo",
    standingPhoto:
      worker.photo_standing_url ||
      worker.photo_3x4_url ||
      "https://via.placeholder.com/280x500?text=Full+Body",
    passportScan:
      worker.passport_scan_url ||
      "https://via.placeholder.com/700x450?text=Passport+Scan",

    ar: {
      applicationTitle: "إستمارة توظيف",
      referenceNo: "رقم المرجع",
      postAppliedFor: "وظيفة",
      monthlySalary: "راتب شهري",
      contractPeriod: "مدة العقد",
      phoneNo: "رقم الهاتف",
      applicantDetails: "بيانات مقدم الطلب",
      nationality: "الجنسية",
      religion: "الديانة",
      dateOfBirth: "تاريخ الميلاد",
      placeOfBirth: "مكان الولادة",
      age: "عمر",
      address: "العنوان",
      maritalStatus: "الحالة",
      childrenCount: "عدد الأطفال",
      height: "الوزن",
      weight: "الطول",
      educationLanguages: "التعليم واللغات",
      english: "الإنجليزية",
      arabic: "العربية",
      education: "المستوى التعليمي",
      workExperience: "خبرة في العمل",
      period: "المدة",
      country: "البلد",
      experienceSkills: "خبرة العمل والمهارات",
      cooking: "الطبخ",
      cleaning: "التنظيف",
      washing: "الغسيل",
      ironing: "الكي",
      babysitting: "عناية",
      childrenCare: "عناية",
      arabicCooking: "الطبخ العربي",
      sewing: "خياطة",
      passportNo: "رقم الجواز",
      issueDate: "تاريخ الإصدار",
      issuePlace: "مكان الإصدار",
      expiryDate: "تاريخ الانتهاء",
      remarks: "ملاحظات",
    },
  };

  return (
    <div className="dashboard-wraper">
      <div className="d-flex justify-content-between align-items-center d-print-none pb-2">
        <h2 className="text-dark mb-2">
          {profile?.role_id !== 4 ? "Employee" : "My"} CV
        </h2>
        {profile?.role_id !== 4 && <BackButton onClick={() => navigate(-1)} />}
      </div>

      {profile?.role_id !== 4 && (
        <div className="mb-3 d-print-none">
          <button
            className="btn btn-main mt-3 px-4 text-white w-auto d-flex align-items-center justify-content-center"
            onClick={handleGenerateAndUpload}
          >
            {worker.cv_url ? "Update CV" : "Generate & Upload CV"}
          </button>
        </div>
      )}

      <div ref={cvRef} className="cv-wrap bg-white">
        <style>{`
          .cv-wrap {
            width: 794px;
            margin: 0 auto;
            background: #fff;
            color: #111;
            font-family: Arial, Helvetica, sans-serif;
          }

          .cv-page {
            width: 794px;
            background: #fff;
            position: relative;
            box-sizing: border-box;
            page-break-after: always;
            page-break-inside: avoid;
            overflow: hidden;
            margin-bottom: 20px;
          }

          .cv-page:last-child {
            page-break-after: auto;
          }

          .cv-inner {
            width: 100%;
            max-height: 1080px;
            padding: 18px 20px 16px 20px;
            box-sizing: border-box;
          }

          .brand-wrap {
            margin-bottom: 5px;
          }
          .brand-logo {
            width: 100%;
            object-fit: contain;
            flex-shrink: 0;
          }

          .brand-text {
            text-align: center;
            line-height: 1.05;
            margin-top: 2px;
          }

          .doc-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            font-size: 15px;
            line-height: 1.15;
            border: 1px solid #111;
          }

          .doc-table td,
          .doc-table th {
            border: 1px solid #111;
            padding: 5px 6px 8px 6px;
            vertical-align: middle;
            box-sizing: border-box;
          }

          .tight {
            padding: 1px 5px !important;
          }

          .label-en {
            font-weight: 500;
            text-align: left;
            color: #111111;
          }

          .label-ar {
            font-weight: 500;
            text-align: center;
            direction: rtl;
            unicode-bidi: embed;
            color: #111111;
          }

          .val {
            text-align: center;
            font-weight: 600;
            color: #111;
          }

          .bold {
            font-weight: 900 !important;
          }

          .deep-red {
            color: #8b0e12 !important;
            font-weight: 900 !important;
          }

          .section-title-row td {
            font-weight: 900;
            text-align: left;
            background: #fff;
          }

          .section-title-ar {
            direction: rtl;
            text-align: right !important;
            font-weight: 900 !important;
          }

          .name-strip {
            display: flex;
            align-items: center;
            border-left: 1px solid #111;
            border-right: 1px solid #111;
            border-bottom: 1px solid #111;
          }

          .name-phone {
            flex: 1;
            display: grid;
            grid-template-columns: 135.5px 1fr;
            min-height: 23px;
            border-right: 1px solid #111;
          }

          .name-phone > div {
            border-right: 1px solid #111;
            padding: 5px 6px;
            font-size: 14px;
            display: flex;
            align-items: center;
          }

          .name-phone > div:last-child {
            border-right: none;
          }

          .name-applicant {
            width: 354px;
            padding: 5px 10px;
            font-size: 14px;
            font-weight: 800;
            text-align: right;
          }

          .main-grid {
            display: grid;
            grid-template-columns: 52.96% 47.04%;
            gap: 0;
            border-left: 1px solid #111;
            border-right: 1px solid #111;
            border-bottom: 1px solid #111;
          }

          .left-side {
            border-right: 1px solid #111;
          }
          }

          .right-side {
            display: flex;
            flex-direction: column;
          }

          .sub-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            font-size: 14px;
            line-height: 1.15;
          }

          .sub-table td {
            border-bottom: 1px solid #111;
            border-right: 1px solid #111;
            padding: 4px 4px;
            vertical-align: middle;
          }

          .sub-table tr td:last-child {
            border-right: none;
          }

          .sub-table tr:last-child td {
            border-bottom: none;
          }

          .personal-grid td,
          .lang-grid td,
          .exp-grid td,
          .skill-grid td,
          .passport-grid td {
            height: 24px;
          }

          .personal-grid .h-double,
          .lang-grid .h-double,
          .exp-grid .h-double {
            height: 40px;
          }

          .small-ar {
            direction: rtl;
            unicode-bidi: embed;
            font-size: 16px;
            text-align: center;
            color: #111;
            font-weight:600;
          }

          .standing-photo-wrap {
            width: 100%;
            border-bottom: 1px solid #111;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            overflow: hidden;
            background: #fff;
          }

          .standing-photo {
            width: 100%;
            height: auto;
          }

          .passport-card table {
            width: 100%;
            border-collapse: collapse;
          }

          .passport-card td {
            border: 1px solid #111;
            padding: 4px 6px 7px 6px;
            font-size: 14px;
          }

      

          .top-right-id {
            width: 100%;
            margin: 0 auto;
            border-bottom: 1px solid #111;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            background: #fff;
          }

          .top-right-id img {
            width: 100%;
            height: 150px;
            object-fit: cover;
          }

          .remarks-row {
            display: grid;
            grid-template-columns: 70px 1fr 95px;
            min-height: 22px;
            border-top: 1px solid #111;
          }

          .remarks-row > div {
            border-right: 1px solid #111;
            padding: 2px 6px;
            font-size: 12px;
            display: flex;
            align-items: center;
          }

          .remarks-row > div:last-child {
            border-right: none;
          }

          .remarks-right {
            direction: rtl;
            justify-content: flex-end;
          }

          .passport-page-inner {
            padding: 40px 50px 30px 50px;
            box-sizing: border-box;
          }

          .passport-box {
            width: 100%;
            display: flex;
            justify-content: center;
            margin-top: 8px;
          }

          .passport-box img {
            width: 86%;
            max-width: 680px;
            height: auto;
            object-fit: contain;
            border: none;
          }
            
          .rtl {
            direction: rtl;
            unicode-bidi: embed;
            color: #111111;
            font-weight: 600;
            font-size: 16px;
          }

          .center {
            text-align: center;
          }

          .right {
            text-align: right;
          }

          .left {
            text-align: left;
            margin-left: 85px;
          }

          .fw700 {
            font-weight: 900;
          }

          .screen-card {
            border: 0;
            box-shadow: 0 0.125rem 0.5rem rgba(0,0,0,.08);
            overflow: hidden;
            background: #fff;
          }

          @media print {
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #fff !important;
              width: 210mm;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .dashboard-wraper {
              margin: 0 !important;
              padding: 0 !important;
              background: #fff !important;
            }

            .d-print-none {
              display: none !important;
            }

            .cv-wrap {
              width: 210mm !important;
              margin: 0 !important;
            }

            .cv-page {
              width: 210mm !important;
              min-height: 297mm !important;
              page-break-after: always !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              overflow: hidden !important;
            }

            .cv-page:last-child {
              page-break-after: auto !important;
            }

            .screen-card {
              box-shadow: none !important;
            }
          }
        `}</style>

        <div className="screen-card">
          {/* PAGE 1 */}
          <div className="cv-page">
            <div className="cv-inner">
              {/* BRAND */}
              <div className="brand-wrap">
                <div className="brand-top">
                  <img
                    className="brand-logo"
                    src={brandLogo}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.style.visibility = "hidden";
                    }}
                  />
                </div>
              </div>
              {/* TOP SUMMARY TABLE */}
              <table className="doc-table">
                <colgroup>
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "35%" }} />
                  <col style={{ width: "19%" }} />
                  <col style={{ width: "28%" }} />
                </colgroup>
                <tbody>
                  <tr>
                    <td className="label-en fw700">Reference No.</td>
                    <td className="val"></td>
                    <td className="label-ar rtl fw700">
                      {clientData.ar.referenceNo}
                    </td>
                    <td rowSpan="4" className="p-0">
                      <div className="top-right-id">
                        <img src={clientData.personalPhoto} alt="personal" />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="label-en">Post Applied For</td>
                    <td className="val">{clientData.postAppliedFor}</td>
                    <td className="label-ar rtl">
                      {clientData.ar.postAppliedFor}
                    </td>
                  </tr>
                  <tr>
                    <td className="label-en">Monthly Salary</td>
                    <td className="val">{clientData.monthlySalary}</td>
                    <td className="label-ar rtl">
                      {clientData.ar.monthlySalary}
                    </td>
                  </tr>
                  <tr>
                    <td className="label-en">Contract Period</td>
                    <td className="val">{clientData.contractPeriod}</td>
                    <td className="label-ar rtl">
                      {clientData.ar.contractPeriod}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* PHONE + NAME */}
              <div className="name-strip">
                <div className="name-phone">
                  <div className="label-en">Phone No.</div>
                  <div className="val left">{clientData.phoneNo}</div>
                </div>
                <div className="name-applicant">{clientData.applicantName}</div>
              </div>

              {/* MAIN GRID */}
              <div className="main-grid">
                {/* LEFT SIDE */}
                <div className="left-side">
                  {/* PERSONAL DETAILS */}
                  <table className="sub-table personal-grid">
                    <colgroup>
                      <col style={{ width: "35.5%" }} />
                      <col style={{ width: "44%" }} />
                      <col style={{ width: "25%" }} />
                    </colgroup>
                    <tbody>
                      <tr>
                        <td className="label-en">Nationality</td>
                        <td className="val">{clientData.nationality}</td>
                        <td className="small-ar">
                          {clientData.ar.nationality}
                        </td>
                      </tr>
                      <tr>
                        <td className="label-en">Religion</td>
                        <td className="val">{clientData.religion}</td>
                        <td className="small-ar">{clientData.ar.religion}</td>
                      </tr>
                      <tr>
                        <td className="label-en">Date of Birth</td>
                        <td className="val">{clientData.dateOfBirth}</td>
                        <td className="small-ar">
                          {clientData.ar.dateOfBirth}
                        </td>
                      </tr>
                      <tr>
                        <td className="label-en">Place of Birth</td>
                        <td className="val">{clientData.placeOfBirth}</td>
                        <td className="small-ar">
                          {clientData.ar.placeOfBirth}
                        </td>
                      </tr>
                      <tr>
                        <td className="label-en">Age</td>
                        <td className="val">{clientData.age}</td>
                        <td className="small-ar">{clientData.ar.age}</td>
                      </tr>
                      <tr>
                        <td className="label-en">Address</td>
                        <td className="val">{clientData.address}</td>
                        <td className="small-ar">{clientData.ar.address}</td>
                      </tr>
                      <tr>
                        <td className="label-en">Marital Status</td>
                        <td className="val">{clientData.maritalStatus}</td>
                        <td className="small-ar">
                          {clientData.ar.maritalStatus}
                        </td>
                      </tr>
                      <tr>
                        <td className="label-en">No. of Children</td>
                        <td className="val">{clientData.childrenCount}</td>
                        <td className="small-ar">
                          {clientData.ar.childrenCount}
                        </td>
                      </tr>
                      <tr>
                        <td className="label-en">Height</td>
                        <td className="val">{clientData.height}</td>
                        <td className="small-ar">{clientData.ar.height}</td>
                      </tr>
                      <tr>
                        <td className="label-en">Weight</td>
                        <td className="val">{clientData.weight}</td>
                        <td className="small-ar">{clientData.ar.weight}</td>
                      </tr>
                      <tr>
                        <td className="label-en"></td>
                        <td className="val"></td>
                        <td className="small-ar"></td>
                      </tr>
                      {/* LANGUAGES */}
                      <tr>
                        <td className="label-en">English</td>
                        <td className="val">{clientData.english}</td>
                        <td className="small-ar">{clientData.ar.english}</td>
                      </tr>
                      <tr>
                        <td className="label-en">Arabic</td>
                        <td className="val">{clientData.arabic}</td>
                        <td className="small-ar">{clientData.ar.arabic}</td>
                      </tr>
                      <tr>
                        <td className="label-en">Education</td>
                        <td className="val">{clientData.education}</td>
                        <td className="small-ar h-double">
                          {clientData.ar.education}
                        </td>
                      </tr>
                      <tr>
                        <td className="label-en"></td>
                        <td className="val"></td>
                        <td className="small-ar"></td>
                      </tr>

                      {/* EXPERIENCE PERIOD/COUNTRY */}
                      <tr>
                        <td className="label-en h-double">Period</td>
                        <td className="val h-double">
                          {clientData.experiencePeriod}
                        </td>
                        <td className="small-ar h-double">
                          {clientData.ar.period}
                        </td>
                      </tr>
                      <tr>
                        <td className="label-en h-double">Country</td>
                        <td className="val h-double">
                          {clientData.experienceCountry}
                        </td>
                        <td className="small-ar h-double">
                          {clientData.ar.country}
                        </td>
                      </tr>
                      <tr>
                        <td className="label-en"></td>
                        <td className="val"></td>
                        <td className="small-ar"></td>
                      </tr>
                      {/* SKILLS */}

                      <tr>
                        <td className="label-en">Cooking</td>
                        <td className="val">{clientData.cooking}</td>
                        <td className="small-ar">{clientData.ar.cooking}</td>
                      </tr>
                      <tr>
                        <td className="label-en">Cleaning</td>
                        <td className="val">{clientData.cleaning}</td>
                        <td className="small-ar">{clientData.ar.cleaning}</td>
                      </tr>
                      <tr>
                        <td className="label-en">Washing</td>
                        <td className="val">{clientData.washing}</td>
                        <td className="small-ar">{clientData.ar.washing}</td>
                      </tr>
                      <tr>
                        <td className="label-en">Ironing</td>
                        <td className="val">{clientData.ironing}</td>
                        <td className="small-ar">{clientData.ar.ironing}</td>
                      </tr>
                      <tr>
                        <td className="label-en">Babysitting</td>
                        <td className="val">{clientData.babysitting}</td>
                        <td className="small-ar">
                          {clientData.ar.babysitting}
                        </td>
                      </tr>
                      <tr>
                        <td className="label-en">Children Care</td>
                        <td className="val">{clientData.childrenCare}</td>
                        <td className="small-ar">
                          {clientData.ar.childrenCare}
                        </td>
                      </tr>
                      <tr>
                        <td className="label-en">Arabic Cooking</td>
                        <td className="val">{clientData.arabicCooking}</td>
                        <td className="small-ar">
                          {clientData.ar.arabicCooking}
                        </td>
                      </tr>
                      <tr>
                        <td className="label-en">Sewing</td>
                        <td className="val">{clientData.sewing}</td>
                        <td className="small-ar">{clientData.ar.sewing}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* RIGHT SIDE */}
                <div className="right-side">
                  <div className="passport-card">
                    <table>
                      <colgroup>
                        <col style={{ width: "40%" }} />
                        <col style={{ width: "40%" }} />
                        <col style={{ width: "40%" }} />
                      </colgroup>
                      <tbody>
                        <tr>
                          <td className="label-en">Passport No.</td>
                          <td className="val">{clientData.passportNo}</td>
                          <td className="small-ar">
                            {clientData.ar.passportNo}
                          </td>
                        </tr>
                        <tr>
                          <td className="label-en">Issue Date</td>
                          <td className="val">{clientData.issueDate}</td>
                          <td className="small-ar">
                            {clientData.ar.issueDate}
                          </td>
                        </tr>
                        <tr>
                          <td className="label-en">Place of Issue</td>
                          <td className="val">{clientData.issuePlace}</td>
                          <td className="small-ar">
                            {clientData.ar.issuePlace}
                          </td>
                        </tr>
                        <tr>
                          <td className="label-en">Expiry Date</td>
                          <td className="val">{clientData.expiryDate}</td>
                          <td className="small-ar">
                            {clientData.ar.expiryDate}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="standing-photo-wrap">
                    <img
                      src={clientData.standingPhoto}
                      alt="standing"
                      className="standing-photo"
                    />
                  </div>
                </div>
              </div>

              {/* REMARKS */}
              <div className="remarks-row">
                <div className="label-en">Remarks</div>
                <div className="deep-red">{clientData.remarks}</div>
                <div className="remarks-right">{clientData.ar.remarks}</div>
              </div>
            </div>
          </div>

          {/* PAGE 2 */}
          <div className="cv-page">
            <div className="passport-page-inner">
              <div className="passport-box">
                <img src={clientData.passportScan} alt="passport scan" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CV;
