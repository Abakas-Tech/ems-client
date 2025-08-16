import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import instance from "../../utils/axios";
import { fetchFeaturedProperties } from "../../api/public/property.api";
import FeaturedCard from "./FeaturedCard";
function Featured() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchFeaturedProperties();
      setProperties(data);
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <section className="bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-7 col-md-10 text-center">
            <div className="sec-heading center">
              <h2>Featured Property For Sale</h2>
              <p>
                Discover the finest properties curated just for you. I am
                dedicated to helping you find your dream home with ease and
                confidence, offering personalized service every step of the way.
              </p>
            </div>
          </div>
        </div>

        <div className="row list-layout">
          {properties.map((property) => (
            <div className="col-xl-6 col-lg-6 col-md-12" key={property.id}>
              <FeaturedCard property={property} />
            </div>
          ))}
        </div>

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 text-center mt-4">
            <a
              href="listings-list-with-sidebar.html"
              className="btn btn-main px-lg-5 rounded"
            >
              Browse More Properties
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Featured;
