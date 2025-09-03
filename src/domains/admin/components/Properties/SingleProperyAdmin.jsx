import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEdit, FaEye, FaTrash, FaStar } from "react-icons/fa";

const SinglePropertyAdmin = ({
  property,
  images,
  onDelete,
  onToggleFeatured,
}) => {
  const navigate = useNavigate();

  const handleView = () => navigate(`/properties/${property.id}`);
  const handleEdit = () => navigate(`/admin/properties/${property.id}`);
  const handleDeleteClick = () => onDelete(property.id);

  const handleFeatured = () => {
    if (onToggleFeatured) {
      const newValue = property.is_featured == "1" ? "0" : "1";
      onToggleFeatured(property.id, newValue);
    }
  };

  const propertyImage =
    images && images.length > 0
      ? images[0].image_url
      : "https://placehold.co/1280x850";

  const isFeatured = property.is_featured ;

  const iconStyle = {
    cursor: "pointer",
    fontSize: "18px",
    transition: "transform 0.2s ease, color 0.2s ease",
  };

  return (
    <div className="col-md-9 col-sm-12 ps-3 pe-2 ">
      {/* Single Property */}
      <div className="singles-dashboard-list d-flex flex-column flex-md-row align-items-start">
        {/* Image Left */}
        <div className="sd-list-left flex-shrink-0 p-2">
          <img
            src={propertyImage}
            alt={property.title || "Property Image"}
            className="img-fluid"
            style={{
              width: "100%",
              height: "200px",
              objectFit: "cover",
            }}
          />
        </div>

        {/* Details Right */}
        <div className="sd-list-right flex-grow-1 d-flex flex-column mt-3 mt-md-0">
          <div className="sd-list-left">
            <h4 className="listing_dashboard_title mt-0">
              <Link
                to={`/admin/properties/${property.id}`}
                className="text-decoration-none"
                title={property.title}
                style={{
                  maxWidth: "200px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {property.title}
              </Link>
            </h4>

            {property.price && (
              <div className="user_dashboard_listed mb-1">
                Price: from{" "}
                <span className="text-primary">${property.price}</span>
                {property.price_type ? ` / ${property.price_type}` : ""}
              </div>
            )}

            {property.tags && Array.isArray(property.tags) && (
              <div className="user_dashboard_listed mb-1">
                Listed in{" "}
                <span className="text-success">{property.property_type}</span>{" "}
                and <span className="text-danger">{property.status}</span>
              </div>
            )}

            <div className="user_dashboard_listed">
              {property.location && (
                <>
                  City: <span className="text-dark">{property.location}</span>
                </>
              )}
              {property.area_size && (
                <>
                  {" , "}Area: <span>{property.area_size} sq ft</span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="action mt-3 d-flex justify-content-start gap-3">
            <FaEdit
              style={iconStyle}
              className="text-primary"
              title="Edit"
              onClick={handleEdit}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "scale(1.2)")
              }
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
            <FaEye
              style={iconStyle}
              className="text-info"
              title="View"
              onClick={handleView}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "scale(1.2)")
              }
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
            <FaTrash
              style={iconStyle}
              className="text-danger"
              title="Delete Property"
              onClick={handleDeleteClick}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "scale(1.2)")
              }
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
            <FaStar
              style={iconStyle}
              className={isFeatured ? "text-warning" : "text-secondary"}
              title={isFeatured ? "Unmark Featured" : "Make Featured"}
              onClick={handleFeatured}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "scale(1.2)")
              }
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinglePropertyAdmin;
