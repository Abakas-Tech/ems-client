import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTelegram, FaWhatsapp } from "react-icons/fa";
import { BiMap } from "react-icons/bi";
import { fetchAgentProfile } from './../../api/profile.api';

const AboutSnippet = ({ showButton  }) => {
  const [agentData, setAgentData] = useState({
    agent_name: "Adam D. Okraar",
    agent_address: "3599 Huntz Lane",
    profile_image_url: "https://placehold.co/500x500",
    bio: "Professional real estate agent.",
    facebook_username: "",
    telegram_username: "",
    whatsapp_username: "",
  });

  useEffect(() => {
    const getAgentProfile = async () => {
      const response = await fetchAgentProfile();
      if (response.success) {
        setAgentData({
          agent_name: response.agent_name || "Adam D. Okraar",
          agent_address: response.address || "3599 Huntz Lane",
          profile_image_url:
            response.profile_image_url || "https://placehold.co/500x500",
          bio:
            response.bio ||
            "Professional real estate agent with experience.",
          facebook_username: response.facebook_username || "",
          telegram_username: response.telegram_username || "",
          whatsapp_username: response.whatsapp_username || "",
        });
      }
    };

    getAgentProfile();
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
    <section className="agent-page p-0 gray-simple mt-5">
      <div className="container">
        <div className="row">
          <div className="col-lg-12 col-md-12">
            <div className="agency agency-list overlio-40">
              <div className="agency-avatar">
                <img src={agentData.profile_image_url} alt="" />
              </div>

              <div className="agency-content m-0">
                <div className="agency-name">
                  <h4>
                    <Link to="/agency-page">{agentData.agent_name}</Link>
                  </h4>
                  <span>
                    <BiMap /> {agentData.agent_address}
                  </span>
                </div>

                <div className="agency-desc">
                  <p>{agentData.bio}</p>
                </div>

               

                <ul className="social-icons mt-3">
                  {facebookUrl && (
                    <li>
                      <a
                        href={facebookUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="facebook"
                      >
                        <FaFacebook />
                      </a>
                    </li>
                  )}
                  {telegramUrl && (
                    <li>
                      <a
                        href={telegramUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="telegram"
                      >
                        <FaTelegram />
                      </a>
                    </li>
                  )}
                  {whatsappUrl && (
                    <li>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="whatsapp"
                      >
                        <FaWhatsapp />
                      </a>
                    </li>
                  )}
                </ul>

                {/* Conditionally render button */}
                {showButton && (
                  <div className="mt-3 d-flex justify-content-end ">
                    <Link to="/about" className="btn btn-md btn-main fw-medium">
                      Learn More
                    </Link>
                  </div>
                )}

                <div className="clearfix"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSnippet;
