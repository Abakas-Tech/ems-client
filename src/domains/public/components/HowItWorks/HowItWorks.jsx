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
import styles from "./HowItWorks.module.css";

function HowItWorks() {
  return (
    <section id="how" className={`${styles["how-section"]} pb-0`}>
      <div id="features" className="features section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-7 col-md-10 text-center">
              <div className="sec-heading center">
                <h2 id="services-title" className="fw-bold">
                  The Process
                </h2>
                <p>
                  Our streamlined process ensures a smooth and efficient journey
                  for overseas employment, guiding you through every step from
                  registration to deployment.
                </p>
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
                      <h4>Registration</h4>
                      <div className="line-dec"></div>
                      <p>
                        Register with the agency by submitting your personal
                        details, identification documents, and creating your
                        official overseas employment profile.
                      </p>
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
                      <h4>Qualification</h4>
                      <div className="line-dec"></div>
                      <p>
                        Complete required training, competency assessment,
                        medical examination, and pre-employment orientation to
                        become eligible for overseas placement.
                      </p>
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
                      <h4>Job Placement</h4>
                      <div className="line-dec"></div>
                      <p>
                        Get matched with a verified employer, complete
                        interviews, sign your employment contract, and process
                        your visa and work permit.
                      </p>
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
                      <h4>Deployment</h4>
                      <div className="line-dec"></div>
                      <p>
                        Attend pre-departure orientation, finalize travel
                        arrangements, receive exit clearance, and begin your
                        overseas employment journey.
                      </p>
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
