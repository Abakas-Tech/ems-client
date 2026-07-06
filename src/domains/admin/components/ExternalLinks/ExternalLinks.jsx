import React from "react";

import styles from "../UserManual/UserManual.module.css";
import musanedLogo from "../../../../assets/img/autofill/musaned.png";
import wafidLogo from "../../../../assets/img/autofill/wafid.svg";
import tasheerLogo from "../../../../assets/img/autofill/tasheer.png";
import visaMofa from "../../../../assets/img/visa/visa.png";
import Lmis from "../../../../assets/img/externalLinks/lmis.png";
import eow from "../../../../assets/img/externalLinks/eow.png";
import teleBirr from "../../../../assets/img/externalLinks/teleBirr.jpg";

const EXTERNAL_LINKS = [
  {
    key: "eow",
    title: "EOW",
    description: "Ethiopian Overseas Workers portal",
    logo: eow,
    url: "https://eows.lmis.gov.et/",
  },
  {
    key: "musaned",
    title: "Musaned",
    description: "Domestic labor service portal",
    logo: musanedLogo,
    url: "https://tawtheeq.musaned.com.sa/",
  },
  {
    key: "wafid",
    title: "Wafid",
    description: "Medical status verification system",
    logo: wafidLogo,
    url: "https://wafid.com/en/book-appointment/",
  },
  {
    key: "lmis",
    title: "LMIS",
    description: "Labor Market Information System",
    logo: Lmis,
    url: "https://lmis.gov.et/",
  },
  {
    key: "tasheer",
    title: "Tasheer",
    description: "Visa appointment scheduling",
    logo: tasheerLogo,
    url: "https://agents.tasheer.com/AgentTasheer/auth/agentGroupScheduling",
  },
  {
    key: "mofa",
    title: "Visa Mofa",
    description: "Saudi Ministry of Foreign Affairs e-services",
    logo: visaMofa,
    url: "https://www.mofa.gov.sa/en/eservices/pages/default.aspx",
  },
  {
    key: "enjaz",
    title: "Easy Enjaz",
    description: "Enjaz / Musaned visa data agent",
    logo: null,
    url: "https://www.easyenjaz.net/",
  },
  {
    key: "telebirr",
    title: "Telebirr",
    description: "Ethio telecom mobile money",
    logo: teleBirr,
    url: "https://telebirr.et/",
  },
  {
    key: "teketing",
    title: "Tiketing",
    description: "LMIS appointment ticketing system",
    logo: null,
    url: "https://atm.lmis.gov.et/",
  },
];

// fallback
const BADGE_COLORS = [
  "#1f6f78",
  "#8a3b8f",
  "#c0392b",
  "#2e7d32",
  "#5c4d9c",
  "#b8860b",
];

function LogoBadge({ title }) {
  const colorIndex = title.charCodeAt(0) % BADGE_COLORS.length;

  return (
    <div
      className="d-flex align-items-center justify-content-center rounded-circle fw-bold text-white"
      style={{
        width: "58px",
        height: "58px",
        fontSize: "22px",
        backgroundColor: BADGE_COLORS[colorIndex],
      }}
    >
      {title.charAt(0).toUpperCase()}
    </div>
  );
}

function ExternalLinks() {
  const handleCardClick = (link) => {
    window.open(link.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="dashboard-wraper">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-2">External Links</h2>
          <p className="text-muted mb-0">
            Quick access to the external systems and portals used across the
            overseas employment process.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="row justify-content-start g-lg-3 g-4">
          {EXTERNAL_LINKS.map((link) => (
            <div
              key={link.key}
              className="col-xl-3 col-lg-4 col-md-6 col-sm-12"
            >
              <button
                type="button"
                className="text-decoration-none text-dark border-0 bg-transparent p-0 w-100 h-100"
                onClick={() => handleCardClick(link)}
              >
                <div
                  className={`agents-grid card rounded-4 border p-4 text-center h-100 shadow-sm-hover ${styles["manual-card"]}`}
                >
                  <div className="d-flex flex-column align-items-center justify-content-between h-100">
                    <div
                      className="d-flex align-items-center justify-content-center mb-3"
                      style={{ width: "130px", height: "70px" }}
                    >
                      {link.logo ? (
                        <img
                          src={link.logo}
                          alt={`${link.title} logo`}
                          className="img-fluid object-fit-contain"
                          style={{ maxWidth: "120px", maxHeight: "58px" }}
                        />
                      ) : (
                        <LogoBadge title={link.title} />
                      )}
                    </div>

                    <div className="w-100">
                      <h5 className="fr-can-name lh-base mb-2">{link.title}</h5>
                      <p
                        className="text-muted small mb-0 mx-auto"
                        style={{ minHeight: "38px", maxWidth: "190px" }}
                      >
                        {link.description}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ExternalLinks;
