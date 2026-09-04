import React from "react";
import Testimonials from "../../components/Testimonials/Testimonials";
import Hero from "../../components/Hero/Hero";
import HowItWorks from "../../components/HowItWorks/HowItWorks";
import Contact from "./../../components/Contact/Contact";
import Gallery from "./../../components/Gallery/Gallery";
import AboutSnippet from "../../components/AboutSnippet/AboutSnippet";
import Services from "../../components/Services/Services";
import SEO from "../../../../shared/components/SEO/SEO";

function LandingPage() {
  return (
    <>
      <SEO title="ALETISALAT | Work Abroad Without the Guesswork" />
      <Hero />
      <HowItWorks />
      <Services />
      <AboutSnippet />
      <Gallery />
      <Testimonials />
      <Contact />
    </>
  );
}

export default LandingPage;
