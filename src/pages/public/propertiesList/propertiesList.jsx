import React, { useEffect, useState } from "react";
import { Row, Col, Container, Button } from "react-bootstrap";
import { FaFilter } from "react-icons/fa";
import FilterSidebar from "../../../components/properties/filterSideBar";
import PaginationAndSort from "../../../components/properties/paginationAndSort";
import SingleProperty from "../../../components/properties/singleProperties";
import {
  deleteProperty,
  getAllProperties,
} from "../../../api/public/properties.api";
import { getPropertyImages } from "../../../api/public/PropertiesImage.api";
import BottomPagination from "../../../components/properties/bottomPagination";
import SinglePropertyAdmin from "./../../../components/admin/Properties/SingleProperyAdmin";
import useLoader from "../../../context/Loader/UseLoader";
// import { useConfirmDelete } from "./../../../context/Delete/UseDelete";

const PropertyList = ({ isPublicPage = true }) => {
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({});
  const [images, setImages] = useState({}); // { propertyId: [images] }
  const [showSidebar, setShowSidebar] = useState(false);
  const { showLoader, hideLoader } = useLoader();
  // const { openModal } = useConfirmDelete();

  const fetchProperties = async (params = {}) => {
    showLoader(); // show global loader
    try {
      const response = await getAllProperties({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        ...params,
      });

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
    } catch (err) {
      console.error("Error fetching properties:", err);
    } finally {
      hideLoader(); // hide global loader
    }
  };

  const handleDeleteProperty = async (id) => {
    showLoader();
    try {
      const response = await deleteProperty(id);
      if (response.success) {
        setProperties((prev) => prev.filter((property) => property.id !== id));
      } else {
        console.error("Delete failed:", response.message);
      }
    } catch (error) {
      console.error("Error deleting property:", error);
    } finally {
      hideLoader();
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
              onSortChange={(sort) =>
                setFilters((prev) => ({ ...prev, sort, page: 1 }))
              }
              onTitleSearch={(title) =>
                setFilters((prev) => ({ ...prev, title, page: 1 }))
              }
              total={pagination.total}
              isPublicPage={isPublicPage}
            />
          </Col>
        </Row>

        {/* Sidebar + Property List */}
        <Row>
          {isPublicPage && (
            <Col
              lg={4}
              className="d-none d-lg-block"
              style={{ overflowY: "auto", paddingRight: "15px" }}
            >
              <FilterSidebar
                className="w-100"
                onFilterChange={setFilters}
                filterState={filters}
                total={pagination.total}
              />
            </Col>
          )}

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

          <Col className="mb-4">
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

            <Row>
              {!isPublicPage ? (
                <div className="bg-white  ps-4 pt-4 rounded-top ">
                  {" "}
                  <h4>My Properties</h4>
                </div>
              ) : (
                <></>
              )}
              {properties?.length > 0 ? (
                properties.map((property) => (
                  <React.Fragment key={property.id}>
                    {isPublicPage ? (
                      <div className="col-12 mb-4">
                        <SingleProperty
                          property={property}
                          images={images[property.id] || []}
                        />
                      </div>
                    ) : (
                      <div className="bg-white col-12">
                        <SinglePropertyAdmin
                          property={property}
                          images={images[property.id] || []}
                          onDelete={() => {
                            openModal(
                              `Delete property ${property.title}?`,
                              async () => {
                                await handleDeleteProperty(property.id);
                              }
                            );
                          }}
                        />
                      </div>
                    )}
                  </React.Fragment>
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
