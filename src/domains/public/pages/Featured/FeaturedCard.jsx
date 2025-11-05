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
  // Helper function to parse and format tags
  const parseAndFormatTags = (tags) => {
    // Check if it's already a valid array
    if (Array.isArray(tags) && tags.length > 0) {
      return tags.join(", ");
    }

    // Check if it's a string and try to parse it
    if (typeof tags === "string") {
      try {
        const parsedTags = JSON.parse(tags);
        if (Array.isArray(parsedTags) && parsedTags.length > 0) {
          return parsedTags.join(", ");
        }
      } catch {
        // If parsing fails, it's not valid JSON, so return an empty string.
        return "";
      }
    }

    // Fallback for null, undefined, or empty arrays/strings
    return "";
  };
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
        <div className="listing-detail-wrapper-box m-0">
          <div className="listing-detail-wrapper d-flex align-items-center justify-content-between m-0 px-2 py-0">
            <div className="listing-short-detail mb-0 p-0">
              <div className="d-flex flex-wrap align-items-center mt-2 mt-lg-0">
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

              <h5 className="mt-2">
                <Link to={`/properties/${id}`}>{title}</Link>
              </h5>
              <div className="fr-can-rating text-muted-2 fs-sm">
                <div>{parseAndFormatTags(tags)}</div>
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
                  <span>{halls} Living & Dining</span>
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
