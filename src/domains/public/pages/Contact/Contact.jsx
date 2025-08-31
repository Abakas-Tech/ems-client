import React from "react";
import Contact from "../../components/Contact/Contact";

const ContactPage = () => {
  return (
    <div>
      <div class="page-title">
        <div class="container">
          <div class="row">
            <div class="col-lg-12 col-md-12">
              <h2 class="ipt-title">Send Me a Message</h2>
              <span class="ipn-subtitle">
                Get in touch for advice, viewings, or property details.
              </span>
            </div>
          </div>
        </div>
      </div>
      <Contact />
    </div>
  );
};

export default ContactPage;
