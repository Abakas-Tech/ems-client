import React, { useState } from "react";
import { ConfirmDeleteContext } from "./DeleteContext";
import ConfirmDeleteModal from "../../shared/global/Delete/ConfirmDeleteModal";

const ConfirmDeleteProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [onConfirm, setOnConfirm] = useState(() => () => {});
  const [config, setConfig] = useState({
    title: "Are you sure?",
    confirmText: "Confirm",
    type: "delete", // "delete" | "archive"
  });
  // Open modal with confirm action only
  const openModal = (confirmAction, options = {}) => {
    setOnConfirm(() => confirmAction);
    setConfig({
      title: options.title || "Are you sure?",
      confirmText: options.confirmText || "Confirm",
      type: options.type || "delete",
    });
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const confirmAndClose = () => {
    onConfirm();
    closeModal();
  };

  return (
    <ConfirmDeleteContext.Provider
      value={{
        isOpen,
        openModal,
        closeModal,
        confirmAndClose,
        config,
      }}
    >
      {children}
      <ConfirmDeleteModal />
    </ConfirmDeleteContext.Provider>
  );
};

export default ConfirmDeleteProvider;
