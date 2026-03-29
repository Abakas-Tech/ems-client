import { FaArrowRight } from "react-icons/fa";
import about from "../../../../assets/img/logo/logo.png";
import { useNavigate } from "react-router-dom";

function About() {
  const navigate = useNavigate();

  const goToAboutDetail = () => {
    navigate("/about-detail");
  };

  const features = [
    "Explore Verified Opportunities",
    "Understand the Process Step-by-Step",
    "Clear Requirements & Guidance",
    "Track Your Journey with Confidence",
    "Reliable Support & Communication",
    "Stay Informed at Every Stage",
  ];

  return (
    <section id="about">
      <div className="container">
        <div className="row g-5 align-items-stretch">
          {/* Image */}
          <div className="col-lg-6 d-flex">
            <img
              src={about}
              alt="About Our Agency"
              className="img-fluid w-100 h-100"
              style={{ objectFit: "cover", borderRadius: "0.5rem" }}
            />
          </div>

          {/* Content */}
          <div className="col-lg-6 d-flex flex-column justify-content-center">
            <h2 className="mb-4 fw-bold">About us</h2>
            <p className="mb-4">
              We help people find trusted international job opportunities. Every
              step is simple and clear, so you always know what to do next.
            </p>

            <p className="mb-4">
              From checking requirements to preparing your applications, we
              guide you with practical advice and useful information to make
              your journey smooth and confident.
            </p>

            <p className="mb-4">
              We stay with you all the way, giving updates and support, so
              working abroad becomes easy, fair, and stress-free for everyone.
            </p>
            {/* Features */}
            <div className="row gy-2 gx-4 mb-4">
              {features.map((feature, idx) => (
                <div className="col-sm-6" key={idx}>
                  <p className="mb-0">
                    <FaArrowRight className="text-info me-2" />
                    {feature}
                  </p>
                </div>
              ))}
            </div>

            <button
              className="btn bg-info text-white w-35"
              onClick={goToAboutDetail}
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
