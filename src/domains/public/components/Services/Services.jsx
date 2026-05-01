import React from "react";

const services = [
  {
    title: "International Recruitment",
    description:
      "Bridging the gap between elite Ethiopian talent and premier global organizations through strategic placement.",
    iconClass: "first-service",
    icon: "bi bi-briefcase",
  },
  {
    title: "Travel & Visa Logistics",
    description:
      "Expert management of legal entry permits and embassy certifications to ensure a seamless approval process.",
    iconClass: "second-service",
    icon: "bi bi-passport",
  },
  {
    title: "Regulatory Compliance",
    description:
      "Facilitating essential labor clearances and work authorization permits in strict accordance with host laws.",
    iconClass: "third-service",
    icon: "bi bi-file-earmark-check",
  },
  {
    title: "Legal Contract Services",
    description:
      "Drafting transparent, binding employment agreements that protect the rights and duties of all stakeholders.",
    iconClass: "fourth-service",
    icon: "bi bi-file-text",
  },
  {
    title: "Deployment Logistics",
    description:
      "Comprehensive travel coordination and arrival support services to guarantee a safe transition for personnel.",
    iconClass: "first-service",
    icon: "bi bi-airplane",
  },
  {
    title: "Cultural Readiness",
    description:
      "Equipping candidates with vital cross-cultural training and professional ethics for success in foreign markets.",
    iconClass: "second-service",
    icon: "bi bi-people",
  },
];

const Services = () => {
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
              <h2 className="fw-bold">Our Services</h2>
              <img src="assets/images/heading-line-dec.png" alt="" />
              <p className="mt-3">
                Aysha Overseas Employment Agency delivers premium, end-to-end
                labor solutions designed to empower Ethiopian professionals on
                the global stage through integrity and excellence.
              </p>
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
                <h4 className="fw-bold">{service.title}</h4>
                {/* Fixed height/character count ensures consistent card rows */}
                <p className="text-muted small">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
