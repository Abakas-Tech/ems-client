import { useContext } from "react";
import SocketContext from "./SocketContext";

// Returns the shared socket.io instance, or null if not connected yet
// (no profile loaded, or still connecting).
const useSocket = () => useContext(SocketContext);

export default useSocket;
