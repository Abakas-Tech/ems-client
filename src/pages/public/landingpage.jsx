import React from "react";
import Hero from "../../components/Hero/Hero";
import Featured from "../../components/Featured/Featured";
import Testimonials from "../../components/Testimonials/Testimonials";
import Contact from "../../components/Contact/Contact";

function landingpage() {
  return (
    <>
      <Hero />
      <Featured />
      <Testimonials />
      <Contact />
    </>
  );
}

export default landingpage;
