import {
  FaUniversity,
  FaLightbulb,
  FaUsers,
  FaLaptopCode,
  FaGlobe,
  FaChartLine,
  FaShieldAlt,
  FaHandsHelping,
  FaAward,
  FaPeopleArrows,
  FaBrain,
} from "react-icons/fa";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

// Mission Items - static
const missions = [
  {
    icon: <FaUniversity size={50} className="text-white" />,
    title: "Company Background",
    description:
      "Founded in 2008, we connect skilled workers with global employment opportunities ethically.",
  },
  {
    icon: <FaLightbulb size={50} className="text-white" />,
    title: "Mission",
    description:
      "To provide reliable workforce solutions while ensuring ethical practices and client satisfaction.",
  },
  {
    icon: <FaGlobe size={50} className="text-white" />,
    title: "Vision",
    description:
      "To be recognized globally for ethical recruitment and measurable impact.",
  },
  {
    icon: <FaShieldAlt size={50} className="text-white" />,
    title: "Ethical Employment",
    description:
      "We follow strict labor laws and ethical recruitment policies to protect every worker.",
  },
];

// Core Values - static
const values = [
  {
    icon: <FaBrain size={50} className="text-white" />,
    title: "Innovation",
    description:
      "Embrace creativity and forward-thinking solutions in workforce management.",
  },
  {
    icon: <FaPeopleArrows size={50} className="text-white" />,
    title: "Collaboration",
    description:
      "Teamwork and strong relationships drive our agency’s success.",
  },
  {
    icon: <FaBalanceScale size={50} className="text-white" />,
    title: "Integrity",
    description:
      "We uphold honesty, transparency, and ethical standards in every project.",
  },
  {
    icon: <FaAward size={50} className="text-white" />,
    title: "Excellence",
    description:
      "Strive for the highest quality in service delivery and workforce placement.",
  },
];

// Experience Items - slider
const experience = [
  {
    icon: <FaAward size={50} className="text-white" />,
    title: "Years of Experience",
    value: "15+",
  },
  {
    icon: <FaUsers size={50} className="text-white" />,
    title: "Trusted Clients",
    value: "120+",
  },
  {
    icon: <FaHandsHelping size={50} className="text-white" />,
    title: "Workers Processed",
    value: "5,000+",
  },
  {
    icon: <FaChartLine size={50} className="text-white" />,
    title: "Success Stories",
    value: "250+",
  },
  {
    icon: <FaLaptopCode size={50} className="text-white" />,
    title: "Global Reach",
    value: "30 Countries",
  },
];

const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
  autoplay: true,
  responsive: [
    { breakpoint: 1200, settings: { slidesToShow: 3 } },
    { breakpoint: 992, settings: { slidesToShow: 2 } },
    { breakpoint: 576, settings: { slidesToShow: 1 } },
  ],
};

function AboutDetail() {
  const navigate = useNavigate();
  const goToContact = () => navigate("/contact");

  return (
    <Container fluid className="py-5 bg-light">
      {/* About Us Section */}
      <Container className="mb-5">
        <h2 className="text-info mb-4">About Us</h2>
        <p>
          Established in 2008, our agency connects skilled workers with
          legitimate employment opportunities globally. We focus on ethical
          recruitment, transparency, and long-term client satisfaction.
        </p>
        <p>
          Operating in over 30 countries, we provide workforce solutions for
          multiple industries including healthcare, engineering, and technology,
          building credibility through experience and reliability.
        </p>
      </Container>

      {/* Mission Section */}
      <Container className="mb-5">
        <h3 className="text-info mb-4">Our Mission</h3>
        <Row className="g-4">
          {missions.map((mission, idx) => (
            <Col key={idx} lg={3} md={6} sm={12}>
              <Card className="bg-info text-white h-100 p-3 text-center shadow-sm">
                <div className="mb-3">{mission.icon}</div>
                <Card.Title>{mission.title}</Card.Title>
                <Card.Text>{mission.description}</Card.Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Core Values Section */}
      <Container className="mb-5">
        <h3 className="text-info mb-4">Our Core Values</h3>
        <Row className="g-4">
          {values.map((value, idx) => (
            <Col key={idx} lg={3} md={6} sm={12}>
              <Card className="bg-info text-white h-100 p-3 text-center shadow-sm">
                <div className="mb-3">{value.icon}</div>
                <Card.Title>{value.title}</Card.Title>
                <Card.Text>{value.description}</Card.Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Experience Section (Slider) */}
      <Container className="mb-5">
        <h3 className="text-info mb-4">Our Experience</h3>
        <Slider {...sliderSettings}>
          {experience.map((exp, idx) => (
            <Card
              key={idx}
              className="bg-info text-white p-4 mx-2 text-center shadow-sm"
            >
              <div className="mb-3">{exp.icon}</div>
              <h4>{exp.value}</h4>
              <Card.Title>{exp.title}</Card.Title>
            </Card>
          ))}
        </Slider>
        <div className="text-center mt-4">
          <Button variant="info" size="lg" onClick={goToContact}>
            Contact Us
          </Button>
        </div>
      </Container>
    </Container>
  );
}

export default AboutDetail;
