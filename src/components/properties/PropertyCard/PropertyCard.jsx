import { Link } from "react-router-dom";

const PropertyCard = ({ property }) => {
  return (
    <div className="sides_list_property">
      <div className="sides_list_property_thumb">
        <img
          src={property?.images[0]?.image_url}
          className="img-fluid"
          alt={property?.images[0]?.alt_text}
        />
      </div>
      <div className="sides_list_property_detail">
        <h4>
          <a href="single-property-1.html">{property.title}</a>
        </h4>
        <span>
          <i className="fa-solid fa-location-dot"></i>
          {property.location}
        </span>
      </div>
    </div>
  );
};

export default PropertyCard;
