import React from "react";
import { Offcanvas, Form, Button } from "react-bootstrap";
import Select from "react-select";

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

  return (
    <Offcanvas
      show={show}
      onHide={onHide}
      placement="start"
      className="bg-white w-80"
    >
      <Offcanvas.Header className="border-b border-gray-200 pb-3">
        <Button
          variant="link"
          onClick={onHide}
          className="text-gray-600 p-0 font-semibold text-lg hover:text-gray-800"
        >
          Close Filter
        </Button>
      </Offcanvas.Header>
      <Offcanvas.Body className="p-4">
        <Form className="space-y-4">
          <Form.Group className="mb-3">
            <Form.Label className="text-lg font-semibold text-gray-800">
              Verification
            </Form.Label>
            <div className="space-y-2">
              <Form.Check
                type="checkbox"
                label="Verified"
                checked={filterState?.is_urgent || false}
                onChange={(e) =>
                  handleFilterChange("is_urgent", e.target.checked)
                }
                className="form-check text-gray-700"
              />
              <Form.Check
                type="checkbox"
                label="SuperAgent"
                checked={filterState?.is_featured || false}
                onChange={(e) =>
                  handleFilterChange("is_featured", e.target.checked)
                }
                className="form-check text-gray-700"
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-lg font-semibold text-gray-800">
              Location
            </Form.Label>
            <Form.Control
              type="text"
              value={filterState?.location || ""}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              placeholder="Enter location (e.g., New York)"
              className="form-control border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-lg font-semibold text-gray-800">
              Category
            </Form.Label>
            <Select
              options={categories}
              value={
                categories.find((opt) => opt.value === filterState?.category) ||
                null
              }
              onChange={(opt) =>
                handleFilterChange("category", opt ? opt.value : "")
              }
              isClearable
              className="text-gray-700"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#d1d5db",
                  borderRadius: "0.375rem",
                  padding: "0.25rem",
                }),
              }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-lg font-semibold text-gray-800">
              Property Type
            </Form.Label>
            <Select
              options={propertyTypes}
              value={
                propertyTypes.find(
                  (opt) => opt.value === filterState?.propertyType
                ) || null
              }
              onChange={(opt) =>
                handleFilterChange("propertyType", opt ? opt.value : "")
              }
              isClearable
              className="text-gray-700"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#d1d5db",
                  borderRadius: "0.375rem",
                  padding: "0.25rem",
                }),
              }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-lg font-semibold text-gray-800">
              Bedrooms
            </Form.Label>
            <Select
              options={bedrooms}
              value={
                bedrooms.find((opt) => opt.value === filterState?.bedrooms) ||
                null
              }
              onChange={(opt) =>
                handleFilterChange("bedrooms", opt ? opt.value : "")
              }
              isClearable
              className="text-gray-700"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#d1d5db",
                  borderRadius: "0.375rem",
                  padding: "0.25rem",
                }),
              }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-lg font-semibold text-gray-800">
              Bathrooms
            </Form.Label>
            <Select
              options={bathrooms}
              value={
                bathrooms.find((opt) => opt.value === filterState?.bathrooms) ||
                null
              }
              onChange={(opt) =>
                handleFilterChange("bathrooms", opt ? opt.value : "")
              }
              isClearable
              className="text-gray-700"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#d1d5db",
                  borderRadius: "0.375rem",
                  padding: "0.25rem",
                }),
              }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-lg font-semibold text-gray-800">
              Status
            </Form.Label>
            <Select
              options={statuses}
              value={
                statuses.find((opt) => opt.value === filterState?.status) ||
                null
              }
              onChange={(opt) =>
                handleFilterChange("status", opt ? opt.value : "")
              }
              isClearable
              className="text-gray-700"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#d1d5db",
                  borderRadius: "0.375rem",
                  padding: "0.25rem",
                }),
              }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-lg font-semibold text-gray-800">
              Area Size (SQFT)
            </Form.Label>
            <div className="d-flex space-x-2">
              <Form.Control
                type="number"
                value={filterState?.areaSizeMin || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "areaSizeMin",
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
                placeholder="Min (e.g., 500)"
                className="form-control border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <Form.Control
                type="number"
                value={filterState?.areaSizeMax || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "areaSizeMax",
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
                placeholder="Max (e.g., 2000)"
                className="form-control border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-lg font-semibold text-gray-800">
              Tags
            </Form.Label>
            <Form.Control
              type="text"
              value={filterState?.tags || ""}
              onChange={(e) => handleFilterChange("tags", e.target.value)}
              placeholder="Enter tags (e.g., luxury, pet-friendly)"
              className="form-control border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </Form.Group>

          <div className="text-lg font-semibold text-gray-800">
            {filterState?.total || 0} Results Show
          </div>
        </Form>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default FilterSidebar;
