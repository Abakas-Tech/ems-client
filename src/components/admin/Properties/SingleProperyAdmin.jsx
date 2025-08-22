import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaPen, FaEye, FaTrash, FaStar } from "react-icons/fa";

const SinglePropertyAdmin = ({ property, images }) => {
  const navigate = useNavigate();

  const handleView = () => navigate(`/admin/properties/${property.id}`);
  const handleEdit = () => alert(`Edit property: ${property.title}`);
  const handleDelete = () => {
    if (
      window.confirm(`Are you sure you want to delete "${property.title}"?`)
    ) {
      alert("Property deleted!");
    }
  };
  const handleFeatured = () => alert(`"${property.title}" is now featured!`);

  const propertyImage =
    images && images.length > 0
      ? images[0].image_url
      : "https://placehold.co/1280x850";

  const containerHeight = 150; // fixed height in px

  return (
    <div className="col-md-12 col-sm-12 mb-2">
      <div
        className="d-flex border rounded shadow-sm overflow-hidden"
        style={{
          backgroundColor: "#fff",
          height: `${containerHeight}px`,
          gap: "10px",
        }}
      >
        {/* Image Container */}
        <div
          className="d-flex flex-shrink-0"
          style={{ width: "200px", height: "100%" }}
        >
          <img
            src={propertyImage}
            alt={property.title || "Property Image"}
            className="img-fluid"
            style={{
              height: "100%",
              width: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        {/* Details */}
        <div className="flex-grow-1 p-2 d-flex flex-column justify-content-between">
          <div>
            <h5 className="mb-1">
              <Link
                to={`/admin/properties/${property.id}`}
                className="text-decoration-none text-dark"
              >
                {property.title}
              </Link>
            </h5>

            {property.price && (
              <div className="mb-1 text-dark">
                Price: <span className="text-primary">${property.price}</span>
                {property.price_type ? ` / ${property.price_type}` : ""}
              </div>
            )}

            {property.tags && Array.isArray(property.tags) && (
              <div className="mb-1">
                Listed in{" "}
                {property.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="me-1 px-2 py-1 rounded"
                    style={{ fontSize: "0.8rem", color: "#4b0082" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div
              className="d-flex flex-wrap gap-2 text-dark"
              style={{ fontSize: "0.9rem" }}
            >
              {property.location && (
                <span>
                  City:{" "}
                  <span className="text-primary">{property.location}</span>
                </span>
              )}
              {property.property_type && (
                <span>
                  Type:{" "}
                  <span className="text-success">{property.property_type}</span>
                </span>
              )}
              {property.area_size && (
                <span>
                  Area:{" "}
                  <span className="text-success">
                    {property.area_size} sq ft
                  </span>
                </span>
              )}
              {property.status && (
                <span>
                  Status:{" "}
                  <span
                    className={
                      property.status.toLowerCase() === "active"
                        ? "text-success"
                        : "text-danger"
                    }
                  >
                    {property.status}
                  </span>
                </span>
              )}
            </div>
          </div>

          <div className="d-flex gap-2 mt-2">
            {[
              {
                onClick: handleEdit,
                title: "Edit",
                icon: <FaPen />,
              },
              {
                onClick: handleView,
                title: "View",
                icon: <FaEye />,
              },
              {
                onClick: handleDelete,
                title: "Delete",
                icon: <FaTrash />,
              },
              {
                onClick: handleFeatured,
                title: "Make Featured",
                icon: <FaStar />,
              },
            ].map((btn, i) => (
              <button
                key={i}
                type="button"
                onClick={btn.onClick}
                title={btn.title}
                className="btn p-1 d-flex align-items-center justify-content-center"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#e0d4f7",
                  color: "#2c2c2c",
                  border: "none",
                  fontSize: "0.9rem",
                }}
              >
                {btn.icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinglePropertyAdmin;
