import React from "react";
import bannerImage from "../../../../assets/img/banner-9.jpg";

const Hero = () => {
  return (
    <div
      className="image-cover hero-banner"
      style={{
        backgroundColor: "#2540a2",
        backgroundImage: `url(${bannerImage})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        height: "100vh", 
      }}
      data-overlay="6"
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-9 col-md-11 col-sm-12">
            <div className="inner-banner-text text-center">
              <h2>
                <span className="font-normal">Find Your </span> Dream Home.
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
