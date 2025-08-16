import React from "react";
import { Card, Badge, Button, Carousel } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

// SingleProperty component for dynamic rendering in a map loop
const SingleProperty = ({ property, images }) => {
  const navigate = useNavigate(); // Hook for navigation

  // Handle navigation to detail page
  const handleNavigate = () => {
    navigate(`/property/${property.id}`); // Navigate to detail page
  };

  // Define badge colors for variety
  const badgeColors = ["bg-primary", "bg-success"];

  return (
    // Card container for the property, clickable for navigation
    <Card
      className="border-0 shadow-sm mb-4 cursor-pointer"
      onClick={handleNavigate}
    >
      // Image and badges container
      <div className="position-relative">
        // Render badges for is_urgent and category
        {property.is_urgent && (
          <Badge
            className={`position-absolute top-0 start-0 m-2 ${badgeColors[0]} text-white`}
          >
            Urgent // Badge for is_urgent
          </Badge>
        )}
        <Badge
          className={`position-absolute top-0 start-0 m-2 ${
            property.is_urgent ? "mt-4" : "mt-2"
          } ${badgeColors[1]} text-white`}
        >
          For {property.category} // Badge for category (e.g., For Sale)
        </Badge>
        // Carousel for images
        <Carousel
          interval={3000}
          controls={images && images.length > 1}
          indicators={images && images.length > 1}
        >
          {images && images.length > 0 ? (
            images.map((image, index) => (
              // Carousel item for each image
              <Carousel.Item key={index}>
                <Card.Img
                  variant="top"
                  src={image.image_url} // Use image from prop
                  alt={image.alt_text} // Use alt text from prop
                  className="rounded-top"
                />
              </Carousel.Item>
            ))
          ) : (
            // Empty carousel item if no images
            <Carousel.Item>
              <div
                className="rounded-top bg-gray-200"
                style={{ height: "200px" }}
              ></div>{" "}
              // Empty container
            </Carousel.Item>
          )}
        </Carousel>
      </div>
      // Card body for property details
      <Card.Body className="p-3">
        // Property type
        <div className="d-flex justify-content-between mb-2">
          <span className="text-capitalize font-semibold text-gray-800">
            {property.title} // Display title (e.g., Cozy Apartment)
          </span>
          <span className="text-capitalize font-semibold text-gray-600">
            {property.property_type} // Display property type (e.g., Apartment)
          </span>
        </div>
        // Property details (status, bedrooms, bathrooms, area size)
        <div className="d-flex justify-content-between mb-3">
          <span className="text-gray-600">
            {property.status} // Display status (e.g., Available)
          </span>
          <span className="text-gray-600">
            {property.bedrooms} Beds // Display bedrooms
          </span>
          <span className="text-gray-600">
            {property.bathrooms} Baths // Display bathrooms
          </span>
          <span className="text-gray-600">
            {property.area_size} SQFT // Display area size
          </span>
        </div>
        // View Detail button
        <Button
          variant="primary"
          className="w-100 rounded-md"
          onClick={handleNavigate} // Navigate on button click
        >
          View Detail
        </Button>
      </Card.Body>
    </Card>
  );
};

export default SingleProperty; // Export the SingleProperty component
