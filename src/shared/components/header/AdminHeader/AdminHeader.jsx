import React, { useEffect } from "react";
import useProfile from "../../../../context/Profile/useProfile";
import { FaBars } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import ProfileCell from "../../ProfileCell/ProfileCell";

const AdminHeader = ({ isDesktop, setMobileOpen, onToggle }) => {
  const { fetchProfile, profile } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rolePathMap = {
    1: "admin",
    2: "employee",
    3: "partner",
    4: "worker",
    5: "employer",
  };

  const roleId = profile?.role_id;

  const roleBase = [1, 2].includes(roleId)
    ? "admin"
    : rolePathMap[roleId] || "admin";




  const roleMap = {
    1: "Admin",
    2: "Staff",
    3: "Partner",
    4: "Employee",
    5: "Employer",
  };

  const roleName = roleMap[Number(profile?.role_id)] || "";

  const fullName = profile?.full_name?.trim() || "";
  const nameParts = fullName.split(" ").filter(Boolean);
  const formattedName =
    nameParts.length > 1
      ? `${nameParts[0]} ${nameParts[1][0]}`
      : nameParts[0] || "";

  //  Dynamic path label
  const formatPathLabel = (pathname) => {
    if (!pathname) return "";

    const segments = pathname.split("/").filter(Boolean);
    let lastSegment = segments.pop();

    // handle /admin → Dashboard
    if (!lastSegment || lastSegment === roleBase) {
      return "Dashboard";
    }

    return lastSegment
      .split("-")
      .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ""))
      .join(" ");
  };

  const activePage = formatPathLabel(location.pathname);

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
            <ProfileCell
              profile={{
                firstName: profile?.full_name,
                image: profile?.profile_photo_url,
              }}
            />

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

            <ProfileCell
              profile={{
                firstName: profile?.full_name,
                image: profile?.profile_photo_url,
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
