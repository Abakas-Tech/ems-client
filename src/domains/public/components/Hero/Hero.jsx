import React from "react";
import styles from "./Hero.module.css";

function Hero() {
  return (
    <div className={`light-bg ${styles["hero-banner"]}`}>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-xl-7 col-lg-7 col-md-12 col-sm-12">
            <div className="d-flex align-items-center justify-content-start mb-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
