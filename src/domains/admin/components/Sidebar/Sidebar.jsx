import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import styles from "./Sidebar.module.css";
import useProfile from "../../../../context/Profile/useProfile";
import MENU_CONFIG from "../../../../config/menu.config";

const Sidebar = ({ isOpen, onClose, expanded, onLogout, isDesktop }) => {
  const location = useLocation();
  const [showLabels, setShowLabels] = useState(expanded);
  const { profile } = useProfile();
  const user = profile;

  // Handle label animation
  useEffect(() => {
    let timer;

    if (expanded) {
      timer = setTimeout(() => {
        setShowLabels(true);
      }, 130);
    } else {
      setShowLabels(false);
    }

    return () => clearTimeout(timer);
  }, [expanded]);

  //   role-based filter
  let filteredItems = MENU_CONFIG.filter((item) =>
    item.roles.includes(user?.role_id),
  );

  //  Add extra permission filter ONLY for Employee
  if (user?.role_id === 2) {
    const userPermissions = user.permissions || {};
    filteredItems = filteredItems.filter((item) =>
      item.permission ? userPermissions[item.permission] === 1 : true,
    );
  }

  // Hide internal or helper menu entries
  filteredItems = filteredItems.filter((item) => !item.isHidden);

  // Logout is rendered in its own pinned footer rather than inline with
  // the rest of the nav — same item, same role/permission filtering
  // above, same onLogout handler, just a different spot in the layout.
  const navItems = filteredItems.filter((item) => !item.isLogout);
  const logoutItem = filteredItems.find((item) => item.isLogout);

  const renderLink = (item, showLabels) => {
    const isActive =
      item.path === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(item.path);
    const liClass = isActive ? styles.active : "";

    if (item.isLogout) {
      return (
        <li key={item.label} className={liClass}>
          <Link className={styles.navLink} onClick={onLogout}>
            <i className={`bi ${item.icon} ${styles.icon}`} />
            {showLabels && <span className={styles.label}>{item.label}</span>}
          </Link>
        </li>
      );
    }

    const path =
      item.path.includes(":id") && user?.id
        ? item.path.replace(":id", user.id)
        : item.path;

    return (
      <li key={item.label} className={liClass}>
        <Link to={path} className={styles.navLink} onClick={onClose}>
          <i className={`bi ${item.icon} ${styles.icon}`} />
          {showLabels && <span className={styles.label}>{item.label}</span>}
          {isActive && <span className={styles.activeDot} />}
        </Link>
      </li>
    );
  };

  const renderMenu = (showLabels = true) => (
    <div className={styles.content}>
      <div className={styles.brand}>
        <img src="/logo.png" alt="" className={styles.brandMark} />
        {showLabels && <span className={styles.brandName}>Vision</span>}
      </div>

      <div className={styles.navScroll}>
        <ul className={styles.nav}>
          {navItems.map((item) => renderLink(item, showLabels))}
        </ul>
      </div>

      {logoutItem && (
        <div className={styles.footer}>
          <ul className={styles.nav}>{renderLink(logoutItem, showLabels)}</ul>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      {isDesktop && (
        <div
          className={`${styles.sidebar}  ${
            expanded ? styles.expanded : styles.collapsed
          } d-navigation `}
        >
          {renderMenu(showLabels)}
        </div>
      )}

      {/* Mobile Drawer */}
      {!isDesktop && (
        <Drawer open={isOpen} onClose={onClose} direction="left" size="100%">
          <div className={`${styles.mobileDrawer} d-navigation`}>
            <button className={styles.drawerClose} onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
            <div className={styles.drawerBody}>{renderMenu(true)}</div>
          </div>
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
