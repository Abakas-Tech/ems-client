import React, { useState } from "react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const closeFilterSearch = () => setIsOpen(false);
  const openFilterSearch = () => setIsOpen(true);

  return (
    <div className={`col-lg-3 col-md-12 pe-xl-4 ${!isOpen ? "d-none" : ""}`}>
      <div className="simple-sidebar sm-sidebar" id="filter_search">
        {/* Sidebar Header */}
        <div className="search-sidebar_header">
          <h4 className="ssh_heading">Close Filter</h4>
          <button
            onClick={closeFilterSearch}
            className="w3-bar-item w3-button w3-large"
          >
            <i className="fa-regular fa-circle-xmark fs-5 text-muted-2"></i>
          </button>
        </div>

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
                <li>
                  <a href="dashboard.html">
                    <i className="bi bi-speedometer me-2"></i>Dashboard
                  </a>
                </li>
                <li className="active">
                  <a href="my-profile.html">
                    <i className="bi bi-person-bounding-box me-2"></i>My Profile
                  </a>
                </li>
                <li>
                  <a href="my-property.html">
                    <i className="bi bi-house-door me-2"></i>My Listings
                  </a>
                </li>
                <li>
                  <a href="bookmark-list.html">
                    <i className="bi bi-suit-heart me-2"></i>Featured Properties
                  </a>
                </li>
                <li>
                  <a href="submit-property-dashboard.html">
                    <i className="bi bi-patch-plus me-2"></i>Submit Property
                  </a>
                </li>
                <li>
                  <a href="change-password.html">
                    <i className="bi bi-gear me-2"></i>Settings
                  </a>
                </li>
                <li>
                  <a href="index.html">
                    <i className="bi bi-power me-2"></i>Log Out
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
