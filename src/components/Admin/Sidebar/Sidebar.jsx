import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getProfile } from "../../../api/admin/auth.api";

const Sidebar = ({ isOpen, closeSidebar }) => {
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
    { label: "Dashboard", path: "/admin/dashboard", icon: "bi-speedometer" },
    {
      label: "My Profile",
      path: "/admin/my-profile",
      icon: "bi-person-bounding-box",
    },
    { label: "My Files", path: "/admin/my-files", icon: "bi bi-files" },
    {
      label: "Appointments",
      path: "/admin/appointments",
      icon: "bi bi-calendar",
    },
    { label: "My Listings", path: "/admin/my-listings", icon: "bi-house-door" },
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
    { label: "Settings", path: "/admin/settings", icon: "bi-gear" },
    { label: "Log Out", path: "/logout", icon: "bi-power" },
  ];

  const SidebarContent = () => (
    <div className="simple-sidebar sm-sidebar">
      <div className="sidebar-widgets">
        <div className="dashboard-navbar">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-lg-none position-absolute top-0 end-0 m-2"
            onClick={closeSidebar}
          >
            <i className="bi bi-x-lg p-2"></i>
          </button>
          <div className="d-user-avater">
            <img
              src={agentData.image}
              className="img-fluid avater"
              alt={`${agentData.name}'s Avatar`}
            />
            <h4>{agentData.name}</h4>
            <span>{agentData.location}</span>
          </div>

          <div className="d-navigation">
            <ul>
              {menuItems.map((item) => (
                <li
                  key={item.path}
                  className={location.pathname === item.path ? "active" : ""}
                  onClick={closeSidebar} // close after navigation on mobile/tablet
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
  );

  return (
    <>
      {/* Mobile/Tablet: Offcanvas */}
      <div
        id="sidebarOffcanvas"
        className={`offcanvas offcanvas-start d-lg-none ${
          isOpen ? "show" : ""
        }`}
        tabIndex={-1}
        role={isOpen ? "dialog" : undefined}
        aria-modal={isOpen ? "true" : undefined}
        aria-labelledby="sidebarOffcanvasLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="sidebarOffcanvasLabel">
            Dashboard Navigation
          </h5>
          <button
            type="button"
            className="btn-close text-reset"
            aria-label="Close"
            onClick={closeSidebar}
          ></button>
        </div>
        <div className="offcanvas-body">
          <SidebarContent />
        </div>
      </div>

      {/* Backdrop for Offcanvas (since we're not using Bootstrap JS) */}
      {isOpen && (
        <div
          className="offcanvas-backdrop fade show d-lg-none"
          onClick={closeSidebar}
        />
      )}

      {/* Desktop: static sidebar */}
      <div className="col-lg-3 pe-xl-4 d-none d-lg-block">
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;
