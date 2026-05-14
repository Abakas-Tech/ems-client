import { useEffect, useState } from "react";
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
} from "react-icons/fa";
import styles from "./AboutDetail.module.css";

const brandColor = "#4484BA";

const publicFeatures = [
  {
    icon: <FaUsers size={45} />,
    title: "Accessible Opportunities",
    desc: "We provide verified international job openings, making it easy for individuals to find suitable positions across multiple countries.",
  },
  {
    icon: <FaGlobe size={45} />,
    title: "Global Reach",
    desc: "Our network connects people with employers worldwide, creating opportunities beyond borders for career growth and experience.",
  },
  {
    icon: <FaShieldAlt size={45} />,
    title: "Transparent Process",
    desc: "Every step is clear and honest. We make sure you know the requirements, timelines, and expectations before you proceed.",
  },
  {
    icon: <FaHandsHelping size={45} />,
    title: "Guidance & Support",
    desc: "From applications to preparation, we guide you through the process, helping you feel confident and ready at every stage.",
  },
  {
    icon: <FaBalanceScale size={45} />,
    title: "Fair Opportunities",
    desc: "We ensure ethical and responsible recruitment practices, promoting equal chances for all candidates.",
  },
  {
    icon: <FaAward size={45} />,
    title: "Trusted Service",
    desc: "Reliability and transparency are at our core, giving you peace of mind as you take steps toward your international career.",
  },
];

const Counter = ({ target, label }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 20);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 20);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <div className="text-center">
      <h2 className=" fw-bold" style={{ color: brandColor }}>
        {count}+
      </h2>
      <p className="mb-0">{label}</p>
    </div>
  );
};

export default function AboutDetail() {
  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, []);

  return (
    <div className="container mt-5 py-4">
      {/* HERO */}
      <div className="mb-5">
        <h2 className="fw-bold  mb-3" style={{ color: brandColor }}>
          About Us
        </h2>

        <p className="mb-4">
          We open doors to international employment opportunities by connecting
          Ethiopian employees with trusted and verified employers across the
          Middle East and other global destinations. As a licensed overseas
          employment agency, our mission is to make every step of the
          journey—from application to deployment—simple, transparent, and
          accessible, so each candidate can confidently plan and pursue a career
          abroad.
        </p>
        <p className="mb-4">
          Whether you are entering the workforce for the first time or seeking
          better opportunities overseas, we provide end-to-end support tailored
          to your needs. From document preparation and job matching to visa
          processing, contract verification, and pre-departure guidance, our
          experienced team ensures that you are well-prepared and informed at
          every stage of the process.
        </p>
        <p className="mb-4">
          We are committed to transparency, accuracy, and employees protection.
          By providing clear information, regular updates, and practical
          guidance, we help reduce uncertainty and build trust throughout the
          journey. Our goal is to ensure that every candidate travels safely,
          understands their rights, and reaches their employer with confidence
          and peace of mind.
        </p>
      </div>

      {/* Our Reach */}
      <div className="mb-5 pt-4 border-top">
        <h3 className=" mb-4" style={{ color: brandColor }}>
          Our Reach
        </h3>

        <div className="row g-4">
          <div className="col-md-3 col-6">
            <Counter target={15} label="Years of Service" />
          </div>
          <div className="col-md-3 col-6">
            <Counter target={2000} label="People Supported" />
          </div>
          <div className="col-md-3 col-6">
            <Counter target={3} label="Countries Covered" />
          </div>
          <div className="col-md-3 col-6">
            <Counter target={100} label="Transparency %" />
          </div>
        </div>
      </div>

      {/* What We Offer */}
      <div className="mb-5 pt-4">
        <h3 className=" mb-4" style={{ color: brandColor }}>
          What We Offer
        </h3>

        <div className="row g-3">
          {[
            "Access to verified international job opportunities",
            "Clear explanation of requirements and application steps",
            "Guidance to help you prepare for working abroad",
            "Reliable updates and communication",
            "Support throughout your journey",
            "Simple and transparent process visibility",
          ].map((text, idx) => (
            <div className="col-12 col-md-6 d-flex align-items-start" key={idx}>
              <FaCheckCircle
                className=" me-2 mt-1"
                size={20}
                style={{ color: brandColor }}
              />
              <p className="mb-0">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Our Approach - Slider */}
      <div className="mb-5 pt-4 border-top">
        <h3 className="mb-4" style={{ color: brandColor }}>
          Our Approach
        </h3>
        <div className={styles.scrollWrapper}>
          <div className={styles.scrollTrack}>
            {[...publicFeatures, ...publicFeatures].map((feature, index) => (
              <div className={styles.featureCard} key={index}>
                <div className="text-center p-4">
                  <div
                    className={styles.iconWrapper}
                    style={{ color: brandColor }}
                  >
                    {feature.icon}
                  </div>
                  <h6 className="fw-bold mb-3">{feature.title}</h6>
                  <p className="small mb-0">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="mb-5 pt-4 border-top">
        <h3 className=" mb-4" style={{ color: brandColor }}>
          Our Values
        </h3>

        <div className="row g-4">
          {[
            {
              icon: <FaPeopleArrows size={40} />,
              title: "Accessibility",
              desc: "We make opportunities easy to understand, ensuring everyone can access the information they need.",
            },
            {
              icon: <FaBalanceScale size={40} />,
              title: "Fairness",
              desc: "Equal and ethical opportunities for all, promoting trust and responsibility in every process.",
            },
            {
              icon: <FaBrain size={40} />,
              title: "Clarity",
              desc: "Providing clear, simple, and accurate information to guide decisions effectively.",
            },
            {
              icon: <FaAward size={40} />,
              title: "Trust",
              desc: "Building confidence through honesty, transparency, and consistent support.",
            },
          ].map((item, idx) => (
            <div className="col-md-6" key={idx}>
              <div className="d-flex">
                <div className=" me-3" style={{ color: brandColor }}>
                  {item.icon}
                </div>
                <div>
                  <h6 className="fw-bold">{item.title}</h6>
                  <p className="small">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Our Impact */}
      <div className="pt-4 border-top">
        <h3 className=" mb-3" style={{ color: brandColor }}>
          Our Impact
        </h3>

        <p className="mb-4">
          We play a vital role in creating life-changing opportunities by
          connecting Ethiopian employees with secure and verified employment
          abroad. Through our structured and transparent processes, we help
          individuals move from local job limitations to stable international
          careers, improving their income, experience, and quality of life.
        </p>
        <p className="mb-4">
          Beyond job placement, we ensure every candidate clearly understands
          each step of the journey—from documentation and visa processing to
          contract signing and final deployment. Our continuous support reduces
          confusion, prevents exploitation, and builds trust, making overseas
          employment safer and more reliable.
        </p>
        <p className="mb-4">
          By providing accurate information, timely updates, and hands-on
          guidance, we minimize delays and uncertainties in the process. Our
          impact is measured not only by successful deployments, but by the
          confidence, safety, and long-term success of the employees we serve.
        </p>
      </div>
    </div>
  );
}
