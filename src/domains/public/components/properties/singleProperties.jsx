import React from "react";
import { Carousel } from "react-bootstrap";
import { Link } from "react-router-dom";

const SingleProperty = ({ property, images }) => {
  const {
    id,
    title,
    location,
    is_featured,
    status,
    is_urgent,
    area_size,
    bedrooms,
    tags,
    bathrooms,
    halls,
    kitchens,
    property_type,
    category,
  } = property;
  const propertyImages =
    images && images.length > 0
      ? images
      : [
          {
            image_url: "https://placehold.co/1280x850",
            alt_text: "Property Image",
          },
        ];

  // Helper to capitalize first letter
  const capitalizeFirstLetter = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <div className="property-listing property-1 bg-white p-2 rounded">
      <div className="d-flex flex-column flex-lg-row">
        {/* Image Carousel */}
        <div className="listing-img-wrapper w-100 w-lg-50 mb-2 mb-lg-0 me-lg-3 position-relative">
          {/* Badges container */}
          {(property_type || category) && (
            <div
              className="d-flex position-absolute top-0 start-0 m-2"
              style={{ gap: "0.5rem", zIndex: 10 }}
            >
              {property_type && (
                <span className="badge bg-success p-2 mt-1">
                  {capitalizeFirstLetter(property_type)}
                </span>
              )}
              {category && (
                <span className="badge bg-primary p-2 mt-1">
                  {capitalizeFirstLetter(category)}
                </span>
              )}
            </div>
          )}

          <Carousel
            indicators={propertyImages.length > 1}
            controls={false}
            interval={3000}
          >
            {propertyImages.map((img, idx) => (
              <Carousel.Item key={idx}>
                <Link to={`/properties/${id}`}>
                  <img
                    src={img.image_url}
                    alt={img.alt_text || title}
                    className="img-fluid mx-auto rounded my-1"
                    style={{
                      maxHeight: "210px",
                      objectFit: "cover",
                      width: "100%",
                    }}
                  />
                </Link>
              </Carousel.Item>
            ))}
          </Carousel>
        </div>

        {/* Content */}
        <div className="listing-content w-100 w-lg-50 pe-2">
          {/* Header */}
          <div className="listing-detail-wrapper-box ">
            <div className="listing-detail-wrapper d-flex align-items-center justify-content-between">
              <div className="listing-short-detail ">
                <span
                  className={`label d-inline-flex mb-1 mt-2 ${
                    is_urgent
                      ? "bg-danger text-white"
                      : "label for-sale d-inline-flex mb-1"
                  }`}
                >
                  {is_urgent ? "Urgent" : "Normal"}
                </span>

                {Number(is_featured) === 1 && (
                  <span className="label featured d-inline-flex mb-1 ms-1 bg-warning  text-white">
                    Featured
                  </span>
                )}

                <h4 className="listing-name mb-0">
                  <Link to={`/properties/${id}`}>{title}</Link>
                </h4>

                {tags && tags.length > 0 && (
                  <div className="fr-can-rating text-muted-2 fs-sm">
                    {tags}
                  </div>
                )}
              </div>

              <div className="list-price">
                <h6
                  className={`listing-card-info-price ${
                    status === "available" ? "text-success" : "text-danger"
                  }`}
                >
                  {status}
                </h6>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="price-features-wrapper mt-2 ">
            <div className="list-fx-features d-flex align-items-center justify-content-between mt-3 mb-1">
              {/* BHK with tooltip */}
              <div className="listing-card d-flex align-items-center position-relative bhk-card">
                <div className="square--25 text-muted-2 fs-sm circle gray-simple me-1">
                  <i className="fa-solid fa-building-shield fs-xs"></i>
                </div>
                <span className="text-muted-2 fs-sm">{bathrooms}BHK</span>

                <div className="tooltip-details position-absolute bg-white border rounded shadow p-2">
                  <div className="d-flex align-items-center mb-1">
                    <i className="fa-solid fa-bath me-1"></i>
                    <span>{bathrooms} Bathrooms</span>
                  </div>
                  <div className="d-flex align-items-center mb-1">
                    <i className="fa-solid fa-utensils me-1"></i>
                    <span>{kitchens} Kitchens</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <i className="fa-solid fa-couch me-1"></i>
                    <span>{halls} Halls</span>
                  </div>
                </div>
              </div>

              {/* Bedrooms */}
              <div className="listing-card d-flex align-items-center">
                <div className="square--25 text-muted-2 fs-sm circle gray-simple me-1">
                  <i className="fa-solid fa-bed fs-xs"></i>
                </div>
                <span className="text-muted-2 fs-sm">{bedrooms} Beds</span>
              </div>

              {/* Area size */}
              <div className="listing-card d-flex align-items-center">
                <div className="square--25 text-muted-2 fs-sm circle gray-simple me-1">
                  <i className="fa-solid fa-clone fs-xs"></i>
                </div>
                <span className="text-muted-2 fs-sm">{area_size} SQFT</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="listing-footer-wrapper mt-2">
            <hr />
            <div className="d-flex justify-content-between align-items-center">
              <div className="listing-locate">
                <span className="listing-location text-muted-2">
                  <i className="bi bi-geo-alt me-1"></i>
                  {location}
                </span>
              </div>
              <div className="listing-detail-btn">
                <Link
                  to={`/properties/${id}`}
                  className="btn btn-sm px-4 fw-medium btn-main btn-light-main "
                >
                  View Detail
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        .carousel-indicators [data-bs-target] {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #fff;
        }
        .carousel-indicators .active {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #439062ff;
        }
        .label.featured {
          z-index: 1050; /* higher than carousel images */
          position: relative;
        }
      `}</style>
    </div>
  );
};

export default SingleProperty;
