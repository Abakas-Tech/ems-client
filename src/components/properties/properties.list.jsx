import React, { useEffect, useState } from "react";
import { Row, Col, Container, Button } from "react-bootstrap";
import { FaFilter } from "react-icons/fa";
import FilterSidebar from "./filterSideBar";
import PaginationAndSort from "./paginationAndSort";
import SingleProperty from "./singleProperties";
import { getAllProperties } from "../../api/public/properties.api";
import { getPropertyImages } from "../../api/public/properties.image.api";
import BottomPagination from "./bottomPagination";

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

  useEffect(() => {
    setProperties(null);
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page, pagination.limit]);

  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setShowSidebar(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div
      style={{
        backgroundColor: "#ECF3FA",
        minHeight: "100vh",
        padding: "20px 0",
      }}
    >
      <Container className="px-3">
        {/* Pagination at top */}
        <Row className="mb-4">
          <Col xs={12}>
            <PaginationAndSort
              pagination={pagination}
              onPageChange={(page) =>
                setPagination((prev) => ({ ...prev, page }))
              }
              onSortChange={(sort) => setFilters((prev) => ({ ...prev, sort }))}
              total={pagination.total}
            />
          </Col>
        </Row>

        {/* Sidebar + Property List */}
        <Row>
          {/* Sidebar for large screens */}
          <Col
            lg={4}
            className="d-none d-lg-block"
            style={{
              overflowY: "auto",
              paddingRight: "15px",
            }}
          >
            <FilterSidebar
              className="w-100"
              onFilterChange={setFilters}
              filterState={filters}
              total={pagination.total}
            />
          </Col>

          {/* Sidebar for smaller screens with smooth open/close */}
          <Col lg={4} md={12} className="d-lg-none position-relative">
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "#fff",
                zIndex: 1050,
                overflowY: "auto",
                boxShadow: "2px 0 10px rgba(0,0,0,0.2)",
                transform: showSidebar ? "translateX(0)" : "translateX(-100%)",
                transition: "transform 0.3s ease-in-out",
              }}
            >
              <FilterSidebar
                show={showSidebar}
                onHide={() => setShowSidebar(false)}
                onFilterChange={setFilters}
                filterState={filters}
                total={pagination.total}
              />
            </div>
          </Col>
          {/* Main content */}
          <Col className="mb-4">
            {/* Toggle button for sidebar on smaller screens */}
            <Row className="d-lg-none mb-3">
              <Col xs={12}>
                <Button
                  className="btn btn-dark full-width"
                  onClick={handleToggleSidebar}
                >
                  <FaFilter className="me-2" />
                  open the filter
                </Button>
              </Col>
            </Row>

            {/* Property List */}
            <Row>
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
                <div className="d-flex justify-content-center align-items-center vh-100">
                  <div className="text-center">
                    <p>No properties found.</p>
                  </div>
                </div>
              )}
            </Row>
          </Col>
        </Row>
        <Row>
          <div className="col-12 mb-4">
            <BottomPagination
              pagination={pagination}
              onPageChange={(page) =>
                setPagination((prev) => ({ ...prev, page }))
              }
            />
          </div>
        </Row>
      </Container>
    </div>
  );
};

export default PropertyListPage;
