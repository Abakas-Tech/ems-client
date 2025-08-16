import React from "react";

const FeaturedCard = ({ property }) => {
  const {
    title,
    location,
    is_featured,
    status,
    area_size,
    bedrooms,
    bathrooms,
    features,
    tags,
    coordinates,
  } = property;

  const parsedCoordinates =
    typeof coordinates === "string" ? JSON.parse(coordinates) : coordinates;

  return (
    <div className="property-listing property-1 bg-white p-2 rounded">
      <div className="listing-img-wrapper">
        <a href={`/properties/${property.id}`}>
          <img
            src={property.image_url || "https://placehold.co/1280x850"}
            className="img-fluid mx-auto rounded"
            alt={title}
          />
        </a>
      </div>

      <div className="listing-content">
        <div className="listing-detail-wrapper-box">
          <div className="listing-detail-wrapper d-flex align-items-center justify-content-between">
            <div className="listing-short-detail">
              {is_featured && (
                <span className="label featured d-inline-flex mb-1">
                  Featured
                </span>
              )}
              <h4 className="listing-name mb-0">
                <a href={`/properties/${property.id}`}>{title}</a>
              </h4>
              <div className="fr-can-rating">
                <i className="fas fa-star fs-xs filled"></i>
                <i className="fas fa-star fs-xs filled"></i>
                <i className="fas fa-star fs-xs filled"></i>
                <i className="fas fa-star fs-xs filled"></i>
                <i className="fas fa-star fs-xs"></i>
              </div>
            </div>
            <div className="list-price">
              <h6 className="listing-card-info-price text-main">
                ${property.price || "N/A"}
              </h6>
            </div>
          </div>
        </div>

        <div className="price-features-wrapper">
          <div className="list-fx-features d-flex align-items-center justify-content-between mt-3 mb-1">
            <div className="listing-card d-flex align-items-center">
              <div className="square--25 text-muted-2 fs-sm circle gray-simple me-1">
                <i className="fa-solid fa-bed fs-xs"></i>
              </div>
              <span className="text-muted-2 fs-sm">{bedrooms} Beds</span>
            </div>
            <div className="listing-card d-flex align-items-center">
              <div className="square--25 text-muted-2 fs-sm circle gray-simple me-1">
                <i className="fa-solid fa-bath fs-xs"></i>
              </div>
              <span className="text-muted-2 fs-sm">{bathrooms} Baths</span>
            </div>
            <div className="listing-card d-flex align-items-center">
              <div className="square--25 text-muted-2 fs-sm circle gray-simple me-1">
                <i className="fa-solid fa-clone fs-xs"></i>
              </div>
              <span className="text-muted-2 fs-sm">{area_size} SQFT</span>
            </div>
          </div>
        </div>

        <div className="listing-footer-wrapper">
          <div className="listing-locate">
            <span className="listing-location text-muted-2">
              <i className="fa-solid fa-location-pin me-1"></i>
              {location}
            </span>
          </div>
          <div className="listing-detail-btn">
            <a
              href={`/properties/${property.id}`}
              className="btn btn-sm px-4 fw-medium btn-main"
            >
              View
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCard;
