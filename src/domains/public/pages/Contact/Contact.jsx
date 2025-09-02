import React from "react";
import Contact from "../../components/Contact/Contact";
import SEOHelmet from "../../../../shared/components/SEOHelmet/SEOHelmet";

const ContactPage = () => {
  return (
    <>
      <SEOHelmet />
      <div class="page-title" style={{ marginTop: "50px" }}>
        <div class="container">
          <div class="row">
            <div class="col-lg-12 col-md-12">
              <h2 class="ipt-title fw-bold">Send Me a Message</h2>
              <span class="ipn-subtitle">
                Get in touch for advice, viewings, or property details.
              </span>
            </div>
          </div>
        </div>
      </div>
      <Contact />
    </>
  );
};

export default ContactPage;
