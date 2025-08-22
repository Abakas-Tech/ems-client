import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaPen, FaEye, FaTrash, FaStar } from "react-icons/fa";

const SingleProperty = ({ property, images }) => {
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/admin/properties/${property.id}`);
  };

  const handleEdit = () => {
    alert(`Edit property: ${property.title}`);
  };

  const handleDelete = () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${property.title}"?`
    );
    if (confirmDelete) {
      alert("Property deleted!"); // replace with delete API call
    }
  };

  const handleFeatured = () => {
    alert(`"${property.title}" is now featured!`);
  };

  const propertyImage =
    images && images.length > 0
      ? images[0].image_url
      : "https://placehold.co/1280x850";

  return (
    <div className="col-md-12 col-sm-12 col-12 mb-3">
      <div className="singles-dashboard-list d-flex border rounded shadow-sm overflow-hidden">
        <div className="sd-list-left flex-shrink-0">
          <img
            src={propertyImage}
            alt={property.title || "Property Image"}
            className="img-fluid"
            style={{ width: "180px", height: "130px", objectFit: "cover" }}
          />
        </div>
        <div className="sd-list-right flex-grow-1 p-3">
          <h4 className="listing_dashboard_title mb-2">
            <Link
              to={`/admin/properties/${property.id}`}
              className="text-decoration-none"
            >
              {property.title}
            </Link>
          </h4>
          {property.tags && (
            <div className="mb-1">
              {property.tags.split(",").map((tag, idx) => (
                <span key={idx} className="badge bg-info text-dark me-1">
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
          {property.location && (
            <div className="user_dashboard_listed mb-1">
              Location:{" "}
              <span className="text-primary">{property.location}</span>
            </div>
          )}
          {property.property_type && (
            <div className="user_dashboard_listed mb-2">
              Type:{" "}
              <span className="text-success">{property.property_type}</span>
            </div>
          )}
          <div className="action d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={handleEdit}
              title="Edit"
            >
              <FaPen />
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-success"
              onClick={handleView}
              title="View"
            >
              <FaEye />
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={handleDelete}
              title="Delete"
            >
              <FaTrash />
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-warning"
              onClick={handleFeatured}
              title="Make Featured"
            >
              <FaStar />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleProperty;
