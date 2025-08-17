import React, { useEffect, useState } from "react";
import { Row, Col, Container, Button } from "react-bootstrap";
import { FaFilter } from "react-icons/fa";
import FilterSidebar from "./filterSideBar";
import PaginationAndSort from "./paginationAndSort";
import SingleProperty from "./singleProperties";
import { getAllProperties } from "../../api/public/properties.api";
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
  const [showSidebar, setShowSidebar] = useState(false);

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

  // Toggle sidebar visibility
  const handleToggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <Container fluid className="mt-4">
      <Row>
        {/* Sidebar for large screens (static) */}
       
          
            <FilterSidebar
              className="d-none d-lg-block col-sm-12 simple-sidebar sm-sidebar"
              onFilterChange={setFilters}
              filterState={filters}
            />
         
       
        {/* Sidebar for smaller screens (Offcanvas) */}
        <Col lg={4} md={12} className="d-lg-none">
          <FilterSidebar
            show={showSidebar}
            onHide={() => setShowSidebar(false)}
            onFilterChange={setFilters}
            filterState={filters}
          />
        </Col>

        {/* Main content */}
        <Col lg={8} md={12}>
          <Row>
            {/* Toggle button for sidebar on smaller screens */}
            <Col xs={12} className="d-lg-none mb-3">
              <Button
                className="btn btn-main rounded d-flex align-items-center"
                onClick={handleToggleSidebar}
              >
                <FaFilter className="me-2" />
                Filter Properties
              </Button>
            </Col>

            {/* Pagination + Sorting */}
            <PaginationAndSort
              pagination={pagination}
              onPageChange={(page) =>
                setPagination((prev) => ({ ...prev, page }))
              }
              onSortChange={(sort) => setFilters((prev) => ({ ...prev, sort }))}
              total={pagination.total}
            />

            {/* Property List */}
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
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default PropertyListPage;
