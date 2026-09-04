import { useEffect } from "react";
import {
  SITE_NAME,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_KEYWORDS,
  ORGANIZATION_JSON_LD,
  TWITTER_CARD_TYPE,
  absoluteUrl,
} from "../../../config/seo.config";

/* ------------------------------------------------------------------
   SEO - keeps ONE set of tags in sync with the current page.

   Renders nothing. Add it as the FIRST child of any page component:

     <SEO
       title="About us"
       description="..."
       path="/about"
       jsonLd={aboutPageJsonLd}
     />

   Notes
   - On SPA navigation the tags update instantly; the fallbacks in
     public/index.html are what crawlers see first.
   - Titles render as "About us | ALETISALAT" unless the title already
     contains the site name.
   - noindex pages (admin/auth dashboards) still get their title - they
     just tell crawlers to stay out.
   - jsonLd replaces the default organization block per page.
   ------------------------------------------------------------------ */
const upsertMeta = (attribute, key, content) => {
  if (content === undefined || content === null) return;

  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
};

const useSeoHead = ({
  title,
  description,
  path,
  image,
  keywords,
  noindex,
  jsonLd,
}) => {
  useEffect(() => {
    const fullTitle = title
      ? title.includes(SITE_NAME)
        ? title
        : `${title} | ${SITE_NAME}`
      : document.title;

    document.title = fullTitle;

    upsertMeta("name", "description", description ?? DEFAULT_DESCRIPTION);
    upsertMeta("name", "keywords", keywords ?? DEFAULT_KEYWORDS);
    upsertMeta(
      "name",
      "robots",
      noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large",
    );

    // Canonical: exactly one, always pointing at the real domain.
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", absoluteUrl(path || "/"));

    // Open Graph
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta(
      "property",
      "og:description",
      description ?? DEFAULT_DESCRIPTION,
    );
    upsertMeta("property", "og:url", absoluteUrl(path || "/"));
    upsertMeta("property", "og:image", absoluteUrl(image ?? DEFAULT_OG_IMAGE));
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:type", "website");

    // Twitter card
    upsertMeta("name", "twitter:card", TWITTER_CARD_TYPE);
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta(
      "name",
      "twitter:description",
      description ?? DEFAULT_DESCRIPTION,
    );
    upsertMeta("name", "twitter:image", absoluteUrl(image ?? DEFAULT_OG_IMAGE));

    // JSON-LD: swap in the page-specific block, or the default
    // organization block. Never accumulates stale script tags.
    const scriptId = "seo-jsonld";
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(jsonLd ?? ORGANIZATION_JSON_LD);

    // No cleanup on unmount: the LAST rendered page's tags stay in the
    // head (correct - they describe the page being displayed).
  }, [title, description, path, image, keywords, noindex, jsonLd]);
};

const SEO = (props) => {
  useSeoHead(props);
  return null;
};

export default SEO;
