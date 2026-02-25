import { X } from "lucide-react";
import styles from "./Response.module.css";
import useResponse from "./../../../context/response/useResponse";

const Response = () => {
  const { responseMessages, removeMessage } = useResponse();
  return (
    <div className={styles.container}>
      {responseMessages.map((msg) => (
        <div
          key={msg.id}
          className={`${styles.messageBox} ${
            msg.type ? styles.success : styles.error
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

export default Response;
