import React from "react";
import {
  BsPersonPlusFill,
  BsPatchCheckFill,
  BsBriefcaseFill,
  BsAirplaneFill,
} from "react-icons/bs";
import { PiAirplaneTilt } from "react-icons/pi";
import { IoPersonAddOutline } from "react-icons/io5";
import { BsAward } from "react-icons/bs";
import { LuUserCheck } from "react-icons/lu";
import { BsPatchCheck } from "react-icons/bs";
import { BsPersonVcard } from "react-icons/bs";
import { useTranslation } from "react-i18next";
import styles from "./HowItWorks.module.css";

function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section id="how" className={`${styles["how-section"]} pb-0`}>
      <div id="features" className="features section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-7 col-md-10 text-center">
              <div className="sec-heading center">
                <h2 id="services-title" className="fw-bold">
                  {t("process.title")}
                </h2>
                <p>{t("process.description")}</p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12">
              <div className="features-content">
                <div className="row">
                  <div className={`col-lg-3 ${styles["step-item"]}`}>
                    <div
                      className="features-item first-feature wow fadeInUp"
                      data-wow-duration="1s"
                      data-wow-delay="0s"
                    >
                      <div className={styles["number"]}>01</div>
                      <div className={styles["icon"]}>
                        <IoPersonAddOutline />
                      </div>
                      <h4>{t("process.steps.registration.title")}</h4>
                      <div className="line-dec"></div>
                      <p>{t("process.steps.registration.desc")}</p>
                    </div>
                  </div>

                  <div className={`col-lg-3 ${styles["step-item"]}`}>
                    <div
                      className="features-item second-feature wow fadeInUp"
                      data-wow-duration="1s"
                      data-wow-delay="0.2s"
                    >
                      <div className={styles["number"]}>02</div>
                      <div className={styles["icon"]}>
                        <BsPatchCheck />
                      </div>
                      <h4>{t("process.steps.qualification.title")}</h4>
                      <div className="line-dec"></div>
                      <p>{t("process.steps.qualification.desc")}</p>
                    </div>
                  </div>

                  <div className={`col-lg-3 ${styles["step-item"]}`}>
                    <div
                      className="features-item first-feature wow fadeInUp"
                      data-wow-duration="1s"
                      data-wow-delay="0.4s"
                    >
                      <div className={styles["number"]}>03</div>
                      <div className={styles["icon"]}>
                        <BsPersonVcard />
                      </div>
                      <h4>{t("process.steps.placement.title")}</h4>
                      <div className="line-dec"></div>
                      <p>{t("process.steps.placement.desc")}</p>
                    </div>
                  </div>

                  <div
                    className={`col-lg-3 ${styles["step-item"]} ${styles["last"]}`}
                  >
                    <div
                      className="features-item second-feature last-features-item wow fadeInUp"
                      data-wow-duration="1s"
                      data-wow-delay="0.6s"
                    >
                      <div className={styles["number"]}>04</div>
                      <div className={styles["icon"]}>
                        <PiAirplaneTilt />
                      </div>
                      <h4>{t("process.steps.deployment.title")}</h4>
                      <div className="line-dec"></div>
                      <p>{t("process.steps.deployment.desc")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
