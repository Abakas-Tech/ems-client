import useResponse from "./../../../context/response/UseResponse";
import styles from "./Response.module.css";
const Response = () => {
  const { responseMessages, removeMessage } = useResponse();

  if (!responseMessages.length) return null;

  return (
    <div className={styles["response-container"]}>
      {responseMessages.map((msg) => (
        <div
          key={msg.id}
          className={`alert ${
            msg.type === "success" ? styles["alert-ok"] : "alert-danger"
          } alert-dismissible fade show`}
          role="alert"
        >
          {msg.text}
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => removeMessage(msg.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default Response;
