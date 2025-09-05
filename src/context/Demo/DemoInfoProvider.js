// DemoInfoProvider.js
import React, { useState } from "react";
import { DemoInfoContext } from "./DemoInfoContext";
import DemoInfoModal from "../../shared/global/Modal/DemoInfoModal";

const DemoInfoProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState("changePassword"); // default type

  const openModal = (modalType) => {
    setType(modalType);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  return (
    <DemoInfoContext.Provider value={{ isOpen, openModal, closeModal, type }}>
      {children}
      <DemoInfoModal isOpen={isOpen} onClose={closeModal} type={type} />
    </DemoInfoContext.Provider>
  );
};

export default DemoInfoProvider;
