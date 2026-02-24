import React, { useState, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import styles from "./Dashboard.module.css";
import useLogout from "./../../../../context/logout/UseLogout";
import {useProfile} from "../../../../context/Profile/ProfileProvider";
import Photo from "../../api/profilePhoto.api";
import useLoader from "../../../../context/Loader/UseLoader";
import useResponse from "../../../../context/response/UseResponse";
import { useConfirmDelete } from "../../../../context/Delete/UseDelete";

const menuItems = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "My Profile", path: "/admin/my-profile" },
  { label: "User Management", path: "/admin/user-management" },
  { label: "Employer Management", path: "/admin/employer-management" },
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
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { openModal } = useConfirmDelete();

  const fileInputRef = useRef(null);

  const { fetchProfile, profile } = useProfile();
  const location = useLocation();
  const { logout } = useLogout();

  useEffect(() => {
    fetchProfile();
  }, []);

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

  // ===== Format Name =====
  const fullName = profile?.full_name?.trim() || "";
  const nameParts = fullName.split(" ").filter(Boolean);
  const formattedName =
    nameParts.length > 1
      ? `${nameParts[0]} ${nameParts[1][0]}`
      : nameParts[0] || "";

  const handleAvatarChange = async (file) => {
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setShowAvatarMenu(false);

    showLoader();
    try {
      const response = await Photo.uploadProfilePhoto(file);
      addMessage(response?.success, response?.message);
      await fetchProfile();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  const handleDeleteAvatar = () => {
    openModal(async () => {
      showLoader();
      try {
        const response = await Photo.deleteProfilePhoto();

        addMessage(response?.success, response?.message);

        setAvatarPreview(null);
        setShowAvatarMenu(false);
        await fetchProfile();
      } catch (err) {
        addMessage(false, err.message);
      } finally {
        hideLoader();
      }
    });
  };

  // ===== Avatar Source =====
  const avatarSrc =
    avatarPreview || profile?.profile_photo_url || "https://placehold.co/88x88";

  const user = {
    name: formattedName,
    role: profile?.role,
    avatar: avatarSrc,
  };

  const sidebarWidth = isDesktop ? (expanded ? 280 : 76) : 0;

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
        onLogout={logout}
        isDesktop={isDesktop}
      />

      <div className={styles.main} style={{ marginLeft: sidebarWidth }}>
        {/* Mobile Header */}
        {!isDesktop && (
          <header className={styles.mobileHeader}>
            <div className={styles.mobileLeft}>
              <h5 className={styles.mobileTitle}>{activePage}</h5>
            </div>

            <div className={styles.mobileRight}>
              <button className={styles.iconBtn}>
                <i className="bi bi-bell"></i>
              </button>
              <div className={styles.avatarWrapper}>
                <img
                  src={user.avatar}
                  alt="User"
                  className={styles.mobileAvatar}
                  onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                />
                {showAvatarMenu && (
                  <div className={styles.avatarMenu}>
                    {/* If Image Exists → Show Edit + Delete */}
                    {profile?.profile_photo_url || avatarPreview ? (
                      <>
                        <button
                          className={styles.avatarIconBtn}
                          onClick={() => fileInputRef.current.click()}
                          title="Update Photo"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          className={styles.avatarIconBtn}
                          onClick={handleDeleteAvatar}
                          title="Delete Photo"
                        >
                          <i className="bi bi-trash text-danger"></i>
                        </button>
                      </>
                    ) : (
                      <>
                        {/* No Image → Upload + Disabled Delete */}
                        <button
                          className={styles.avatarIconBtn}
                          onClick={() => fileInputRef.current.click()}
                          title="Upload Photo"
                        >
                          <i className="bi bi-upload"></i>
                        </button>

                        <button
                          className={`${styles.avatarIconBtn} ${styles.disabledBtn}`}
                          disabled
                          title="No photo to delete"
                        >
                          <i className="bi bi-trash text-muted"></i>
                        </button>
                      </>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      ref={fileInputRef}
                      onChange={(e) => handleAvatarChange(e.target.files[0])}
                    />
                  </div>
                )}
              </div>
              <button
                className={styles.iconBtn}
                onClick={() => setMobileOpen(true)}
              >
                <i className="bi bi-list fw-bold"></i>
              </button>
            </div>
          </header>
        )}

        {/* Desktop Header */}
        {isDesktop && (
          <header className={styles.desktopHeader}>
            <h1 className={styles.pageTitle}>{activePage}</h1>

            <div className={styles.headerRight}>
              <button className={styles.iconBtn}>
                <i className="bi bi-bell"></i>
              </button>

              {/* ===== Modern Avatar Section ===== */}
              <div className={styles.avatarWrapper}>
                <img
                  src={user.avatar}
                  alt="User"
                  className={styles.userAvatar}
                  onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                />

                {showAvatarMenu && (
                  <div className={styles.avatarMenu}>
                    {/* If Image Exists → Show Edit + Delete */}
                    {profile?.profile_photo_url || avatarPreview ? (
                      <>
                        <button
                          className={styles.avatarIconBtn}
                          onClick={() => fileInputRef.current.click()}
                          title="Update Photo"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          className={styles.avatarIconBtn}
                          onClick={handleDeleteAvatar}
                          title="Delete Photo"
                        >
                          <i className="bi bi-trash text-danger"></i>
                        </button>
                      </>
                    ) : (
                      <>
                        {/* No Image → Upload + Disabled Delete */}
                        <button
                          className={styles.avatarIconBtn}
                          onClick={() => fileInputRef.current.click()}
                          title="Upload Photo"
                        >
                          <i className="bi bi-upload"></i>
                        </button>

                        <button
                          className={`${styles.avatarIconBtn} ${styles.disabledBtn}`}
                          disabled
                          title="No photo to delete"
                        >
                          <i className="bi bi-trash text-muted"></i>
                        </button>
                      </>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      ref={fileInputRef}
                      onChange={(e) => handleAvatarChange(e.target.files[0])}
                    />
                  </div>
                )}
              </div>
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
