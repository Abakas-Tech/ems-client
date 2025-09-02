import React, { useState } from "react";
import styles from "./PasswordInput.module.css";

const PasswordInput = ({
  label,
  value,
  onChange,
  id,
  icon_input = false,
  required = false,
  placeholder = "",
  align = "right", // "right" or "left"
  variant = "",
}) => {
  const [show, setShow] = useState(false);
  return (
    <div
      className={`position-relative ${
        variant === "floating" ? "form-floating" : "form-group"
      } ${styles.icon_input}`}
    >
      {variant === "standard" && <label htmlFor={id}>{label}</label>}
      <input
        id={id}
        type={show ? "text" : "password"}
        className="form-control"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
      />
      {variant === "floating" && <label htmlFor={id}>{label}</label>}
      <i
        className={`bi ${show ? "bi-eye-slash" : "bi-eye"} ${styles.icon} ${
          align === "left" ? styles.left : styles.right
        }`}
        onClick={() => setShow((prev) => !prev)}
      />
    </div>
  );
};

export default PasswordInput;
