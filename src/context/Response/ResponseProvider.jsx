import React, { useState } from "react";
import { ResponseContext } from "./ResponseContext";
import Response from "./../../shared/global/Response/Response";

let messageId = 0;

const ResponseProvider = ({ children }) => {
  const [responseMessages, setResponseMessages] = useState([]);

  const addMessage = (isSuccess, text) => {
    const id = ++messageId;

    setResponseMessages((prev) => [
      ...prev,
      {
        id,
        type: isSuccess ? "success" : "error",
        text,
      },
    ]);

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
      <Response />
    </ResponseContext.Provider>
  );
};

export default ResponseProvider;
