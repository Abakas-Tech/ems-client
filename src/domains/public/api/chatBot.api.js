import { axiosPythonInstance } from "../../../utils/axios";

// Send a user message to chatbot with session_id
export const sendMessage = async (sessionId, message) => {
  try {
    // console.log(sessionId, message);
    const res = await axiosPythonInstance.post("/chat/message", {
      session_id: sessionId,
      message: message,
    });

    return res.data;
  } catch (err) {
    console.error("Chatbot /message error:", err.response?.data || err.message);
    throw err;
  }
};
// Get chatbot welcome message
export const getWelcomeMessage = async () => {
  try {
    const res = await axiosPythonInstance.get("/chat/welcome");
    return res.data;
  } catch (err) {
    console.error("Chatbot /welcome error:", err.response?.data || err.message);
    throw err;
  }
};
