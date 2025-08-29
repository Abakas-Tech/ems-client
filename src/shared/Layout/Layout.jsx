// Layout.jsx
import React from "react";
import Header from "../components/header/header";
import Footer from "../components/Footer/Footer";
import ChatBot from "../../domains/public/components/chat/chatBot";
const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <main>{children}</main>
      <ChatBot />
      <Footer />
    </>
  );
};

export default Layout;
