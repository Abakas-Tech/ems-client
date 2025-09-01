import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaPen, FaEye, FaTrash, FaStar } from "react-icons/fa";

const SinglePropertyAdmin = ({
  property,
  images,
  onDelete,
  onToggleFeatured,
}) => {
  const navigate = useNavigate();

  const handleView = () => navigate(`/admin/properties/veiw/${property.id}`);
  const handleEdit = () => navigate(`/admin/properties/${property.id}`);

  const handleDeleteClick = () => {
    onDelete(property.id);
  };

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

  const isFeatured = property.is_featured == "1";

  return (
    <div className="col-md-12 col-sm-12 ps-2 pe-2">
      {/* Single Property */}
      <div className="singles-dashboard-list d-flex flex-column flex-md-row align-items-start">
        {/* Image Left */}
        <div className="sd-list-left flex-shrink-0">
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
                <span className="text-green">{property.property_type}</span> and{" "}
                <span className="text-red">{property.status}</span>
              </div>
            )}

            <div className="user_dashboard_listed">
              {property.location && (
                <>
                  City: <span className="text-main">{property.location}</span>
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
          <div className="action mt-2 d-flex gap-1">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleEdit();
              }}
              title="Edit"
            >
              <FaPen />
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleView();
              }}
              title="View"
            >
              <FaEye />
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleDeleteClick();
              }}
              title="Delete Property"
              className="delete"
            >
              <FaTrash />
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleFeatured();
              }}
              title={isFeatured ? "Unmark Featured" : "Make Featured"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "30px",
                height: "30px",
                backgroundColor: isFeatured ? "green" : "blue",
                color: isFeatured ? "white" : "inherit",
                borderRadius: "0", // square shape
              }}
            >
              <FaStar />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinglePropertyAdmin;
