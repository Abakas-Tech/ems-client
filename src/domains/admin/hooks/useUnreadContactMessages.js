import { useEffect, useState } from "react";
import useSocket from "../../../context/Socket/useSocket";
import { getUnreadContactCount } from "../api/contactMessage.api";

const ADMIN_ROLE_ID = 1;

/* Live unread count for the contact-form inbox (admins only). The server
   pushes "contact:new" for every new message and "contact:changed" (with
   the fresh unread total) whenever an admin reads/stars/deletes one. */
const useUnreadContactMessages = (roleId) => {
  const socket = useSocket();
  const [unread, setUnread] = useState(0);
  const enabled = Number(roleId) === ADMIN_ROLE_ID;

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    getUnreadContactCount()
      .then((res) => !cancelled && setUnread(Number(res?.data?.unread) || 0))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !socket) return undefined;
    const onNew = () => setUnread((n) => n + 1);
    const onChanged = (e) => {
      if (e && typeof e.unread === "number") setUnread(e.unread);
    };
    socket.on("contact:new", onNew);
    socket.on("contact:changed", onChanged);
    return () => {
      socket.off("contact:new", onNew);
      socket.off("contact:changed", onChanged);
    };
  }, [enabled, socket]);

  return enabled ? unread : 0;
};

export default useUnreadContactMessages;
