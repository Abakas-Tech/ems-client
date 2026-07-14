import React, { useCallback, useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { getWorkerCVData } from "../../../../api/worker.api";
import { getUsersLookup } from "../../../../api/user.api";
import BackButton from "../../../../../../shared/components/BackButton/BackButton";
import { useNavigate, useParams } from "react-router-dom";
import useLoader from "../../../../../../context/Loader/useLoader";
import { uploadFile } from "../../../../api/file.api";
import useResponse from "../../../../../../context/Response/useResponse";
import useProfile from "../../../../../../context/Profile/useProfile";
import CreateModal from "../../../../../../shared/components/CreateModal/CreateModal";

const safeDate = (date) => (date ? date.slice(0, 10) : "");

const REFERENCE_PREFIX = "CV";

const generateReferenceNumber = (worker) => {
  const existing = worker?.reference_number ?? worker?.reference_no;
  if (existing) return existing;

  const workerId = worker?.id ?? worker?.worker_id;
  if (!workerId) return "";

  return `${REFERENCE_PREFIX}-${String(workerId).padStart(6, "0")}`;
};

const subtractDate = (firstDate, secondDate) => {
  const date1 = new Date(firstDate);
  const date2 = new Date(secondDate);
  const diff = date1.getTime() - date2.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);

  return years > 0 ? `${years} years` : `${months} months`;
};

const GOLD = "#7a5c1e";
const FONT = "'Times New Roman', Times, serif";

const css = {
  enLabel: {
    padding: "2px 6px",
    fontWeight: "bold",
    fontStyle: "italic",
    fontSize: 14,
    borderRight: "1px solid #000",
  },
  enValue: {
    padding: "2px 6px",
    fontStyle: "italic",
    fontSize: 12,
    borderRight: "1px solid #000",
  },
  enValueBold: {
    padding: "2px 6px",
    fontWeight: "bold",
    fontStyle: "italic",
    fontSize: 12,
    borderRight: "1px solid #000",
  },
  arLabel: {
    padding: "2px 6px",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "right",
    direction: "rtl",
  },
  arLabelBold: {
    padding: "2px 6px",
    fontWeight: "bold",
    fontStyle: "italic",
    fontSize: 14,
    textAlign: "right",
    direction: "rtl",
  },
  goldBar: {
    background: GOLD,
    color: "#fff",
    fontSize: 15,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    borderBottom: "1px solid #000",
  },
  goldLeft: {
    padding: "2.5px 8px",
    fontWeight: "bold",
    fontStyle: "italic",
    fontSize: 15,
  },
  goldRight: {
    padding: "2.5px 8px",
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "right",
    direction: "rtl",
  },
  tdGoldHeader: {
    padding: "4px 7px",
    fontSize: 15,
    fontFamily: FONT,
    fontWeight: "bold",
    fontStyle: "italic",
    background: GOLD,
    color: "#fff",
    textAlign: "center",
    verticalAlign: "middle",
  },
};

const GoldBar = ({ en, ar }) => (
  <div style={css.goldBar}>
    <div style={css.goldLeft}>{en}</div>
    <div style={css.goldRight}>{ar}</div>
  </div>
);

const Row3 = ({
  label,
  value,
  arLabel,
  boldValue,
  last,
  cols = "110px 100px 1fr",
  minHeight,
}) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: cols,
      minHeight,
      ...(last ? {} : { borderBottom: "1px solid #000" }),
    }}
  >
    <div style={css.enLabel}>{label}</div>
    <div style={boldValue ? css.enValueBold : css.enValue}>{value ?? ""}</div>
    <div style={css.arLabel}>{arLabel}</div>
  </div>
);

const SkillRow = ({ en, value, ar, last }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "110px 80px 1fr",
      ...(last ? {} : { borderBottom: "1px solid #000" }),
    }}
  >
    <div style={css.enLabel}>{en}</div>
    <div style={{ ...css.enValueBold, textAlign: "center" }}>{value}</div>
    <div style={css.arLabelBold}>{ar}</div>
  </div>
);

const captureElementToPage = async (
  pdf,
  element,
  waitMs = 500,
  marginX = 8,
  marginY = 8,
) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const originalWidth = element.style.width;
  element.style.width = "760px";

  await new Promise((resolve) => setTimeout(resolve, waitMs));

  const canvas = await html2canvas(element, {
    useCORS: true,
    allowTaint: false,
    scale: 2,
    windowWidth: 760,
  });

  element.style.width = originalWidth;

  const imageData = canvas.toDataURL("image/jpeg", 0.95);
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  const printableWidth = pageWidth - marginX * 2;
  const printableHeight = pageHeight - marginY * 2;
  const ratio = Math.min(
    printableWidth / canvasWidth,
    printableHeight / canvasHeight,
  );

  const imageWidth = canvasWidth * ratio;
  const imageHeight = canvasHeight * ratio;
  const offsetX = marginX + (printableWidth - imageWidth) / 2;
  const offsetY = marginY + (printableHeight - imageHeight) / 2;

  pdf.addImage(imageData, "JPEG", offsetX, offsetY, imageWidth, imageHeight);
};

const CVThree = ({ templateSwitcher }) => {
  const { id } = useParams();
  const cvRef = useRef(null);
  const passportRef = useRef(null);
  const headerLoadingUrlRef = useRef(null);
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);
  const [partners, setPartners] = useState([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");

  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [remarkOverride, setRemarkOverride] = useState(null);
  const [remarkDateOverride, setRemarkDateOverride] = useState(null);
  const [pendingGenerate, setPendingGenerate] = useState(false);

  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { profile } = useProfile();

  const fetchWorkerData = useCallback(async () => {
    const workerId = id ?? profile?.id;
    if (!workerId) return;

    showLoader();

    try {
      const response = await getWorkerCVData(workerId);
      setWorker(response.data);
    } catch (error) {
      console.error("fetch error:", error);
      addMessage(false, "Failed to load CV data");
    } finally {
      hideLoader();
    }
  }, [id, profile?.id]);

  useEffect(() => {
    fetchWorkerData();
  }, [fetchWorkerData]);

  useEffect(() => {
    const fetchPartners = async () => {
      /*
       * A logged-in partner should only use their own account. Admin and
       * employee users continue to receive the existing partner lookup.
       */
      if (Number(profile?.role_id) === 3) {
        /* Fixed CV_ONE/CV_TWO partners are not New Partner CV choices. */
        if (profile?.cv_template_code) {
          setPartners([]);
          setSelectedPartnerId("");
          return;
        }

        const ownPartner = {
          id: profile?.id,
          full_name: profile?.full_name,
          email: profile?.email,
          partner_id: profile?.partner_id,
          cv_header_url: profile?.cv_header_url,
          cv_template_code: profile?.cv_template_code,
        };

        setPartners([ownPartner]);

        if (ownPartner.partner_id) {
          setSelectedPartnerId(String(ownPartner.partner_id));

          if (ownPartner.cv_header_url) {
            headerLoadingUrlRef.current = ownPartner.cv_header_url;
            showLoader();
          }
        }

        return;
      }

      try {
        const response = await getUsersLookup({ role_id: 3 });
        const allPartners = Array.isArray(response?.data) ? response.data : [];

        /* New Partner CV only uses partners without a fixed CV template. */
        setPartners(allPartners.filter((partner) => !partner.cv_template_code));
      } catch (error) {
        console.error("fetch partners error:", error);
        addMessage(false, "Failed to load partners");
      }
    };

    if (profile) {
      fetchPartners();
    }
  }, [profile]);

  const selectedPartner = partners.find(
    (partner) => String(partner.partner_id) === String(selectedPartnerId),
  );

  const selectedPartnerHeaderUrl = selectedPartner?.cv_header_url || null;

  const getPartnerOptionLabel = (partner) => {
    const fullLabel =
      partner.full_name || partner.email || `Partner ${partner.partner_id}`;

    const shortLabel =
      fullLabel.length > 32 ? `${fullLabel.slice(0, 29)}...` : fullLabel;

    return partner.cv_header_url ? shortLabel : `${shortLabel} (No header)`;
  };

  const handlePartnerChange = (event) => {
    const nextPartnerId = event.target.value;
    const nextPartner = partners.find(
      (partner) => String(partner.partner_id) === String(nextPartnerId),
    );
    const nextHeaderUrl = nextPartner?.cv_header_url || null;

    setSelectedPartnerId(nextPartnerId);

    if (headerLoadingUrlRef.current) {
      headerLoadingUrlRef.current = null;
      hideLoader();
    }

    if (nextHeaderUrl) {
      headerLoadingUrlRef.current = nextHeaderUrl;
      showLoader();
    }
  };

  const handleHeaderLoaded = () => {
    if (headerLoadingUrlRef.current === selectedPartnerHeaderUrl) {
      headerLoadingUrlRef.current = null;
      hideLoader();
    }
  };

  const handleHeaderLoadError = () => {
    if (headerLoadingUrlRef.current) {
      headerLoadingUrlRef.current = null;
      hideLoader();
    }

    addMessage(false, "Failed to load the selected partner header");
  };

  useEffect(() => {
    return () => {
      if (headerLoadingUrlRef.current) {
        headerLoadingUrlRef.current = null;
        hideLoader();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const existingSelectedPartnerCv = Array.isArray(worker?.generated_cvs)
    ? worker.generated_cvs.find(
        (cv) =>
          cv.category === "CV_THREE" &&
          String(cv.partner_id) === String(selectedPartnerId),
      ) || null
    : null;

  const hasSelectedPartnerCv = Boolean(existingSelectedPartnerCv);

  const handleGenerateClick = () => {
    if (!selectedPartnerId) {
      addMessage(false, "Please select a partner");
      return;
    }

    if (!selectedPartnerHeaderUrl) {
      addMessage(false, "The selected partner does not have a CV header");
      return;
    }

    setShowRemarkModal(true);
  };

  const handleGenerateAndUpload = async () => {
    if (!cvRef.current || !worker) return;

    if (!selectedPartnerId || !selectedPartnerHeaderUrl) {
      addMessage(false, "Please select a partner with a CV header");
      return;
    }

    showLoader();

    try {
      const pdf = new jsPDF("p", "mm", "a4");

      // Page 1: CV
      await captureElementToPage(pdf, cvRef.current, 400);

      // Page 2: passport
      if (passportRef.current) {
        pdf.addPage();
        await captureElementToPage(pdf, passportRef.current, 800);
      }

      const blob = pdf.output("blob");
      const name = `${worker.full_name.replace(/\s+/g, "_")}_CV`;
      const file = new File([blob], `${name}.pdf`, {
        type: "application/pdf",
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("file_name", name);
      formData.append("category", "CV_THREE");
      formData.append("is_private", 0);
      formData.append("description", `CV for ${worker.full_name}`);
      formData.append("worker_id", worker.id);
      formData.append("partner_id", selectedPartnerId);

      await uploadFile(formData);

      /*
       * Keep the local state in sync so the button immediately changes from
       * "Generate CV" to "Update CV" for this selected partner.
       */
      setWorker((previous) => {
        const previousCvs = Array.isArray(previous?.generated_cvs)
          ? previous.generated_cvs
          : [];

        const otherCvs = previousCvs.filter(
          (cv) =>
            !(
              cv.category === "CV_THREE" &&
              String(cv.partner_id) === String(selectedPartnerId)
            ),
        );

        return {
          ...previous,
          generated_cvs: [
            {
              ...existingSelectedPartnerCv,
              category: "CV_THREE",
              partner_id: Number(selectedPartnerId),
            },
            ...otherCvs,
          ],
        };
      });

      addMessage(
        true,
        `CV ${hasSelectedPartnerCv ? "updated" : "generated"} and uploaded successfully!`,
      );
    } catch (error) {
      console.error(error);
      addMessage(false, "Failed to generate PDF");
    } finally {
      hideLoader();
    }
  };

  const handleRemarkSubmit = (inputValues) => {
    const remarkText = inputValues.remark?.trim();

    if (!remarkText) {
      addMessage(false, "Remark is required");
      return;
    }

    if (!selectedPartnerId) {
      addMessage(false, "Partner is required");
      return;
    }

    if (!selectedPartnerHeaderUrl) {
      addMessage(false, "The selected partner does not have a CV header");
      return;
    }

    setRemarkOverride(remarkText);
    setRemarkDateOverride(new Date().toISOString().slice(0, 10));
    setShowRemarkModal(false);
    setPendingGenerate(true);
  };

  useEffect(() => {
    if (pendingGenerate) {
      setPendingGenerate(false);
      handleGenerateAndUpload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingGenerate]);

  if (!worker) return null;

  const ref = generateReferenceNumber(worker);
  const post = worker.primary_positions?.[0] ?? "House Maid";
  const salary = worker.monthly_salary ? `${worker.monthly_salary} SR` : "";
  const contract =
    worker.contract_start_date && worker.contract_end_date
      ? subtractDate(worker.contract_end_date, worker.contract_start_date)
      : (worker.contract_period ?? "2 Years");
  const phone = worker.phone_number ?? "";
  const name = (worker.full_name ?? "").toUpperCase();
  const nationality = worker.nationality ?? "";
  const religion = worker.religion ?? "";
  const dateOfBirth = safeDate(worker.date_of_birth);
  const placeOfBirth = (worker.place_of_birth ?? "").toUpperCase();
  const age = worker.date_of_birth
    ? String(
        new Date().getFullYear() - new Date(worker.date_of_birth).getFullYear(),
      )
    : "";
  const address = (worker.address ?? "").toUpperCase();
  const maritalStatus = worker.marital_status ?? "";
  const numberOfChildren = String(worker.number_of_children ?? "");
  const height = worker.height_cm ? `${worker.height_cm} cm` : "";
  const weight = worker.weight_kg ? `${worker.weight_kg} kg` : "";
  const languages =
    worker.languages
      ?.map((language) => language.language ?? language.name)
      .join(", ") ?? "";
  const education = (worker.education ?? "").toUpperCase();
  const experiencePeriod = worker.experience?.length
    ? worker.experience
        .map((experience) =>
          experience.years ? `${experience.years} yrs` : "",
        )
        .join(" / ")
    : "";
  const experienceCountry = worker.experience?.length
    ? worker.experience
        .map((experience) => experience.country ?? "")
        .join(" / ")
    : "";
  const passportNumber = worker.passport_number ?? "";
  const passportIssueDate = safeDate(worker.passport_issue_date);
  const passportIssuePlace = worker.passport_issuing_country ?? "";
  const passportExpiryDate = safeDate(worker.passport_expiry_date);
  const faceUrl = worker.photo_3x4_url ?? "";
  const bodyUrl = worker.photo_standing_url ?? "";

  const remarks = remarkOverride ?? worker.remarks ?? "";
  const remarkDate = remarkDateOverride ?? safeDate(worker.remarks_date);

  const SKILL_DEFINITIONS = [
    { en: "Cooking", ar: "الطبخ", key: "Cooking" },
    { en: "Cleaning", ar: "التنظيف", key: "Cleaning" },
    { en: "Washing", ar: "الغسيل", key: "Washing" },
    { en: "Ironing", ar: "الكوي", key: "Ironing" },
    { en: "Babysitting", ar: "مجا لسه الكفال", key: "Babysitting" },
    { en: "Children Care", ar: "رعايه الطفال", key: "Children Care" },
    { en: "Arabic Cooking", ar: "الطبخ العربي", key: "Arabic Cooking" },
    { en: "Sewing", ar: "الخياطه", key: "Sewing" },
  ];

  const workerSkillNames =
    worker.skills?.map((skill) =>
      (skill.skill_name ?? skill.name ?? skill).toLowerCase(),
    ) ?? [];

  const skills = SKILL_DEFINITIONS.map((skill) => ({
    en: skill.en,
    ar: skill.ar,
    value: workerSkillNames.includes(skill.key.toLowerCase()) ? "YES" : "NO",
  }));

  const cvStyle = {
    width: 760,
    minWidth: 760,
    background: "#fff",
    fontFamily: FONT,
    fontSize: 15,
    color: "#000",
    boxSizing: "border-box",
    border: "2px solid #000",
    padding: 6,
  };

  return (
    <div className="dashboard-wraper">
      {/* Toolbar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3">
        <div className="mt-0">
          <h2 className="fw-bold text-dark mb-2">CV</h2>
          <p className="text-muted mb-0">Generate and upload CV</p>
        </div>

        <div className="position-absolute top-0 end-0 mt-4 pt-2">
          {Number(profile?.role_id) !== 4 && (
            <BackButton onClick={() => navigate(-1)} />
          )}
        </div>

        {(Number(profile?.role_id) === 1 || Number(profile?.role_id) === 2) && (
          <button
            className="btn btn-main mt-3 mt-md-5  text-white w-45 d-flex align-items-center justify-content-center"
            onClick={handleGenerateClick}
          >
            {hasSelectedPartnerCv ? "Update CV" : "Generate CV"}
          </button>
        )}
      </div>

      <div className="mb-3 mt-1">{templateSwitcher}</div>

      {/* Partner control remains outside cvRef, so it is not captured in the PDF. */}
      <div
        className="d-flex align-items-center gap-2 mb-2 flex-wrap"
        style={{ width: "100%", maxWidth: "420px" }}
      >
        <label className="mb-0 fw-semibold" htmlFor="cv-three-partner">
          Partner
        </label>

        <select
          id="cv-three-partner"
          className="form-control"
          value={selectedPartnerId}
          onChange={handlePartnerChange}
          disabled={Number(profile?.role_id) === 3}
          style={{
            flex: "1 1 260px",
            width: "100%",
            minWidth: 0,
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          <option value="">Select Partner</option>

          {partners.map((partner) => (
            <option key={partner.partner_id} value={partner.partner_id}>
              {getPartnerOptionLabel(partner)}
            </option>
          ))}
        </select>
      </div>

      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        {/* Page 1: CV */}
        <div ref={cvRef} style={cvStyle}>
          {/* Dynamic header from the selected partner */}
          {selectedPartnerHeaderUrl ? (
            <img
              src={selectedPartnerHeaderUrl}
              alt={`${selectedPartner?.full_name || "Partner"} CV Header`}
              crossOrigin="anonymous"
              onLoad={handleHeaderLoaded}
              onError={handleHeaderLoadError}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                marginBottom: 8,
                boxShadow: "0 0 12px 4px rgba(0,0,0,0.25)",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: 120,
                marginBottom: 8,
                border: "2px dashed #999",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
                fontSize: 13,
                fontStyle: "italic",
              }}
            >
              {selectedPartnerId
                ? "The selected partner does not have a CV header"
                : "Select a partner above to load the CV header"}
            </div>
          )}

          <div style={{ border: "2px solid #000" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 220px",
                borderBottom: "1px solid #000",
              }}
            >
              <div style={css.tdGoldHeader}>
                Application for Employment &nbsp;|&nbsp; طلب التوظيف
              </div>
              <div style={css.tdGoldHeader}>{name}</div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "stretch",
                minHeight: 160,
                borderBottom: "1px solid #000",
              }}
            >
              <div
                style={{
                  flex: "1 1 auto",
                  display: "flex",
                  flexDirection: "column",
                  borderRight: "1px solid #000",
                }}
              >
                <Row3
                  label="Reference No."
                  value={ref}
                  minHeight={40}
                  arLabel="رقم المرجع"
                  cols="150px 130px 1fr"
                />
                <Row3
                  label="Post Applied For"
                  value={post}
                  minHeight={40}
                  arLabel="وظيفة"
                  cols="150px 130px 1fr"
                />
                <Row3
                  label="Monthly Salary"
                  value={salary}
                  minHeight={40}
                  arLabel="راتب شهري"
                  cols="150px 130px 1fr"
                />
                <Row3
                  label="Contract Period"
                  value={contract}
                  minHeight={40}
                  arLabel="مدة العقد"
                  last
                  cols="150px 130px 1fr"
                />
              </div>

              <div style={{ position: "relative", flex: "0 0 220px" }}>
                {faceUrl ? (
                  <img
                    src={faceUrl}
                    alt="Candidate"
                    crossOrigin="anonymous"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: "#ddd",
                    }}
                  />
                )}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "180px 1fr",
                marginBottom: "3px",
              }}
            >
              <div
                style={{
                  padding: "4px 8px",
                  fontWeight: "bold",
                  fontSize: 12,
                  borderRight: "1px solid #000",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                PHONE NO:
                <span style={{ fontWeight: "normal", marginLeft: 4 }}>
                  {phone}
                </span>
              </div>

              <div
                style={{
                  padding: "4px 8px",
                  background: GOLD,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                }}
              >
                <div style={{ fontWeight: "bold", fontSize: 15 }}>{name}</div>
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: 12,
                    fontStyle: "italic",
                    direction: "rtl",
                  }}
                >
                  اسم العامله :
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                borderBottom: "1px solid #000",
              }}
            >
              <div style={{ borderRight: "2px solid #000" }}>
                <GoldBar en="Details of Applicant" ar="بيانات الطلب" />
                <Row3
                  label="Nationality"
                  value={nationality}
                  arLabel="الجنسيه"
                />
                <Row3 label="Religion" value={religion} arLabel="الديانه" />
                <Row3
                  label="Date of Birth"
                  value={dateOfBirth}
                  arLabel="التاريخ"
                />
                <Row3
                  label="Place of Birth"
                  value={placeOfBirth}
                  arLabel="مكان الولاده"
                />
                <Row3 label="Age" value={age} arLabel="العمر" />
                <Row3 label="Address" value={address} arLabel="العنوان" />
                <Row3
                  label="Marital Status"
                  value={maritalStatus}
                  arLabel="الحاله"
                />
                <Row3
                  label="No. of Children"
                  value={numberOfChildren}
                  arLabel="عدد الاطفال"
                />
                <Row3 label="Height" value={height} arLabel="ارتفاع" />
                <Row3 label="Weight" value={weight} arLabel="وزن" />

                <GoldBar en="Languages & Education" ar="اللغه & التعليم" />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "80px 130px 1fr",
                    borderBottom: "1px solid #000",
                  }}
                >
                  <div
                    style={{
                      padding: "2px 6px",
                      fontWeight: "bold",
                      fontStyle: "italic",
                      fontSize: 11,
                      borderRight: "1px solid #000",
                      lineHeight: 1.5,
                    }}
                  >
                    Language of
                    <br />
                    worker
                  </div>
                  <div
                    style={{
                      padding: "2px 6px",
                      fontWeight: "bold",
                      fontStyle: "italic",
                      fontSize: 11,
                      borderRight: "1px solid #000",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {languages}
                  </div>
                  <div
                    style={{
                      padding: "2px 6px",
                      fontSize: 11,
                      textAlign: "right",
                      direction: "rtl",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    العاملة لغة
                  </div>
                </div>

                <Row3
                  label="Education"
                  value={education}
                  arLabel="المستوي التعليمي"
                  boldValue
                />

                <GoldBar en="Work Experience" ar="خبره العمل" />
                <Row3 label="Period" value={experiencePeriod} arLabel="المده" />
                <Row3
                  label="Country"
                  value={experienceCountry}
                  arLabel="البلد"
                />

                <GoldBar en="Skills & Experience" ar="الخبره & المهارات" />
                {skills.map((skill, index) => (
                  <SkillRow
                    key={skill.en}
                    en={skill.en}
                    value={skill.value}
                    ar={skill.ar}
                    last={index === skills.length - 1}
                  />
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                }}
              >
                <GoldBar en="Passport Detail" ar="تفاصيل جواز" />
                <Row3
                  label="Passport No."
                  value={passportNumber}
                  arLabel="رقيم الجواز"
                  boldValue
                  cols="100px 110px 1fr"
                />
                <Row3
                  label="Issue Date"
                  value={passportIssueDate}
                  arLabel="تاريخ الإصدار"
                  cols="100px 110px 1fr"
                />
                <Row3
                  label="Place of Issue"
                  value={passportIssuePlace}
                  arLabel="مكان الاصدار"
                  cols="100px 110px 1fr"
                />
                <Row3
                  label="Expiry Date"
                  value={passportExpiryDate}
                  arLabel="تاريخ الانتهاء"
                  cols="100px 110px 1fr"
                />

                <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
                  {bodyUrl ? (
                    <img
                      src={bodyUrl}
                      alt="full body"
                      crossOrigin="anonymous"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        border: "1px solid #999",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        minHeight: 200,
                        background: "#ddd",
                        border: "1px solid #999",
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "3px 10px",
                display: "flex",
                gap: 20,
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontWeight: "bold",
                  fontStyle: "italic",
                  fontSize: 11,
                }}
              >
                Remarks
              </span>
              <span style={{ color: GOLD, fontWeight: "bold", fontSize: 12 }}>
                {remarks}
              </span>
              <span style={{ color: GOLD, fontWeight: "bold", fontSize: 12 }}>
                {remarkDate}
              </span>
            </div>
          </div>
        </div>

        {/* Page 2: passport scan */}
        <div
          ref={passportRef}
          style={{
            width: 760,
            minWidth: 760,
            marginTop: 24,
            background: "#fff",
            fontFamily: FONT,
          }}
        >
          <div
            style={{
              textAlign: "center",
              fontSize: 11,
              color: "#999",
              marginBottom: 6,
              fontStyle: "italic",
            }}
          >
            — Page 2 —
          </div>

          <div
            style={{
              background: "#fff",
              border: "2px solid #000",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: 12,
            }}
          >
            {worker.passport_scan_url ? (
              <div
                style={{
                  width: "100%",
                  border: "1px solid #999",
                }}
              >
                <img
                  src={worker.passport_scan_url}
                  alt="Passport Scan"
                  crossOrigin="anonymous"
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: "100%",
                  height: 500,
                  background: "#ddd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  color: "#999",
                  fontStyle: "italic",
                }}
              >
                No passport scan available
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateModal
        show={showRemarkModal}
        onClose={() => setShowRemarkModal(false)}
        onCreate={handleRemarkSubmit}
        fields={[{ name: "remark", label: "Remark" }]}
        title="Add Remark"
      />
    </div>
  );
};

export default CVThree;
