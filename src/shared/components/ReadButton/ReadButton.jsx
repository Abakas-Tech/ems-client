import styles from "./ReadButton.module.css";
import { FaBookOpen, FaBook } from "react-icons/fa";

const ReadButton = ({ onClick, className, children }) => {
  return (
    <button
      className={`${styles.readmoreBtn} ${className || ""}`}
      onClick={onClick}
    >
      <span className={styles.bookWrapper}>
        <FaBookOpen className={styles.book} />
        <FaBook className={styles.bookPage} />
      </span>

      <span className={styles.text}>{children || "Read More"}</span>
    </button>
  );
};
export default ReadButton;
