import React from "react";

const services = [
  {
    title: "Property Buying",
    description:
      "We guide clients through the entire buying process, from finding listings to closing deals.",
    icon: "bi bi-house-door",
    link: "/service-details/buying",
  },
  {
    title: "Property Selling",
    description:
      "Helping you sell properties at the best market price with effective marketing strategies.",
    icon: "bi bi-cash-coin",
    link: "/service-details/selling",
  },
  {
    title: "Rental Management",
    description:
      "End-to-end rental management including tenant screening, contracts, and rent collection.",
    icon: "bi bi-key",
    link: "/service-details/rental",
  },
  {
    title: "Property Valuation",
    description:
      "Accurate property valuation services to help you understand true market value.",
    icon: "bi bi-bar-chart",
    link: "/service-details/valuation",
  },
  {
    title: "Legal Assistance",
    description:
      "Expert support for contracts, documentation, and legal aspects of real estate.",
    icon: "bi bi-file-earmark-text",
    link: "/service-details/legal",
  },
  {
    title: "Mortgage Consultation",
    description:
      "Helping clients secure loans and mortgages through trusted financial partners.",
    icon: "bi bi-bank",
    link: "/service-details/mortgage",
  },
];

const ServicesSection = () => {
  return (
    <>
      <section className=" mt-6 ">
        <div className="container">
          {/* Heading */}
          <div className="row justify-content-center">
            <div className="col-lg-7 col-md-10 text-center">
              <div className="sec-heading center">
                <h2>My Services</h2>
                <p>
                  As your trusted real estate agent, I guide you through buying,
                  selling, renting, or valuing property—making the process
                  smooth and stress-free.
                </p>
              </div>
            </div>
          </div>

          {/* Services Cards */}
          <div className="row gy-4 ">
            {services.map((service, index) => (
              <div
                key={index}
                className="col-lg-4 col-md-6"
                data-aos="fade-up"
                data-aos-delay={(index + 1) * 100}
              >
                <div
                  className="service-item position-relative h-100 shadow p-4 rounded hover-up text-center bg-white custom-shadow"
                  style={{ border: "1px solid #f0f0f0" }}
                >
                  <div className="icon mb-3 ">
                    <i className={`${service.icon} fs-1 text-primary`}></i>
                  </div>
                  <a href={service.link} className="stretched-link">
                    <h3 className="fw-semibold">{service.title}</h3>
                  </a>
                  <p className="text-muted">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default ServicesSection;
