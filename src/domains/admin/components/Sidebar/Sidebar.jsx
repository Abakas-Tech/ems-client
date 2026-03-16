import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import styles from "./Sidebar.module.css";
import useProfile from "../../../../context/Profile/useProfile";
import MENU_CONFIG from "../../../../config/menu.config";
import ROLES from "../../../../config/role.config";

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
      }, 150);
    } else {
      setShowLabels(false);
    }

    return () => clearTimeout(timer);
  }, [expanded]);

  const filteredItems = MENU_CONFIG.filter((item) =>
    item.roles.includes(user?.role_id),
  ).map((item) => {
    if (user?.role_id === ROLES.WORKER && item.path === "/admin/workers") {
      return {
        ...item,
        label: "My Application",
        icon: "bi bi-person-vcard-fill",
      };
    }
    return item;
  });

  const renderMenu = (showLabels = true) => (
    <div className={styles.content}>
      <ul className={styles.nav}>
        {filteredItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const liClass = isActive ? "active" : "";
          if (item.isLogout) {
            return (
              <li key={item.label} className={liClass}>
                <Link className={styles.navLink} onClick={onLogout}>
                  <i className={`bi ${item.icon} ${styles.icon}`} />
                  {showLabels && <span>{item.label}</span>}
                </Link>
              </li>
            );
          }

          return (
            <li key={item.label} className={liClass}>
              <Link to={item.path} className={styles.navLink} onClick={onClose}>
                <i className={`bi ${item.icon} ${styles.icon}`} />
                {showLabels && (
                  <span className={styles.label}>{item.label}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
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

            {renderMenu(true)}
          </div>
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
