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

  const isFeatured = property.is_featured;

  const iconStyle = {
    cursor: "pointer",
    fontSize: "18px",
    transition: "transform 0.2s ease, color 0.2s ease",
  };

  return (
    <div className="col-md-9 col-sm-12 my-3 p-0 ms-2">
      <div className="property_card shadow-sm rounded overflow-hidden bg-white d-flex flex-column flex-md-row">
        {/* Image Section - Clickable */}
        <div
          className="property_image col-md-5 col-12 p-2"
          style={{ cursor: "pointer" }}
          onClick={handleView}
        >
          <img
            src={propertyImage}
            alt={property.title || "Property Image"}
            className="img-fluid w-100 h-100"
            style={{
              objectFit: "cover",
              minHeight: "200px",
              maxHeight: "220px",
            }}
          />
        </div>

        {/* Details Section */}
        <div className="property_details flex-grow-1 p-3 d-flex flex-column justify-content-between">
          {/* Title */}
          <h5 className="fw-bold text-dark mb-1">
            <Link
              to={`/admin/properties/${property.id}`}
              className="text-decoration-none text-dark"
              title={property.title}
              style={{
                maxWidth: "240px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {property.title}
            </Link>
          </h5>

          {/* Price */}
          {property.price && (
            <div className="mb-1 text-muted">
              Price:{" "}
              <span className="text-primary fw-semibold">
                ${property.price}
              </span>
              {property.price_type ? ` / ${property.price_type}` : ""}
            </div>
          )}

          {/* Type and Status */}
          {property.tags && Array.isArray(property.tags) && (
            <div className="mb-1 text-muted">
              Listed in{" "}
              <span className="text-success">{property.property_type}</span> and{" "}
              <span className="text-danger">{property.status}</span>
            </div>
          )}

          {/* Location & Size */}
          <div className="mb-2 text-muted small">
            {property.location && (
              <>
                City: <span className="text-dark">{property.location}</span>
              </>
            )}
            {property.area_size && (
              <>
                {" , "}Area:{" "}
                <span className="fw-semibold">{property.area_size} sq ft</span>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="mt-2 d-flex gap-2">
            <div
              className="d-flex align-items-center justify-content-center bg-light p-2 rounded shadow-sm"
              title="Edit"
              onClick={handleEdit}
            >
              <FaEdit
                style={iconStyle}
                className="text-primary"
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "scale(1.2)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              />
            </div>

            <div
              className="d-flex align-items-center justify-content-center bg-light p-2 rounded shadow-sm"
              title="View"
              onClick={handleView}
            >
              <FaEye
                style={iconStyle}
                className="text-info"
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "scale(1.2)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              />
            </div>

            <div
              className="d-flex align-items-center justify-content-center bg-light p-2 rounded shadow-sm"
              title="Delete Property"
              onClick={handleDeleteClick}
            >
              <FaTrash
                style={iconStyle}
                className="text-danger"
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "scale(1.2)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              />
            </div>

            <div
              className="d-flex align-items-center justify-content-center bg-light p-2 rounded shadow-sm"
              title={isFeatured ? "Unmark Featured" : "Make Featured"}
              onClick={handleFeatured}
            >
              <FaStar
                style={iconStyle}
                className={isFeatured ? "text-warning" : "text-secondary"}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "scale(1.2)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinglePropertyAdmin;
