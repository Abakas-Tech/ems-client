// Layout.jsx
import React from "react";
// import header from "../header/header"; 
import Footer from "../Footer/Footer";

const Layout = ({ children }) => {
  return (
    <>
      {/* <header /> */}
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
