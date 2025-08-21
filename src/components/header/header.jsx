import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/img/logo.svg";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPortrait, setIsPortrait] = useState(window.innerWidth <= 992);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const settings = {
    mobileBreakpoint: 992,
    showDuration: 300,
    hideDuration: 300,
    overlay: true,
    overlayColor: "rgba(0, 0, 0, 0.5)",
    offCanvasSide: "left",
  };

  // Handle screen resize
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

  // Handle scroll to toggle header-fixed class
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle off-canvas menu
  const toggleMenu = () => {
    if (isPortrait) {
      setIsOpen(!isOpen);
      document.body.classList.toggle("no-scroll", !isOpen);
      if (!isOpen && settings.overlay) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isOpen && !e.target.closest(".navigation")) {
        setIsOpen(false);
        document.body.classList.remove("no-scroll");
        document.body.style.overflow = "";
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isOpen]);

  // Apply padding-top to body when header-fixed is active and not in portrait mode
  useEffect(() => {
    const isFixed = isScrolled || location.pathname !== "/";
    if (isFixed && !isPortrait) {
      document.body.style.paddingTop = "80px"; // Apply padding only on larger screens
    } else {
      document.body.style.paddingTop = "";
    }
  }, [isScrolled, location.pathname, isPortrait]);

  // Determine if header-fixed should be applied
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
            {/* Brand */}
            <Link className="nav-brand text-logo exchange" to="/">
              <img src={logo} alt="Logo" />
              <h5 className="m-0">Resido</h5>
            </Link>

            {/* Toggle (Hamburger menu) */}
            {isPortrait && (
              <div className="nav-toggle" onClick={toggleMenu}></div>
            )}
          </div>

          {/* Nav Menu Wrapper */}
          <div
            className={`nav-menus-wrapper ${
              isOpen ? "nav-menus-wrapper-open" : ""
            } ${
              settings.offCanvasSide === "right"
                ? "nav-menus-wrapper-right"
                : ""
            }`}
            style={{
              transitionProperty: isPortrait ? settings.offCanvasSide : "none",
              transitionDuration: `${
                isOpen ? settings.showDuration : settings.hideDuration
              }ms`,
            }}
          >
            {isPortrait && (
              <span
                className="nav-menus-wrapper-close-button"
                onClick={toggleMenu}
              >
                ✕
              </span>
            )}
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
                  className={location.pathname === "/contact" ? "active" : ""}
                  onClick={toggleMenu}
                >
                  Contact
                </Link>
              </li>
              <li className="nav-menu-social add-listing">
                <Link
                  to="/signin"
                  className={location.pathname === "/signin" ? "active" : ""}
                  onClick={toggleMenu}
                >
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
          {isOpen && settings.overlay && isPortrait && (
            <div
              className="nav-overlay-panel"
              style={{ backgroundColor: settings.overlayColor }}
              onClick={toggleMenu}
            ></div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
