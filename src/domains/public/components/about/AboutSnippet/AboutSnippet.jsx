import {
  FaArrowRight,
  FaCheckCircle,
  FaGlobeAfrica,
  FaPassport,
  FaUserShield,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import about from "../../../../../assets/img/logo/image.png";

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
      {/* Blur Background */}
      <div className={styles.blurOne}></div>
      <div className={styles.blurTwo}></div>

      <div className="container position-relative">
        <div className="row align-items-center gy-5">
          {/* IMAGE SIDE */}
          <div
            className="col-lg-6"
        
          >
            <div className={styles.imageWrapper}>
              {/* Floating Badge */}
              <div className={styles.floatingBadge}>
                <span className={styles.dot}></span>
                Trusted Overseas Recruitment
              </div>

              <img
                src={about}
                alt="Global Trust Overseas Employment Agency"
                className={`img-fluid ${styles.aboutImage}`}
                loading="lazy"
              />

            </div>
          </div>

          {/* CONTENT SIDE */}
          <div
            className="col-lg-6"
         
          >
            <div className={styles.tag} id="about">
              ABOUT GLOBAL TRUST
            </div>

           

            <p className={styles.description}>
              <strong>Global Trust Overseas Employment Agency Plc</strong> is a
              licensed recruitment agency dedicated to connecting Ethiopian
              employees with verified international job opportunities.
            </p>
            <p className={styles.description}>
              Global Trust Overseas Employment Agency Plc is a
              licensed recruitment agency dedicated to connecting Ethiopian
              employees with verified international job opportunities.
            </p>

            <p className={styles.description}>
              We manage the full overseas employment process including job
              matching, visa processing, LMIS/work permits, employer contract
              verification, and deployment coordination.
            </p>

            {/* STATS */}
            <div className="row g-3 mb-5">
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
                <FaArrowRight className="ms-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSnippet;
