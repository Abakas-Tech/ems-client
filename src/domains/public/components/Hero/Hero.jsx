import React from "react";
import banner from "../../../../assets/img/banner/banner.png";
import styles from "./Hero.module.css";

function Hero() {
  return (
    <div className={`light-bg ${styles["hero-banner"]}`}>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-xl-7 col-lg-7 col-md-12 col-sm-12">
            <div className="d-flex align-items-center justify-content-start mb-2">
              <div className="label rounded-pill bg-white text-dark d-flex align-items-center justify-content-center px-2 py-2 pe-3">
                <span className="label bg-green rounded-pill text-uppercase me-2">
                  New
                </span>
                Get 20% Off with Super Agent
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
