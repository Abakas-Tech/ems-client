import React, { useState } from "react";
import { DeleteContext } from "./DeleteContext";
import ConfirmDeleteModal from "../../shared/global/ConfirmDeleteModal/ConfirmDeleteModal";

const DeleteProvider = ({ children }) => {
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
    <DeleteContext.Provider
      value={{ isOpen, openModal, closeModal, confirmAndClose }}
    >
      {children}
      <ConfirmDeleteModal />
    </DeleteContext.Provider>
  );
};

export default DeleteProvider;
