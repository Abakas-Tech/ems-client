// AboutDetail component (with Title, Info, Experience, Contact Form)
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { faFacebook, faTelegram, faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";
import img from "../../assets/img/img.jpg";
import { fetchAgentProfile } from "../../api/public/about.api";
import ContactForm from "../ContactForm/ContactForm";

const AboutDetail = () => {
  const [agent, setAgent] = useState({
    agent_name: "Adam D. Okraar",
    agent_address: "3599 Huntz Lane",
    profile_image_url: "https://placehold.co/500x500",
    agent_email: "agent@realestate.com",
    agent_phone: "0968301661",
    telegram_username: "-",
    city: "Addis Ababa",
    country: "Ethiopia",
    experience_description:
      "experience_description: `Abdurehman Ahmed has been a leading real estate agent in Ethiopia for over 12 years. He has extensive experience in residential, commercial, and luxury properties. His expertise includes market analysis, property valuation, client relationship management, and seamless property transactions. Abdurehman is committed to providing personalized guidance, ensuring his clients make informed decisions and achieve their property goals efficiently.",
    facebook_username: "#",
    whatsapp_username: "#",
  });

  useEffect(() => {
    const getAgent = async () => {
      const data = await fetchAgentProfile();
      if (data) {
        setAgent((prev) => ({ ...prev, ...data }));
      }
    };
    getAgent();
  }, []);

  return (
    <div>
      {/* Page Title */}
      <div className="image-cover page-title">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 col-md-12">
              <h2 className="ipt-title">Agent Detail</h2>
              <span className="ipn-subtitle">{agent.agent_name} From Ethiopia</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="agent-page p-0 gray-simple">
        <div className="container">
          <div className="row">
            {/* Agent Profile Card */}
            <div className="col-lg-12 col-md-12">
              <div className="agency agency-list overlio-40">
                <div className="agency-avatar">
                  <img src={agent.profile_image_url || img} alt="img avatar" />
                </div>
                <div className="agency-content">
                  <div className="agency-name">
                    <h4>
                      <Link to="/agency-page">{agent.agent_name} </Link>
                    </h4>
                    <p>
                      <span>
                        <FontAwesomeIcon icon={faLocationDot} /> {agent.agent_address}
                      </span>
                    </p>
                  </div>
                  <div className="agency-desc">
                     <p>{agent.bio}</p>
                  </div>

                  {/* Social Icons */}
                  <ul className="social-icons mt-5 d-flex gap-3">
                    <li>
                      <a
                        className="facebook"
                        href={agent.facebook_username || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FontAwesomeIcon icon={faFacebook} />
                      </a>
                    </li>
                    <li>
                      <a
                        className="telegram"
                        href={agent.telegram_username || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FontAwesomeIcon icon={faTelegram} />
                      </a>
                    </li>
                    <li>
                      <a
                        className="whatsapp"
                        href={agent.whatsapp_username || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FontAwesomeIcon icon={faWhatsapp} />
                      </a>
                    </li>
                  </ul>
                  <div className="clearfix"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Info & Contact Section */}
          <div className="row mt-4 d-flex flex-wrap">
            {/* Left Side (Info + Experience) */}
            <div className="col-lg-8 col-md-12 d-flex flex-column" style={{ alignItems: "stretch" }}>
              {/* Agent Info */}
              <div className="block-wrap mb-4 flex-fill">
                <div className="block-header">
                  <h4 className="block-title">Agent Info</h4>
                </div>
                <div className="block-body">
                  <ul className="dw-proprty-info">
                    <li><strong>CEO</strong> {agent.agent_name}</li>
                    <li><strong>Email</strong> {agent.agent_email}</li>
                    <li><strong>Phone</strong> {agent.agent_phone}</li>
                    <li><strong>Telegram</strong> {agent.telegram_username}</li>
                    <li><strong>Address</strong> {agent.agent_address}</li>
                    <li><strong>City</strong> {agent.city}</li>
                    <li><strong>Country</strong> {agent.country}</li>
                  </ul>
                </div>
              </div>

              {/* Agent Experience */}
              <div className="block-wrap mb-4 flex-fill">
                <div className="block-header">
                  <h4 className="block-title">Agent Experience</h4>
                </div>
                <div className="block-body">
                  <div className="agent-experience">
                    <p>{agent.experience_description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side (Contact Form) */}
            <div className="col-lg-4 col-md-12 mb-4">
              <div className="sides-widget bg-white rounded">
                <ContactForm profile={agent} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutDetail;
