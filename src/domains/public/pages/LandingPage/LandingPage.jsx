import React from "react";

import Hero from "../../components/Hero/Hero";
import HowItWorks from "../../components/HowItWorks/HowItWorks";
import Contact from "./../../components/Contact/Contact";
import Gallery from "./../../components/Gallery/Gallery";

import Services from "../../components/Services/Services";
import AboutSnippet from "../../components/about/AboutSnippet/AboutSnippet";

function LandingPage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Services />
      <AboutSnippet />

      <Gallery />

      <Contact />
    </>
  );
}

export default LandingPage;
