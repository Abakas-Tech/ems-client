import { axiosPythonInstance } from "../../../utils/axios";

// Send a user message to chatbot with session_id
export const sendMessage = async (sessionId, message) => {
  try {
    const res = await axiosPythonInstance.post("/chat/message", {
      session_id: sessionId,
      message: message,
    });
    return res.data;
  } catch (err) {
    // Throw sanitized error for frontend
    throw new Error(err.response?.data?.message || "Failed to send message");
  }
};

// Get chatbot welcome message
export const getWelcomeMessage = async () => {
  try {
    const res = await axiosPythonInstance.get("/chat/welcome");
    return res.data;
  } catch (err) {
    // Throw sanitized error for frontend
    throw new Error(
      err.response?.data?.message || "Failed to get welcome message"
    );
  }
};

// Send menu selection only
export const selectMenu = async ({ session_id, menu_flag }) => {
  try {
    const res = await axiosPythonInstance.post("/chat/menu", {
      session_id: session_id,
      menu_flag: menu_flag,
    });
    return res.data;
  } catch (err) {
    // Throw sanitized error for frontend
    throw new Error(err.response?.data?.message || "Failed to select menu");
  }
};
