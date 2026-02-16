import React from "react";
import { Link } from "react-router-dom";
import errorImage from "../../../assets/img/404/404.png";
import SEOHelmet from "../SEOHelmet/SEOHelmet";

const NotFound = () => (
  <>
    <SEOHelmet />
    <section className="error-wrap">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-10">
            <div className="text-center">
              <img src={errorImage} className="img-fluid" alt="" />
              <p>
                Oops! The page you're looking for doesn't exist. Explore our
                properties or return to the homepage to continue with your
                search.
              </p>
              <Link className="btn btn-main px-5" to="/">
                Back To Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </>
);

export default NotFound;
