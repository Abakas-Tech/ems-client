import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import useLogout from "../../../../context/logout/UseLogout";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import { useProfile } from "../../../../context/Profile/ProfileProvider";
const Sidebar = ({ isOpen, closeSidebar }) => {
  const { logout } = useLogout();
  const location = useLocation();
  const { profile } = useProfile();

  const agentData = {
    image: profile?.profile_image_url || "https://placehold.co/500x500",
    name: profile?.agent_name || "Loading...",
    location:
      `${profile?.address || ""}, ${profile?.city || ""}, ${
        profile?.country || ""
      }` || "Loading...",
  };

  // Auto-close drawer on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992 && isOpen) {
        closeSidebar();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, closeSidebar]);

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
    <div className="sidebar-widgets">
      <div className="dashboard-navbar">
        {/* Close button only on mobile */}
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary d-lg-none position-absolute top-0 end-0 m-2"
          onClick={closeSidebar}
        >
          <i className="bi bi-x-lg p-2"></i>
        </button>

        {/* User profile */}
        <div className="d-user-avater">
          <img
            src={agentData.image}
            className="img-fluid avater"
            alt={`${agentData.name}'s Avatar`}
          />
          <h3>{agentData.name}</h3>
          <span>{agentData.location}</span>
        </div>

        {/* Navigation */}
        <div className="d-navigation">
          <ul>
            {menuItems.map((item) => (
              <li
                key={item.path}
                className={location.pathname === item.path ? "active" : ""}
                onClick={closeSidebar}
              >
                {item.label === "Log Out" ? (
                  <Link onClick={() => logout()}>
                    <i className={`bi ${item.icon} me-2`}></i>
                    {item.label}
                  </Link>
                ) : (
                  <Link to={item.path}>
                    <i className={`bi ${item.icon} me-2`}></i>
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile/Tablet: Drawer */}
      <Drawer open={isOpen} onClose={closeSidebar} direction="left" size="100%">
        <div style={{ height: "100vh", overflowY: "auto" }} className="p-3">
          <SidebarContent />
        </div>
      </Drawer>

      {/* Desktop: static sidebar */}
      <div className="d-none d-lg-block">
        <div className="simple-sidebar sm-sidebar">
          <SidebarContent />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
