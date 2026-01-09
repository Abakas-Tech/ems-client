import React, { useState } from "react";
import { ConfirmDeleteContext } from "./DeleteContext";
import ConfirmDeleteModal from "../../shared/global/Delete/ConfirmDeleteModal";

const ConfirmDeleteProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [onConfirm, setOnConfirm] = useState(() => () => {});

  // Open modal with confirm action only
  const openModal = (confirmAction) => {
    setOnConfirm(() => confirmAction);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const confirmAndClose = () => {
    onConfirm();
    closeModal();
  };

  return (
    <ConfirmDeleteContext.Provider
      value={{ isOpen, openModal, closeModal, confirmAndClose }}
    >
      {children}
      <ConfirmDeleteModal />
    </ConfirmDeleteContext.Provider>
  );
};

export default ConfirmDeleteProvider;
