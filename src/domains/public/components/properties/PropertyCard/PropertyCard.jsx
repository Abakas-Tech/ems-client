import { Link } from "react-router-dom";

const PropertyCard = ({ property, isPublicPage }) => {
  // Use placeholder if no image is provided
  const firstImage =
    property?.images && property.images.length > 0
      ? property.images[0]
      : {
          image_url: "https://placehold.co/400x300",
          alt_text: "Property Image",
        };

  return (
    <Link
      to={
        isPublicPage
          ? `/properties/${property.id}`
          : `/admin/properties/veiw/${property.id}`
      }
      className="sides_list_property "
    >
      <div className="sides_list_property_thumb">
        <img
          src={firstImage.image_url}
          className="img-fluid"
          alt={firstImage.alt_text}
        />
      </div>
      <div className="sides_list_property_detail">
        <h4>
          <a>{property.title}</a>
        </h4>
        <span className="text-muted-2">
          <i className="bi bi-geo-alt me-1"></i>
          {property.location}
        </span>

        <div className="lists_property_types">
          <div
            className={
              property.category === "sale"
                ? "property_types_vlix buy"
                : "property_types_vlix"
            }
          >
            For {property.category}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
