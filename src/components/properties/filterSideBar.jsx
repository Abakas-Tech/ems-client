import React from "react";
import { Offcanvas, Accordion, Form, Button } from "react-bootstrap";
import { FaTimesCircle, FaSearch, FaCheckCircle, FaStar } from "react-icons/fa";

const FilterSidebar = ({ show, onHide, onFilterChange, filterState }) => {
  const categories = [
    { value: "sale", label: "For Sale" },
    { value: "rent", label: "For Rent" },
  ];

  const propertyTypes = [
    { value: "apartment", label: "Apartment" },
    { value: "house", label: "House" },
    { value: "villa", label: "Villa" },
    { value: "land", label: "Land" },
  ];

  const bedrooms = [
    { value: 1, label: "1 Bedroom" },
    { value: 2, label: "2 Bedrooms" },
    { value: 3, label: "3 Bedrooms" },
    { value: 4, label: "4 Bedrooms" },
    { value: 5, label: "5 Bedrooms" },
    { value: 6, label: "6+ Bedrooms" },
  ];

  const bathrooms = [
    { value: 1, label: "1 Bathroom" },
    { value: 2, label: "2 Bathrooms" },
    { value: 3, label: "3 Bathrooms" },
    { value: 4, label: "4 Bathrooms" },
    { value: 5, label: "5+ Bathrooms" },
  ];

  const statuses = [
    { value: "available", label: "Available" },
    { value: "sold", label: "Sold" },
    { value: "rented", label: "Rented" },
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filterState, [key]: value };
    onFilterChange(newFilters);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    handleFilterChange("location", value);
    handleFilterChange("tags", value);
  };

  // Sidebar content to be reused for both static and Offcanvas rendering
  const SidebarContent = () => (
    <>
      <div className="search-sidebar_header">
        <h4 className="ssh_heading fw-normal fs-6">Close Filter</h4>
        <button onClick={onHide} className="w3-bar-item w3-button w3-large">
          <FaTimesCircle className="fs-5 text-muted-2" />
        </button>
      </div>
      <div className="sidebar-widgets">
        <div className="search-inner p-0">
          <div className="filter-search-box">
            <div className="form-group">
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control rounded-3 ps-5"
                  placeholder="Search by space name…"
                  value={filterState?.location || filterState?.tags || ""}
                  onChange={handleSearchChange}
                />
                <div className="position-absolute top-50 start-0 translate-middle-y ms-2">
                  <FaSearch className="text-main fs-5" />
                </div>
              </div>
            </div>
          </div>

          <div className="position-relative d-flex flex-xl-row flex-column align-items-center">
            <div className="urgent-block flex-fill full-width my-1 me-1">
              <div className="d-flex align-items-center justify-content-center justify-content-between border rounded-3 px-2 py-3">
                <div className="eliok-cliops d-flex align-items-center">
                  <FaCheckCircle className="text-success fs-5 me-1" />
                  <span className="text-muted-2 fw-normal fs-6 ms-1">Urgent</span>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="flexSwitchCheckUrgent"
                    checked={filterState?.is_urgent || false}
                    onChange={(e) =>
                      handleFilterChange("is_urgent", e.target.checked)
                    }
                  />
                  <label
                    className="form-check-label"
                    htmlFor="flexSwitchCheckUrgent"
                  ></label>
                </div>
              </div>
            </div>
            <div className="featured-block flex-fill full-width my-1 ms-1">
              <div className="d-flex align-items-center justify-content-center justify-content-between border rounded-3 px-2 py-3">
                <div className="eliok-cliops d-flex align-items-center">
                  <FaStar className="text-warning fs-5 me-1" />
                  <span className="text-muted-2 fw-normal fs-6 ms-1">Featured</span>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="flexSwitchCheckFeatured"
                    checked={filterState?.is_featured || false}
                    onChange={(e) =>
                      handleFilterChange("is_featured", e.target.checked)
                    }
                  />
                  <label
                    className="form-check-label"
                    htmlFor="flexSwitchCheckFeatured"
                  ></label>
                </div>
              </div>
            </div>
          </div>

          <div className="filter_wraps">
            <Accordion defaultActiveKey={null} className="border-0 bg-transparent shadow-none">
              <div className="single_search_boxed">
                <Accordion.Item eventKey="0" className="border-0">
                  <Accordion.Header className="p-0 border-0">
                    <h4 className="fw-normal fs-6 m-0">
                      Category
                      <span className="selected">
                        {categories.find(
                          (opt) => opt.value === filterState?.category
                        )?.label || "For Sale"}
                      </span>
                    </h4>
                  </Accordion.Header>
                  <Accordion.Body className="p-0">
                    <div className="side-list no-border">
                      <div className="single_filter_card border-top">
                        <div className="card-body pt-0 px-0">
                          <div className="inner_widget_link">
                            <ul className="no-ul-list filter-list">
                              {categories.map((category, idx) => (
                                <li className="form-check" key={idx}>
                                  <input
                                    id={`c${idx + 1}`}
                                    className="form-check-input shadow-none"
                                    name="category"
                                    type="radio"
                                    checked={
                                      filterState?.category === category.value
                                    }
                                    onChange={() =>
                                      handleFilterChange(
                                        "category",
                                        category.value
                                      )
                                    }
                                  />
                                  <label
                                    htmlFor={`c${idx + 1}`}
                                    className="form-check-label fw-normal fs-6"
                                  >
                                    {category.label}
                                  </label>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              </div>

              <div className="single_search_boxed">
                <Accordion.Item eventKey="1" className="border-0">
                  <Accordion.Header className="p-0 border-0">
                    <h4 className="fw-normal fs-6 m-0">
                      Property Type
                      <span className="selected">
                        {propertyTypes.find(
                          (opt) => opt.value === filterState?.propertyType
                        )?.label || "Apartment"}
                      </span>
                    </h4>
                  </Accordion.Header>
                  <Accordion.Body className="p-0">
                    <div className="side-list no-border">
                      <div className="single_filter_card border-top">
                        <div className="card-body pt-0 px-0">
                          <div className="inner_widget_link">
                            <ul className="no-ul-list filter-list">
                              {propertyTypes.map((type, idx) => (
                                <li className="form-check" key={idx}>
                                  <input
                                    id={`p${idx + 1}`}
                                    className="form-check-input shadow-none"
                                    name="ptype"
                                    type="radio"
                                    checked={
                                      filterState?.propertyType === type.value
                                    }
                                    onChange={() =>
                                      handleFilterChange(
                                        "propertyType",
                                        type.value
                                      )
                                    }
                                  />
                                  <label
                                    htmlFor={`p${idx + 1}`}
                                    className="form-check-label fw-normal fs-6"
                                  >
                                    {type.label}
                                  </label>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              </div>

              <div className="single_search_boxed">
                <Accordion.Item eventKey="2" className="border-0">
                  <Accordion.Header className="p-0 border-0">
                    <h4 className="fw-normal fs-6 m-0">
                      Bedrooms
                      <span className="selected">
                        {bedrooms.find(
                          (opt) => opt.value === filterState?.bedrooms
                        )?.label || "1 Bedroom"}
                      </span>
                    </h4>
                  </Accordion.Header>
                  <Accordion.Body className="p-0">
                    <div className="side-list no-border">
                      <div className="single_filter_card border-top">
                        <div className="card-body pt-0 px-0">
                          <div className="inner_widget_link">
                            <ul className="no-ul-list filter-list">
                              {bedrooms.map((bed, idx) => (
                                <li className="form-check" key={idx}>
                                  <input
                                    id={`b${idx + 1}`}
                                    className="form-check-input shadow-none"
                                    name="bed"
                                    type="radio"
                                    checked={
                                      filterState?.bedrooms === bed.value
                                    }
                                    onChange={() =>
                                      handleFilterChange("bedrooms", bed.value)
                                    }
                                  />
                                  <label
                                    htmlFor={`b${idx + 1}`}
                                    className="form-check-label fw-normal fs-6"
                                  >
                                    {bed.label}
                                  </label>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              </div>

              <div className="single_search_boxed">
                <Accordion.Item eventKey="3" className="border-0">
                  <Accordion.Header className="p-0 border-0">
                    <h4 className="fw-normal fs-6 m-0">
                      Bathrooms
                      <span className="selected">
                        {bathrooms.find(
                          (opt) => opt.value === filterState?.bathrooms
                        )?.label || "1 Bathroom"}
                      </span>
                    </h4>
                  </Accordion.Header>
                  <Accordion.Body className="p-0">
                    <div className="side-list no-border">
                      <div className="single_filter_card border-top">
                        <div className="card-body pt-0 px-0">
                          <div className="inner_widget_link">
                            <ul className="no-ul-list filter-list">
                              {bathrooms.map((bath, idx) => (
                                <li className="form-check" key={idx}>
                                  <input
                                    id={`a${idx + 1}`}
                                    className="form-check-input shadow-none"
                                    name="bath"
                                    type="radio"
                                    checked={
                                      filterState?.bathrooms === bath.value
                                    }
                                    onChange={() =>
                                      handleFilterChange(
                                        "bathrooms",
                                        bath.value
                                      )
                                    }
                                  />
                                  <label
                                    htmlFor={`a${idx + 1}`}
                                    className="form-check-label fw-normal fs-6"
                                  >
                                    {bath.label}
                                  </label>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              </div>

              <div className="single_search_boxed">
                <Accordion.Item eventKey="4" className="border-0">
                  <Accordion.Header className="p-0 border-0">
                    <h4 className="fw-normal fs-6 m-0">
                      Status
                      <span className="selected">
                        {statuses.find(
                          (opt) => opt.value === filterState?.status
                        )?.label || "Available"}
                      </span>
                    </h4>
                  </Accordion.Header>
                  <Accordion.Body className="p-0">
                    <div className="side-list no-border">
                      <div className="single_filter_card border-top">
                        <div className="card-body pt-0 px-0">
                          <div className="inner_widget_link">
                            <ul className="no-ul-list filter-list">
                              {statuses.map((status, idx) => (
                                <li className="form-check" key={idx}>
                                  <input
                                    id={`s${idx + 1}`}
                                    className="form-check-input shadow-none"
                                    name="status"
                                    type="radio"
                                    checked={
                                      filterState?.status === status.value
                                    }
                                    onChange={() =>
                                      handleFilterChange("status", status.value)
                                    }
                                  />
                                  <label
                                    htmlFor={`s${idx + 1}`}
                                    className="form-check-label fw-normal fs-6"
                                  >
                                    {status.label}
                                  </label>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              </div>

              <div className="single_search_boxed">
                <Accordion.Item eventKey="5" className="border-0">
                  <Accordion.Header className="p-0 border-0">
                    <h4 className="fw-normal fs-6 m-0">
                      Area Size (SQFT)
                      <span className="selected">
                        {filterState?.areaSizeMin || filterState?.areaSizeMax
                          ? `${filterState?.areaSizeMin || "Any"} - ${
                              filterState?.areaSizeMax || "Any"
                            }`
                          : "Any"}
                      </span>
                    </h4>
                  </Accordion.Header>
                  <Accordion.Body className="p-0">
                    <div className="side-list no-border">
                      <div className="single_filter_card border-top">
                        <div className="card-body pt-0 px-0">
                          <div className="inner_widget_link">
                            <div className="d-flex flex-column gap-2">
                              <input
                                type="number"
                                className="form-control rounded-3"
                                placeholder="Min (e.g., 500)"
                                value={filterState?.areaSizeMin || ""}
                                onChange={(e) =>
                                  handleFilterChange(
                                    "areaSizeMin",
                                    e.target.value ? Number(e.target.value) : ""
                                  )
                                }
                              />
                              <input
                                type="number"
                                className="form-control rounded-3"
                                placeholder="Max (e.g., 2000)"
                                value={filterState?.areaSizeMax || ""}
                                onChange={(e) =>
                                  handleFilterChange(
                                    "areaSizeMax",
                                    e.target.value ? Number(e.target.value) : ""
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              </div>
            </Accordion>
          </div>

          <div className="form-group filter_button">
            <Button type="button" className="btn btn-main rounded full-width fw-normal fs-6">
              Filter ({filterState?.total || 0} Results)
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  return show !== undefined ? (
    <Offcanvas
      show={show}
      onHide={onHide}
      placement="start"
      className="col-lg-4 col-md-12 col-sm-12 simple-sidebar sm-sidebar"
    >
      <Offcanvas.Body>{SidebarContent()}</Offcanvas.Body>
    </Offcanvas>
  ) : (
    <div className=" simple-sidebar sm-sidebar">
      {SidebarContent()}
    </div>
  );
};

export default FilterSidebar;