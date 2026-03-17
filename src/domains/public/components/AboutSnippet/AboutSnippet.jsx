import { FaArrowRight } from "react-icons/fa";
import about from "../../../../assets/img/Banner/banner.jpg";
import { useNavigate } from "react-router-dom";
import ReadButton from "../../../../shared/components/ReadButton/ReadButton";

function About() {
  const navigate = useNavigate();

  const goToAboutDetail = () => {
    navigate("/about-detail");
  };

  return (
    <section id="about" className="py-5">
      <div className="container">
        {/* Row with stretch to equalize column heights */}
        <div className="row g-5 align-items-stretch">
          {/* Image Section */}
          <div className="col-lg-6 d-flex">
            <img
              src={about}
              alt="About Selam Academy"
              className="img-fluid w-100 h-100"
              style={{ objectFit: "cover", borderRadius: "0.5rem" }}
            />
          </div>

          {/* Content Section */}
          <div className="col-lg-6 d-flex flex-column justify-content-center">
            <h2 className="mb-4 fw-bold">Selam Academy</h2>
            <p className="mb-4">
              Selam Academy is a beacon of knowledge and growth, dedicated to
              nurturing the minds and talents of its students. It is a place of
              learning and growth, where students thrive in a supportive
              environment.
              learning and growth, where students thrive in a supportive
              environment.
              learning and growth, where students thrive in a supportive
              environment.
              Selam Academy is a beacon of knowledge and growth, dedicated to
              nurturing the minds and talents of its students. It is a place of
              learning and growth, where students thrive in a supportive
              environment.
              learning and growth, where students thrive in a supportive
              environment.
              learning and growth, where students thrive in a supportive
              environment.
            </p>
            <p className="mb-4 text-justify">
              We stand as a symbol of enlightenment and development, committed
              to fostering the intellectual and creative abilities of its
              students. It serves as an educational hub where individuals
              flourish, surrounded by a nurturing and encouraging atmosphere
              that promotes both personal and academic growth.
              flourish, surrounded by a nurturing and encouraging atmosphere
              that promotes both personal and academic growth.
            </p>

            {/* Features List */}
            <div className="row gy-2 gx-4 mb-4">
              {[
                "Comprehensive Curriculum",
                "Student-Centered Approach",
                "Practical Learning",
                "Skilled Instructors",
                "Interactive Learning Sessions",
                "National Certification",
              ].map((feature, idx) => (
                <div className="col-sm-6" key={idx}>
                  <p className="mb-0">
                    <FaArrowRight className="text-info me-2" />
                    {feature}
                  </p>
                </div>
              ))}
            </div>

            {/* Read More Button */}
         
              <ReadButton
                className="btn bg-info text-white"
                onClick={goToAboutDetail}
              >
                Read More
              </ReadButton>
          
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
