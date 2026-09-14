import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import styles from "./Sidebar.module.css";
import useProfile from "../../../../context/Profile/useProfile";
import MENU_CONFIG from "../../../../config/menu.config";

const Sidebar = ({ isOpen, onClose, expanded, onLogout, isDesktop }) => {
  const location = useLocation();
  const [showLabels, setShowLabels] = useState(expanded);
  const [searchQuery, setSearchQuery] = useState("");
  const { profile } = useProfile();
  const user = profile;

  // Handle label animation
  useEffect(() => {
    let timer;

    if (expanded) {
      timer = setTimeout(() => {
        setShowLabels(true);
      }, 130);
    } else {
      setShowLabels(false);
      setSearchQuery("");
    }

    return () => clearTimeout(timer);
  }, [expanded]);

  //   role-based filter
  let filteredItems = MENU_CONFIG.filter((item) =>
    item.roles.includes(user?.role_id),
  );

  //  Add extra permission filter ONLY for Employee
  if (user?.role_id === 2) {
    const userPermissions = user.permissions || {};
    filteredItems = filteredItems.filter((item) =>
      item.permission ? userPermissions[item.permission] === 1 : true,
    );
  }

  // Hide internal or helper menu entries
  filteredItems = filteredItems.filter((item) => !item.isHidden);

  // Filter items based on search query
  const searchedItems = searchQuery
    ? filteredItems.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : filteredItems;

  const renderMenu = (showLabels = true) => (
    <div className={styles.content}>
      {/* Sticky Search Bar Container */}
      {showLabels && user?.role_id === 1 && (
        <div className={styles.stickySearchWrap}>
          <div className={styles.searchWrap}>
            <i className={`bi bi-search ${styles.searchIcon}`} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search page..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Scrollable Navigation List */}
      <div className={styles.navScroll}>
        <ul className={styles.nav}>
          {searchedItems.length === 0 && (
            <li className={styles.noResults}>No page found</li>
          )}

          {searchedItems.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);
            const liClass = isActive ? styles.active : "";

            if (item.isLogout) {
              return (
                <li key={item.label} className={liClass}>
                  <Link
                    className={styles.navLink}
                    onClick={onLogout}
                    title={!showLabels ? item.label : undefined}
                  >
                    <span className={styles.iconWrap}>
                      <i className={`bi ${item.icon} ${styles.icon}`} />
                    </span>
                    {showLabels && (
                      <span className={styles.label}>{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            }

            const path =
              item.path.includes(":id") && user?.id
                ? item.path.replace(":id", user.id)
                : item.path;

            return (
              <li key={item.label} className={liClass}>
                <Link
                  to={path}
                  className={styles.navLink}
                  onClick={onClose}
                  title={!showLabels ? item.label : undefined}
                >
                  <span className={styles.iconWrap}>
                    <i className={`bi ${item.icon} ${styles.icon}`} />
                  </span>
                  {showLabels && (
                    <span className={styles.label}>{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      {isDesktop && (
        <div
          className={`${styles.sidebar} ${
            expanded ? styles.expanded : styles.collapsed
          } d-navigation`}
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
            <div className={styles.drawerBody}>{renderMenu(true)}</div>
          </div>
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
