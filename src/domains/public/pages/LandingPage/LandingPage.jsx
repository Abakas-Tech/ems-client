import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import SEO from "../../../../shared/components/SEO/SEO";
import Hero from "../../components/Hero/Hero";
import PromiseTicker from "../../components/PromiseTicker/PromiseTicker";
import HowItWorks from "../../components/HowItWorks/HowItWorks";
import Services from "../../components/Services/Services";
import AboutSnippet from "../../components/AboutSnippet/AboutSnippet";
import Destinations from "../../components/Destinations/Destinations";
import VisionMission from "../../components/VisionMission/VisionMission";
import CoreValues from "../../components/CoreValues/CoreValues";
import WhyChooseUs from "../../components/WhyChooseUs/WhyChooseUs";
import Gallery from "../../components/Gallery/Gallery";
import Testimonials from "../../components/Testimonials/Testimonials";
import CallToAction from "../../components/CallToAction/CallToAction";
import Contact from "../../components/Contact/Contact";

function LandingPage() {
  const { t, i18n } = useTranslation();
  const title = t("meta.title");

  /* SEO appends the English site name to titles that don't contain it;
     use the localized title as-is (this effect runs after SEO's). */
  useEffect(() => {
    document.title = title;
  }, [title, i18n.resolvedLanguage]);
  return (
    <>
      <SEO title={title} />
      <Hero />
      <PromiseTicker />
      <HowItWorks />
      <Services />
      <AboutSnippet />
      <Destinations />
      <VisionMission />
      <CoreValues />
      <WhyChooseUs />
      <Gallery />
      <Testimonials />
      <CallToAction />
      <Contact />
    </>
  );
}

export default LandingPage;
