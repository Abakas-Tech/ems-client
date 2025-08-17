import React from "react";

const Contact = () => {
  return (
    <>
      {/* Contact Section */}
      <section>
        <div className="container">
          <div className="row">
            {/* Contact Form */}
            <h2>Contact Me</h2>
            <div className="col-lg-7 col-md-7">
              <div className="row">
                <div className="col-lg-6 col-md-6">
                  <div className="form-group">
                    <label>Name</label>
                    <input type="text" className="form-control simple" />
                  </div>
                </div>
                <div className="col-lg-6 col-md-6">
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" className="form-control simple" />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Subject</label>
                <input type="text" className="form-control simple" />
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea className="form-control simple"></textarea>
              </div>

              <div className="form-group">
                <button className="btn btn-main px-5 rounded" type="submit">
                  Submit Request
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="col-lg-5 col-md-5">
              <div className="contact-info">
                <h2>Get In Touch</h2>
                <p>
                  I’m here to help you with any questions about buying, selling,
                  or renting properties. Whether you’re looking for advice,
                  scheduling a viewing, or need more details about a listing,
                  feel free to reach out anytime.
                </p>

                <div className="cn-info-detail">
                  <div className="cn-info-icon">
                    <i className="fa-solid fa-house"></i>
                  </div>
                  <div className="cn-info-content">
                    <h4 className="cn-info-title">Reach Me</h4>
                    2512, New Market,
                    <br />
                    Eliza Road, Sincher 80 CA,
                    <br />
                    Canada, USA
                  </div>
                </div>

                <div className="cn-info-detail">
                  <div className="cn-info-icon">
                    <i className="fa-solid fa-envelope-circle-check"></i>
                  </div>
                  <div className="cn-info-content">
                    <h4 className="cn-info-title">Drop A Mail</h4>
                    support@Rikada.com
                    <br />
                    Rikada@gmail.com
                  </div>
                </div>

                <div className="cn-info-detail">
                  <div className="cn-info-icon">
                    <i className="fa-solid fa-phone-volume"></i>
                  </div>
                  <div className="cn-info-content">
                    <h4 className="cn-info-title">Call Me</h4>
                    (41) 123 521 458
                    <br />
                    +91 235 548 7548
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
