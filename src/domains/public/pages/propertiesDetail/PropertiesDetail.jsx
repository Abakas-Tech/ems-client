import React from "react";
import PropertiesDetail from "../../components/properties/propertiesDetail/PropertiesDetail";
const PropertiesDetailPage = ({ isPublicPage }) => {
  return (
    <>
      <PropertiesDetail isPublicPage={isPublicPage} />
    </>
  );
};

export default PropertiesDetailPage;
