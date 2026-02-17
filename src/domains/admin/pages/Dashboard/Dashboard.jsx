import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import styles from "./Dashboard.module.css";

const menuItems = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "My Profile", path: "/admin/my-profile" },
  { label: "Requests", path: "/admin/requests" },
  { label: "Employees", path: "/admin/employees" },
  { label: "Groups", path: "/admin/groups" },
  { label: "Contributors", path: "/admin/contributors" },
  { label: "Collect Money", path: "/admin/collect-money" },
  { label: "Payment History", path: "/admin/payments" },
  { label: "Settings", path: "/admin/settings" },
];

const Dashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992);
  const location = useLocation();

  const user = {
    name: "Abdulwasie",
    role: "Admin",
    avatar: "https://placehold.co/88x88/6366f1/white?text=A",
  };

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 992;
      setIsDesktop(desktop);
      if (desktop) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarWidth = isDesktop ? (expanded ? 280 : 76) : 0;

  // Determine active page title
  const activePage =
    menuItems.find((item) => item.path === location.pathname)?.label || "";

  return (
    <div className={styles.layout}>
      <Sidebar
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
        user={user}
        onLogout={() => alert("Logging out...")}
        isDesktop={isDesktop}
      />

      <div className={styles.main} style={{ marginLeft: sidebarWidth }}>
        {/* Mobile menu button */}
        {!isDesktop && (
          <header className={styles.header}>
            <button
              className={styles.menuBtn}
              onClick={() => setMobileOpen(true)}
            >
              <i className="bi bi-list me-2"></i> Menu
            </button>
          </header>
        )}

        {/* Desktop top header */}
        {isDesktop && (
          <header className={styles.desktopHeader}>
            <h1 className={styles.pageTitle}>{activePage}</h1>
            <div className={styles.headerRight}>
              <button className={styles.iconBtn}>
                <i className="bi bi-bell"></i>
              </button>
              <img src={user.avatar} alt="User" className={styles.userAvatar} />
            </div>
          </header>
        )}

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
