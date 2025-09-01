import React from "react";
import PropertiesDetail from "../../components/properties/propertiesDetail/PropertiesDetail";
import SEOHelmet from "../../../../shared/components/SEOHelmet/SEOHelmet";
const PropertiesDetailPage = ({ isPublicPage }) => {
  return (
    <>
      <SEOHelmet />
      <PropertiesDetail isPublicPage={isPublicPage} />
    </>
  );
};

export default PropertiesDetailPage;
