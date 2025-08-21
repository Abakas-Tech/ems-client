// Layout.jsx
import React from "react";
import Header from "../header/header";
import Footer from "../Footer/Footer";
import ChatBot from "../chat/chatBot";
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
