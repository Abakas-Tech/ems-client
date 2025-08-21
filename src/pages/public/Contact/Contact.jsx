import React, { useEffect, useState } from "react";
import Contact from "../../../components/Contact/Contact.jsx";

const ContactPage = () => {
  return (
    <div>
      <div class="page-title">
        <div class="container">
          <div class="row">
            <div class="col-lg-12 col-md-12">
              <h2 class="ipt-title">Contact Us</h2>
              <span class="ipn-subtitle">
                Lists of our all Popular agencies
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
