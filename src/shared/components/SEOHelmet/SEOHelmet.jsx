import React from "react";
import { Helmet } from "react-helmet";

const SEOHelmet = ({
  title = "Resido - Your Real Estate Partner | Find Properties",
  description = "Discover top properties with Resido. Find homes, apartments, and commercial spaces with expert real estate agents in Ethiopia.",
  keywords = "real estate, properties, houses, apartments, commercial spaces, rentals, sales, Addis Ababa, Ethiopia real estate ",
  canonical = "https://resido.com",
  ogTitle = "Resido - Your Real Estate Partner",
  ogDescription = "Find your dream home with Resido's expert real estate agents in Addis Ababa, Ethiopia.",
  ogUrl = "https://resido.com",
  ogImage = "https://resido.com/assets/img/og-image.jpg",
  structuredData = null,
}) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="keywords" content={keywords} />
    <link rel="canonical" href={canonical} />
    <meta property="og:title" content={ogTitle} />
    <meta property="og:description" content={ogDescription} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={ogUrl} />
    <meta property="og:image" content={ogImage} />
    {structuredData && (
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    )}
  </Helmet>
);

export default SEOHelmet;
