// src/pages/PropertyListPage.jsx
import React, { useEffect, useState } from "react";
import { Row, Col, Container } from "react-bootstrap";
import FilterSidebar from "./filterSideBar";
import PaginationAndSort from "./paginationAndSort";
import SingleProperty from "./singleProperties";
import { getAllProperties} from "../../api/public/properties.api";
import { getPropertyImages } from "../../api/public/properties.image.api";

const PropertyListPage = () => {
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [images, setImages] = useState({}); // { propertyId: [images] }

  // Fetch properties
  const fetchProperties = async (params = {}) => {
    setLoading(true);
    try {
      const response = await getAllProperties({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        ...params,
      });

      if (response.status === "success") {
        const { properties, pagination: pg } = response.data;
        console.log(response)
        setProperties(properties);
        setPagination(pg);

        // Fetch images for each property
        const imageResults = {};
        for (const property of properties) {
          const imgRes = await getPropertyImages(property.id);
          if (imgRes.success) {
            imageResults[property.id] = imgRes.data.data;
          }
        }
        setImages(imageResults);
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load + whenever filters/pagination change
  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page, pagination.limit]);

  return (
    <Container fluid className="mt-4">
      <Row>
        {/* Sidebar */}
        <Col lg={4} md={12}>
          <FilterSidebar onFilterChange={setFilters} />
        </Col>

        {/* Property List */}
        <Col lg={8} md={12} className="list-layout">
          <div className="row">
            {loading ? (
              <div className="col-12 text-center my-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : properties.length > 0 ? (
              properties.map((property) => (
                <div className="col-12 mb-4" key={property.id}>
                  <SingleProperty
                    property={property}
                    images={images[property.id] || []}
                  />
                </div>
              ))
            ) : (
              <div className="col-12 text-center">
                <p>No properties found.</p>
              </div>
            )}
          </div>

          {/* Pagination + Sorting */}
          <div className="shorting_pagination mt-4 d-flex justify-content-between align-items-center">
            <PaginationAndSort
              pagination={pagination}
              onPageChange={(page) =>
                setPagination((prev) => ({ ...prev, page }))
              }
              onSortChange={(sort) => setFilters((prev) => ({ ...prev, sort }))}
            />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default PropertyListPage;
