import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllProperties } from "../../api/properties.api";
import { getPropertyImages } from "../../api/PropertiesImage.api";
import FeaturedCard from "./FeaturedCard";
import Loader from "../../../../shared/components/Loader/Loader";

function Featured() {
  const [properties, setProperties] = useState([]);
  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch featured properties
        const params = { isFeatured: true };
        const data = await getAllProperties(params);
        const featuredList = data?.data?.properties || [];
        setProperties(featuredList);

        // Fetch images for each featured property
        const imagesResponses = await Promise.all(
          featuredList.map((prop) => getPropertyImages(prop.id))
        );

        // Create images object with property IDs as keys
        const imagesMap = featuredList.reduce((acc, prop, index) => {
          acc[prop.id] = imagesResponses[index]?.data?.data || [];
          return acc;
        }, {});

        setImages(imagesMap);

        // Debug: Log the images data
        // console.log("Images data:", imagesMap);
      } catch (err) {
        setError("Failed to fetch properties or images.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <section className="bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-7 col-md-10 text-center">
            <div className="sec-heading center">
              <h2>Featured Properties For Sale</h2>
              <p>
                Discover the finest properties curated just for you. I am
                dedicated to helping you find your dream home with ease and
                confidence, offering personalized service every step of the way.
              </p>
            </div>
          </div>
        </div>

        <div className="row list-layout">
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <Loader />
            </div>
          ) : error ? (
            <p className="text-danger text-center">{error}</p>
          ) : properties.length === 0 ? (
            <p className="text-center">No featured properties found.</p>
          ) : (
            properties.map((property) => (
              <div className="col-xl-6 col-lg-6 col-md-12" key={property.id}>
                <FeaturedCard
                  property={property}
                  images={images[property.id] || []}
                />
              </div>
            ))
          )}
        </div>

        {!loading && (
          <div className="row">
            <div className="col-lg-12 col-md-12 col-sm-12 text-center mt-4">
              <Link to="/properties" className="btn btn-main px-lg-5 rounded">
                Browse More Properties
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Featured;
