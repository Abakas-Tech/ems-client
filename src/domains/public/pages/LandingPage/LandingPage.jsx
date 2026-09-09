import React from "react";
import Testimonials from "../../components/Testimonials/Testimonials";
import Hero from "../../components/Hero/Hero";
import HowItWorks from "../../components/HowItWorks/HowItWorks";
import Contact from "./../../components/Contact/Contact";
import Gallery from "./../../components/Gallery/Gallery";
import AboutSnippet from "../../components/AboutSnippet/AboutSnippet";
import Services from "../../components/Services/Services";
import SEO from "../../../../shared/components/SEO/SEO";
import WhatsAppButton from "../../components/WhatsAppButton/WhatsAppButton";

function LandingPage() {
  return (
    <>
      <SEO title="Vision Recruitment | Work Abroad Without the Guesswork" />
      {/* <WhatsAppButton /> */}
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
