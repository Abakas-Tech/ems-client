import { createContext } from "react";

// Holds the single shared socket.io connection for the logged-in user (any
// role) — null until a profile is loaded and the socket has been created.
const SocketContext = createContext(null);

export default SocketContext;
