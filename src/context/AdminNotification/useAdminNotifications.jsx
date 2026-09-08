import { useContext } from "react";
import AdminNotificationContext from "./AdminNotificationContext";

const useAdminNotifications = () => useContext(AdminNotificationContext);

export default useAdminNotifications;
