import React from "react";
import { Helmet } from "react-helmet";

const SEOHelmet = ({
  title = "Mager Properties | Real Estate Consultants",
  description = "Mager Properties Real Estate Web App helps consultants and agents manage listings, track client inquiries, and organize property sales efficiently. Visit https://magerproperty.com for more information.",
  keywords = "Mager Properties, real estate, property consultants, real estate agents, property management, house for sale, buy property, property investment, magerproperty.com",
  canonical = "https://magerproperty.com",
  ogTitle = "Mager Properties | Real Estate Consultants",
  ogDescription = "Professional real estate consultancy offering property management, listings, and sales insights. Visit https://magerproperty.com to explore opportunities.",
  ogUrl = "https://magerproperty.com",
  ogImage = "https://magerproperty.com/og-image.png", // ✅ replace with your hosted image (recommended 1200x630)
  structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Mager Properties",
    url: "https://magerproperty.com",
    logo: "https://magerproperty.com/logo.png",
    description:
      "Professional real estate consultancy offering property management, listings, and sales insights.",
    sameAs: [
      "https://www.facebook.com/magerproperty",
      "https://www.linkedin.com/company/magerproperty",
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
    <meta property="og:site_name" content="Mager Properties" />

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
