import { Link } from "react-router-dom";

const PropertyCard = ({ property }) => {
  return (
    <Link to={`/properties/${property.id}`} className="sides_list_property ">
      <div className="sides_list_property_thumb">
        <img
          src={property?.images[0]?.image_url}
          className="img-fluid"
          alt={property?.images[0]?.alt_text}
        />
      </div>
      <div className="sides_list_property_detail">
        <h4>
          <a>{property.title}</a>
        </h4>
        <span class="text-muted-2">
          <i class="bi bi-geo-alt me-1"></i>
          {property.location}
        </span>

        <div class="lists_property_types">
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
