import React from "react";
import { Helmet } from "react-helmet";

const SEOHelmet = ({
  title = "MMH Overseas Employment | Overseas Jobs for Ethiopians | Verified Recruitment Agency",
  description = "MMH Overseas Employment Agency Plc connects Ethiopian workers with verified international job opportunities. We provide full visa processing, contract verification, LMIS/work permits, and safe deployment to Middle Eastern countries.",
  keywords = "overseas jobs Ethiopia, jobs in Middle East for Ethiopians, recruitment agency Ethiopia, work abroad Ethiopia, Middle East jobs Ethiopia, visa processing Ethiopia, LMIS Ethiopia, overseas employment Ethiopia, legal recruitment Ethiopia, MMH Overseas Employment",
  canonical = "https://mmhjobs.com/",
  ogTitle = "Verified Overseas Jobs for Ethiopians | MMH Overseas Employment",
  ogDescription = "Apply for safe and verified overseas jobs with full support: job matching, visa processing, contract verification, and travel coordination.",
  ogUrl = "https://mmhjobs.com/",
  ogImage = "https://mmhjobs.com/image.jpg", // replace with your hosted image (1200x630 recommended)
  structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "MMH Overseas Employment Agency Plc",
    url: "https://mmhjobs.com",
    logo: "https://mmhjobs.com/logo.jpg",
    description:
      "Licensed recruitment agency connecting Ethiopian workers with verified international job opportunities, especially in the Middle East.",
    sameAs: [
      "https://www.facebook.com/mmhjobs",
      "https://twitter.com/mmhjobs",
      "https://www.linkedin.com/company/mmh-overseas-employment",
    ],
    telephone: "+251-11-1234567",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Bole Rd",
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
    <meta property="og:site_name" content="MMH Overseas Employment" />

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
