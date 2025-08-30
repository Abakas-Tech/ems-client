import React, { useState } from "react";
import { ConfirmDeleteContext } from "./DeleteContext";
import ConfirmDeleteModal from "../../shared/global/Delete/ConfirmDeleteModal";

const ConfirmDeleteProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [onConfirm, setOnConfirm] = useState(() => () => {});

  const openModal = (name, confirmAction) => {
    setItemName(name);
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
      value={{ isOpen, itemName, openModal, closeModal, confirmAndClose }}
    >
      {children}
      <ConfirmDeleteModal/>
    </ConfirmDeleteContext.Provider>
  );
};

export default ConfirmDeleteProvider;
