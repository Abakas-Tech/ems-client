import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSocialMedias } from "../../../domains/public/api/socialMedia.api";
import logo from "../../../assets/img/logo/agency-logo.png";

const Footer = () => {
  const [agencyData, setAgencyData] = useState({
    agency_name: "Sultan Agency",
    agency_email: "",
    agency_phone: "",
    address: "Addis Ababa, Ethiopia",
    facebook_username: "",
    instagram_username: "",
    telegram_username: "",
    tiktok_username: "",
    linkedin_username: "",
    youtube_username: "",
    twitter_username: "",
    whatsapp_username: "",
  });

  useEffect(() => {
    const loadSocialMedia = async () => {
      try {
        const response = await getSocialMedias();
        const data = response?.data;

        setAgencyData((prev) => ({
          ...prev,
          agency_phone: data?.contact_number || "",
          agency_email: data?.email || "",
          facebook_username: data?.facebook_username || "",
          instagram_username: data?.instagram_username || "",
          telegram_username: data?.telegram_username || "",
          tiktok_username: data?.tiktok_username || "",
          linkedin_username: data?.linkedin_username || "",
          youtube_username: data?.youtube_channel || "",
          twitter_username: data?.twitter_username || "",
          whatsapp_username: data?.whatsapp_number || "",
        }));
      } catch (error) {
        console.error("Failed to load social medias:", error.message);
      }
    };

    loadSocialMedia();
  }, []);

  const socialLinks = {
    facebook: agencyData.facebook_username
      ? `https://facebook.com/${agencyData.facebook_username}`
      : null,

    instagram: agencyData.instagram_username
      ? `https://instagram.com/${agencyData.instagram_username}`
      : null,

    telegram: agencyData.telegram_username
      ? `https://t.me/${agencyData.telegram_username}`
      : null,

    tiktok: agencyData.tiktok_username
      ? `https://tiktok.com/@${agencyData.tiktok_username}`
      : null,

    linkedin: agencyData.linkedin_username
      ? `https://linkedin.com/in/${agencyData.linkedin_username}`
      : null,

    youtube: agencyData.youtube_username
      ? `https://youtube.com/@${agencyData.youtube_username}`
      : null,

    twitter: agencyData.twitter_username
      ? `https://twitter.com/${agencyData.twitter_username}`
      : null,

    whatsapp: agencyData.whatsapp_username
      ? `https://wa.me/${agencyData.whatsapp_username.replace(/\D/g, "")}`
      : null,
  };

  const socialIcons = {
    facebook: "fa-facebook",
    instagram: "fa-instagram",
    telegram: "fa-telegram",
    tiktok: "fa-tiktok",
    linkedin: "fa-linkedin",
    youtube: "fa-youtube",
    twitter: "fa-twitter",
    whatsapp: "fa-whatsapp",
  };

  return (
    <footer className="dark-footer skin-dark-footer">
      <div>
        <div className="container custome-footer">
          <div className="row my-0">
            {/* Logo & Contact */}
            <div className="col-lg-4 col-md-4">
              <div className="footer-widget">
                <Link className="nav-footer-logo" to="/">
                  {/* If you want logo instead of text, uncomment below */}
                  {/* <img src={logo} alt="logo" className="footer-logo" /> */}

                  <h5 className="fs-2 fw-bold text-light ms-1 my-0">
                    {agencyData.agency_name}
                  </h5>
                </Link>

                <div className="footer-add">
                  <p>{agencyData.address}</p>
                  {agencyData.agency_phone && <p>{agencyData.agency_phone}</p>}
                  {agencyData.agency_email && <p>{agencyData.agency_email}</p>}
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
                © {new Date().getFullYear()} {agencyData.agency_name}. Developed
                by{" "}
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
                {Object.entries(socialLinks).map(([platform, url]) =>
                  url ? (
                    <li key={platform} className="me-3 mb-2 mb-md-0">
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <i className={`fa-brands ${socialIcons[platform]}`}></i>
                      </a>
                    </li>
                  ) : null,
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
