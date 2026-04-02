import React from "react";

const services = [
  {
    title: "Overseas Job Placement",
    description:
      "We connect qualified Ethiopian workers with trusted employers in Middle Eastern countries and beyond.",
    icon: "bi bi-briefcase",
  },
  {
    title: "Visa Processing",
    description:
      "Complete handling of visa applications, documentation, and embassy procedures for smooth approval.",
    icon: "bi bi-passport",
  },
  {
    title: "LMIS / Work Permit Support",
    description:
      "We manage labor clearance, work permits, and LMIS/LMIA documentation required by destination countries.",
    icon: "bi bi-file-earmark-check",
  },
  {
    title: "Contract Arrangement",
    description:
      "We ensure transparent employment contracts between workers and verified overseas employers.",
    icon: "bi bi-file-text",
  },
  {
    title: "Flight & Deployment Coordination",
    description:
      "We organize flight bookings and full deployment logistics until workers safely reach their employers.",
    icon: "bi bi-airplane",
  },
  {
    title: "Pre-Departure Orientation",
    description:
      "We prepare workers with essential training, cultural guidance, and job readiness before departure.",
    icon: "bi bi-people",
  },
];

const Services = () => {
  return (
    <section id="services" className="pb-0" aria-labelledby="services-title">
      <div className="container">
        {/* Heading */}
        <div className="row justify-content-center">
          <div className="col-lg-7 col-md-10 text-center">
            <div className="sec-heading center">
              <h2 id="services-title" className="fw-bold">
                Our Services
              </h2>
              <p>
                Global Trust Overseas Employment Agent Plc provides end-to-end
                overseas employment solutions, ensuring safe, legal, and
                reliable deployment of Ethiopian workers abroad.
              </p>
            </div>
          </div>
        </div>

        {/* Services Cards */}
        <div className="row gy-4">
          {services.map((service, index) => (
            <div key={index} className="col-lg-4 col-md-6">
              <div
                className="service-item position-relative h-100 shadow p-4 rounded hover-up text-center bg-white "
                style={{ border: "2px solid #f0f0f0" }}
              >
                <div
                  className="icon mb-3"
                  style={{ color: "#4484BA" }}
                  aria-hidden="true"
                >
                  <i className={`${service.icon} fs-1`}></i>
                </div>

                <div className="stretched-link">
                  <h3 className="fw-semibold">{service.title}</h3>
                </div>

                <p className="text-muted">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
