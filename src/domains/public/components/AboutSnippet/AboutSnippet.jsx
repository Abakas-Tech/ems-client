import { useNavigate } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import about from "../../../../assets/img/logo/aletisalat-about.png";

import styles from "./AboutSnippet.module.css";

function AboutSnippet() {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
                {t("aboutSnippet.badge")}
              </div>

              <img
                src={about}
                alt={t("aboutSnippet.imageAlt")}
                className={`img-fluid ${styles.aboutImage}`}
                loading="lazy"
              />
            </div>
          </div>

          {/* CONTENT SIDE */}
          <div className="col-lg-6">
            <div className={styles.contentInner}>
              <div className={styles.tag}>{t("aboutSnippet.tag")}</div>
              <p className={styles.description}>
                <Trans
                  i18nKey="aboutSnippet.p1"
                  components={{ strong: <strong /> }}
                />
              </p>
              <p className={styles.description}>{t("aboutSnippet.p2")}</p>

              <p className={styles.description}>{t("aboutSnippet.p3")}</p>

              <p className={styles.description}>
                <Trans
                  i18nKey="aboutSnippet.p4"
                  components={{ strong: <strong /> }}
                />
              </p>

              {/* BUTTON */}
              <div className={styles.btnWrapper}>
                <button
                  onClick={goToAboutDetail}
                  className="btn text-white d-flex fw-bold"
                  style={{ background: "#0B1F3A" }}
                >
                  {t("aboutSnippet.learnMore")}
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
