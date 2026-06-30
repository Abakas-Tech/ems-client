import React, { useState } from "react";
import { DeleteContext } from "./DeleteContext";
import ConfirmDeleteModal from "../../shared/global/ConfirmDeleteModal/ConfirmDeleteModal";

const DEFAULT_CONFIG = {
  title: "Are you sure you want to delete?",
  confirmText: "Delete",
  cancelText: "Cancel",
  body: null, // optional custom JSX rendered above/instead of the default actions
  actions: null, // optional array of { label, onClick, variant } to replace Cancel/Delete buttons
  hideDefaultActions: false, // set true when `actions` fully replaces Cancel/Delete
};

const DeleteProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [onConfirm, setOnConfirm] = useState(() => () => {});
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  // Open modal with confirm action only (existing behavior, unchanged for all current callers)
  const openModal = (confirmAction, options = {}) => {
    setOnConfirm(() => confirmAction || (() => {}));
    setConfig({
      ...DEFAULT_CONFIG,
      title: options.title || DEFAULT_CONFIG.title,
      confirmText: options.confirmText || DEFAULT_CONFIG.confirmText,
      cancelText: options.cancelText || DEFAULT_CONFIG.cancelText,
      body: options.body || null,
      actions: options.actions || null,
      hideDefaultActions: options.hideDefaultActions || false,
    });
    setIsOpen(true);
  };

  // New: open the same modal purely as a dynamic dialog (no confirm/delete semantics).
  // Useful for success states like "PDF generated, download or share it".
  const openDynamicModal = (options = {}) => {
    setOnConfirm(() => () => {});
    setConfig({
      ...DEFAULT_CONFIG,
      title: options.title || "",
      confirmText: options.confirmText || DEFAULT_CONFIG.confirmText,
      cancelText: options.cancelText || "Close",
      body: options.body || null,
      actions: options.actions || null,
      hideDefaultActions:
        options.hideDefaultActions !== undefined
          ? options.hideDefaultActions
          : true,
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
        openDynamicModal,
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
