import React, { useEffect, useState } from "react";
import {
  getPropertyById,
  getPropertyImages,
  getAgentProfile,
  getFeaturedProperties,
} from "../../api/public/properties.api.js";
import { useParams } from "react-router-dom";
import ContactForm from "../../components/ContactForm/ContactForm.jsx";
import PropertyCard from "../../components/PropertyCard/PropertyCard.jsx";
const PropertyDetails = () => {
  const [property, setProperty] = useState({});
  const [images, setImages] = useState([]);
  const [profile, setProfile] = useState({});
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const { id } = useParams();
  const fetchProperty = async (id) => {
    // 1. Fetch main property + images + profile
    const property = await getPropertyById(id);
    setProperty(property);

    const images = await getPropertyImages(id);
    setImages(images);

    const profile = await getAgentProfile();
    setProfile(profile);

    // 2. Fetch featured properties
    const featured = await getFeaturedProperties({ isFeatured: true });

    // 3. Fetch images for all featured properties in parallel
    const imagesResponses = await Promise.all(
      featured.map((prop) => getPropertyImages(prop.id))
    );

    // 4. Merge images into each property
    const featuredWithImages = featured.map((prop, index) => ({
      ...prop,
      images: imagesResponses[index] || [],
    }));

    setFeaturedProperties(featuredWithImages);
  };

  useEffect(() => {
    fetchProperty(id);
  }, []);
  return (
    <>
      <div class="featured_slick_gallery gray">
        <div class="featured_slick_gallery-slide">
          {images.map((image, index) => (
            <div class="featured_slick_padd" key={index}>
              <a href={image.url} class="mfp-gallery">
                <img src={image.image_url} class="img-fluid mx-auto" alt="" />
              </a>
            </div>
          ))}
        </div>
        <a href="JavaScript:Void(0);" class="btn-view-pic top">
          View photos
        </a>
      </div>

      <section className="gray-simple">
        <div className="container">
          <div className="row">
            {/* Main Detail Section */}
            <div className="col-lg-8 col-md-12 col-sm-12">
              {/* Property Main Detail */}
              <div className="property_block_wrap style-2 p-4">
                {property && (
                  <div className="prt-detail-title-desc">
                    <span className="label text-light bg-green">
                      For {property.category}
                    </span>
                    <h3>{property.title}</h3>
                    <span>
                      <i className="bi bi-geo-alt"></i>
                      {property.location}
                    </span>
                    <div className="list-fx-features">
                      <div className="listing-card-info-icon">
                        <div className="inc-fleat-icon me-1">
                          <img src="assets/img/bed.svg" width="13" alt="" />
                        </div>
                        {property.bedrooms} Beds
                      </div>
                      <div className="listing-card-info-icon">
                        <div className="inc-fleat-icon me-1">
                          <img src="assets/img/bathtub.svg" width="13" alt="" />
                        </div>
                        {property.bathrooms} Bath
                      </div>
                      <div className="listing-card-info-icon">
                        <div className="inc-fleat-icon me-1">
                          <img src="assets/img/move.svg" width="13" alt="" />
                        </div>
                        {property.area_size} sqft
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
                        {property.bedrooms} Beds
                      </li>
                      <li>
                        <strong>Bathrooms:</strong>
                        {property.bathrooms} Bath
                      </li>
                      <li>
                        <strong>Areas:</strong>
                        {property.area_size} sq ft
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
                    <p>{property.description}...</p>
                  </div>
                </div>
              </div>

              {/* Single Block Wrap   For Amenities */}
              <div class="property_block_wrap style-2">
                <div class="property_block_wrap_header">
                  <a
                    data-bs-toggle="collapse"
                    data-parent="#amen"
                    data-bs-target="#clThree"
                    aria-controls="clThree"
                    href="javascript:void(0);"
                    aria-expanded="true"
                  >
                    <h4 class="property_block_title">Ameneties</h4>
                  </a>
                </div>

                <div id="clThree" class="panel-collapse collapse show">
                  <div class="block-body">
                    <ul class="avl-features third color">
                      {property?.features?.map((amenity) => (
                        <li>
                          <i class="bi bi-check"></i>
                          <span>{amenity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              {/* Single Block Wrap For Location */}
              <div class="property_block_wrap style-2">
                <div class="property_block_wrap_header">
                  <a
                    data-bs-toggle="collapse"
                    data-parent="#loca"
                    data-bs-target="#clSix"
                    aria-controls="clSix"
                    href="javascript:void(0);"
                    aria-expanded="true"
                    class="collapsed"
                  >
                    <h4 class="property_block_title">Location</h4>
                  </a>
                </div>

                <div id="clSix" class="panel-collapse collapse show">
                  <div class="block-body">
                    <div class="map-container">
                      {/* Add Google Map with longitude and latitude coordinates */}
                      <iframe
                        src={`https://maps.google.com/maps?q=${property?.coordinates?.latitude},${property?.coordinates?.longitude}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                        width="100%"
                        height="450"
                        frameborder="0"
                        scrolling="no"
                        marginheight="0"
                        marginwidth="0"
                      ></iframe>
                    </div>
                  </div>
                </div>
              </div>
              {/* Single Block Wrap  For Gallery*/}
              <div class="property_block_wrap style-2">
                <div class="property_block_wrap_header">
                  <a
                    data-bs-toggle="collapse"
                    data-parent="#clSev"
                    data-bs-target="#clSev"
                    aria-controls="clOne"
                    href="javascript:void(0);"
                    aria-expanded="true"
                    class="collapsed"
                  >
                    <h4 class="property_block_title">Gallery</h4>
                  </a>
                </div>

                <div id="clSev" class="panel-collapse collapse">
                  <div class="block-body">
                    <ul class="list-gallery-inline">
                      {images.map((image, index) => (
                        <li>
                          <a href={image.url} class="mfp-gallery">
                            <img
                              src={image.image_url}
                              class="img-fluid mx-auto"
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
                <div className="sides-widget">
                  <ContactForm profile={profile} />
                </div>
                {/* Featured Properties */}
                <div class="sidebar-widgets">
                  <h4>Featured Property</h4>
                  <div class="sidebar_featured_property">
                    {featuredProperties.map((property) => (
                      <PropertyCard property={property} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* End Sidebar */}
          </div>
        </div>
      </section>
    </>
  );
};

export default PropertyDetails;
