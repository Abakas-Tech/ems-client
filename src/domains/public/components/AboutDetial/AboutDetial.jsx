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
    desc: "We provide verified international job openings, making it easy for Ethiopian workers to find suitable positions across multiple countries.",
  },
  {
    icon: <FaGlobe size={45} />,
    title: "Global Reach",
    desc: "Our network connects candidates with employers worldwide, creating career opportunities beyond borders.",
  },
  {
    icon: <FaShieldAlt size={45} />,
    title: "Transparent Process",
    desc: "We maintain clarity and honesty at every step, ensuring candidates understand requirements, timelines, and expectations.",
  },
  {
    icon: <FaHandsHelping size={45} />,
    title: "Guidance & Support",
    desc: "From applications to pre-departure preparation, we guide candidates throughout the entire process, building confidence and readiness.",
  },
  {
    icon: <FaBalanceScale size={45} />,
    title: "Fair Opportunities",
    desc: "We adhere to ethical and responsible recruitment practices, offering equal chances for all applicants.",
  },
  {
    icon: <FaAward size={45} />,
    title: "Trusted Service",
    desc: "Reliability and transparency are at our core, providing peace of mind as candidates pursue international careers.",
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
    <div className="container mt-5 py-5">
      {/* HERO */}
      <div className="mb-5">
        <h2 className="fw-bold text-info mb-3">About Us</h2>

        <p className="mb-4">
          We open doors to international employment opportunities by connecting
          Ethiopian workers with trusted and verified employers across the
          Middle East and other global destinations. As a licensed overseas
          employment agency, our mission is to make every step of the
          journey—from application to deployment—simple, transparent, and
          accessible, so candidates can confidently plan and advance their
          careers abroad.
        </p>

        <p className="mb-4">
          Whether you are entering the workforce for the first time or seeking
          better opportunities overseas, we provide end-to-end support tailored
          to your needs. From document preparation and job matching to visa
          processing, contract verification, and pre-departure guidance, our
          experienced team ensures you are fully prepared and informed at every
          stage of the process.
        </p>

        <p className="mb-4">
          We are committed to transparency, accuracy, and worker protection. By
          providing clear information, regular updates, and practical guidance,
          we help reduce uncertainty and build trust throughout the journey. Our
          goal is to ensure every candidate travels safely, understands their
          rights, and reaches their employer with confidence and peace of mind.
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
            "Clear guidance on requirements and application steps",
            "Support to prepare for working abroad",
            "Reliable updates and communication",
            "Continuous assistance throughout the journey",
            "Transparent and easy-to-follow process",
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
              desc: "We provide equal and ethical opportunities for all, promoting trust and responsibility in every process.",
            },
            {
              icon: <FaBrain size={40} />,
              title: "Clarity",
              desc: "We offer clear, concise, and accurate information to guide informed decisions effectively.",
            },
            {
              icon: <FaAward size={40} />,
              title: "Trust",
              desc: "We build confidence through honesty, transparency, and consistent support.",
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
          We create life-changing opportunities by connecting Ethiopian workers
          with secure and verified international employment. Our structured and
          transparent processes help individuals move from local job limitations
          to stable overseas careers, improving income, experience, and quality
          of life.
        </p>

        <p className="mb-4">
          Beyond job placement, we ensure every candidate fully understands each
          step—from documentation and visa processing to contract signing and
          deployment. Our ongoing support reduces confusion, prevents
          exploitation, and ensures safer overseas employment.
        </p>

        <p className="mb-4">
          By providing accurate information, timely updates, and hands-on
          guidance, we minimize delays and uncertainties. Our impact is measured
          not only by successful placements but by the confidence, safety, and
          long-term success of the workers we serve.
        </p>
      </div>
    </div>
  );
}

export default AboutDetail;
