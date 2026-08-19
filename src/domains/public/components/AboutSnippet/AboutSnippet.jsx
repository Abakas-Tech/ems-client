import {
  FaArrowRight,
  FaCheckCircle,
  FaGlobeAfrica,
  FaPassport,
  FaUserShield,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import about from "../../../../assets/img/logo/aletisalat-about.png";

import styles from "./AboutSnippet.module.css";

function AboutSnippet() {
  const navigate = useNavigate();

  const goToAboutDetail = () => {
    navigate("/about-detail");
  };

  const stats = [
    {
      icon: <FaGlobeAfrica />,
      value: "10+",
      label: "Countries",
    },
    {
      icon: <FaPassport />,
      value: "5K+",
      label: "Deployments",
    },
    {
      icon: <FaUserShield />,
      value: "100%",
      label: "Verified Process",
    },
  ];

  return (
    <section id="about" className={styles.aboutSection}>
      <div className="container position-relative">
        <div className="row align-items-center">
          {/* IMAGE SIDE */}
          <div className="col-lg-6">
            <div className={styles.imageWrapper}>
              {/* Floating Badge */}
              <div className={styles.floatingBadge}>
                <span className={styles.dot}></span>
                Trusted Overseas Recruitment
              </div>

              <img
                src={about}
                alt="ALETISALAT Private Foreign Employment Agency"
                className={`img-fluid ${styles.aboutImage}`}
                loading="lazy"
              />
            </div>
          </div>

          {/* CONTENT SIDE */}
          <div className="col-lg-6">
            <div className={styles.tag}>ABOUT ALETISALAT</div>

            <p className={styles.description}>
              <strong>ALETISALAT Private Foreign Employment Agency</strong> is a
              professional foreign employment and workforce placement agency
              committed to connecting qualified Ethiopian workers with
              legitimate employment opportunities abroad.
            </p>

            <p className={styles.description}>
              We build a trusted bridge between Ethiopian job seekers and
              international employers by providing responsible, transparent,
              professional, and efficient recruitment services — protecting the
              dignity and interests of workers while helping employers access
              reliable, qualified human resources.
            </p>

            {/* STATS */}
            <div className="row g-3 mb-3">
              {stats.map((item, idx) => (
                <div className="col-sm-4" key={idx}>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>{item.icon}</div>

                    <h3>{item.value}</h3>
                    <p>{item.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* BUTTONS */}
            <div className="m-0">
              <button
                className={`btn ${styles.primaryBtn}`}
                onClick={goToAboutDetail}
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSnippet;
