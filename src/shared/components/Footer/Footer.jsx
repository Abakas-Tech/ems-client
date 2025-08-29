import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css"

const Footer = () => {
  return (
    <footer className="dark-footer skin-dark-footer pt-4">
      <div className="container">
        <div className="row footer-content d-flex justify-content-between align-items-start">
          {/* Brand Logo */}
          <div className="col-lg-3 col-md-4">
            <div className="footer-widget pt-2">
              <Link className="nav-footer-logo d-flex align-items-center" to="/">
                <span className="svg-icon text-light svg-icon-2hx me-1">
                  <svg
                    width="65"
                    height="65"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.8797 15.375C15.9797 15.075 15.9797 14.775 15.9797 14.475C15.9797 13.775 15.7797 13.075 15.4797 12.475C14.7797 11.275 13.4797 10.475 11.9797 10.475C11.7797 10.475 11.5797 10.475 11.3797 10.575C7.37971 11.075 4.67971 14.575 2.57971 18.075L10.8797 3.675C11.3797 2.775 12.5797 2.775 13.0797 3.675C13.1797 3.875 13.2797 3.975 13.3797 4.175C15.2797 7.575 16.9797 11.675 15.8797 15.375Z"
                      fill="currentColor"
                    />
                    <path
                      opacity="0.3"
                      d="M20.6797 20.6749C16.7797 20.6749 12.3797 20.275 9.57972 17.575C10.2797 18.075 11.0797 18.375 11.9797 18.375C13.4797 18.375 14.7797 17.5749 15.4797 16.2749C15.6797 15.9749 15.7797 15.675 15.7797 15.375V15.2749C16.8797 11.5749 15.2797 7.47495 13.2797 4.07495L21.6797 18.6749C22.2797 19.5749 21.6797 20.6749 20.6797 20.6749ZM8.67972 18.6749C8.17972 17.8749 7.97972 16.975 7.77972 15.975C7.37972 13.575 8.67972 10.775 11.3797 10.375C7.37972 10.875 4.67972 14.375 2.57972 17.875C2.47972 18.075 2.27972 18.375 2.17972 18.575C1.67972 19.475 2.27972 20.475 3.27972 20.475H10.3797C9.67972 20.175 9.07972 19.3749 8.67972 18.6749Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <h5 className="fs-2 fw-semibold text-light my-0">Agent</h5>
              </Link>
              <div className="footer-add mt-3">
                <p>
                  
                    Bole Road, Addis Ababa, Ethiopia

                </p>
                <p>+251 911 234 567</p>
                <p>agent@abakas.net</p>
              </div>
            </div>
          </div>

          {/* Navigations */}
          <div className="col-lg-2 col-md-4">
            <div className="footer-widget pt-2">
              <h4 className="widget-title">Navigations</h4>
              <ul className="footer-menu list-unstyled">
                <li>
                  <Link to="/home">Home</Link>
                </li>
                <li>
                  <Link to="/about-us">About Us</Link>
                </li>
                <li>
                  <Link to="/faq">Properties</Link>
                </li>
                <li>
                  <Link to="/contact">Contact</Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Highlights */}
          <div className="col-lg-2 col-md-4">
            <div className="footer-widget pt-2">
              <h4 className="widget-title">Highlights</h4>
              <ul className="footer-menu list-unstyled">
                <li>
                  <Link to="#">Apartment</Link>
                </li>
                <li>
                  <Link to="#">Houses</Link>
                </li>
                <li>
                  <Link to="#">Real Estate</Link>
                </li>
                <li>
                  <Link to="#">Villas</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container pt-2">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-6">
              <p className="mb-3">
                © 2025 Agent. Designed By{" "}
                <a
                  href="https://abakas.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary"
                 
                >
                  Abakas Digital Solutions
                </a>{" "}
                All Rights Reserved
              </p>
            </div>
            <div className="col-lg-6 col-md-6 text-end mb-4 ">
              <ul className="footer-bottom-social list-unstyled d-flex justify-content-end gap-3 mb-0">
                <li>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fa-brands fa-facebook"></i>
                  </a>
                </li>
                <li>
                  <a
                    href="https://t.me"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fa-brands fa-telegram"></i>
                  </a>
                </li>
                <li>
                  <a
                    href="https://whatsapp.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fa-brands fa-whatsapp"></i>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
