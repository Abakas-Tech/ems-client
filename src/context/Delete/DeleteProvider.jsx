import React, { useState } from "react";
import { DeleteContext } from "./DeleteContext";
import ConfirmDeleteModal from "../../shared/global/ConfirmDeleteModal/ConfirmDeleteModal";

const DeleteProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [onConfirm, setOnConfirm] = useState(() => () => {});
  const [config, setConfig] = useState({
    title: "Are you sure you want to delete?",
    confirmText: "Delete",
  });
  // Open modal with confirm action only
  const openModal = (confirmAction, options = {}) => {
    setOnConfirm(() => confirmAction);
    setConfig({
      title: options.title || "Are you sure you want to delete?",
      confirmText: options.confirmText || "Delete",
    });
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const confirmAndClose = () => {
    onConfirm();
    closeModal();
  };

  return (
    <DeleteContext.Provider
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
    </DeleteContext.Provider>
  );
};

export default DeleteProvider;
