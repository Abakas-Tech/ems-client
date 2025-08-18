import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { BiMap } from "react-icons/bi";
import { getAgentProfile } from "../../api/public/profile.api";

const AboutSnippet = () => {
  const [agentData, setAgentData] = useState({
    agent_name: "Adam D. Okraar",
    agent_address: "3599 Huntz Lane",
    profile_image_url: "https://placehold.co/500x500",
  });

  useEffect(() => {
    const fetchAgentProfile = async () => {
      const response = await getAgentProfile();
      if (response.success) {
        setAgentData({
          agent_name: response.data.agent_name || "Adam D. Okraar",
          agent_address: response.data.agent_address || "3599 Huntz Lane",
          profile_image_url:
            response.data.profile_image_url || "https://placehold.co/500x500",
        });
      }
    };

    fetchAgentProfile();
  }, []);

  return (
    <section className="agent-page p-0 gray-simple">
      <div className="container">
        <div className="row">
          <div className="col-lg-12 col-md-12">
            <div className="agency agency-list overlio-40">
              <div className="agency-avatar">
                <img src={agentData.profile_image_url} alt="" />
              </div>

              <div className="agency-content">
                <div className="agency-name">
                  <h4>
                    <Link to="/agency-page">{agentData.agent_name}</Link>
                  </h4>
                  <span>
                    <BiMap /> {agentData.agent_address}
                  </span>
                </div>

                <div className="agency-desc">
                  <p>
                    Think of a news blog that's filled with content hourly on
                    the day of going live However, reviewers tend to be
                    distracted by comprehensible content. In a professional
                    context it often happens that private or corporate clients
                    corder a publication to be made and presented with the
                    actual content still not being ready.
                  </p>
                </div>

                <div className="prt-detios">
                  <span className="label text-light bg-green">
                    202 Property
                  </span>
                </div>

                <ul className="social-icons mt-3">
                  <li>
                    <Link to="#" className="facebook">
                      <FaFacebook />
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="twitter">
                      <FaTwitter />
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="linkedin">
                      <FaInstagram />
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="linkedin">
                      <FaLinkedin />
                    </Link>
                  </li>
                </ul>
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
