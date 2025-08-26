import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getProfile } from "../../../api/admin/auth.api";

const Sidebar = () => {
  const location = useLocation();
  const [agentData, setAgentData] = useState({
    image: "https://placehold.co/500x500",
    name: "Loading...",
    location: "Loading...",
  });

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const response = await getProfile();
        console.log("Fetched agent data:", response);
        const { data } = response;
        setAgentData({
          image: data.profile_image_url || "https://placehold.co/500x500",
          name: data.agent_name,
          location: `${data.address || ""}, ${data.city || ""}, ${
            data.country || ""
          }`,
        });
      } catch (error) {
        console.error("Failed to fetch agent data:", error);
      }
    };

    fetchAgentData();
  }, []);

  const menuItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: "bi-speedometer",
    },
    {
      label: "My Profile",
      path: "/admin/my-profile",
      icon: "bi-person-bounding-box",
    },
    {
      label: "My Files",
      path: "/admin/my-files",
      icon: "bi bi-files",
    },
    {
      label: "Appointments",
      path: "/admin/appointments",
      icon: "bi bi-calendar",
    },
    {
      label: "My Listings",
      path: "/admin/my-listings",
      icon: "bi-house-door",
    },
    {
      label: "Featured Properties",
      path: "/admin/featured-properties",
      icon: "bi-suit-heart",
    },
    {
      label: "Submit Property",
      path: "/admin/submit-property",
      icon: "bi-patch-plus",
    },
    {
      label: "Settings",
      path: "/admin/settings",
      icon: "bi-gear",
    },
    { label: "Log Out", path: "/logout", icon: "bi-power" },
  ];

  return (
    <div className="col-lg-3 col-md-12 pe-xl-4">
      <div className="simple-sidebar sm-sidebar" id="filter_search">
        {/* Sidebar Header */}

        {/* Sidebar Widgets */}
        <div className="sidebar-widgets">
          <div className="dashboard-navbar">
            <div className="d-user-avater">
              <img
                src={agentData.image}
                className="img-fluid avater"
                alt={`${agentData.name}'s Avatar`}
              />
              <h4>{agentData.name}</h4>
              <span>{agentData.location}</span>
            </div>

            {/* Navigation Links */}
            <div className="d-navigation">
              <ul>
                {menuItems.map((item) => (
                  <li
                    key={item.path}
                    className={location.pathname === item.path ? "active" : ""}
                  >
                    <Link to={item.path}>
                      <i className={`bi ${item.icon} me-2`}></i>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
