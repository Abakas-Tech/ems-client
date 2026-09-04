import React from "react";
import { Helmet } from "react-helmet";

const SEOHelmet = ({
  title = "ALETISALAT Private Foreign Employment Agency | Overseas Jobs for Ethiopians | Verified Recruitment Agency",
  description = "ALETISALAT Private Foreign Employment Agency connects Ethiopian workers with verified international job opportunities. We provide full visa processing, contract verification, LMIS/work permits, and safe deployment to Middle Eastern countries.",
  keywords = "overseas jobs Ethiopia, jobs in Middle East for Ethiopians, recruitment agency Ethiopia, work abroad Ethiopia, Middle East jobs Ethiopia, visa processing Ethiopia, LMIS Ethiopia, overseas employment Ethiopia, legal recruitment Ethiopia, ALETISALAT Private Foreign Employment Agency",
  canonical = "https://aletisalatjobs.com/",
  ogTitle = "Verified Overseas Jobs for Ethiopians | ALETISALAT Private Foreign Employment Agency",
  ogDescription = "Apply for safe and verified overseas jobs with full support: job matching, visa processing, contract verification, and travel coordination.",
  ogUrl = "https://aletisalatjobs.com/",
  ogImage = "https://aletisalatjobs.com/image.jpg", // replace with your hosted image (1200x630 recommended)
  structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "ALETISALAT Private Foreign Employment Agency",
    url: "https://aletisalatjobs.com",
    logo: "https://aletisalatjobs.com/logo.jpg",
    description:
      "Licensed recruitment agency connecting Ethiopian workers with verified international job opportunities, especially in the Middle East.",
    email: "aletesalat.eth.agency@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Addis Ababa",
      addressCountry: "Ethiopia",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 9.03,
      longitude: 38.74,
    },
    openingHours: "Mo-Su 09:00-18:00",
    serviceType: [
      "Overseas Job Placement",
      "Visa Processing",
      "LMIS / Work Permit Processing",
      "Contract Verification",
      "Flight & Deployment Coordination",
      "Pre-departure Orientation",
    ],
  },
}) => (
  <Helmet>
    {/* Primary Meta Tags */}
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="keywords" content={keywords} />
    <link rel="canonical" href={canonical} />

    {/* Open Graph / Facebook */}
    <meta property="og:title" content={ogTitle} />
    <meta property="og:description" content={ogDescription} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={ogUrl} />
    <meta property="og:image" content={ogImage} />
    <meta
      property="og:site_name"
      content="ALETISALAT Private Foreign Employment Agency"
    />

    {/* Twitter Meta */}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={ogTitle} />
    <meta name="twitter:description" content={ogDescription} />
    <meta name="twitter:image" content={ogImage} />

    {/* Structured Data (JSON-LD for SEO) */}
    {structuredData && (
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    )}
  </Helmet>
);

export default SEOHelmet;
