import React, { useEffect } from "react";
import useProfile from "../../../../context/Profile/useProfile";
import { FaBars } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import ProfileCell from "../../ProfileCell/ProfileCell";

const menuItems = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "My Profile", path: "/admin/my-profile" },
  { label: "User ", path: "/admin/user-management" },
  { label: "Worker", path: "/admin/workers" },
  { label: "Finance", path: "/admin/finances" },
  { label: "Files", path: "/admin/my-files" },
  { label: "Collect Money", path: "/admin/collect-money" },
  { label: "Payment History", path: "/admin/payments" },
  { label: "Settings", path: "/admin/settings" },
];

const AdminHeader = ({ isDesktop, setMobileOpen, onToggle }) => {
  const { fetchProfile, profile } = useProfile();
  const location = useLocation();

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const roleMap = {
    1: "Admin",
    2: "Employee",
    3: "Partner",
    4: "Worker",
    5: "Employer",
  };

  const roleName = roleMap[Number(profile?.role_id)] || "";
  // ===== Format Name =====
  const fullName = profile?.full_name?.trim() || "";
  const nameParts = fullName.split(" ").filter(Boolean);
  const formattedName =
    nameParts.length > 1
      ? `${nameParts[0]} ${nameParts[1][0]}`
      : nameParts[0] || "";

  // ===== Avatar Source =====
  const avatarSrc = profile?.profile_photo_url || "https://placehold.co/88x88";

  const activePage =
    menuItems.find((item) => item.path === location.pathname)?.label || "";

  return (
    <>
      {/* Mobile Header */}
      {!isDesktop && (
        <header
          className="sticky-top d-flex justify-content-between align-items-center bg-white border-bottom px-3"
          style={{ zIndex: 100 }}
        >
          <h5 className="mb-0 fw-semibold text-dark">{activePage}</h5>

          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-link p-0 fs-5">
              <i className="bi bi-bell"></i>
            </button>

            {/* User Info */}
            <div className="text-end">
              <div className="fw-semibold" style={{ fontSize: "0.9rem" }}>
                {formattedName}
              </div>
              <div
                className="text-muted"
                style={{ fontSize: "0.7rem", lineHeight: "1" }}
              >
                {profile?.role}
              </div>
            </div>

            <ProfileCell
              profile={{
                profile_photo_url: profile?.profile_photo_url,
                full_name: profile?.full_name,
              }}
            />

            <button
              className="btn btn-link p-0 fs-5 fw-bold"
              onClick={() => setMobileOpen(true)}
              style={{ color: "var(--maincolor)" }}
            >
              <FaBars />
            </button>
          </div>
        </header>
      )}

      {/* Desktop Header */}
      {isDesktop && (
        <header
          className="sticky-top d-flex justify-content-between align-items-center bg-white border-bottom px-4"
          style={{ zIndex: 10 }}
        >
          <div className="d-flex align-items-center">
            {/* Sidebar Toggle */}
            <div
              onClick={onToggle}
              style={{
                fontSize: "22px",
                cursor: "pointer",
                marginRight: "18px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <FaBars />
            </div>

            <h1
              className="fs-5 fw-semibold mb-0"
              style={{ color: "var(--maincolor)" }}
            >
              {activePage}
            </h1>
          </div>

          <div className="d-flex align-items-center gap-3">
            <button
              className="btn p-0 fs-5"
              style={{ color: "var(--maincolor)" }}
            >
              <i className="bi bi-bell fw-bold"></i>
            </button>

            {/* User Info */}

            {/* Avatar */}
            <ProfileCell
              profile={{
                profile_photo_url: profile?.profile_photo_url,
                full_name: profile?.full_name,
              }}
            />
            <div className="text-start">
              <div
                className="fw-semibold m-0"
                style={{
                  fontSize: "0.95rem",
                  color: "var(--maincolor)",
                }}
              >
                {formattedName}
              </div>

              <div
                className="fw-medium m-0 text-muted"
                style={{
                  fontSize: "0.7rem",
                  borderRadius: "20px",

                  letterSpacing: "0.4px",
                }}
              >
                {roleName}
              </div>
            </div>
          </div>
        </header>
      )}
    </>
  );
};

export default AdminHeader;
