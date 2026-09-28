import React from "react";
import { useTranslation } from "react-i18next";

// Service texts are translation keys (services.items.<key>.title/desc),
// shared with the About page's "What We Do" list.
const services = [
  {
    key: "recruitment",
    iconClass: "first-service",
    icon: "bi bi-briefcase",
  },
  {
    key: "placement",
    iconClass: "second-service",
    icon: "bi bi-person-check",
  },
  {
    key: "employer",
    iconClass: "third-service",
    icon: "bi bi-building",
  },
  {
    key: "candidate",
    iconClass: "fourth-service",
    icon: "bi bi-life-preserver",
  },
  {
    key: "documentation",
    iconClass: "first-service",
    icon: "bi bi-file-earmark-check",
  },
  {
    key: "orientation",
    iconClass: "second-service",
    icon: "bi bi-airplane",
  },
];

const Services = () => {
  const { t } = useTranslation();

  return (
    <section
      id="services"
      className="services section mb-0"
      style={{ paddingBottom: "0px" }}
    >
      <div className="container">
        <div className="row">
          <div className="col-lg-8 offset-lg-2">
            <div
              className="section-heading wow fadeInDown"
              data-wow-duration="1s"
              data-wow-delay="0.5s"
            >
              <h2 className="fw-bold">{t("services.title")}</h2>
              <p>{t("services.description")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row gy-4">
          {services.map((service, index) => (
            <div key={index} className="col-lg-4">
              <div
                className={`service-item ${service.iconClass} h-100 shadow-md`}
              >
                <div className="icon d-flex align-items-center justify-content-center">
                  <i
                    className={`${service.icon}`}
                    style={{
                      fontSize: "45px",
                      zIndex: "2",
                      position: "relative",
                      color: "#105491",
                    }}
                  ></i>
                </div>
                <h4 className="fw-bold">
                  {t(`services.items.${service.key}.title`)}
                </h4>
                {/* Fixed height/character count ensures consistent card rows */}
                <p>{t(`services.items.${service.key}.desc`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
