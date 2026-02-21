import React from "react";
import styles from "./BackButton.module.css";

function BackButton({ onClick, className }) {
  return (
    <button
      type="button"
      aria-label="Back"
      className={styles.arrow + " " + className}
      onClick={onClick}
    >
      ❮
    </button>
  );
}

export default BackButton;
