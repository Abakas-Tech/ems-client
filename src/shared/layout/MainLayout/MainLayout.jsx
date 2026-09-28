import React from "react";
import { Outlet } from "react-router-dom";
import MainHeader from "../../components/header/MainHeader/MainHeader";
import Footer from "../../components/Footer/Footer";
import { usePageDirection } from "../../../i18n/useLanguage";

const MainLayout = () => {
  // Public pages follow the selected language's direction (RTL for
  // Arabic); it's reset when leaving them, so dashboards stay LTR.
  usePageDirection();

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
