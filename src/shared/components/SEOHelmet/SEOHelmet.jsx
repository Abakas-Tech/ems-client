import React from "react";
import { Helmet } from "react-helmet";

const SEOHelmet = ({
  title = "Abakas | Real Estate Agent Web App",
  description = "Abakas Real Estate Agent Web App helps property agents manage listings, track property views, handle inquiries, organize files, and schedule appointments. Demo available at agent.abakas.net.",
  keywords = "real estate agent app, property management software, real estate CRM, property listings, client inquiries, real estate dashboard, file management, appointment scheduling, real estate analytics, Abakas",
  canonical = "https://agent.abakas.net",
  ogTitle = "Abakas | Real Estate Agent Web App",
  ogDescription = "A powerful web app for property agents: manage listings, track views, handle inquiries, organize files, and schedule appointments. Explore the demo at agent.abakas.net.",
  ogUrl = "https://agent.abakas.net",
  ogImage = "/image.png", // replace with actual logo/preview image URL
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
