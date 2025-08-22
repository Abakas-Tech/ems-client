import React from "react";
import Hero from "../../../components/Hero/Hero";
import Featured from "../../../components/Featured/Featured";
import Testimonials from "../../../components/Testimonials/Testimonials";
import Contact from "../../../components/Contact/Contact";
import ServicesSection from "../../../components/ServicesSection/ServicesSection";
import AboutSnippet from "../../../components/AboutSnippet/AboutSnippet";

function landingpage() {
  return (
    <>
      <Hero />
      <ServicesSection />
      <AboutSnippet showButton={true} />
      <Featured />
      <Testimonials />
      <Contact />
    </>
  );
}

export default landingpage;
