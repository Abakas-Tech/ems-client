import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import instance from "../../utils/axios";
function Featured() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  return (
    <section className="bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-7 col-md-10 text-center">
            <div className="sec-heading center">
              <h2>Featured Property For Sale</h2>
              <p>
                Discover the finest properties curated just for you. I am
                dedicated to helping you find your dream home with ease and
                confidence, offering personalized service every step of the way.
              </p>
            </div>
          </div>
        </div>

        <div className="row list-layout">
          {/* Single Property Start */}
          <div className="col-xl-6 col-lg-6 col-md-12">
            <div className="property-listing property-1 bg-white p-2 rounded">
              <div className="listing-img-wrapper">
                <a href="single-property-2.html">
                  <img
                    src="https://placehold.co/1280x850"
                    className="img-fluid mx-auto rounded"
                    alt=""
                  />
                </a>
              </div>

              <div className="listing-content">
                <div className="listing-detail-wrapper-box">
                  <div className="listing-detail-wrapper d-flex align-items-center justify-content-between">
                    <div className="listing-short-detail">
                      <span className="label for-sale d-inline-flex mb-1">
                        For Sale
                      </span>
                      <h4 className="listing-name mb-0">
                        <a href="single-property-2.html">
                          Adobe Property Advisors
                        </a>
                      </h4>
                      <div className="fr-can-rating">
                        <i className="fas fa-star fs-xs filled"></i>
                        <i className="fas fa-star fs-xs filled"></i>
                        <i className="fas fa-star fs-xs filled"></i>
                        <i className="fas fa-star fs-xs filled"></i>
                        <i className="fas fa-star fs-xs"></i>
                        <span className="reviews_text fs-sm text-muted ms-2">
                          (42 Reviews)
                        </span>
                      </div>
                    </div>
                    <div className="list-price">
                      <h6 className="listing-card-info-price text-main">
                        $120M
                      </h6>
                    </div>
                  </div>
                </div>

                <div className="price-features-wrapper">
                  <div className="list-fx-features d-flex align-items-center justify-content-between mt-3 mb-1">
                    <div className="listing-card d-flex align-items-center">
                      <div className="square--25 text-muted-2 fs-sm circle gray-simple me-1">
                        <i className="fa-solid fa-building-shield fs-xs"></i>
                      </div>
                      <span className="text-muted-2 fs-sm">3BHK</span>
                    </div>
                    <div className="listing-card d-flex align-items-center">
                      <div className="square--25 text-muted-2 fs-sm circle gray-simple me-1">
                        <i className="fa-solid fa-bed fs-xs"></i>
                      </div>
                      <span className="text-muted-2 fs-sm">3 Beds</span>
                    </div>
                    <div className="listing-card d-flex align-items-center">
                      <div className="square--25 text-muted-2 fs-sm circle gray-simple me-1">
                        <i className="fa-solid fa-clone fs-xs"></i>
                      </div>
                      <span className="text-muted-2 fs-sm">1800 SQFT</span>
                    </div>
                  </div>
                </div>

                <div className="listing-footer-wrapper">
                  <div className="listing-locate">
                    <span className="listing-location text-muted-2">
                      <i className="fa-solid fa-location-pin me-1"></i>Quice
                      Market, Canada
                    </span>
                  </div>
                  <div className="listing-detail-btn">
                    <a
                      href="single-property-2.html"
                      className="btn btn-sm px-4 fw-medium btn-main"
                    >
                      View
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Single Property End */}
          {/* Single Property Start */}
          <div className="col-xl-6 col-lg-6 col-md-12">
            <div className="property-listing property-1 bg-white p-2 rounded">
              <div className="listing-img-wrapper">
                <a href="single-property-2.html">
                  <img
                    src="https://placehold.co/1280x850"
                    className="img-fluid mx-auto rounded"
                    alt=""
                  />
                </a>
              </div>

              <div className="listing-content">
                <div className="listing-detail-wrapper-box">
                  <div className="listing-detail-wrapper d-flex align-items-center justify-content-between">
                    <div className="listing-short-detail">
                      <span className="label for-sale d-inline-flex mb-1">
                        For Sale
                      </span>
                      <h4 className="listing-name mb-0">
                        <a href="single-property-2.html">
                          Adobe Property Advisors
                        </a>
                      </h4>
                      <div className="fr-can-rating">
                        <i className="fas fa-star fs-xs filled"></i>
                        <i className="fas fa-star fs-xs filled"></i>
                        <i className="fas fa-star fs-xs filled"></i>
                        <i className="fas fa-star fs-xs filled"></i>
                        <i className="fas fa-star fs-xs"></i>
                        <span className="reviews_text fs-sm text-muted ms-2">
                          (42 Reviews)
                        </span>
                      </div>
                    </div>
                    <div className="list-price">
                      <h6 className="listing-card-info-price text-main">
                        $120M
                      </h6>
                    </div>
                  </div>
                </div>

                <div className="price-features-wrapper">
                  <div className="list-fx-features d-flex align-items-center justify-content-between mt-3 mb-1">
                    <div className="listing-card d-flex align-items-center">
                      <div className="square--25 text-muted-2 fs-sm circle gray-simple me-1">
                        <i className="fa-solid fa-building-shield fs-xs"></i>
                      </div>
                      <span className="text-muted-2 fs-sm">3BHK</span>
                    </div>
                    <div className="listing-card d-flex align-items-center">
                      <div className="square--25 text-muted-2 fs-sm circle gray-simple me-1">
                        <i className="fa-solid fa-bed fs-xs"></i>
                      </div>
                      <span className="text-muted-2 fs-sm">3 Beds</span>
                    </div>
                    <div className="listing-card d-flex align-items-center">
                      <div className="square--25 text-muted-2 fs-sm circle gray-simple me-1">
                        <i className="fa-solid fa-clone fs-xs"></i>
                      </div>
                      <span className="text-muted-2 fs-sm">1800 SQFT</span>
                    </div>
                  </div>
                </div>

                <div className="listing-footer-wrapper">
                  <div className="listing-locate">
                    <span className="listing-location text-muted-2">
                      <i className="fa-solid fa-location-pin me-1"></i>Quice
                      Market, Canada
                    </span>
                  </div>
                  <div className="listing-detail-btn">
                    <a
                      href="single-property-2.html"
                      className="btn btn-sm px-4 fw-medium btn-main"
                    >
                      View
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Single Property End */}
          {/* Single Property Start */}
          <div className="col-xl-6 col-lg-6 col-md-12">
            <div className="property-listing property-1 bg-white p-2 rounded">
              <div className="listing-img-wrapper">
                <a href="single-property-2.html">
                  <img
                    src="https://placehold.co/1280x850"
                    className="img-fluid mx-auto rounded"
                    alt=""
                  />
                </a>
              </div>

              <div className="listing-content">
                <div className="listing-detail-wrapper-box">
                  <div className="listing-detail-wrapper d-flex align-items-center justify-content-between">
                    <div className="listing-short-detail">
                      <span className="label for-sale d-inline-flex mb-1">
                        For Sale
                      </span>
                      <h4 className="listing-name mb-0">
                        <a href="single-property-2.html">
                          Adobe Property Advisors
                        </a>
                      </h4>
                      <div className="fr-can-rating">
                        <i className="fas fa-star fs-xs filled"></i>
                        <i className="fas fa-star fs-xs filled"></i>
                        <i className="fas fa-star fs-xs filled"></i>
                        <i className="fas fa-star fs-xs filled"></i>
                        <i className="fas fa-star fs-xs"></i>
                        <span className="reviews_text fs-sm text-muted ms-2">
                          (42 Reviews)
                        </span>
                      </div>
                    </div>
                    <div className="list-price">
                      <h6 className="listing-card-info-price text-main">
                        $120M
                      </h6>
                    </div>
                  </div>
                </div>

                <div className="price-features-wrapper">
                  <div className="list-fx-features d-flex align-items-center justify-content-between mt-3 mb-1">
                    <div className="listing-card d-flex align-items-center">
                      <div className="square--25 text-muted-2 fs-sm circle gray-simple me-1">
                        <i className="fa-solid fa-building-shield fs-xs"></i>
                      </div>
                      <span className="text-muted-2 fs-sm">3BHK</span>
                    </div>
                    <div className="listing-card d-flex align-items-center">
                      <div className="square--25 text-muted-2 fs-sm circle gray-simple me-1">
                        <i className="fa-solid fa-bed fs-xs"></i>
                      </div>
                      <span className="text-muted-2 fs-sm">3 Beds</span>
                    </div>
                    <div className="listing-card d-flex align-items-center">
                      <div className="square--25 text-muted-2 fs-sm circle gray-simple me-1">
                        <i className="fa-solid fa-clone fs-xs"></i>
                      </div>
                      <span className="text-muted-2 fs-sm">1800 SQFT</span>
                    </div>
                  </div>
                </div>

                <div className="listing-footer-wrapper">
                  <div className="listing-locate">
                    <span className="listing-location text-muted-2">
                      <i className="fa-solid fa-location-pin me-1"></i>Quice
                      Market, Canada
                    </span>
                  </div>
                  <div className="listing-detail-btn">
                    <a
                      href="single-property-2.html"
                      className="btn btn-sm px-4 fw-medium btn-main"
                    >
                      View
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Single Property End */}
          {/* Single Property Start */}
          <div className="col-xl-6 col-lg-6 col-md-12">
            <div className="property-listing property-1 bg-white p-2 rounded">
              <div className="listing-img-wrapper">
                <a href="single-property-2.html">
                  <img
                    src="https://placehold.co/1280x850"
                    className="img-fluid mx-auto rounded"
                    alt=""
                  />
                </a>
              </div>

              <div className="listing-content">
                <div className="listing-detail-wrapper-box">
                  <div className="listing-detail-wrapper d-flex align-items-center justify-content-between">
                    <div className="listing-short-detail">
                      <span className="label for-sale d-inline-flex mb-1">
                        For Sale
                      </span>
                      <h4 className="listing-name mb-0">
                        <a href="single-property-2.html">
                          Adobe Property Advisors
                        </a>
                      </h4>
                      <div className="fr-can-rating">
                        <i className="fas fa-star fs-xs filled"></i>
                        <i className="fas fa-star fs-xs filled"></i>
                        <i className="fas fa-star fs-xs filled"></i>
                        <i className="fas fa-star fs-xs filled"></i>
                        <i className="fas fa-star fs-xs"></i>
                        <span className="reviews_text fs-sm text-muted ms-2">
                          (42 Reviews)
                        </span>
                      </div>
                    </div>
                    <div className="list-price">
                      <h6 className="listing-card-info-price text-main">
                        $120M
                      </h6>
                    </div>
                  </div>
                </div>

                <div className="price-features-wrapper">
                  <div className="list-fx-features d-flex align-items-center justify-content-between mt-3 mb-1">
                    <div className="listing-card d-flex align-items-center">
                      <div className="square--25 text-muted-2 fs-sm circle gray-simple me-1">
                        <i className="fa-solid fa-building-shield fs-xs"></i>
                      </div>
                      <span className="text-muted-2 fs-sm">3BHK</span>
                    </div>
                    <div className="listing-card d-flex align-items-center">
                      <div className="square--25 text-muted-2 fs-sm circle gray-simple me-1">
                        <i className="fa-solid fa-bed fs-xs"></i>
                      </div>
                      <span className="text-muted-2 fs-sm">3 Beds</span>
                    </div>
                    <div className="listing-card d-flex align-items-center">
                      <div className="square--25 text-muted-2 fs-sm circle gray-simple me-1">
                        <i className="fa-solid fa-clone fs-xs"></i>
                      </div>
                      <span className="text-muted-2 fs-sm">1800 SQFT</span>
                    </div>
                  </div>
                </div>

                <div className="listing-footer-wrapper">
                  <div className="listing-locate">
                    <span className="listing-location text-muted-2">
                      <i className="fa-solid fa-location-pin me-1"></i>Quice
                      Market, Canada
                    </span>
                  </div>
                  <div className="listing-detail-btn">
                    <a
                      href="single-property-2.html"
                      className="btn btn-sm px-4 fw-medium btn-main"
                    >
                      View
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Single Property End */}

          {/* Repeat for other properties by duplicating the above block and updating content */}
        </div>

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 text-center mt-4">
            <a
              href="listings-list-with-sidebar.html"
              className="btn btn-main px-lg-5 rounded"
            >
              Browse More Properties
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Featured;
