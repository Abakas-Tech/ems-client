/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import { FaBars } from "react-icons/fa";

import logo from "../../../../assets/img/logo/header-logo.png";
import useProfile from "../../../../context/Profile/useProfile";
import { hasAccessToken } from "../../../../utils/axios";

const MainHeader = () => {
  const { profile, checkingAuth } = useProfile();
  const isAuth = hasAccessToken() || profile;

  const [isOpen, setIsOpen] = useState(false);
  const [isPortrait, setIsPortrait] = useState(window.innerWidth <= 992);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll helper
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle navigation click
const handleNavClick = (id) => {
  if (location.pathname === "/") {
    // Already on home, just scroll and update URL hash
    scrollToSection(id);
    window.history.replaceState(null, "", `/#${id}`);
  } else {
    // Navigate to home first
    navigate("/", { replace: false });
    // Wait for home page to render, then scroll and update URL hash
    setTimeout(() => {
      scrollToSection(id);
      window.history.replaceState(null, "", `/#${id}`);
    }, 150);
  }
  setIsOpen(false); // Close drawer if mobile
  document.body.classList.remove("no-scroll");
};
  const settings = {
    mobileBreakpoint: 992,
    overlay: true,
    overlayColor: "rgba(0, 0, 0, 0.5)",
    drawerSize: "42%",
    animationDuration: 600,
  };

  // Dynamic navigation based on role
  const roleDashboardMap = {
    1: "/admin/dashboard",
    2: "/admin/dashboard",
    3: "/partner/my-profile",
    4: "/worker/my-profile",
    5: "/employer/my-profile",
  };

  // Determine dashboard link and text
  let dashboardLink = "/auth/login";
  let dashboardText = "Sign In";

  if (!checkingAuth && isAuth && profile) {
    dashboardLink = roleDashboardMap[profile.role_id] || "/admin/dashboard";
    dashboardText = "Dashboard";
  }

  const toggleMenu = () => setIsOpen(!isOpen);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const newIsPortrait = window.innerWidth <= settings.mobileBreakpoint;
      setIsPortrait(newIsPortrait);
      if (!newIsPortrait) {
        setIsOpen(false);
        document.body.classList.remove("no-scroll");
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update body padding for fixed header
  useEffect(() => {
    const isFixed = location.pathname !== "/" && !isPortrait;
    document.body.style.paddingTop = isFixed ? "10px" : "";
  }, [location.pathname, isPortrait]);

  const isFixed = isScrolled || location.pathname !== "/";

  return (
    <header
      className={`header header-transparent navigation ${
        isPortrait ? "navigation-portrait" : "navigation-landscape"
      } ${isFixed ? "header-fixed" : ""}`}
    >
      <div className="container custom-container px-0">
        <nav
          id="navigation"
          className={`navigation ${
            isPortrait ? "navigation-portrait" : "navigation-landscape"
          }`}
        >
          {/* Nav Header */}
          <div className="nav-header">
            <Link className="nav-brand text-logo exchange" to="/">
              <img src={logo} alt="Logo" style={{ width: "80px" }} />
              {/* <h5 className="m-0">Resido</h5> */}
            </Link>

            {isPortrait && (
              <div
                className="pe-2"
                onClick={toggleMenu}
                style={{
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "var(--maincolor)",
                  marginRight: "10px",
                }}
              >
                <FaBars />
              </div>
            )}
          </div>

          {/* Desktop Nav */}
          {!isPortrait && (
            <div className="nav-menus-wrapper">
              <ul className="nav-menu align-to-right">
                <li>
                  <a
                    onClick={() => handleNavClick("home")}
                    style={{ cursor: "pointer" }}
                    className={location.pathname === "/" ? "active" : ""}
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    onClick={() => handleNavClick("how")}
                    style={{ cursor: "pointer" }}
                  >
                    Process
                  </a>
                </li>
                <li>
                  <a
                    onClick={() => handleNavClick("services")}
                    style={{ cursor: "pointer" }}
                  >
                    Services
                  </a>
                </li>
                <li>
                  <a
                    onClick={() => handleNavClick("about")}
                    style={{ cursor: "pointer" }}
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    onClick={() => handleNavClick("gallery")}
                    style={{ cursor: "pointer" }}
                  >
                    Gallery
                  </a>
                </li>
                <li>
                  <a
                    onClick={() => handleNavClick("testimonials")}
                    style={{ cursor: "pointer" }}
                  >
                    Testimonials
                  </a>
                </li>
                <li>
                  <a
                    onClick={() => handleNavClick("contact")}
                    style={{ cursor: "pointer" }}
                  >
                    Contact
                  </a>
                </li>

                <li className="nav-menu-social add-listing">
                  <Link
                    to={dashboardLink}
                    className={
                      location.pathname === dashboardLink ? "active" : ""
                    }
                  >
                    {dashboardText}
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* Mobile Nav with Drawer */}
          {isPortrait && (
            <Drawer
              open={isOpen}
              onClose={toggleMenu}
              direction="left"
              size={settings.drawerSize}
              duration={settings.animationDuration}
              overlayColor={settings.overlayColor}
            >
              <div
                className={`nav-menus-wrapper ${
                  isOpen ? "nav-menus-wrapper-open" : ""
                }`}
              >
                <span
                  className="nav-menus-wrapper-close-button"
                  onClick={toggleMenu}
                >
                  ✕
                </span>
                <ul className="nav-menu align-to-right">
                  <li>
                    <a
                      onClick={() => handleNavClick("home")}
                      style={{ cursor: "pointer" }}
                    >
                      Hero
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => handleNavClick("how")}
                      style={{ cursor: "pointer" }}
                    >
                      Process
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => handleNavClick("services")}
                      style={{ cursor: "pointer" }}
                    >
                      Services
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => handleNavClick("about")}
                      style={{ cursor: "pointer" }}
                    >
                      About
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => handleNavClick("gallery")}
                      style={{ cursor: "pointer" }}
                    >
                      Gallery
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => handleNavClick("testimonials")}
                      style={{ cursor: "pointer" }}
                    >
                      Testimonials
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => handleNavClick("contact")}
                      style={{ cursor: "pointer" }}
                    >
                      Contact
                    </a>
                  </li>
                  <li>
                    <Link
                      to={dashboardLink}
                      className={
                        location.pathname === dashboardLink ? "active" : ""
                      }
                    >
                      {dashboardText}
                    </Link>
                  </li>
                </ul>
              </div>
            </Drawer>
          )}
        </nav>
      </div>
    </header>
  );
};

export default MainHeader;
