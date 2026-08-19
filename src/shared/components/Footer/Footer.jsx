import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import getSocialMedias from "../../../domains/public/api/socialMedia.api";
import { getLocation } from "../../../domains/admin/api/location.api";

const Footer = () => {
  const [agencyData, setAgencyData] = useState({
    agency_name: "ALETISALAT Private Foreign Employment Agency",
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

        const locationRes = await getLocation();
        const location = locationRes?.data;

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
          address: location?.address || prev.address,
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
    twitter: "fa-x-twitter",
    whatsapp: "fa-whatsapp",
  };

  return (
    <footer className="dark-footer skin-dark-footer">
      <div className="container">
        {/* <div className="row my-0"> */}
        <div className="col-12">
          <div className="footer-content pb-0">
            <div className="footer-links">
              <a href="#how">Process</a>
              <a href="#services">Services</a>
              <a href="#about">About</a>
              <a href="#gallery">Gallary</a>
              <a href="#testimonials">Testimonials</a>
              <a href="#contact">Contact</a>
            </div>
          </div>
        </div>
        {/* </div> */}
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="row align-items-center">
            {/* Left side */}
            <div className="col-lg-6 col-md-6 text-center text-md-start mb-2 mb-md-0">
              <p className="mb-0">
                © {new Date().getFullYear()} ALETISALAT Private Foreign
                Employment Agency | Developed by{" "}
                <a
                  href="https://abakastech.com/"
                  className="brand-link fw-bold"
                >
                  Abakas Technologies 
                </a>
                | All Rights Reserved.
              </p>
            </div>

            {/* Social icons */}
            <div className="col-lg-6 col-md-6 text-center text-md-end">
              <ul className="d-inline-flex d-md-flex justify-content-center justify-content-md-end  mb-0 me-4">
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
