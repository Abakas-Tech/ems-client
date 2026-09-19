import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import SocketContext from "./SocketContext";
import { getAccessToken } from "../../utils/axios";
import useProfile from "../Profile/useProfile";

// Socket.IO connects to the server origin directly, not the REST /api path
const backend_server_url = import.meta.env.VITE_AXIOS_INSTANCE_BASE_URL;
const socketBaseUrl = backend_server_url.replace(/\/api\/?$/, "");

// One shared socket connection per logged-in user, regardless of role —
// the server puts every authenticated socket in a "live-updates" room
// used to broadcast data changes so open pages can refresh without a
// manual reload. Other providers (e.g. admin notifications) should read
// this shared socket via useSocket() instead of opening their own.
const SocketProvider = ({ children }) => {
  const { profile } = useProfile();
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!profile?.id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    const newSocket = io(socketBaseUrl, {
      // auth as a function is re-evaluated on every (re)connection attempt,
      // so a token that rotated via the axios refresh flow is always current
      auth: (cb) => cb({ token: getAccessToken() }),
      withCredentials: true,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export default SocketProvider;
