import React, { useState } from "react";
import { ResponseContext } from "./ResponseContext";
import GlobalResponse from "../../components/global/response/response.jsx";

let messageId = 0;

const ResponseProvider = ({ children }) => {
  const [responseMessages, setResponseMessages] = useState([]);

  const addMessage = (type, text) => {
    const id = ++messageId;
    setResponseMessages((prev) => [...prev, { id, type, text }]);
    setTimeout(() => removeMessage(id), 5000);
  };

  const removeMessage = (id) => {
    setResponseMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  return (
    <ResponseContext.Provider
      value={{ responseMessages, addMessage, removeMessage }}
    >
      {children}
      <GlobalResponse />
    </ResponseContext.Provider>
  );
};

export default ResponseProvider;
