import React from "react";
import { Carousel, Badge, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt } from "react-icons/fa";

const SingleProperty = ({ property, images }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/property/${property.id}`);
  };

  const propertyImages =
    images && images.length > 0
      ? images
      : [
          {
            image_url: "https://placehold.co/400x300",
            alt_text: "Property Image",
          },
        ];

  return (
    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
      <div className="property-listing list_view style_new border-0 shadow-sm mb-4">
        <div className="d-flex flex-column flex-lg-row">
          {/* Image Section */}
          <div
            className="listing-img-wrapper position-relative flex-shrink-0"
            style={{ width: "350px", height: "250px" }}
          >
            {/* Badges */}
            <div className="position-absolute top-0 start-0 ms-3 mt-3 z-1 d-flex">
              {property.category && (
                <Badge bg="info" className="me-1">
                  {property.category}
                </Badge>
              )}
              {property.property_type && (
                <Badge bg="success">{property.property_type}</Badge>
              )}
            </div>

            <Carousel indicators={propertyImages.length > 1} interval={null}>
              {propertyImages.map((img, idx) => (
                <Carousel.Item key={idx}>
                  <a href="#" onClick={handleNavigate}>
                    <img
                      src={img.image_url}
                      alt={img.alt_text}
                      className="img-fluid w-100 h-100"
                      style={{ objectFit: "cover" }}
                    />
                  </a>
                </Carousel.Item>
              ))}
            </Carousel>
          </div>

          {/* Details Section */}
          <div className="list_view_flex p-3 flex-grow-1">
            <div className="listing-detail-wrapper mt-1">
              {/* Title */}
              <h4 className="listing-name mb-2">
                <a href="#" className="prt-link-detail" onClick={handleNavigate}>
                  {property.title}
                </a>
              </h4>

              {/* Location */}
              {property.location && (
                <div className="d-flex align-items-center mb-2">
                  <FaMapMarkerAlt className="me-2 text-danger" size={18} />
                  <span className="fw-medium">Location:</span>&nbsp;
                  {property.location}
                </div>
              )}

              {/* Features */}
              <div className="list-fx-features d-flex flex-wrap align-items-center mt-2">
                {property.bedrooms && (
                  <div className="listing-card d-flex align-items-center me-3 mb-1">
                    <FaBed className="me-1" color="#FF6B6B" size={18} />
                    <span className="fw-medium">{property.bedrooms} Bedrooms</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="listing-card d-flex align-items-center me-3 mb-1">
                    <FaBath className="me-1" color="#1DD1A1" size={18} />
                    <span className="fw-medium">{property.bathrooms} Bathrooms</span>
                  </div>
                )}
                {property.area_size && (
                  <div className="listing-card d-flex align-items-center mb-1">
                    <FaRulerCombined className="me-1" color="#54a0ff" size={18} />
                    <span className="fw-medium">{property.area_size} SQFT</span>
                  </div>
                )}
              </div>

              {/* View Detail Button */}
              <div className="listing-detail-footer d-flex justify-content-end mt-3">
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
      </div>
    </div>
  );
};

export default SingleProperty;
