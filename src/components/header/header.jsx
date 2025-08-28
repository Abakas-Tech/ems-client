import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";

import logo from "../../assets/img/logo.svg";

const Header = () => {
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

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Body padding
  useEffect(() => {
    const isFixed = isScrolled || location.pathname !== "/";
    if (isFixed && !isPortrait) {
      document.body.style.paddingTop = "80px";
    } else {
      document.body.style.paddingTop = "";
    }
  }, [isScrolled, location.pathname, isPortrait]);

  const isFixed = isScrolled || location.pathname !== "/";

  return (
    <header
      className={`header header-transparent navigation ${
        isPortrait ? "navigation-portrait" : "navigation-landscape"
      } ${isFixed ? "header-fixed" : ""}`}
    >
      <div className="container">
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
              <div className="nav-toggle" onClick={toggleMenu}></div>
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
                    to="/signin"
                    className={location.pathname === "/signin" ? "active" : ""}
                  >
                    Sign In
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
                      to="/signin"
                      className={
                        location.pathname === "/signin" ? "active" : ""
                      }
                      onClick={toggleMenu}
                    >
                      Sign In
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
