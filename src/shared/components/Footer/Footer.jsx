import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSocialMedias } from "../../../domains/public/api/socialMedia.api";

const Footer = () => {
  const [agentData, setAgentData] = useState({
    agent_name: "Hussen Agent",
    agent_email: "support@agent.com",
    agent_phone: "0918241535",
    address: "Addiss Ababa, Ethiopia",
    facebook_username: "",
    telegram_username: "",
    whatsapp_username: "",
  });

  useEffect(() => {
    const loadSocialMedia = async () => {
      try {
        const data = await getSocialMedias();

        setAgentData((prev) => ({
          ...prev,
          facebook_username: data?.facebook_username || "",
          telegram_username: data?.telegram_username || "",
          whatsapp_username: data?.whatsapp_username || "",
        }));
      } catch (error) {
        console.error("Failed to load social medias:", error.message);
      }
    };

    loadSocialMedia();
  }, []);

  // Dynamic social links
  const facebookUrl = agentData.facebook_username
    ? `https://facebook.com/${agentData.facebook_username}`
    : null;

  const telegramUrl = agentData.telegram_username
    ? `https://t.me/${agentData.telegram_username}`
    : null;

  const whatsappUrl = agentData.whatsapp_username
    ? `https://wa.me/${agentData.whatsapp_username.replace(/\D/g, "")}`
    : null;

  return (
    <footer className="dark-footer skin-dark-footer">
      <div>
        <div className="container custome-footer">
          <div className="row my-0">
            {/* Logo & Contact */}
            <div className="col-lg-4 col-md-4">
              <div className="footer-widget">
                <Link className="nav-footer-logo" to="/">
                  <h5 className="fs-2 fw-bold text-light ms-1 my-0">Resido</h5>
                </Link>

                <div className="footer-add">
                  <p>{agentData.address}</p>
                  <p>{agentData.agent_phone}</p>
                  <p>{agentData.agent_email}</p>
                </div>
              </div>
            </div>

            {/* Navigations */}
            <div className="col-lg-4 col-md-4">
              <div className="footer-widget">
                <h4 className="widget-title mb-0">Navigations</h4>
                <ul className="footer-menu">
                  <li>
                    <Link to="/">Home</Link>
                  </li>
                  <li>
                    <Link to="/properties">Properties</Link>
                  </li>
                  <li>
                    <Link to="/about">About</Link>
                  </li>
                  <li>
                    <Link to="/contact">Contact</Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Highlights */}
            <div className="col-lg-4 col-md-4">
              <div className="footer-widget">
                <h4 className="widget-title mb-0">Highlights</h4>
                <ul className="footer-menu">
                  <li>
                    <Link to="/properties">Apartments</Link>
                  </li>
                  <li>
                    <Link to="/properties">Villas</Link>
                  </li>
                  <li>
                    <Link to="/properties">Houses</Link>
                  </li>
                  <li>
                    <Link to="/properties">Lands</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="row align-items-center">
            {/* Left side */}
            <div className="col-lg-6 col-md-6 text-center text-md-start mb-2 mb-md-0">
              <p className="mb-0">
                © 2025 Resido. Developed by{" "}
                <a
                  href="https://abakastech.com/"
                  className="brand-link"
                  style={{ color: "#00C090" }}
                >
                  Abakas
                </a>
                . All Rights Reserved.
              </p>
            </div>

            {/* Social icons */}
            <div className="col-lg-6 col-md-6 text-center text-md-end">
              <ul className="d-inline-flex d-md-flex justify-content-center justify-content-md-end flex-wrap mb-0 me-4">
                {facebookUrl && (
                  <li className="me-3 mb-2 mb-md-0">
                    <a
                      href={facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fa-brands fa-facebook"></i>
                    </a>
                  </li>
                )}

                {whatsappUrl && (
                  <li className="me-3 mb-2 mb-md-0">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fa-brands fa-whatsapp"></i>
                    </a>
                  </li>
                )}

                {telegramUrl && (
                  <li className="mb-2 mb-md-0">
                    <a
                      href={telegramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fa-brands fa-telegram"></i>
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
