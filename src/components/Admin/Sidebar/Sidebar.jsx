import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

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
      label: "My Listings",
      path: "/admin/my-property",
      icon: "bi-house-door",
    },
    {
      label: "Featured Properties",
      path: "/admin/bookmarks",
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
                src="https://placehold.co/500x500"
                className="img-fluid avater"
                alt="User Avatar"
              />
              <h4>Adam Harshvardhan</h4>
              <span>Canada USA</span>
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
