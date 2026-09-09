import {
  FaCompass,
  FaBullseye,
  FaBalanceScale,
  FaHandshake,
  FaHeart,
  FaBriefcase,
  FaStar,
  FaAward,
  FaCheckCircle,
} from "react-icons/fa";
import about from "../../../../assets/img/logo/aletisalat-about.png";
import styles from "./AboutSnippet.module.css";

const CORE_VALUES = [
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

const WHY_CHOOSE = [
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

const PROMISES = [
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

const GLANCE = [
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

function SubHeading({ eyebrow, title, subtitle, center }) {
  return (
    <div className={`${styles.subHead} ${center ? styles.subHeadCenter : ""}`}>
      {eyebrow && <span className={styles.subEyebrow}>{eyebrow}</span>}
      <h3 className={styles.subTitle}>{title}</h3>
      {subtitle && <p className={styles.subSubtitle}>{subtitle}</p>}
    </div>
  );
}

function AboutSnippet() {
  return (
    <section id="about" className={styles.aboutSection}>
      {/* INTRO */}
      <div className="container">
        {/* Header */}
        <div>
          <SubHeading
            eyebrow="About"
            title="Vision Recruitment Agency"
            subtitle=" discover how we connect Ethiopian workers with international employers through ethical and professional recruitment services."
            center
          />
        </div>
        <div className={`row align-items-center ${styles.introRow}`}>
          <div className="col-lg-6">
            <div className={styles.imageWrapper}>
              <div className={styles.floatingBadge}>
                <span className={styles.dot}></span>
                Trusted Overseas Recruitment
              </div>
              <img
                src={about}
                alt="Vision Recruitment Agency"
                className={`img-fluid ${styles.aboutImage}`}
                loading="lazy"
              />
            </div>
          </div>

          <div className="col-lg-6">
            <div className={styles.contentInner}>
              <span className={styles.tag}>
                About Vision Recruitment Agency
              </span>
              <p className={styles.description}>
                <strong>Vision Recruitment Agency</strong> is a professional
                foreign employment and workforce placement agency committed to
                connecting qualified Ethiopian workers with legitimate
                employment opportunities abroad.
              </p>
              <p className={styles.description}>
                <strong>Vision Recruitment Agency</strong> is a professional
                foreign employment and workforce placement agency committed to
                connecting qualified Ethiopian workers with legitimate
                employment opportunities abroad.
            
              </p>
              <p className={styles.description}>
                We believe that employment is more than simply finding a job. It
                is about creating opportunities that improve lives, strengthen
                families, develop skills, and contribute to a better future.
              </p>
              <p className={styles.description}>
                Our agency works to build a trusted bridge between Ethiopian job
                seekers and international employers by providing responsible,
                transparent, professional, and efficient recruitment services.
                At Vision Recruitment Agency, we are committed to protecting the
                dignity and interests of workers while helping employers access
                reliable, qualified, and motivated human resources.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* VISION & MISSION */}
      <div className={styles.tintBlock}>
        <div className="container">
          <SubHeading eyebrow="Who We Are" title="Vision & Mission" center />
          <div className="row g-4">
            <div className="col-md-6">
              <div className={styles.pillarCard}>
                <div className={styles.pillarIcon}>
                  <FaCompass />
                </div>
                <span className={styles.pillarLabel}>Our Vision</span>
                <p className={styles.pillarQuote}>
                  To be the most trusted name in international recruitment,
                  opening safe and reliable pathways for Ethiopian talent to
                  build better lives abroad.
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
                  To connect skilled workers with verified international
                  employers through ethical, transparent, and professional
                  recruitment services built on trust.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CORE VALUES */}
      <div className={`container ${styles.block}`}>
        <SubHeading
          eyebrow="What We Stand For"
          title="Our Core Values"
          subtitle="The principles that guide every placement we make."
          center
        />
        <div className={styles.valuesGrid}>
          {CORE_VALUES.map((item) => (
            <div className={styles.valueCard} key={item.title}>
              <div className={styles.valueIcon}>{item.icon}</div>
              <h6 className={styles.valueTitle}>
                {item.title}
                <span className={styles.valueAmharic}>{item.amharic}</span>
              </h6>
              <p className={styles.valueDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* WHY CHOOSE US + PROMISE */}
      <div className={styles.tintBlock}>
        <SubHeading
          eyebrow="Why Choose Us"
          title="We Are Trusted By Workers & Employers"
          subtitle="We are companies that benefit both workers and employers."
          center
        />
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-6">
              <div className={styles.whyList}>
                {WHY_CHOOSE.map((item) => (
                  <div className={styles.whyItem} key={item.title}>
                    <span className={styles.whyIconWrap}>
                      <FaCheckCircle />
                    </span>
                    <div>
                      <h6 className={styles.whyTitle}>{item.title}</h6>
                      <p className={styles.whyDesc}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-6">
              <div className={styles.promiseStack}>
                {PROMISES.map((item, idx) => (
                  <div className={styles.promiseCard} key={item.title}>
                    <span className={styles.promiseNumber}>0{idx + 1}</span>
                    <div>
                      <h6 className={styles.promiseTitle}>{item.title}</h6>
                      <p className={styles.promiseDesc}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AT A GLANCE */}
      <div className={`container ${styles.block}`}>
        <div className={styles.glanceStrip}>
          {GLANCE.map((item) => (
            <div className={styles.glanceItem} key={item.label}>
              <span className={styles.glanceLabel}>{item.label}</span>
              <span className={styles.glanceValue}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AboutSnippet;
