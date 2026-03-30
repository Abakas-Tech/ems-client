import { FaArrowRight } from "react-icons/fa";
import about from "../../../../assets/img/logo/logo.png";
import { useNavigate } from "react-router-dom";

function About() {
  const navigate = useNavigate();

  const goToAboutDetail = () => {
    navigate("/about-detail");
  };

  const features = [
    "Verified overseas job opportunities",
    "Full visa & document processing",
    "Contract verification with employers",
    "Flight & deployment coordination",
    "Pre-departure orientation & guidance",
    "Continuous applicant support",
  ];

  return (
    <section id="about" style={{ padding: "100px 0" }} className="pb-0">
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
              <span style={{ color: "#19699B" }} className="fw-bold">
                Globa Trust Overseas Employment Agent Plc
              </span>{" "}
              is a licensed recruitment agency dedicated to connecting Ethiopian
              workers with verified international job opportunities, especially
              in Middle Eastern countries.
            </p>

            <p className="mb-4">
              We manage the full employment process including job matching,
              document preparation, visa processing, LMIS/work permits, contract
              verification, and flight arrangements—ensuring a smooth and legal
              deployment process.
            </p>

            <p className="mb-4">
              Our goal is to make overseas employment safe, transparent, and
              accessible by supporting applicants at every step until they
              successfully reach their employers abroad.
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
              className="btn bg-info text-white w-40 fw-bold"
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
