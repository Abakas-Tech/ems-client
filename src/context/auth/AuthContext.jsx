import { createContext } from "react";

export const AuthContext = createContext({
  user: null,
  setUser: () => {}, // Default no-op function to avoid undefined errors
});
