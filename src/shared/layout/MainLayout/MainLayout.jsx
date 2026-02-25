import React from "react";
import MainHeader from "../../components/header/MainHeader/MainHeader";
import Footer from "../../components/Footer/Footer";

const MainLayout = ({ children}) => {
  return (
    <>
      <MainHeader/>
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default MainLayout;
