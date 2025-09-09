import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import { FaBars } from "react-icons/fa";

import logo from "../../../assets/img/logo.svg";
import useAuth from "../../../context/auth/UseAuth";

const Header = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isPortrait, setIsPortrait] = useState(window.innerWidth <= 992);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const settings = {
    mobileBreakpoint: 992,
    overlay: true,
    overlayColor: "rgba(0, 0, 0, 0.5)",
    drawerSize: "42%", // max width instead of full screen
    animationDuration: 600, // slower smoothness
  };

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

  // Handle scroll just for header styling (background/shadow)
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Only update body padding when route or viewport changes
  useEffect(() => {
    const isFixed = location.pathname !== "/" && !isPortrait;
    if (isFixed) {
      document.body.style.paddingTop = "10px";
    } else {
      document.body.style.paddingTop = "";
    }
  }, [location.pathname, isPortrait]);

  const isFixed = isScrolled || location.pathname !== "/";

  return (
    <header
      className={`header header-transparent navigation ${
        isPortrait ? "navigation-portrait" : "navigation-landscape"
      } ${isFixed ? "header-fixed" : ""}`}
    >
      <div className="container custom-container px-0 ">
        <nav
          id="navigation"
          className={`navigation ${
            isPortrait ? "navigation-portrait" : "navigation-landscape"
          }`}
        >
          {/* Nav Header */}
          <div className="nav-header">
            <Link className="nav-brand text-logo exchange" to="/">
              <img src={logo} alt="Logo" />
              <h5 className="m-0">Resido</h5>
            </Link>

            {/* Mobile toggle */}
            {isPortrait && (
              <div
                className="pe-2"
                onClick={toggleMenu}
                style={{
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "var(--maincolor)",
                  marginRight:"20px"
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
                  <Link
                    to="/"
                    className={location.pathname === "/" ? "active" : ""}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/properties"
                    className={
                      location.pathname === "/properties" ? "active" : ""
                    }
                  >
                    Properties
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className={location.pathname === "/about" ? "active" : ""}
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className={location.pathname === "/contact" ? "active" : ""}
                  >
                    Contact
                  </Link>
                </li>

                <li className="nav-menu-social add-listing">
                  <Link
                    to={user ? "/admin/dashboard" : "/auth/login"}
                    className={
                      location.pathname ===
                      (user ? "/admin/dashboard" : "/auth/login")
                        ? "active"
                        : ""
                    }
                  >
                    {user ? "Dashboard" : "Sign In"}
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
                    <Link
                      to="/"
                      className={location.pathname === "/" ? "active" : ""}
                      onClick={toggleMenu}
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/properties"
                      className={
                        location.pathname === "/properties" ? "active" : ""
                      }
                      onClick={toggleMenu}
                    >
                      Properties
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/about"
                      className={location.pathname === "/about" ? "active" : ""}
                      onClick={toggleMenu}
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contact"
                      className={
                        location.pathname === "/contact" ? "active" : ""
                      }
                      onClick={toggleMenu}
                    >
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={user ? "/admin/dashboard" : "/auth/login"}
                      className={
                        location.pathname ===
                        (user ? "/admin/dashboard" : "/auth/login")
                          ? "active"
                          : ""
                      }
                      onClick={toggleMenu}
                    >
                      {user ? "Dashboard" : "Sign In"}
                    </Link>
                  </li>
                </ul>
              </div>
            </Drawer>
          )}

          {/* Overlay (optional, handled by Drawer) */}
        </nav>
      </div>
    </header>
  );
};

export default Header;
