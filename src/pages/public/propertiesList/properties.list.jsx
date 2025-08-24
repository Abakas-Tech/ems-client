import React, { useEffect, useState } from "react";
import { Row, Col, Container, Button } from "react-bootstrap";
import { FaFilter } from "react-icons/fa";
import FilterSidebar from "../../../components/properties/filterSideBar";
import PaginationAndSort from "../../../components/properties/paginationAndSort";
import SingleProperty from "../../../components/properties/singleProperties";
import {
  deleteProperty,
  getAllProperties,
} from "../../../api/Public/properties.api";
import { getPropertyImages } from "../../../api/public/PropertiesImage.api";
import BottomPagination from "../../../components/properties/bottomPagination";
import SinglePropertyAdmin from "./../../../components/admin/Properties/SingleProperyAdmin";

const PropertyList = ({ isPublicPage = true }) => {
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

      if (response.success === true) {
        if (response.success) {
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
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (id) => {
    try {
      const response = await deleteProperty(id);

      if (response.success) {
        // remove deleted property from state
        setProperties((prev) => prev.filter((property) => property.id !== id));
      } else {
        console.error("Delete failed:", response.message);
      }
    } catch (error) {
      console.error("Error deleting property:", error);
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
          {isPublicPage && (
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
          )}

          {/* Sidebar for smaller screens with smooth open/close */}
          {isPublicPage && (
            <Col lg={4} md={12} className="d-lg-none position-relative">
              <FilterSidebar
                show={showSidebar}
                onHide={() => setShowSidebar(false)}
                onFilterChange={setFilters}
                filterState={filters}
                total={pagination.total}
              />
            </Col>
          )}
          {/* Main content */}

          <Col className="mb-4">
            {/* Toggle button for sidebar on smaller screens */}
            {isPublicPage && (
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
            )}
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
                  <>
                    {isPublicPage ? (
                      <div className="col-12 mb-4" key={property.id}>
                        <SingleProperty
                          property={property}
                          images={images[property.id] || []}
                        />
                      </div>
                    ) : (
                      <div className="bg-white col-12 " key={property.id}>
                        <SinglePropertyAdmin
                          property={property}
                          images={images[property.id] || []}
                          onDelete={handleDeleteProperty}
                        />
                      </div>
                    )}
                  </>
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

export default PropertyList;
