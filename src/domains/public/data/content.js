/* ------------------------------------------------------------------
   Static copy for the public website.

   Kept in one place so the content can be edited without touching
   layout code. Dynamic content (gallery, contact details, location,
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

export const AGENCY_NAME = "Vision Recruitment Agency";
export const AGENCY_LEGAL_NAME =
  "Vision Recruitment Private Foreign Employment Agency";

/* Section anchors used by the header, footer and in-page CTAs */
export const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "how", label: "Process" },
  { id: "services", label: "Services" },
  { id: "about", label: "About" },
  { id: "gallery", label: "Gallery" },
  { id: "testimonials", label: "Testimonials" },
  { id: "contact", label: "Contact" },
];

export const HERO_SLIDES = [
  {
    id: 1,
    image: hero1,
    imageSm: hero1Sm,
    eyebrow: "Your trusted partner in overseas employment",
    heading: ["Your future", "starts here."],
    sub: "Ethiopia's leading agency connecting skilled workers with top employers in Saudi Arabia, UAE, Kuwait, and Qatar.",
  },
  {
    id: 2,
    image: hero2,
    imageSm: hero2Sm,
    eyebrow: "Legal. Safe. Transparent.",
    heading: ["Your safe", "path abroad."],
    sub: "From documents to departure — we handle everything so you and your family have peace of mind.",
  },
  {
    id: 3,
    image: hero3,
    imageSm: hero3Sm,
    eyebrow: "Thousands placed. Countless lives changed.",
    heading: ["Build a better", "life abroad."],
    sub: "Thousands of Ethiopians have built successful careers in the Middle East — your story starts here.",
  },
  {
    id: 4,
    image: hero4,
    imageSm: hero4Sm,
    eyebrow: "Your gateway to the Gulf",
    heading: ["Opportunity", "awaits you."],
    sub: "From Addis Ababa to Dubai, Riyadh, and Kuwait City — we open doors to life-changing careers for hardworking Ethiopians.",
  },
  {
    id: 5,
    image: hero5,
    imageSm: hero5Sm,
    eyebrow: "Start your journey today",
    heading: ["Apply once.", "Change everything."],
    sub: "Our simple application process gets you in front of verified employers fast. No hidden fees. No middlemen. Just results.",
  },
];

export const DESTINATIONS = ["Saudi Arabia", "UAE", "Kuwait", "Qatar"];

/* Short promises drawn from the agency's own messaging */
export const PROMISE_TICKER = [
  "Legal. Safe. Transparent.",
  "Verified employers",
  "No hidden fees",
  "No middlemen",
  "From documents to departure",
  "Ethical recruitment",
  "Addis Ababa → The Gulf",
];

export const PROCESS_STEPS = [
  {
    key: "registration",
    title: "Registration",
    description:
      "Register with the agency by submitting your personal details, identification documents, and creating your official overseas employment profile.",
  },
  {
    key: "qualification",
    title: "Qualification",
    description:
      "Complete required training, competency assessment, medical examination, and pre-employment orientation to become eligible for overseas placement.",
  },
  {
    key: "placement",
    title: "Job Placement",
    description:
      "Get matched with a verified employer, complete interviews, sign your employment contract, and process your visa and work permit.",
  },
  {
    key: "deployment",
    title: "Deployment",
    description:
      "Attend pre-departure orientation, finalize travel arrangements, receive exit clearance, and begin your overseas employment journey.",
  },
];

export const SERVICES = [
  {
    key: "recruitment",
    title: "Foreign Employment Recruitment",
    description:
      "We connect qualified Ethiopian workers with suitable employment opportunities in international markets.",
  },
  {
    key: "placement",
    title: "Workforce Selection & Placement",
    description:
      "We identify, screen, assess, and place candidates according to employer requirements and applicable regulations.",
  },
  {
    key: "employer",
    title: "Employer Recruitment Services",
    description:
      "We support international employers in sourcing suitable, qualified, and dependable workers.",
  },
  {
    key: "support",
    title: "Candidate Support",
    description:
      "We guide candidates throughout the recruitment and placement process and provide the necessary information and assistance.",
  },
  {
    key: "documentation",
    title: "Documentation & Processing Support",
    description:
      "We assist with the necessary recruitment, employment, and travel documentation in accordance with applicable requirements.",
  },
];

export const ABOUT_PARAGRAPHS = [
  "We connect talented individuals with trusted employers, creating pathways that support personal growth, strengthen families, build valuable skills, and open doors to brighter opportunities.",
  "Our mission is to make the employment journey easier and more reliable, helping candidates discover suitable opportunities while connecting employers with skilled and dedicated professionals.",
  "Our agency works to build a trusted bridge between Ethiopian job seekers and international employers by providing responsible, transparent, professional, and efficient recruitment services. At Vision Recruitment Agency, we are committed to protecting the dignity and interests of workers while helping employers access reliable, qualified, and motivated human resources.",
];

export const AT_A_GLANCE = [
  { label: "Company Name", value: "Vision Recruitment Agency" },
  { label: "Industry", value: "Foreign Employment & Workforce Recruitment" },
  {
    label: "Core Service",
    value: "International Recruitment & Employment Placement",
  },
  {
    label: "Primary Market",
    value: "Ethiopian Workforce & International Employers",
  },
];

export const VISION_MISSION = [
  {
    key: "vision",
    label: "Our Vision",
    text: "To be the most trusted name in international recruitment, opening safe and reliable pathways for Ethiopian talent to build better lives abroad.",
  },
  {
    key: "mission",
    label: "Our Mission",
    text: "To connect skilled workers with verified international employers through ethical, transparent, and professional recruitment services built on trust.",
  },
];

export const CORE_VALUES = [
  {
    key: "integrity",
    title: "Integrity",
    amharic: "ታማኝነት",
    desc: "We conduct our business with honesty, fairness, accountability, and respect.",
  },
  {
    key: "trust",
    title: "Trust",
    amharic: "እምነት",
    desc: "We build lasting relationships through transparency, reliability, and responsible service.",
  },
  {
    key: "people",
    title: "People First",
    amharic: "ሰው ቅድሚያ",
    desc: "We put the dignity, safety, rights, and interests of people at the heart of our work.",
  },
  {
    key: "professionalism",
    title: "Professionalism",
    amharic: "ሙያዊነት",
    desc: "We deliver our services with competence, efficiency, discipline, and professionalism.",
  },
  {
    key: "opportunity",
    title: "Opportunity",
    amharic: "የዕድል ፈጠራ",
    desc: "We connect people with opportunities that can improve their livelihoods and future.",
  },
  {
    key: "excellence",
    title: "Excellence",
    amharic: "የላቀ አገልግሎት",
    desc: "We continuously improve our services to achieve the highest standards of quality and client satisfaction.",
  },
];

export const WHY_CHOOSE = [
  {
    title: "Trusted",
    desc: "We value honesty, transparency, and long-term relationships.",
  },
  {
    title: "Professional",
    desc: "We provide organized and professional recruitment and placement services.",
  },
  {
    title: "People-Centered",
    desc: "We respect the dignity, rights, safety, and interests of workers.",
  },
  {
    title: "Employer-Focused",
    desc: "We help employers find suitable and dependable human resources.",
  },
];

export const PROMISES = [
  {
    title: "To Workers",
    desc: "We strive to connect you with legitimate opportunities and provide professional guidance throughout your employment journey.",
  },
  {
    title: "To Employers",
    desc: "We strive to provide qualified, reliable, and suitable human resources according to your requirements.",
  },
  {
    title: "To Our Partners",
    desc: "We build lasting relationships based on trust, professionalism, transparency, and mutual success.",
  },
];

/* NOTE: carried over unchanged from the previous site — these are still
   placeholder entries and should be replaced with real candidate stories. */
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

export const TESTIMONIAL_RATING_TEXT = "Rated by over 2,500 candidates";

/* Role → dashboard mapping for the header's Sign In / Dashboard button */
export const ROLE_DASHBOARD = {
  1: "/admin/dashboard",
  2: "/admin/dashboard",
  3: "/partner/my-profile",
  4: "/employee/my-profile",
  5: "/employer/my-profile",
};
