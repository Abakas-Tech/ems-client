// AboutDetail component (with Title, Info, Experience, Contact Form)
import React, { useEffect, useState } from "react";
import { fetchAgentProfile } from "../../api/profile.api";
import ContactForm from "../../components/ContactForm/ContactForm";
import AboutSnippet from "./../../components/AboutSnippet/AboutSnippet";
import SEOHelmet from "../../../../shared/components/SEOHelmet/SEOHelmet";

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
      "Abdurehman Ahmed has been a leading real estate agent in Ethiopia for over 12 years. He has extensive experience in residential, commercial, and luxury properties. His expertise includes market analysis, property valuation, client relationship management, and seamless property transactions. Abdurehman is committed to providing personalized guidance, ensuring his clients make informed decisions and achieve their property goals efficiently.",
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
    <>
      <SEOHelmet />
      {/* Page Title */}
      <div className="image-cover page-title" style={{ marginTop: "50px" }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-12 col-md-12">
              <h2 className="ipt-title fw-bold">Agent Detail</h2>
              <span className="ipn-subtitle">
                {agent.agent_name} From {agent.city}, {agent.country}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="agent-page gray-simple">
        <div className="container">
          <div className="row">
            {/*  Replaced duplicated agent profile card */}
            <div className="col-lg-12 col-md-12 px-0">
              <AboutSnippet showButton={false} />
            </div>
          </div>

          {/* Info & Contact Section */}
          <div className="row mt-4 d-flex flex-wrap">
            {/* Left Side (Info + Experience) */}
            <div
              className="col-lg-8 col-md-12 d-flex flex-column"
              style={{ alignItems: "stretch" }}
            >
              {/* Agent Info */}
              <div className="block-wrap mb-4 ">
                <div className="block-header">
                  <h4 className="block-title">Agent Info</h4>
                </div>
                <div className="block-body">
                  <ul className="dw-proprty-info">
                    <li>
                      <strong>CEO</strong> {agent.agent_name}
                    </li>

                    <li>
                      <strong>Phone</strong> {agent.agent_phone}
                    </li>
                    <li>
                      <strong>Telegram</strong> {agent.telegram_username}
                    </li>
                    <li>
                      <strong>Address</strong> {agent.address}
                    </li>
                    <li>
                      <strong>City</strong> {agent.city}
                    </li>
                    <li>
                      <strong>Country</strong> {agent.country}
                    </li>
                    <li>
                      <strong>Email</strong> {agent.agent_email}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Agent Experience */}
              <div className="block-wrap mb-4 ">
                <div className="block-header">
                  <h4 className="block-title">Agent Experience</h4>
                </div>
                <div className="block-body">
                  <div className="agent-experience">
                    <p>{agent?.experience_description}</p>
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
    </>
  );
};

export default AboutDetail;
