import React from "react";
import ServicesSection from "../../../components/Services/ServicesSection";
const Services = () => {
  return (
    <>
      <div className="image-cover page-title">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 col-md-12">
              <h2 className="ipt-title">Our Services</h2>
              <span className="ipn-subtitle">
                We offer a wide range of services
              </span>
            </div>
          </div>
        </div>
      </div>
      <ServicesSection />;
    </>
  );
};

export default Services;
