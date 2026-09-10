import React from "react";
import { FaRoute } from "react-icons/fa";
import { PiAirplaneTilt } from "react-icons/pi";
import { IoPersonAddOutline } from "react-icons/io5";
import { BsPatchCheck, BsPersonVcard } from "react-icons/bs";
import styles from "./HowItWorks.module.css";

const STEPS = [
  {
    icon: <IoPersonAddOutline />,
    title: "Registration",
    description:
      "Register with the agency by submitting your personal details, identification documents, and creating your official overseas employment profile.",
  },
  {
    icon: <BsPatchCheck />,
    title: "Qualification",
    description:
      "Complete required training, competency assessment, medical examination, and pre-employment orientation to become eligible for overseas placement.",
  },
  {
    icon: <BsPersonVcard />,
    title: "Job Placement",
    description:
      "Get matched with a verified employer, complete interviews, sign your employment contract, and process your visa and work permit.",
  },
  {
    icon: <PiAirplaneTilt />,
    title: "Deployment",
    description:
      "Attend pre-departure orientation, finalize travel arrangements, receive exit clearance, and begin your overseas employment journey.",
  },
];

function HowItWorks() {
  return (
    <section id="how" className={styles.section}>
      <div className="container">
        <div className={styles.head}>
          <span className={styles.kicker}>How it works</span>
          <h2 className={styles.title}>Your Journey With Us</h2>
          <p className={styles.subtitle}>
            A streamlined process that guides you from registration through
            training to deployment step by step.
          </p>
        </div>

        <div className={styles.tree}>
          <div className={styles.root}>
            <div className={styles.rootIcon}>
              <FaRoute />
            </div>
            <h3 className={styles.rootTitle}>The Process</h3>
            <p className={styles.rootCaption}>4 steps to deployment</p>
          </div>

          <div className={styles.branches}>
            {STEPS.map((step, index) => (
              <div className={styles.branch} key={step.title}>
                <span className={styles.branchDot} aria-hidden="true" />
                <div className={styles.branchIcon}>{step.icon}</div>
                <div className={styles.branchCard}>
                  <span className={styles.branchNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h4 className={styles.branchTitle}>{step.title}</h4>
                  <p className={styles.branchDesc}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
