import { axiosPythonInstance } from "../../utils/axios.js";

// Send a user message to chatbot
export const sendMessage = async (message) => {
  try {
    const res = await axiosPythonInstance.post("/chat/message", { message });
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
