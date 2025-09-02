import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../../../assets/img/logo.svg";
import { fetchAgentProfile } from "../../../domains/public/api/profile.api";
import useResponse from "../../../context/response/UseResponse";

const Footer = () => {
  const { addMessage } = useResponse();
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
    const loadAgentProfile = async () => {
      try {
        const profile = await fetchAgentProfile();
        setAgentData({
          agent_name: profile.agent_name,
          agent_email: profile.agent_email,
          agent_phone: profile.agent_phone,
          address: profile.address,
          facebook_username: profile.facebook_username || "",
          telegram_username: profile.telegram_username || "",
          whatsapp_username: profile.whatsapp_username || "",
        });
      } catch (error) {
        addMessage("error", error.message);
      }
    };

    loadAgentProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                  <span className="svg-icon text-light svg-icon-2hx">
                    <img src={logo} alt="Resido Logo" className="img-fluid" />
                  </span>
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
            <div className="col-lg-6 col-md-6">
              <p className="mb-0">
                © 2025 Resido. Developed by{" "}
                <a
                  href="https://abakas.net"
                  className="brand-link"
                  style={{ color: "#ff5722" }}
                >
                  Abakas
                </a>
                . All Rights Reserved.
              </p>
            </div>

            <div className="col-lg-6 col-md-6 text-right">
              <ul className="footer-bottom-social">
                {facebookUrl && (
                  <li>
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
                  <li>
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
                  <li>
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
