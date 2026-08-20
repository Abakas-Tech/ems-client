import {
  FaGlobeAfrica,
  FaHandshake,
  FaUserCheck,
  FaFileSignature,
  FaPlaneDeparture,
  FaUsersCog,
  FaBalanceScale,
  FaHeart,
  FaBriefcase,
  FaAward,
  FaStar,
  FaCheckCircle,
  FaCompass,
  FaBullseye,
} from "react-icons/fa";
import styles from "./AboutDetail.module.css";

/* --- What We Do (6 services) --- */
const services = [
  {
    icon: <FaGlobeAfrica />,
    title: "Foreign Employment Recruitment",
    desc: "We connect qualified Ethiopian workers with suitable employment opportunities in international markets.",
  },
  {
    icon: <FaUsersCog />,
    title: "Workforce Selection & Placement",
    desc: "We identify, screen, assess, and place candidates according to employer requirements and applicable regulations.",
  },
  {
    icon: <FaHandshake />,
    title: "Employer Recruitment Services",
    desc: "We support international employers in sourcing suitable, qualified, and dependable workers.",
  },
  {
    icon: <FaUserCheck />,
    title: "Candidate Support",
    desc: "We guide candidates throughout the recruitment and placement process and provide the necessary information and assistance.",
  },
  {
    icon: <FaFileSignature />,
    title: "Documentation & Processing Support",
    desc: "We assist with the necessary recruitment, employment, and travel documentation in accordance with applicable requirements.",
  },
  {
    icon: <FaPlaneDeparture />,
    title: "Pre-Departure Orientation",
    desc: "We help selected workers understand their employment conditions, responsibilities, rights, and expectations before departure.",
  },
];

/* --- Core Values (6) --- */
const coreValues = [
  {
    icon: <FaBalanceScale />,
    title: "Integrity",
    amharic: "ታማኝነት",
    desc: "We conduct our business with honesty, fairness, accountability, and respect.",
  },
  {
    icon: <FaHandshake />,
    title: "Trust",
    amharic: "እምነት",
    desc: "We build lasting relationships through transparency, reliability, and responsible service.",
  },
  {
    icon: <FaHeart />,
    title: "People First",
    amharic: "ሰው ቅድሚያ",
    desc: "We put the dignity, safety, rights, and interests of people at the heart of our work.",
  },
  {
    icon: <FaBriefcase />,
    title: "Professionalism",
    amharic: "ሙያዊነት",
    desc: "We deliver our services with competence, efficiency, discipline, and professionalism.",
  },
  {
    icon: <FaStar />,
    title: "Opportunity",
    amharic: "የዕድል ፈጠራ",
    desc: "We connect people with opportunities that can improve their livelihoods and future.",
  },
  {
    icon: <FaAward />,
    title: "Excellence",
    amharic: "የላቀ አገልግሎት",
    desc: "We continuously improve our services to achieve the highest standards of quality and client satisfaction.",
  },
];

/* --- Why Choose ALETISALAT (6) --- */
const whyChoose = [
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
  {
    title: "Opportunity-Driven",
    desc: "We work to open new pathways for Ethiopian workers in the international employment market.",
  },
  {
    title: "Responsible",
    desc: "We are committed to responsible recruitment and compliance with applicable laws and regulations.",
  },
];

/* --- Our Promise (3) --- */
const promises = [
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
    desc: "We build relationships based on trust, professionalism, transparency, and mutual success.",
  },
];

/* --- ALETISALAT at a Glance --- */
const glance = [
  {
    label: "Company Name",
    value: "ALETISALAT Private Foreign Employment Agency",
  },
  { label: "Industry", value: "Foreign Employment & Workforce Recruitment" },
  {
    label: "Core Service",
    value: "International Recruitment & Employment Placement",
  },
  {
    label: "Primary Market",
    value: "Ethiopian Workforce & International Employers",
  },
  {
    label: "Core Values",
    value:
      "Integrity • Trust • People First • Professionalism • Opportunity • Excellence",
  },
];

/* Small reusable heading block used above every section */
function SectionHeading({ eyebrow, title, subtitle, center }) {
  return (
    <div
      className={`${styles.sectionHead} ${center ? styles.sectionHeadCenter : ""}`}
    >
      {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
      <h3 className={styles.sectionTitle}>{title}</h3>
      {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
    </div>
  );
}

export default function AboutDetail() {
  return (
    <div className={styles.page}>
      <div className="container py-5">
        {/* HERO */}
        <div className={styles.hero}>
          <h2 className={styles.heroTitle}>About ALETISALAT</h2>
          <p className={styles.heroKicker}>
            Striving for a Better Future for Others.
            <span>ለሌሎች የተሻለ ወደፊት እንጥራለን።</span>
          </p>

          <p className={styles.heroLead}>
            <strong>ALETISALAT Private Foreign Employment Agency</strong> is a
            professional foreign employment and workforce placement agency
            committed to connecting qualified Ethiopian workers with legitimate
            employment opportunities abroad.
          </p>

          <p className={styles.heroText}>
            We believe that employment is more than simply finding a job. It is
            about creating opportunities that improve lives, strengthen
            families, develop skills, and contribute to a better future. Our
            agency works to build a trusted bridge between Ethiopian job seekers
            and international employers by providing responsible, transparent,
            professional, and efficient recruitment services.
          </p>

          <div className={styles.tagline}>
            "Connecting People. Creating Opportunities. Building Better
            Futures."
            <span>"ሰዎችን እናገናኛለን። ዕድሎችን እንፈጥራለን። የተሻለ ወደፊት እንገነባለን።"</span>
          </div>
        </div>

        <div className={styles.sections}>
          {/* VISION & MISSION */}
          <div>
            <SectionHeading eyebrow="Who We Are" title="Vision & Mission" />
            <div className="row g-4 mt-1">
              <div className="col-md-6">
                <div className={styles.pillarCard}>
                  <div className={styles.pillarIcon}>
                    <FaCompass />
                  </div>
                  <span className={styles.pillarLabel}>Our Vision</span>
                  <p className={styles.pillarQuote}>
                    "We strive to create a better future for others by
                    connecting people with meaningful opportunities."
                  </p>
                  <p className={styles.pillarAmharic}>
                    "ሰዎችን ከትርጉም ያለው የሥራ ዕድል በማገናኘት ለሌሎች የተሻለ ወደፊት ለመፍጠር እንጥራለን።"
                  </p>
                </div>
              </div>

              <div className="col-md-6">
                <div className={styles.pillarCard}>
                  <div className={styles.pillarIcon}>
                    <FaBullseye />
                  </div>
                  <span className={styles.pillarLabel}>Our Mission</span>
                  <p className={styles.pillarQuote}>
                    Our mission is to provide ethical, transparent, reliable,
                    and professional foreign employment services by connecting
                    qualified workers with legitimate international employment
                    opportunities while creating value for workers, employers,
                    families, and communities.
                  </p>
                  <p className={styles.pillarAmharic}>
                    ብቁ የሆኑ ሰራተኞችን ከህጋዊና ተገቢ የውጭ ሀገር የሥራ ዕድሎች ጋር በማገናኘት፣ ለሰራተኞች፣
                    ለአሰሪዎች፣ ለቤተሰቦች እና ለማህበረሰቡ ዋጋ የሚፈጥር ሥነ-ምግባራዊ፣ ግልጽ፣ አስተማማኝና
                    ፕሮፌሽናል የውጭ ሥራ ማገናኛ አገልግሎት መስጠት ተልዕኮአችን ነው።
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CORE VALUES */}
          <div>
            <SectionHeading
              eyebrow="What We Stand For"
              title="Our Core Values"
              subtitle="The principles that guide every placement we make."
            />
            <div className={styles.panel}>
              <div className="row g-4">
                {coreValues.map((item, idx) => (
                  <div className="col-md-4 col-sm-6" key={idx}>
                    <div className={styles.valueCard}>
                      <div className={styles.valueIcon}>{item.icon}</div>
                      <h6 className={styles.valueTitle}>
                        {item.title}
                        <span className={styles.valueAmharic}>
                          {item.amharic}
                        </span>
                      </h6>
                      <p className={styles.valueDesc}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* WHAT WE DO - SLIDER */}
          <div>
            <SectionHeading
              eyebrow="Our Services"
              title="What We Do"
              subtitle="End-to-end recruitment services for workers and employers alike."
            />
            <div className={styles.scrollWrapper}>
              <div className={styles.scrollTrack}>
                {[...services, ...services].map((service, index) => (
                  <div className={styles.featureCard} key={index}>
                    <div className="text-center p-4">
                      <div className={styles.iconWrapper}>{service.icon}</div>
                      <h6 className="fw-bold mb-3">{service.title}</h6>
                      <p className="small mb-0">{service.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* WHY CHOOSE ALETISALAT */}
          <div>
            <SectionHeading eyebrow="Why Us" title="Why Choose ALETISALAT?" />
            <div className={styles.panel}>
              <div className="row g-3">
                {whyChoose.map((item, idx) => (
                  <div className="col-12 col-md-6" key={idx}>
                    <div className={styles.whyItem}>
                      <span className={styles.whyIconWrap}>
                        <FaCheckCircle className={styles.whyIcon} size={16} />
                      </span>
                      <div>
                        <h6 className={styles.whyTitle}>{item.title}</h6>
                        <p className={styles.whyDesc}>{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* OUR PROMISE */}
          <div>
            <SectionHeading
              eyebrow="Our Commitment To You"
              title="Our Promise"
            />
            <div className="row g-4 mt-1">
              {promises.map((item, idx) => (
                <div className="col-md-4" key={idx}>
                  <div className={styles.promiseCard}>
                    <span className={styles.promiseNumber}>0{idx + 1}</span>
                    <h6 className={styles.promiseTitle}>{item.title}</h6>
                    <p className={styles.promiseDesc}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AT A GLANCE */}
          <div>
            <SectionHeading
              eyebrow="Quick Facts"
              title="ALETISALAT at a Glance"
            />
            <div className={styles.glanceGrid}>
              {glance.map((item, idx) => (
                <div className={styles.glanceRow} key={idx}>
                  <span className={styles.glanceLabel}>{item.label}</span>
                  <span className={styles.glanceValue}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* OUR FUTURE */}
          <div className={styles.futureSection}>
            <SectionHeading eyebrow="Looking Ahead" title="Our Future" center />
            <p className={styles.futureText}>
              ALETISALAT aspires to become a trusted and recognized foreign
              employment agency known for responsible recruitment, professional
              service, strong international partnerships, and positive impact on
              the lives of workers and their families. We envision a future
              where Ethiopian workers can access legitimate international
              employment opportunities through a trusted, transparent, and
              professional pathway.
            </p>
            <div className={styles.futureTagline}>
              ALETISALAT — Connecting People. Creating Opportunities. Building
              Better Futures.
              <span>ሰዎችን እናገናኛለን። ዕድሎችን እንፈጥራለን። የተሻለ ወደፊት እንገነባለን።</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
