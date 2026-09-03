import { useNavigate } from "react-router-dom";
import about from "../../../../assets/img/logo/aletisalat-about.png";

import styles from "./AboutSnippet.module.css";

function AboutSnippet() {
  const navigate = useNavigate();

  const goToAboutDetail = () => {
    navigate("/about-detail");
  };

  return (
    <section id="about" className={styles.aboutSection}>
      <div className="container position-relative">
        <div className={`row align-items-stretch ${styles.aboutRow}`}>
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
            <div className={styles.contentInner}>
              <div className={styles.tag}>ABOUT ALETISALAT</div>
              <p className={styles.description}>
                <strong>ALETISALAT Private Foreign Employment Agency</strong> is
                a professional foreign employment and workforce placement agency
                committed to connecting qualified Ethiopian workers with
                legitimate employment opportunities abroad.
              </p>
              <p className={styles.description}>
                We believe that employment is more than simply finding a job. It
                is about creating opportunities that improve lives, strengthen
                families, develop skills, and contribute to a better future.
              </p>

              <p className={styles.description}>
                Our agency works to build a trusted bridge between Ethiopian job
                seekers and international employers by providing responsible,
                transparent, professional, and efficient recruitment services.
              </p>

              <p className={styles.description}>
                At <strong>ALETISALAT</strong>, we are committed to protecting
                the dignity and interests of workers while helping employers
                access reliable, qualified, and motivated human resources.
              </p>

              {/* BUTTON */}
              <div className={styles.btnWrapper}>
                <button
                  onClick={goToAboutDetail}
                  className="btn text-white d-flex fw-bold"
                  style={{ background: "#0B1F3A" }}
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSnippet;
