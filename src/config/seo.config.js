/* ------------------------------------------------------------------
   CENTRAL SEO CONFIGURATION

   The production domain lives in exactly ONE place: SITE_URL below.
   When the final domain is bought (if different from
   https://aletisalatjobs.com), change it here — every page, the sitemap
   references, and the social-share image URL follow automatically.

   Also remember to update by hand (one find & replace each):
   - public/index.html        (fallback meta + JSON-LD)
   - public/robots.txt        (Sitemap line)
   - public/sitemap.xml       (<loc> entries)
   ------------------------------------------------------------------ */

export const SITE_URL = "https://aletisalatjobs.com";

export const SITE_NAME = "ALETISALAT";

export const DEFAULT_TITLE =
  "ALETISALAT | Work Abroad Without the Guesswork — Licensed Ethiopian Overseas Employment Agency";

export const DEFAULT_DESCRIPTION =
  "ALETISALAT places skilled Ethiopians in verified jobs across Saudi Arabia, Jordan, and the Gulf. Every contract checked, every step explained before you sign.";

export const DEFAULT_OG_IMAGE = "/og-image.jpg";

export const DEFAULT_KEYWORDS =
  "Ethiopia overseas employment, work abroad Ethiopia, house maid Saudi Arabia, jobs Jordan Ethiopian, licensed employment agency Addis Ababa, domestic worker Gulf, ALETISALAT";

/* Organization structured data (EmploymentAgency type). Add social
   profile URLs into sameAs when the accounts exist — they feed
   "knowledge panel" style results. */
export const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "EmploymentAgency",
  name: SITE_NAME,
  alternateName: "Aletisalat Overseas Employment Agency",
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/logo192.png`,
  image: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
  description: DEFAULT_DESCRIPTION,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Addis Ababa",
    addressCountry: "ET",
  },
  areaServed: [
    "Ethiopia",
    "Saudi Arabia",
    "Jordan",
    "United Arab Emirates",
    "Kuwait",
  ],
  knowsLanguage: ["en", "am", "ar"],
  sameAs: [],
};

export const TWITTER_CARD_TYPE = "summary_large_image";

/* Absolute URL for a site-relative asset path (og:image must be absolute). */
export const absoluteUrl = (path = "/") => {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};
