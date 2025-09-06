import React, { useEffect, useRef, useState } from "react";
import {
  getPropertyById,
  getAllProperties,
} from "../../../api/properties.api.js";
import { getPropertyImages } from "../../../api/PropertiesImage.api.js";
import { useParams } from "react-router-dom";
import ContactForm from "../../../components/ContactForm/ContactForm.jsx";
import PropertyCard from "../PropertyCard/PropertyCard.jsx";
import PropertyGallery from "../PropertyGallery/PropertyGallery.jsx";
import useLoader from "../../../../../context/Loader/UseLoader.jsx";
const PropertyDetails = ({ isPublicPage = true }) => {
  const [property, setProperty] = useState({});
  const [images, setImages] = useState([]);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const { showLoader, hideLoader } = useLoader();

  const { id } = useParams();

  const fetchProperty = async (id) => {
    try {
      showLoader(); // use global loader

      // 1. Fetch main property
      const propertyRes = await getPropertyById(id);
      setProperty(propertyRes?.data || {});

      // 2. Fetch images for main property
      const imagesRes = await getPropertyImages(id);
      setImages(imagesRes?.data?.data || []);

      // 3. Fetch featured properties
      const featuredRes = await getAllProperties({ isFeatured: true });
      const featuredList = featuredRes?.data?.properties || [];

      // 4. Fetch images for all featured properties in parallel
      const imagesResponses = await Promise.all(
        featuredList.map((prop) => getPropertyImages(prop.id))
      );

      // 5. Merge images into each featured property
      const featuredWithImages = featuredList.map((prop, index) => ({
        ...prop,
        images: imagesResponses[index]?.data?.data || [],
      }));

      setFeaturedProperties(featuredWithImages);
    } finally {
      hideLoader(); // stop global loader
    }
  };

  const prevIdRef = useRef();

  useEffect(() => {
    if (!id) return;

    // If id changed or first render
    if (prevIdRef.current !== id) {
      prevIdRef.current = id;

      // Clear all states
      setProperty({ coordinates: {} });
      setImages([]);
      setFeaturedProperties([]);

      // Optional: reset other fields if you have them
      // setOtherState(...);

      // Fetch new property data
      (async () => {
        try {
          showLoader();
          await fetchProperty(id);
        } finally {
          hideLoader();
        }
      })();
    }
  }, [id]);
  // Safely get a features array, handling both array and string formats from the API
  const amenities = Array.isArray(property?.features)
    ? property.features
    : typeof property?.features === "string"
    ? JSON.parse(property.features || "[]")
    : [];

  // Safely get the coordinates object, handling string format
  const safeCoordinates =
    typeof property?.coordinates === "string"
      ? JSON.parse(property.coordinates || "{}")
      : property?.coordinates;

  return (
    <div style={{ marginTop: "50px" }}>
      <PropertyGallery images={images} />
      <section className="gray-simple">
        <div className="container">
          <div className="row">
            {/* Main Detail Section */}
            <div className="col-lg-8 col-md-12 col-sm-12">
              {/* Property Main Detail */}
              <div className="property_block_wrap style-2 p-4">
                {property && (
                  <div className="prt-detail-title-desc">
                    <span className="label text-white bg-green fw-semibold">
                      For {property.category}
                    </span>
                    <h3 className="mt-2">{property.title}</h3>
                    <span>
                      {/* <h3 className="prt=price-fix text-main">
                        {property.is_urgent ? (
                          <span>Urgent</span>
                        ) : property.is_featured ? (
                          <span>Featured</span>
                        ) : (
                          <span>Regular</span>
                        )}
                      </h3> */}
                      <i className="bi bi-geo-alt me-1"></i>
                      {property.location}
                    </span>
                    <div className="list-fx-features">
                      <div className="listing-card-info-icon">
                        <div className="square--25 text-muted-2 fs-sm circle gray-simple me-1">
                          <i className="fa-solid fa-bed fs-xs"></i>
                        </div>
                        {property.bedrooms} Beds
                      </div>
                      <div className="listing-card-info-icon">
                        <div className="square--25 text-muted-2 fs-sm circle gray-simple me-1">
                          <i className="fa-solid fa-bath me-1"></i>
                        </div>
                        {property.bathrooms} Bath
                      </div>
                      <div className="listing-card-info-icon">
                        <div className="square--25 text-muted-2 fs-sm circle gray-simple me-1">
                          <i className="fa-solid fa-clone fs-xs"></i>
                        </div>
                        {property.area_size} SQFT
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Detail & Features */}
              <div className="property_block_wrap style-2">
                <div className="property_block_wrap_header">
                  <a
                    data-bs-toggle="collapse"
                    data-parent="#features"
                    data-bs-target="#clOne"
                    aria-controls="clOne"
                    href="javascript:void(0);"
                    aria-expanded="false"
                  >
                    <h4 className="property_block_title">Detail & Features</h4>
                  </a>
                </div>
                <div
                  id="clOne"
                  className="panel-collapse collapse show"
                  aria-labelledby="clOne"
                >
                  <div className="block-body">
                    <ul className="deatil_features">
                      <li>
                        <strong>Bedrooms:</strong>
                        {property.bedrooms}
                      </li>
                      <li>
                        <strong>Bathrooms:</strong>
                        {property.bathrooms}
                      </li>
                      <li>
                        <strong>Areas:</strong>
                        {property.area_size} SQFT
                      </li>

                      <li>
                        <strong>Property Type:</strong>
                        {property.property_type}
                      </li>
                      <li>
                        <strong>Year:</strong>
                        {/* {property.created_at} change it to normal format */}
                        {new Date(property.created_at).getFullYear()}
                      </li>
                      <li>
                        <strong>Status:</strong>
                        {property.status}
                      </li>
                      <li>
                        <strong>Halls:</strong>
                        {property.halls}
                      </li>
                      <li>
                        <strong>Kitchens:</strong>
                        {property.kitchens}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="property_block_wrap style-2">
                <div className="property_block_wrap_header">
                  <a
                    data-bs-toggle="collapse"
                    data-parent="#dsrp"
                    data-bs-target="#clTwo"
                    aria-controls="clTwo"
                    href="javascript:void(0);"
                    aria-expanded="true"
                  >
                    <h4 className="property_block_title">Description</h4>
                  </a>
                </div>
                <div id="clTwo" className="panel-collapse collapse show">
                  <div className="block-body">
                    <p>{property.description}</p>
                  </div>
                </div>
              </div>

              {/* Single Block Wrap   For Amenities */}
              <div className="property_block_wrap style-2">
                <div className="property_block_wrap_header">
                  <a
                    data-bs-toggle="collapse"
                    data-parent="#amen"
                    data-bs-target="#clThree"
                    aria-controls="clThree"
                    href="javascript:void(0);"
                    aria-expanded="true"
                  >
                    <h4 className="property_block_title">Ameneties</h4>
                  </a>
                </div>

                <div id="clThree" className="panel-collapse collapse show">
                  <div className="block-body">
                    <ul className="avl-features third color">
                      {amenities.map((amenity, index) => (
                        <li key={index}>
                          <i className="bi bi-check"></i>
                          <span>{amenity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              {/* Single Block Wrap For Location */}
              {safeCoordinates?.latitude != null &&
                safeCoordinates?.longitude != null && (
                  <div className="property_block_wrap style-2">
                    <div className="property_block_wrap_header">
                      <a
                        data-bs-toggle="collapse"
                        data-parent="#loca"
                        data-bs-target="#clSix"
                        aria-controls="clSix"
                        href="#!"
                        aria-expanded="true"
                        className="collapsed"
                      >
                        <h4 className="property_block_title">Location</h4>
                      </a>
                    </div>

                    <div id="clSix" className="panel-collapse collapse">
                      <div className="block-body">
                        <div className="map-container">
                          <iframe
                            src={`https://maps.google.com/maps?q=${safeCoordinates.latitude},${safeCoordinates.longitude}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                            width="100%"
                            height="450"
                            title="Property Location"
                          ></iframe>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* Single Block Wrap  For Gallery*/}
              <div className="property_block_wrap style-2">
                <div className="property_block_wrap_header">
                  <a
                    data-bs-toggle="collapse"
                    data-parent="#clSev"
                    data-bs-target="#clSev"
                    aria-controls="clOne"
                    href="javascript:void(0);"
                    aria-expanded="true"
                    className="collapsed"
                  >
                    <h4 className="property_block_title">Gallery</h4>
                  </a>
                </div>

                <div id="clSev" className="panel-collapse collapse show">
                  <div className="block-body">
                    <ul className="list-gallery-inline">
                      {images.map((image, index) => (
                        <li key={index}>
                          <a href={image.url} className="mfp-gallery">
                            <img
                              src={image.image_url}
                              className="img-fluid mx-auto"
                              alt=""
                            />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            {/* Sidebar Section */}

            <div className="col-lg-4 col-md-12 col-sm-12">
              <div className="details-sidebar">
                {isPublicPage && (
                  <div className="sides-widget">
                    <ContactForm id={property.id} />
                  </div>
                )}
                {/* Featured Properties */}

                <div className="sidebar-widgets">
                  <h4>Featured Property</h4>
                  <div className="sidebar_featured_property mt-3">
                    {featuredProperties.map((property) => (
                      <PropertyCard
                        property={property}
                        key={property.id}
                        isPublicPage={isPublicPage}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* End Sidebar */}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PropertyDetails;
