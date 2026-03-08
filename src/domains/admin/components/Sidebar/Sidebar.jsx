import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import styles from "./Sidebar.module.css";
import useProfile from "../../../../context/Profile/useProfile";

const menuItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: "bi-speedometer2" },
  {
    label: "My Profile",
    path: "/admin/my-profile",
    icon: "bi bi-person-bounding-box",
  },
  {
    label: "User Management",
    path: "/admin/user-management",
    icon: "bi bi-people",
  },
  {
    label: "Worker",
    path: "/admin/workers",
    icon: "bi bi-file-earmark-person-fill",
  },
  {
    label: "Finance",
    path: "/admin/finances",
    icon: "bi bi-wallet",
  },
  { label: "Files", path: "/admin/my-files", icon: "bi bi-files" },
  { label: "Meta Data", path: "/admin/meta-data", icon: "bi bi-database-add" },
  {
    label: "Public Profile",
    path: "/admin/public-profile",
    icon: "bi bi-layout-text-sidebar-reverse",
  },
  {
    label: "Public Location",
    path: "/admin/public-Location",
    icon: "bi bi-geo-alt",
  },
  {
    label: "Public Gallery",
    path: "/admin/public-gallery",
    icon: "bi bi-images",
  },
  { label: "Settings", path: "/admin/settings", icon: "bi-gear" },

  { label: "Log Out", path: "#", icon: "bi bi-power", isLogout: true },
];

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

  const filteredItems =
    user?.role === "Employee"
      ? menuItems.filter(
          (item) =>
            !["Dashboard", "Employees", "Payment History"].includes(item.label),
        )
      : menuItems;

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
