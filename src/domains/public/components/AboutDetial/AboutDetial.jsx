import { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
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

const settings = {
  dots: true,
  infinite: true,
  arrows: false,
  speed: 500,
  slidesToShow: 3,
  autoplay: true,
  responsive: [
    { breakpoint: 992, settings: { slidesToShow: 2 } },
    { breakpoint: 576, settings: { slidesToShow: 1 } },
  ],
};

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
      <h2 className="text-info fw-bold">{count}+</h2>
      <p className="mb-0">{label}</p>
    </div>
  );
};

function AboutDetail() {
  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, []);

  return (
    <div className="container mt-3 py-5">
      {/* HERO */}
      <div className="mb-5">
        <h2 className="fw-bold text-info mb-3">About Us</h2>

        <p className="mb-4">
          We open doors to international opportunities by connecting individuals
          with trusted employers around the world. Our mission is to make every
          step simple, clear, and accessible so you can confidently plan your
          career abroad.
        </p>

        <p className="mb-4">
          Whether you are just starting your professional journey or preparing
          for a new chapter in your career, we provide the guidance, resources,
          and support you need to navigate each stage with clarity.
        </p>

        <p className="mb-4">
          By offering accurate information and practical tips, we ensure that
          each candidate understands the process fully, reducing uncertainty and
          building confidence for the path ahead.
        </p>
      </div>

      {/* TRUST / STATS */}
      <div className="mb-5 pt-4 border-top">
        <h3 className="text-info mb-4">Our Reach</h3>

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

      {/* WHAT WE OFFER */}
      <div className="mb-5 pt-4">
        <h3 className="text-info mb-4">What We Offer</h3>

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
              <FaCheckCircle className="text-info me-2 mt-1" size={20} />
              <p className="mb-0">{text}</p>
            </div>
          ))}
        </div>
      </div>
      {/* SLIDER */}
      <div className="mb-5 pt-4 border-top">
        <h3 className="text-info mb-4">Our Approach</h3>

        <Slider {...settings}>
          {publicFeatures.map((item, i) => (
            <div key={i}>
              <div className="text-center p-3">
                <div className="mb-3 text-info">{item.icon}</div>
                <h6 className="fw-bold">{item.title}</h6>
                <p className="small">{item.desc}</p>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* VALUES */}
      <div className="mb-5 pt-4 border-top">
        <h3 className="text-info mb-4">Our Values</h3>

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
                <div className="text-info me-3">{item.icon}</div>
                <div>
                  <h6 className="fw-bold">{item.title}</h6>
                  <p className="small">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* IMPACT */}
      <div className="pt-4 border-top">
        <h3 className="text-info mb-3">Our Impact</h3>

        <p className="mb-4">
          We simplify the journey to working abroad by providing clear,
          reliable, and actionable information. This empowers individuals to
          make informed decisions and pursue opportunities with confidence.
        </p>

        <p className="mb-4">
          Beyond offering job opportunities, we ensure every person understands
          the process and feels supported at every stage. Our mission is to make
          working internationally fair, transparent, and stress-free.
        </p>

        <p className="mb-4">
          By combining guidance, updates, and practical tips, we reduce
          uncertainty and help individuals successfully achieve their
          international career goals.
        </p>
      </div>
    </div>
  );
}

export default AboutDetail;
