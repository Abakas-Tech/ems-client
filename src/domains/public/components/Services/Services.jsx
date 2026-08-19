import React from "react";

const services = [
  {
    title: "Foreign Employment Recruitment",
    description:
      "We connect qualified Ethiopian workers with suitable employment opportunities in international markets.",
    iconClass: "first-service",
    icon: "bi bi-briefcase",
  },
  {
    title: "Workforce Selection & Placement",
    description:
      "We identify, screen, assess, and place candidates according to employer requirements and applicable regulations.",
    iconClass: "second-service",
    icon: "bi bi-person-check",
  },
  {
    title: "Employer Recruitment Services",
    description:
      "We support international employers in sourcing suitable, qualified, and dependable workers.",
    iconClass: "third-service",
    icon: "bi bi-building",
  },
  {
    title: "Candidate Support",
    description:
      "We guide candidates throughout the recruitment and placement process and provide the necessary information and assistance.",
    iconClass: "fourth-service",
    icon: "bi bi-life-preserver",
  },
  {
    title: "Documentation & Processing Support",
    description:
      "We assist with the necessary recruitment, employment, and travel documentation in accordance with applicable requirements.",
    iconClass: "first-service",
    icon: "bi bi-file-earmark-check",
  },
  {
    title: "Pre-Departure Orientation",
    description:
      "We help selected workers understand their employment conditions, responsibilities, rights, and expectations before departure.",
    iconClass: "second-service",
    icon: "bi bi-airplane",
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
                ALETISALAT Private Foreign Employment Agency delivers ethical,
                transparent, and professional foreign employment services —
                connecting qualified Ethiopian workers with legitimate
                international opportunities while creating value for workers,
                employers, families, and communities.
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
                <p>{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
