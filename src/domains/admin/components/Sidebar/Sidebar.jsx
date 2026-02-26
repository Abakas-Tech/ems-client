import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import styles from "./Sidebar.module.css";
import  useProfile  from "../../../../context/Profile/useProfile";

const menuItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: "bi-speedometer2" },
  { label: "My Profile", path: "/admin/my-profile", icon: "bi-person" },
  {
    label: "User Management",
    path: "/admin/user-management",
    icon: "bi-file-earmark-text",
  },
  { label: "Groups", path: "/admin/groups", icon: "bi-people-fill" },
  {
    label: "Contributors",
    path: "/admin/contributors",
    icon: "bi-person-lines-fill",
  },
  { label: "Collect Money", path: "/admin/collect-money", icon: "bi-wallet2" },
  { label: "Payment History", path: "/admin/payments", icon: "bi-cash-stack" },
  { label: "Settings", path: "/admin/settings", icon: "bi-gear" },
  { label: "Log Out", path: "#", icon: "bi-box-arrow-right", isLogout: true },
];

const Sidebar = ({
  isOpen,
  onClose,
  expanded,
  onLogout,
  isDesktop,
}) => {
  const location = useLocation();
  const [showLabels, setShowLabels] = useState(expanded);
  const { profile } = useProfile();

  const user = profile;

  // Handle label animation
  useEffect(() => {
    let timer;

<<<<<<< HEAD
  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "bi-speedometer" },
    {
      label: "My Profile",
      path: "/admin/my-profile",
      icon: "bi-person-bounding-box",
    },
    { label: "My Files", path: "/admin/my-files", icon: "bi bi-files" },
    {
      label: "Finances",
      path: "/admin/finances",
      icon: "bi-wallet2",
    },
    { label: "My Listings", path: "/admin/my-listings", icon: "bi-house-door" },
    {
      label: "Featured Properties",
      path: "/admin/featured-properties",
      icon: "bi-suit-heart",
    },
    {
      label: "Submit Property",
      path: "/admin/submit-property",
      icon: "bi-patch-plus",
    },
    { label: "Settings", path: "/admin/settings", icon: "bi-gear" },
    { label: "Log Out", path: "/logout", icon: "bi-power" },
  ];
=======
    if (expanded) {
      timer = setTimeout(() => {
        setShowLabels(true);
      }, 150);
    } else {
      setShowLabels(false);
    }
>>>>>>> 9a4de8cf0f02901b83cfaddd9828a2ce12d0059e

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
          const isActive = location.pathname === item.path;
          const liClass = isActive ? "active" : "";

          if (item.isLogout) {
            return (
              <li key={item.label} className={liClass}>
                <Link className={styles.navLink} onClick={onLogout}>
                  <i className={`bi ${item.icon} ${styles.icon}`} />
                  {showLabels && (
                    <span >{item.label}</span>
                  )}
                </Link>
              </li>
            );
          }

          return (
            <li key={item.label} className={liClass}>
              <Link to={item.path} className={styles.navLink} onClick={onClose}>
                <i className={`bi ${item.icon} ${styles.icon}`} />
                {showLabels && <span className={styles.label}>{item.label}</span>}
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
