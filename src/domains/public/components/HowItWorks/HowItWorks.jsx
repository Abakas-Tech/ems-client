import React from "react";
import styles from "./HowItWorks.module.css";

function HowItWorks() {
  return (
    <section id="how" className={`styles["how-section"] pb-0`}>
      <div className="container">
        {/* HEADER */}
        <div className="row justify-content-center">
          <div className="col-xl-6 col-lg-7 col-md-10 text-center">
            <div className={styles["section-heading"]}>
              <h2>How It Works</h2>
              <p className="mb-5">
                Follow these simple steps to complete your overseas employment
                journey smoothly and efficiently.
              </p>
            </div>
          </div>
        </div>

        {/* STEPS */}
        <div className="row justify-content-center g-4">
          {/* STEP 1 */}
          <div className="col-lg-4 col-md-4">
            <div className={styles["step-item"]}>
              <div className={styles["step-number"]}>01</div>

              <div className={styles["icon-wrapper"]}>
                <div className={styles["icon-box"]}>
                  <svg width="45" height="45" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5z"
                      fill="currentColor"
                    />
                    <path
                      d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M19 8v4M17 10h4"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>

              <div className={styles["step-content"]}>
                <h4>Register</h4>
                <p className="text-muted">
                  Visit the agency, register and submit your application details
                  to get started with the process.
                </p>
              </div>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="col-lg-4 col-md-4">
            <div className={styles["step-item"]}>
              <div className={styles["step-number"]}>02</div>

              <div className={styles["icon-wrapper"]}>
                <div className={`${styles["icon-box"]} ${styles["warning"]}`}>
                  <svg width="45" height="45" viewBox="0 0 24 24" fill="none">
                    {/* Document */}
                    <path
                      d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />

                    {/* Fold corner */}
                    <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" />

                    {/* Check / process line */}
                    <path
                      d="M9 13l2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <div className={styles["step-content"]}>
                <h4>Processing</h4>
                <p className="text-muted">
                  Your application is reviewed, verified, and prepared by the
                  agency for approval.
                </p>
              </div>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="col-lg-4 col-md-4">
            <div className={`${styles["step-item"]} ${styles["last"]}`}>
              <div className={styles["step-number"]}>03</div>

              <div className={styles["icon-wrapper"]}>
                <div className={`${styles["icon-box"]} ${styles["primary"]}`}>
                  <svg width="45" height="45" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M2 16l20-5-20-5v4l14 1-14 1v4z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>

              <div className={styles["step-content"]}>
                <h4>Deployment</h4>
                <p className="text-muted">
                  Once approved, you are deployed to your destination country to
                  begin your job.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
