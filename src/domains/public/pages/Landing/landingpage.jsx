import React from "react";
import Hero from "../../../public/components/Hero/Hero";
import Featured from "../../../public/pages/Featured/Featured";
import Testimonials from "../../../public/components/Testimonials/Testimonials";
import Contact from "../../../public/components/Contact/Contact";
import ServicesSection from "../../../public/components/ServicesSection/ServicesSection";
import AboutSnippet from "../../../public/components/AboutSnippet/AboutSnippet";
import SEOHelmet from "../../../../shared/components/SEOHelmet/SEOHelmet";

function landingpage() {
  return (
    <>
      <SEOHelmet />
      <Hero />
      <ServicesSection />
      <AboutSnippet showButton={true} />
      <Featured isAdmin={false} />

      <Testimonials />
      <Contact />
    </>
  );
}

export default landingpage;
