// Layout.jsx
import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import ChatBot from "../../domains/public/components/chat/chatBot";

const Layout = ({ children, showChatBot = false }) => {
  return (
    <>
      <Header />
      <main>{children}</main>
      {showChatBot && <ChatBot />} 
      <Footer />
    </>
  );
};

export default Layout;
