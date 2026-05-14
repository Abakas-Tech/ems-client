import { useEffect, useState, useRef } from "react";
import {
  FaUsers,
  FaGlobe,
  FaShieldAlt,
  FaHandsHelping,
  FaBalanceScale,
  FaAward,
  FaPeopleArrows,
  FaBrain,
  FaCheckCircle,
  FaArrowRight,
  FaQuoteLeft,
} from "react-icons/fa";
import styles from "./AboutDetail.module.css";
import { useNavigate } from "react-router-dom";


const approaches = [
  {
    icon: <FaUsers size={22} />,
    title: "Accessible Opportunities",
    desc: "Verified international job openings across multiple countries, easy to explore and apply.",
  },
  {
    icon: <FaGlobe size={22} />,
    title: "Global Reach",
    desc: "Our network connects candidates with employers worldwide, creating opportunities beyond borders.",
  },
  {
    icon: <FaShieldAlt size={22} />,
    title: "Transparent Process",
    desc: "Every requirement, timeline, and expectation is disclosed clearly before you proceed.",
  },
  {
    icon: <FaHandsHelping size={22} />,
    title: "Guidance & Support",
    desc: "From application to departure, we walk with you through every stage of the process.",
  },
  {
    icon: <FaBalanceScale size={22} />,
    title: "Fair Opportunities",
    desc: "Ethical recruitment promoting equal chances and responsible practices for all candidates.",
  },
  {
    icon: <FaAward size={22} />,
    title: "Trusted Service",
    desc: "Reliability and honesty are our foundation, giving you confidence at every step.",
  },
];

const values = [
  {
    icon: <FaPeopleArrows size={20} />,
    title: "Accessibility",
    desc: "Making opportunities easy to understand for everyone.",
  },
  {
    icon: <FaBalanceScale size={20} />,
    title: "Fairness",
    desc: "Equal and ethical treatment in every recruitment process.",
  },
  {
    icon: <FaBrain size={20} />,
    title: "Clarity",
    desc: "Clear, accurate information that guides informed decisions.",
  },
  {
    icon: <FaAward size={20} />,
    title: "Trust",
    desc: "Confidence built through honesty and consistent support.",
  },
];

const stats = [
  { target: 15, label: "Years of Service", suffix: "+" },
  { target: 2000, label: "People Supported", suffix: "+" },
  { target: 3, label: "Countries Covered", suffix: "" },
  { target: 100, label: "Transparency", suffix: "%" },
];

const offerings = [
  "Access to verified international job opportunities",
  "Clear explanation of requirements and application steps",
  "Guidance to help you prepare for working abroad",
  "Reliable updates and communication throughout",
  "Support at every stage of your journey",
  "Simple and transparent process visibility",
];

const delayClass = [
  styles.delay0,
  styles.delay1,
  styles.delay2,
  styles.delay3,
  styles.delay4,
  styles.delay5,
];


function Counter({ target, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const step = target / (1600 / 16);
          let cur = 0;
          const t = setInterval(() => {
            cur += step;
            if (cur >= target) {
              setCount(target);
              clearInterval(t);
            } else setCount(Math.floor(cur));
          }, 16);
        }
      },
      { threshold: 0.4 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className={styles.counterWrap}>
      <span className={styles.counterNum}>
        {count}
        {suffix}
      </span>
    </div>
  );
}


function useFadeIn(threshold = 0.08) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, visible];
}


function fadeClass(visible, delayIdx = 0) {
  return [
    visible ? styles.fadeVisible : styles.fadeHidden,
    delayClass[Math.min(delayIdx, delayClass.length - 1)],
  ].join(" ");
}


function SectionLabel({ children }) {
  return (
    <div className={styles.sectionLabelWrap}>
      <div className={styles.sectionLabelLine} />
      <span className={styles.sectionLabelText}>{children}</span>
    </div>
  );
}


const Divider = () => <div className={styles.divider} />;


function Card({ children, className = "", noHover = false }) {
  return (
    <div
      className={`${noHover ? styles.cardNoHover : styles.card} ${className}`}
    >
      {children}
    </div>
  );
}


export default function AboutDetail() {
  const [heroRef, heroVisible] = useFadeIn(0.05);
  const [reachRef, reachVisible] = useFadeIn(0.1);
  const [offerRef, offerVisible] = useFadeIn(0.1);
  const [approachRef, approachVisible] = useFadeIn(0.1);
  const [valuesRef, valuesVisible] = useFadeIn(0.1);
  const [impactRef, impactVisible] = useFadeIn(0.1);
  const navigate = useNavigate();
  const navigateToContact = () => {
    navigate("/#contact");
  }

  return (
    <div className={styles.page}>
      {/* ══ HERO ══ */}
      <section ref={heroRef} className={styles.heroSection}>
        <div className="container">
          <div className="row align-items-start g-3">
            {/* Left col */}
            <div className={`col-lg-7 ${fadeClass(heroVisible, 0)}`}>
              <SectionLabel>Our Story</SectionLabel>
              <h1 className={styles.heroHeading}>
                Connecting <span className={styles.heroBrand}>Ethiopia</span> to
                the World
              </h1>
              <p className={styles.heroBody}>
                We open doors to international employment by connecting
                Ethiopian employees with trusted, verified employers across the
                Middle East and beyond. As a licensed overseas agency, every
                step — from application to deployment — is simple, transparent,
                and accessible.
              </p>
              <p className={styles.heroBody}>
                Whether entering the workforce for the first time or seeking
                better opportunities overseas, we provide end-to-end support:
                document prep, job matching, visa processing, contract
                verification, and pre-departure guidance.
              </p>
              <p className={styles.heroBodyLast}>
                Our commitment is transparency, accuracy, and employee
                protection — so every candidate travels safely, knows their
                rights, and arrives with confidence.
              </p>
            </div>

            {/* Right col — quote box */}
            <div className={`col-lg-5 ${fadeClass(heroVisible, 3)}`}>
              <div className={styles.quoteBox}>
                <FaQuoteLeft size={18} className={styles.quoteIcon} />
                <p className={styles.quoteText}>
                  "Our goal is to ensure every candidate travels safely,
                  understands their rights, and reaches their employer with
                  confidence and peace of mind."
                </p>
                <div className={styles.quoteLine}>
                  <div className={styles.quoteLineBar} />
                  <span className={styles.quoteLineLabel}>
                    Founder &amp; CEO
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* ══ OUR REACH ══ */}
      <section ref={reachRef} className={styles.reachSection}>
        <div className="container">
          <div
            className={`${styles.sectionHeadWrap} ${fadeClass(reachVisible, 0)}`}
          >
            <SectionLabel>Impact</SectionLabel>
            <h2 className={styles.sectionHeading}>Our Reach</h2>
          </div>

          <div className={styles.statsGrid}>
            {stats.map((s, i) => (
              <div
                key={i}
                className={`${styles.statCard} ${fadeClass(reachVisible, i)}`}
              >
                <div className={styles.statNumber}>
                  <Counter target={s.target} suffix={s.suffix} />
                </div>
                <p className={styles.statLabel}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ══ WHAT WE OFFER ══ */}
      <section ref={offerRef} className={styles.offerSection}>
        <div className="container">
          <div
            className={`${styles.sectionHeadWrap} ${fadeClass(offerVisible, 0)}`}
          >
            <SectionLabel>Services</SectionLabel>
            <h2 className={styles.sectionHeading}>What We Offer</h2>
          </div>

          <div className="row g-2">
            {offerings.map((text, idx) => (
              <div
                key={idx}
                className={`col-md-6 ${fadeClass(offerVisible, Math.min(idx, 5))}`}
              >
                <div className={styles.offerItem}>
                  <div className={styles.offerIcon}>
                    <FaCheckCircle size={12} color="var(--brand)" />
                  </div>
                  <span className={styles.offerText}>{text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ══ OUR APPROACH ══ */}
      <section ref={approachRef} className={styles.approachSection}>
        <div className="container">
          <div
            className={`${styles.sectionHeadWrap} ${fadeClass(approachVisible, 0)}`}
          >
            <SectionLabel>Methodology</SectionLabel>
            <h2 className={styles.sectionHeading}>Our Approach</h2>
          </div>

          <div className="row g-2">
            {approaches.map((item, idx) => (
              <div
                key={idx}
                className={`col-sm-6 col-lg-4 ${fadeClass(approachVisible, Math.min(idx, 5))}`}
              >
                <Card className={`${styles.cardPad} ${styles.cardFull}`}>
                  <div className={styles.approachIconBox}>{item.icon}</div>
                  <h6 className={styles.approachTitle}>{item.title}</h6>
                  <p className={styles.approachDesc}>{item.desc}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ══ OUR VALUES ══ */}
      <section ref={valuesRef} className={styles.valuesSection}>
        <div className="container">
          <div
            className={`${styles.sectionHeadWrap} ${fadeClass(valuesVisible, 0)}`}
          >
            <SectionLabel>Principles</SectionLabel>
            <h2 className={styles.sectionHeading}>Our Values</h2>
          </div>

          <div className="row g-2">
            {values.map((v, idx) => (
              <div
                key={idx}
                className={`col-sm-6 col-lg-3 ${fadeClass(valuesVisible, idx)}`}
              >
                <Card
                  className={`${styles.cardPad} ${styles.cardFull} text-center`}
                >
                  <div className={styles.valueNum}>
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div className={`${styles.valueIconBox} mx-auto`}>
                    {v.icon}
                  </div>
                  <h6 className={styles.valueTitle}>{v.title}</h6>
                  <p className={styles.valueDesc}>{v.desc}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ══ OUR IMPACT ══ */}
      <section ref={impactRef} className={styles.impactSection}>
        <div className="container">
          <div
            className={`${styles.sectionHeadWrap} ${fadeClass(impactVisible, 0)}`}
          >
            <SectionLabel>Results</SectionLabel>
            <h2 className={styles.sectionHeading}>Our Impact</h2>
          </div>

          {/* Main impact card */}
          <Card
            noHover
            className={`${styles.impactPad} ${fadeClass(impactVisible, 1)}`}
          >
            <div className="row align-items-start g-3">
              {/* Text */}
              <div className="col-lg-6">
                <p className={styles.impactBody}>
                  We play a vital role in creating life-changing opportunities
                  by connecting Ethiopian employees with secure, verified
                  employment abroad. Through structured, transparent processes
                  we help individuals move from local job limitations to stable
                  international careers.
                </p>
                <p className={styles.impactBody}>
                  Beyond job placement, we ensure every candidate clearly
                  understands each step — documentation, visa processing,
                  contract signing, and deployment. Our support reduces
                  confusion and prevents exploitation.
                </p>
                <p className={styles.impactBodyLast}>
                  Impact is measured not only by successful deployments, but by
                  the confidence, safety, and long-term success of every
                  employee we serve.
                </p>
              </div>

              {/* Metrics */}
              <div className="col-lg-6">
                <div className="row g-2">
                  {[
                    { label: "Safe Deployments", pct: 98 },
                    { label: "Document Success", pct: 96 },
                    { label: "Client Satisfaction", pct: 94 },
                    { label: "Transparent Process", pct: 100 },
                  ].map((bar, i) => (
                    <div key={i} className="col-6">
                      <div className={styles.metricBox}>
                        <div className={styles.metricNum}>{bar.pct}%</div>
                        <div className={styles.metricLabel}>
                          {bar.label.toUpperCase()}
                        </div>
                        <div className={styles.metricTrack}>
                          <div
                            className={styles.metricBar}
                            style={{
                              width: impactVisible ? `${bar.pct}%` : "0%",
                              transition: `width 1.1s ease ${i * 0.13 + 0.2}s`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* CTA */}
          <div className={fadeClass(impactVisible, 5)}>
            <div className={styles.ctaBox}>
              <div>
                <h5 className={styles.ctaTitle}>
                  Ready to start your journey?
                </h5>
                <p className={styles.ctaBody}>
                  Join thousands of Ethiopians who've built international
                  careers with us.
                </p>
              </div>
              <button className={styles.ctaBtn} onClick={navigateToContact}>
                Get Started <FaArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
