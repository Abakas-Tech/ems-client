import { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  FaUniversity,
  FaLightbulb,
  FaUsers,
  FaLaptopCode,
  FaGlobe,
  FaChartLine,
  FaShieldAlt,
  FaHandsHelping,
  FaBalanceScale,
  FaAward,
  FaPeopleArrows,
  FaBrain,
} from "react-icons/fa";

// Mission items
const missions = [
  {
    icon: <FaUniversity size={45} />,
    title: "Licensed & Compliant",
    desc: "Operating under international labor regulations and government-approved recruitment standards.",
  },
  {
    icon: <FaLightbulb size={45} />,
    title: "Tailored Deployment",
    desc: "Customized workforce solutions based on employer needs and market demand.",
  },
  {
    icon: <FaUsers size={45} />,
    title: "Worker Protection",
    desc: "Ensuring fair contracts, safety, and dignity for every worker abroad.",
  },
  {
    icon: <FaLaptopCode size={45} />,
    title: "Digital Recruitment",
    desc: "Modern systems for faster screening, documentation, and deployment.",
  },
  {
    icon: <FaGlobe size={45} />,
    title: "Global Opportunities",
    desc: "Providing access to jobs across the Middle East, Europe, and Asia.",
  },
  {
    icon: <FaChartLine size={45} />,
    title: "Proven Placement Success",
    desc: "Consistent delivery of skilled manpower to international employers.",
  },
];

// Slider settings
const settings = {
  dots: true,
  infinite: true,
  arrows: false,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
  autoplay: true,
  responsive: [
    {
      breakpoint: 992, // tablet
      settings: { slidesToShow: 2, slidesToScroll: 1 },
    },
    {
      breakpoint: 576, // mobile
      settings: { slidesToShow: 1, slidesToScroll: 1 },
    },
  ],
};

// Counter component
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
  // Fix slider recalculation on mount
  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, []);

  return (
    <div className="container py-5">
      {/* HERO */}
      <div className="row align-items-center mb-5">
        <div>
          <h2 className="fw-bold text-info mb-3">Overseas Employment Agency</h2>
          <p>
            We are a government-recognized overseas employment agency
            specializing in recruiting, training, and deploying skilled and
            semi-skilled workers to international markets.
          </p>
          <p>
            Our agency bridges the gap between global employers and local talent
            by ensuring ethical recruitment, transparent processes, and full
            worker support before and after deployment.
          </p>
        </div>
      </div>

      {/* EXPERIENCE / STATS */}
      <div className="mb-5 pt-4 border-top">
        <h3 className="text-info mb-4">Our Experience</h3>
        <div className="row g-4">
          <div className="col-md-3 col-6">
            <Counter target={12} label="Years Experience" />
          </div>
          <div className="col-md-3 col-6">
            <Counter target={8500} label="Workers Deployed" />
          </div>
          <div className="col-md-3 col-6">
            <Counter target={25} label="Partner Countries" />
          </div>
          <div className="col-md-3 col-6">
            <Counter target={120} label="Global Employers" />
          </div>
        </div>
      </div>

      {/* STORY */}
      <div className="mb-5">
        <h3 className="text-info mb-3">Our Journey</h3>
        <p>
          Since our establishment, we have successfully deployed thousands of
          workers to countries such as UAE, Saudi Arabia, Qatar, and Europe. We
          specialize in sectors including construction, hospitality, healthcare,
          and domestic services.
        </p>
        <p>
          Our growth is built on trust, compliance, and strong international
          partnerships. We ensure every worker is properly trained, documented,
          and prepared for overseas employment.
        </p>
      </div>

      {/* MISSION SLIDER */}
      <div className="mb-5 pt-4 border-top">
        <h3 className="text-info mb-4">Our Approach</h3>
        <p className="mb-4">
          We follow a structured recruitment process that ensures quality,
          compliance, and worker safety from sourcing to deployment.
        </p>

        <Slider {...settings}>
          {missions.map((item, i) => (
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

      {/* WHY CHOOSE US */}
      <div className="mb-5 pt-4 border-top">
        <h3 className="text-info mb-4">Why Choose Us</h3>
        <div className="row g-4">
          {[
            {
              icon: <FaHandsHelping size={40} />,
              title: "Ethical Recruitment",
              desc: "No exploitation, no hidden fees — full transparency for workers and employers.",
            },
            {
              icon: <FaShieldAlt size={40} />,
              title: "Government Compliance",
              desc: "Fully aligned with labor laws and international standards.",
            },
            {
              icon: <FaGlobe size={40} />,
              title: "Wide Global Network",
              desc: "Strong employer partnerships across multiple countries.",
            },
            {
              icon: <FaChartLine size={40} />,
              title: "High Success Rate",
              desc: "Efficient deployment with high employer satisfaction.",
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

      {/* CORE VALUES */}
      <div className="mb-5 pt-4 border-top">
        <h3 className="text-info mb-4">Core Values</h3>
        <div className="row g-4">
          {[
            {
              icon: <FaBalanceScale size={40} />,
              title: "Integrity",
              desc: "Honest processes and transparent communication.",
            },
            {
              icon: <FaPeopleArrows size={40} />,
              title: "Partnership",
              desc: "Building long-term relationships with employers and workers.",
            },
            {
              icon: <FaBrain size={40} />,
              title: "Innovation",
              desc: "Improving recruitment using modern tools and systems.",
            },
            {
              icon: <FaAward size={40} />,
              title: "Excellence",
              desc: "Delivering high-quality manpower solutions consistently.",
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
        <p>
          We have transformed thousands of lives by connecting workers to
          better-paying jobs abroad, supporting families and contributing to
          national economic growth.
        </p>
        <p>
          Our commitment is to safe migration, ethical recruitment, and
          sustainable employment opportunities worldwide.
        </p>
      </div>
    </div>
  );
}

export default AboutDetail;
