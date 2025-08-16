import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/img/logo.svg";
const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPortrait, setIsPortrait] = useState(window.innerWidth < 992);

  // Watch screen resize to switch classes
  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerWidth < 992);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="header head-shadow">
      <div className="container">
        <nav
          className={`navigation ${
            isPortrait ? "navigation-portrait" : "navigation-landscape"
          }`}
        >
          {/* Nav Header */}
          <div className="nav-header">
            {/* Brand */}
            <Link className="nav-brand text-logo" to="/">
              <img src={logo} alt="Logo" />
              <h5 className="m-0">Resido</h5>
            </Link>

            {/* Toggle (Hamburger menu) */}
            {isPortrait && (
              <div
                className="nav-toggle"
                onClick={() => setIsOpen(!isOpen)}
              ></div>
            )}
          </div>

          {/* Nav Menu Wrapper */}
          <div
            className={`nav-menus-wrapper ${
              isOpen ? "nav-menus-wrapper-open" : ""
            }`}
          >
            <span class="nav-menus-wrapper-close-button">✕</span>
            <ul className="nav-menu align-to-right">
              <li>
                <Link to="/" className="active">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/properties">Properties</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <Link to="/services">Services</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
              <li className="nav-menu-social add-listing">
                <Link to="/signin">Sign In</Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
