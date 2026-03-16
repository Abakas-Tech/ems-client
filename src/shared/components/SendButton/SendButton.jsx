import { FaPaperPlane } from "react-icons/fa";
import styles from "./SendButton.module.css";

const SendButton = ({ type = "button", className = "" }) => {
  return (
    <button
      type={type}
      className={`btn btn-info text-white w-100 d-flex align-items-center justify-content-center ${styles["send-btn"]} ${className}`}
    >
      <span className={styles["icon-wrapper"]}>
        <FaPaperPlane size={18} />
      </span>

      <span className={`${styles["btn-text"]} ms-2`}>Send</span>
    </button>
  );
};

export default SendButton;
