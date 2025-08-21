import React, { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { X } from "lucide-react";
import styles from "./globalResponse.module.css";

const GlobalResponse = () => {
  const { responseMessages, removeMessage } = useContext(AuthContext);

  return (
    <div className={styles.container}>
      {responseMessages.map((msg) => (
        <div
          key={msg.id}
          className={`${styles.messageBox} ${
            msg.type === "success" ? styles.success : styles.error
          }`}
        >
          <span>{msg.text}</span>
          <X
            size={16}
            onClick={() => removeMessage(msg.id)}
            className={styles.closeIcon}
          />
        </div>
      ))}
    </div>
  );
};

export default GlobalResponse;
