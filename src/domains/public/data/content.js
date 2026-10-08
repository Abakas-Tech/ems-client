/* ------------------------------------------------------------------
   Non-text data for the public website (images, keys, map positions).

   All visible text lives in ../i18n/locales/{en,am,ar}.js and is read
   with useTranslation(); list items there line up by index with the
   arrays below. Dynamic content (gallery, contact details, location,
   social links) still comes from the API.
   ------------------------------------------------------------------ */
import hero1 from "../../../assets/img/site/hero-1.jpg";
import hero1Sm from "../../../assets/img/site/hero-1-sm.jpg";
import hero2 from "../../../assets/img/site/hero-2.jpg";
import hero2Sm from "../../../assets/img/site/hero-2-sm.jpg";
import hero3 from "../../../assets/img/site/hero-3.jpg";
import hero3Sm from "../../../assets/img/site/hero-3-sm.jpg";
import hero4 from "../../../assets/img/site/hero-4.jpg";
import hero4Sm from "../../../assets/img/site/hero-4-sm.jpg";
import hero5 from "../../../assets/img/site/hero-5.jpg";
import hero5Sm from "../../../assets/img/site/hero-5-sm.jpg";
import avatar1 from "../../../assets/img/site/avatar-1.jpg";
import avatar2 from "../../../assets/img/site/avatar-2.jpg";
import avatar3 from "../../../assets/img/site/avatar-3.jpg";

/* Section anchors used by the header, footer and in-page CTAs
   (labels: nav.<id> in the locale files) */
export const NAV_IDS = ["home", "how", "services", "about", "gallery", "testimonials", "contact"];

export const HERO_IMAGES = [
  { image: hero1, imageSm: hero1Sm },
  { image: hero2, imageSm: hero2Sm },
  { image: hero3, imageSm: hero3Sm },
  { image: hero4, imageSm: hero4Sm },
  { image: hero5, imageSm: hero5Sm },
];

export const PROCESS_KEYS = ["registration", "qualification", "placement", "deployment"];

export const SERVICE_KEYS = ["recruitment", "placement", "employer", "support", "documentation"];

/* Amharic names shown under each value (in the English/Arabic UI) */
export const CORE_VALUES = [
  { key: "integrity", amharic: "ታማኝነት" },
  { key: "trust", amharic: "እምነት" },
  { key: "people", amharic: "ሰው ቅድሚያ" },
  { key: "professionalism", amharic: "ሙያዊነት" },
  { key: "opportunity", amharic: "የዕድል ፈጠራ" },
  { key: "excellence", amharic: "የላቀ አገልግሎት" },
];

/* Route map positions in the SVG viewBox (x = east, y = south),
   roughly to scale from Addis Ababa. */
export const ROUTE_ORIGIN = { x: 96, y: 452 };

export const DESTINATION_ROUTES = [
  { key: "sa", code: "KSA", x: 254, y: 146 },
  { key: "kw", code: "KWT", x: 282, y: 54 },
  { key: "qa", code: "QAT", x: 352, y: 140 },
  { key: "ae", code: "UAE", x: 430, y: 128 },
];

/* NOTE: carried over unchanged from the previous site — these are still
   placeholder entries and should be replaced with real candidate stories.
   They are shown as-is in every language. */
export const TESTIMONIALS = [
  {
    name: "Sophia Anderson",
    position: "Marketing Director",
    image: avatar1,
    quote:
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
  },
  {
    name: "Marcus Webb",
    position: "Tech Lead",
    image: avatar2,
    quote:
      "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.",
  },
  {
    name: "Elena Rodriguez",
    position: "Startup Founder",
    image: avatar3,
    quote:
      "Itaque earum rerum hic tenetur a sapiente delectus ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.",
  },
  {
    name: "Oliver Thompson",
    position: "Product Designer",
    image: avatar1,
    quote:
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
  },
];

/* Role → dashboard mapping for the header's Sign In / Dashboard button */
export const ROLE_DASHBOARD = {
  1: "/admin/dashboard",
  2: "/admin/dashboard",
  3: "/partner/my-profile",
  4: "/employee/my-profile",
  5: "/employer/my-profile",
};
