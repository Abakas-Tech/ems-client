import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../../domains/admin/components/Sidebar/Sidebar";
import AdminHeader from "../../components/header/AdminHeader/AdminHeader";
import DashboardFooter from "../../components/DashboardFooter/DashboardFooter";
import useLogout from "../../../context/Logout/useLogout";

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992);

  const { logout } = useLogout();

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

  const sidebarWidth = isDesktop ? (expanded ? 280 : 90) : 0;

  return (
    <div className="d-flex">
      <Sidebar
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
        isDesktop={isDesktop}
        onLogout={logout}
      />

      <div
        className="flex-grow-1 d-flex flex-column"
        style={{
          marginLeft: sidebarWidth,
          transition: "margin 0.3s",
          minWidth: 0,
          minHeight: "100vh",
        }}
      >
        <AdminHeader
          isDesktop={isDesktop}
          setMobileOpen={setMobileOpen}
          onToggle={() => setExpanded((prev) => !prev)}
        />

        <main className="flex-grow-1 p-3">
          <Outlet />
        </main>

        <DashboardFooter />
      </div>
    </div>
  );
};

export default AdminLayout;
