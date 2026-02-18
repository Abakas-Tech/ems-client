import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import styles from "./Sidebar.module.css";

const menuItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: "bi-speedometer2" },
  { label: "My Profile", path: "/admin/my-profile", icon: "bi-person" },
  { label: "User Management", path: "/admin/user-management", icon: "bi-file-earmark-text" },
  { label: "Employer Management", path: "/admin/employer-management", icon: "bi-people" },
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
  onToggle,
  user,
  onLogout,
  isDesktop,
}) => {
  const location = useLocation();
  const [showLabels, setShowLabels] = useState(expanded);

  useEffect(() => {
    let timer;

    if (expanded) {
      // wait for sidebar width transition to finish
      timer = setTimeout(() => {
        setShowLabels(true);
      }, 150); // match CSS transition duration
    } else {
      // hide immediately when collapsing
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
      <div className={styles.header}>
        <img
          src={user?.avatar || "https://placehold.co/88x88"}
          alt="User"
          className={`${styles.avatar} ${expanded ? styles.expandedAvatar : styles.collapsedAvatar}`}
        />

        {showLabels && (
          <div className={styles.userInfo}>
            <h5 className={styles.name}>{user?.name || "User"}</h5>
            <p className={styles.role}>{user?.role || "Member"}</p>
          </div>
        )}
      </div>

      <ul className={styles.nav}>
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path;
          const className = `${styles.navLink} ${
            isActive ? styles.active : ""
          }`;

          if (item.isLogout) {
            return (
              <li key={item.label}>
                <button className={className} onClick={onLogout}>
                  <i className={`bi ${item.icon} ${styles.icon}`} />
                  {showLabels && <span>{item.label}</span>}
                </button>
              </li>
            );
          }

          return (
            <li key={item.label}>
              <Link to={item.path} className={className} onClick={onClose}>
                <i className={`bi ${item.icon} ${styles.icon}`} />
                {showLabels && <span>{item.label}</span>}
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
          className={`${styles.sidebar} simpleSidebar smSidebar ${
            expanded ? styles.expanded : styles.collapsed
          }`}
        >
          <button className={styles.toggle} onClick={onToggle}>
            <i
              className={`bi ${expanded ? "bi-chevron-left" : "bi-chevron-right"}`}
            />
          </button>

          {renderMenu(showLabels)}
        </div>
      )}

      {/* Mobile Drawer */}
      {!isDesktop && (
        <Drawer open={isOpen} onClose={onClose} direction="left" size="280px">
          <div className={styles.mobileDrawer}>
            <button className={styles.drawerClose} onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>

            {renderMenu(showLabels)}
          </div>
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
