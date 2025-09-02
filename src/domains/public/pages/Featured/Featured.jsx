/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllProperties } from "../../api/properties.api";
import { getPropertyImages } from "../../api/PropertiesImage.api";
import FeaturedCard from "./FeaturedCard";
import useLoader from "../../../../context/Loader/UseLoader";

function Featured({ isAdmin = false }) {
  const [properties, setProperties] = useState([]);
  const [images, setImages] = useState({});
  const { showLoader, hideLoader } = useLoader();
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        showLoader();
        setError(null);

        const params = { isFeatured: true };
        const data = await getAllProperties(params);
        const featuredList = data?.data?.properties || [];
        setProperties(featuredList);

        const imagesResponses = await Promise.all(
          featuredList.map((prop) => getPropertyImages(prop.id))
        );

        const imagesMap = featuredList.reduce((acc, prop, index) => {
          acc[prop.id] = imagesResponses[index]?.data?.data || [];
          return acc;
        }, {});

        setImages(imagesMap);
      } catch {
        setError("Failed to fetch properties or images.");
      } finally {
        hideLoader();
      }
    };

    loadData();
  }, []);

  return (
    <section className={isAdmin ? "dashboard-wraper" : "bg-light"}>
      <div className={isAdmin ? "" : "container"}>
        <div className={isAdmin ? "" : "row justify-content-center"}>
          <div className={isAdmin ? "" : "col-lg-7 col-md-10 text-center"}>
            <div className={isAdmin ? "" : "sec-heading center"}>
              <h2
                className={
                  isAdmin
                    ? "fw-bold text-dark mb-2 d-flex align-items-center"
                    : "fw-bold"
                }
              >
                {isAdmin
                  ? "Featured Properties"
                  : "Featured Properties For Sale"}
              </h2>
              <p className={isAdmin ? "text-muted mb-2" : ""}>
                {isAdmin
                  ? "Keep an overview of the properties you’ve marked as featured."
                  : "Discover the finest properties curated just for you. I am dedicated to helping you find your dream home with ease and confidence, offering personalized service every step of the way."}
              </p>
            </div>
          </div>
        </div>

        <div className="row list-layout">
          {error ? (
            <p className="text-danger text-center">{error}</p>
          ) : properties.length === 0 ? (
            <p className="text-center">No featured properties found.</p>
          ) : (
            properties.map((property) => (
              <div
                className={`${
                  !isAdmin
                    ? "col-xl-6 col-lg-6 col-md-12"
                    : "border my-3 rounded w-75 py-0 ms-2 p-0 "
                }`}
                key={property.id}
              >
                <FeaturedCard
                  className={isAdmin && "bg-light"}
                  property={property}
                  images={images[property.id] || []}
                />
              </div>
            ))
          )}
        </div>

        {!isAdmin && (
          <div className="row">
            <div className="col-lg-12 col-md-12 col-sm-12 text-center mt-4">
              <Link
                to="/properties"
                className="btn btn-main px-lg-5 rounded btn-light-main"
              >
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
