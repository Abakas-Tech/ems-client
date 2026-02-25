import { useState, useEffect } from "react";
import Sidebar from "../../../domains/admin/components/Sidebar/Sidebar";
import AdminHeader from "../../components/headers/AdminHeader/AdminHeader";
import useLogout from "../../../context/Logout/useLogout";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992);

  const { logout } = useLogout();

  // Handle responsive changes
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

  // Sidebar width controlled via inline style for smooth toggle
  const sidebarWidth = isDesktop ? (expanded ? 280 : 90) : 0;

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
        isDesktop={isDesktop}
        onLogout={logout}
      />

      {/* Main content area */}
      <div
        className="flex-grow-1"
        style={{
          marginLeft: sidebarWidth,
          transition: "margin 0.3s",
          minWidth: 0,
        }}
      >
        {/* Header */}
        <AdminHeader
          isDesktop={isDesktop}
          setMobileOpen={setMobileOpen}
          onToggle={() => setExpanded((prev) => !prev)}
        />

        {/* Page content */}
        <main className="p-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
