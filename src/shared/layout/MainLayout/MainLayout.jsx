import React from "react";
import { Outlet } from "react-router-dom";
import MainHeader from "../../components/header/MainHeader/MainHeader";
import Footer from "../../components/Footer/Footer";

const MainLayout = () => {
  return (
    <>
      <MainHeader />
      <main>
        <Outlet /> 
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;
