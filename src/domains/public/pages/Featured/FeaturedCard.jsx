import React from "react";
import { Link } from "react-router-dom";

const FeaturedCard = ({ property, images }) => {
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
  } = property;
  console.log(tags);
  return (
    <div
      className="property-listing property-1 bg-white p-2 rounded"
      id="featured"
    >
      <div className="listing-img-wrapper">
        <Link to={`/properties/${id}`}>
          <img
            src={images[0]?.image_url || "https://placehold.co/1280x850"}
            className="img-fluid mx-auto rounded"
            alt={images[0]?.alt_text || title}
          />
        </Link>
      </div>

      <div className="listing-content">
        <div className="listing-detail-wrapper-box">
          <div className="listing-detail-wrapper d-flex align-items-center justify-content-between">
            <div className="listing-short-detail">
              <div className="d-flex justify-content-between align-items-center">
                <span
                  className={`label d-inline-flex mb-1 ${
                    is_urgent ? "bg-danger text-white" : "for-sale"
                  }`}
                >
                  {is_urgent ? "Urgent" : "Normal"}
                </span>

                {is_featured && (
                  <span className="label d-inline-flex mb-1 ms-2 bg-warning text-white">
                    Featured
                  </span>
                )}
              </div>

              <h4 className="listing-name mb-0">
                <Link to={`/properties/${id}`}>{title}</Link>
              </h4>
              <div className="fr-can-rating text-muted-2 fs-sm">
                {tags.join(", ")}
              </div>
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

        {/* Price & Features */}
        <div className="price-features-wrapper">
          <div className="list-fx-features d-flex align-items-center justify-content-between mt-3 mb-1">
            {/* BHK with hover tooltip */}
            <div className="listing-card d-flex align-items-center position-relative bhk-card">
              <div className="square--25 text-muted-2 fs-sm circle gray-simple me-1">
                <i className="fa-solid fa-building-shield fs-xs"></i>
              </div>
              <span className="text-muted-2 fs-sm">{bathrooms}BHK</span>

              {/* Tooltip */}
              <div className="tooltip-details position-absolute bg-white border rounded shadow p-2">
                <div className="d-flex align-items-center mb-1">
                  <i className="fa-solid fa-bath me-1"></i>
                  <span>{bathrooms} Bathrooms</span>
                </div>
                <div className="d-flex align-items-center mb-1">
                  <i className="fa-solid fa-kitchen-set me-1"></i>
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
        <div className="listing-footer-wrapper d-flex justify-content-between align-items-center">
          <div className="listing-locate">
            <span className="listing-location text-muted-2">
              <i className="bi bi-geo-alt me-1"></i>
              {location}
            </span>
          </div>
          <div className="listing-detail-btn">
            <Link
              to={`/properties/${id}`}
              className="btn btn-sm px-4 btn-light-main  fw-medium btn-main"
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCard;
