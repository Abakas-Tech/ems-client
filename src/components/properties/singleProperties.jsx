import React from "react";
import { Carousel, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  FaShieldAlt,
  FaBed,
  FaBath,
  FaClone,
  FaMapMarkerAlt,
} from "react-icons/fa";

const SingleProperty = ({ property, images }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/properties/${property.id}`);
  };

  const propertyImages =
    images && images.length > 0
      ? images
      : [
          {
            image_url: "https://placehold.co/1280x850",
            alt_text: "Property Image",
          },
        ];

  return (
    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
      <div className="property-listing list_view style_new">
        <div className="listing-img-wrapper position-relative flex-shrink-0">
          {/* Badges */}
          <div className="position-absolute top-0 start-0 ms-3 mt-3 z-1">
            {property.category && (
              <div className="label verified-listing d-inline-flex align-items-center justify-content-center bg-info text-light me-1 px-2 py-1">
                For {property.category}
              </div>
            )}
          </div>

          <Carousel
            indicators={propertyImages.length > 1}
            controls={false}
            interval={3000}
            className="list-img-slide"
          >
            {propertyImages.map((img, idx) => (
              <Carousel.Item key={idx}>
                <div className="clior">
                  <div>
                    <a href="#" onClick={handleNavigate}>
                      <img
                        src={img.image_url}
                        alt={img.alt_text}
                        className="img-fluid mx-auto"
                        style={{
                          width: "100%",
                          height: "250px",
                          objectFit: "cover",
                        }}
                      />
                    </a>
                  </div>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </div>

        <div className="list_view_flex">
          <div className="listing-detail-wrapper mt-1">
            <div className="listing-short-detail-wrap">
              <div className="_card_list_flex mb-2">
                <div className="_card_flex_01 d-flex align-items-center">
                  {Boolean(property.is_urgent) && (
                    <span className="label for-sale me-2 text-light px-2 py-1">
                      urgent
                    </span>
                  )}
                  {property.property_type && (
                    <span className="label property-type text-light px-2 py-1">
                      {property.property_type}
                    </span>
                  )}
                </div>
              </div>
              <div className="_card_list_flex">
                <div className="_card_flex_01">
                  <h4 className="listing-name mb-2">
                    <Link
                      href="#"
                      className="prt-link-detail"
                      onClick={handleNavigate}
                    >
                      {property.title}
                    </Link>
                  </h4>
                </div>
              </div>
            </div>
          </div>

          <div className="price-features-wrapper">
            <div className="list-fx-features d-flex align-items-center justify-content-between gap-4">
              {property.bhk && (
                <div className="listing-card d-flex align-items-center">
                  <div className="square--30 text-muted-2 fs-sm circle gray-simple me-2">
                    <FaShieldAlt className="fs-sm" />
                  </div>
                  <span className="text-muted-2">{property.bhk}</span>
                </div>
              )}
              {property.bedrooms && (
                <div className="listing-card d-flex align-items-center">
                  <div className="square--30 text-muted-2 fs-sm circle gray-simple me-2">
                    <FaBed className="fs-sm" />
                  </div>
                  <span className="text-muted-2">{property.bedrooms} Beds</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="listing-card d-flex align-items-center">
                  <div className="square--30 text-muted-2 fs-sm circle gray-simple me-2">
                    <FaBath className="fs-sm" />
                  </div>
                  <span className="text-muted-2">
                    {property.bathrooms} Bath
                  </span>
                </div>
              )}
              {property.area_size && (
                <div className="listing-card d-flex align-items-center">
                  <div className="square--30 text-muted-2 fs-sm circle gray-simple me-2">
                    <FaClone className="fs-sm" />
                  </div>
                  <span className="text-muted-2">
                    {property.area_size} SQFT
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="listing-detail-footer d-flex align-items-center justify-content-between">
            <div className="footer-first">
              {property.location && (
                <div className="foot-rates">
                  <FaMapMarkerAlt className="text-danger" size={18} />
                  <span className="text-muted-2">{property.location}</span>
                </div>
              )}
            </div>
            <div className="footer-flex">
              <Button
                className="btn btn-md btn-main fw-medium"
                onClick={handleNavigate}
              >
                View Detail
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .carousel-indicators [data-bs-target] {
          background-color: #6c757d; /* Default dot color (Bootstrap secondary) */
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin: 0 4px;
        }
        .carousel-indicators .active {
          background-color: #0d6efd; /* Highlight color (Bootstrap primary) */
        }
      `}</style>
    </div>
  );
};

export default SingleProperty;
