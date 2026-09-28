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
import { useTranslation, Trans } from "react-i18next";
import { useLanguage } from "../../../../i18n/useLanguage";
import styles from "./AboutDetail.module.css";

/* Section texts are translation keys (aboutDetail.* / services.items.*).
   The Amharic lines under some English headings are the client-approved
   Amharic wording; they're shown in English and Arabic views and hidden
   in the Amharic view, where the main text is already that Amharic. */

/* --- What We Do (6 services) --- same texts as the Services section */
const services = [
  { icon: <FaGlobeAfrica />, key: "recruitment" },
  { icon: <FaUsersCog />, key: "placement" },
  { icon: <FaHandshake />, key: "employer" },
  { icon: <FaUserCheck />, key: "candidate" },
  { icon: <FaFileSignature />, key: "documentation" },
  { icon: <FaPlaneDeparture />, key: "orientation" },
];

/* --- Core Values (6) --- */
const coreValues = [
  { icon: <FaBalanceScale />, key: "integrity", amharic: "ታማኝነት" },
  { icon: <FaHandshake />, key: "trust", amharic: "እምነት" },
  { icon: <FaHeart />, key: "peopleFirst", amharic: "ሰው ቅድሚያ" },
  { icon: <FaBriefcase />, key: "professionalism", amharic: "ሙያዊነት" },
  { icon: <FaStar />, key: "opportunity", amharic: "የዕድል ፈጠራ" },
  { icon: <FaAward />, key: "excellence", amharic: "የላቀ አገልግሎት" },
];

/* --- Why Choose ALETISALAT (6) --- */
const whyChoose = [
  "trusted",
  "professional",
  "peopleCentered",
  "employerFocused",
  "opportunityDriven",
  "responsible",
];

/* --- Our Promise (3) --- */
const promises = ["workers", "employers", "partners"];

/* --- ALETISALAT at a Glance --- */
const glance = [
  "companyName",
  "industry",
  "coreService",
  "primaryMarket",
  "coreValues",
];

/* Approved Amharic lines (unchanged) */
const AMHARIC = {
  kicker: "ለሌሎች የተሻለ ወደፊት እንጥራለን።",
  tagline: "\"ሰዎችን እናገናኛለን። ዕድሎችን እንፈጥራለን። የተሻለ ወደፊት እንገነባለን።\"",
  vision:
    "\"ሰዎችን ከትርጉም ያለው የሥራ ዕድል በማገናኘት ለሌሎች የተሻለ ወደፊት ለመፍጠር እንጥራለን።\"",
  mission:
    "ብቁ የሆኑ ሰራተኞችን ከህጋዊና ተገቢ የውጭ ሀገር የሥራ ዕድሎች ጋር በማገናኘት፣ ለሰራተኞች፣ ለአሰሪዎች፣ ለቤተሰቦች እና ለማህበረሰቡ ዋጋ የሚፈጥር ሥነ-ምግባራዊ፣ ግልጽ፣ አስተማማኝና ፕሮፌሽናል የውጭ ሥራ ማገናኛ አገልግሎት መስጠት ተልዕኮአችን ነው።",
  futureTagline: "ሰዎችን እናገናኛለን። ዕድሎችን እንፈጥራለን። የተሻለ ወደፊት እንገነባለን።",
};

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
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  // The approved Amharic secondary lines, unless the page is already Amharic.
  const showAmharic = currentLanguage !== "am";

  return (
    <div className={styles.page}>
      <div className="container py-5">
        {/* HERO */}
        <div className={styles.hero}>
          <h2 className={styles.heroTitle}>{t("aboutDetail.title")}</h2>
          <p className={styles.heroKicker}>
            {t("aboutDetail.kicker")}
            {showAmharic && <span lang="am">{AMHARIC.kicker}</span>}
          </p>

          <p className={styles.heroLead}>
            <Trans
              i18nKey="aboutDetail.lead"
              components={{ strong: <strong /> }}
            />
          </p>

          <div className={styles.tagline}>
            {t("aboutDetail.tagline")}
            {showAmharic && <span lang="am">{AMHARIC.tagline}</span>}
          </div>
        </div>

        <div className={styles.sections}>
          {/* VISION & MISSION */}
          <div>
            <SectionHeading
              eyebrow={t("aboutDetail.visionMission.eyebrow")}
              title={t("aboutDetail.visionMission.title")}
            />
            <div className="row g-4">
              <div className="col-md-6">
                <div className={styles.pillarCard}>
                  <div className={styles.pillarIcon}>
                    <FaCompass />
                  </div>
                  <span className={styles.pillarLabel}>
                    {t("aboutDetail.visionMission.visionLabel")}
                  </span>
                  <p className={styles.pillarQuote}>
                    {t("aboutDetail.visionMission.vision")}
                  </p>
                  {showAmharic && (
                    <p className={styles.pillarAmharic} lang="am">
                      {AMHARIC.vision}
                    </p>
                  )}
                </div>
              </div>

              <div className="col-md-6">
                <div className={styles.pillarCard}>
                  <div className={styles.pillarIcon}>
                    <FaBullseye />
                  </div>
                  <span className={styles.pillarLabel}>
                    {t("aboutDetail.visionMission.missionLabel")}
                  </span>
                  <p className={styles.pillarQuote}>
                    {t("aboutDetail.visionMission.mission")}
                  </p>
                  {showAmharic && (
                    <p className={styles.pillarAmharic} lang="am">
                      {AMHARIC.mission}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* CORE VALUES */}
          <div>
            <SectionHeading
              eyebrow={t("aboutDetail.coreValues.eyebrow")}
              title={t("aboutDetail.coreValues.title")}
              subtitle={t("aboutDetail.coreValues.subtitle")}
            />
            <div className={styles.panel}>
              <div className="row g-4">
                {coreValues.map((item, idx) => (
                  <div className="col-md-4 col-sm-6" key={idx}>
                    <div className={styles.valueCard}>
                      <div className={styles.valueIcon}>{item.icon}</div>
                      <h6 className={styles.valueTitle}>
                        {t(`aboutDetail.coreValues.items.${item.key}.title`)}
                        {showAmharic && (
                          <span className={styles.valueAmharic} lang="am">
                            {item.amharic}
                          </span>
                        )}
                      </h6>
                      <p className={styles.valueDesc}>
                        {t(`aboutDetail.coreValues.items.${item.key}.desc`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* WHY CHOOSE ALETISALAT */}
          <div>
            <SectionHeading
              eyebrow={t("aboutDetail.whyChoose.eyebrow")}
              title={t("aboutDetail.whyChoose.title")}
            />
            <div className={styles.panel}>
              <div className="row g-3">
                {whyChoose.map((key) => (
                  <div className="col-12 col-md-6" key={key}>
                    <div className={styles.whyItem}>
                      <span className={styles.whyIconWrap}>
                        <FaCheckCircle className={styles.whyIcon} size={16} />
                      </span>
                      <div>
                        <h6 className={styles.whyTitle}>
                          {t(`aboutDetail.whyChoose.items.${key}.title`)}
                        </h6>
                        <p className={styles.whyDesc}>
                          {t(`aboutDetail.whyChoose.items.${key}.desc`)}
                        </p>
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
              eyebrow={t("aboutDetail.promise.eyebrow")}
              title={t("aboutDetail.promise.title")}
            />
            <div className="row g-4">
              {promises.map((key, idx) => (
                <div className="col-md-4" key={key}>
                  <div className={styles.promiseCard}>
                    <span className={styles.promiseNumber}>0{idx + 1}</span>
                    <h6 className={styles.promiseTitle}>
                      {t(`aboutDetail.promise.items.${key}.title`)}
                    </h6>
                    <p className={styles.promiseDesc}>
                      {t(`aboutDetail.promise.items.${key}.desc`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AT A GLANCE */}
          <div>
            <SectionHeading
              eyebrow={t("aboutDetail.glance.eyebrow")}
              title={t("aboutDetail.glance.title")}
            />
            <div className={styles.glanceGrid}>
              {glance.map((key) => (
                <div className={styles.glanceRow} key={key}>
                  <span className={styles.glanceLabel}>
                    {t(`aboutDetail.glance.items.${key}.label`)}
                  </span>
                  <span className={styles.glanceValue}>
                    {t(`aboutDetail.glance.items.${key}.value`)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* OUR FUTURE */}
          <div className={styles.futureSection}>
            <SectionHeading
              eyebrow={t("aboutDetail.future.eyebrow")}
              title={t("aboutDetail.future.title")}
              center
            />
            <p className={styles.futureText}>{t("aboutDetail.future.text")}</p>
            <div className={styles.futureTagline}>
              {t("aboutDetail.future.tagline")}
              {showAmharic && (
                <span lang="am">{AMHARIC.futureTagline}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
