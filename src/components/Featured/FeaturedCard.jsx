import React from "react";

const FeaturedCard = ({ property }) => {
  const {
    id,
    title,
    location,
    is_featured,
    status,
    property_type,
    is_urgent,
    area_size,
      bedrooms,
    tags,
    bathrooms,
    features,
    coordinates,
    image_url,
  } = property;

  const parsedCoordinates =
    typeof coordinates === "string" ? JSON.parse(coordinates) : coordinates;

  return (
    <div className="property-listing property-1 bg-white p-2 rounded">
      <div className="listing-img-wrapper">
        <a href={`/properties/${id}`}>
          <img
            src={image_url || "https://placehold.co/1280x850"}
            className="img-fluid mx-auto rounded"
            alt={title}
          />
        </a>
      </div>

      <div className="listing-content">
        <div className="listing-detail-wrapper-box">
          <div className="listing-detail-wrapper d-flex align-items-center justify-content-between">
            <div className="listing-short-detail">
              {/* Urgent / Normal badge above title */}
              <span
                className={`label d-inline-flex mb-1 ${
                  is_urgent
                    ? "bg-danger text-white"
                    : "label for-sale d-inline-flex mb-1"
                }`}
              >
                {is_urgent ? "Urgent" : "Normal"}
              </span>

              {is_featured && (
                <span className="label featured d-inline-flex mb-1 ms-1">
                  Featured
                </span>
              )}

              <h4 className="listing-name mb-0">
                <a href={`/properties/${id}`}>{title}</a>
              </h4>
              <div className="fr-can-rating text-muted-2 fs-sm">{tags}</div>
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

        <div className="listing-footer-wrapper d-flex justify-content-between align-items-center">
          <div className="listing-locate">
            <span className="listing-location text-muted-2">
              <i className="fa-solid fa-location-pin me-1"></i>
              {location}
            </span>
          </div>
          <div className="listing-detail-btn">
            <a
              href={`/properties/${id}`}
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
