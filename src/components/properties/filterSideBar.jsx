import React from "react"; // Import React for component creation
import { Offcanvas, Form, Button } from "react-bootstrap"; // Import react-bootstrap components for UI
import Select from "react-select"; // Import react-select for dropdowns

const FilterSidebar = ({ show, onHide, onFilterChange, filterState }) => {
  // Define category options for dropdown
  const categories = [
    { value: "sale", label: "For Sale" },
    { value: "rent", label: "For Rent" },
  ];

  // Define property type options from backend schema
  const propertyTypes = [
    { value: "apartment", label: "Apartment" },
    { value: "house", label: "House" },
    { value: "villa", label: "Villa" },
    { value: "land", label: "Land" },
  ];

  // Define bedroom options for dropdown
  const bedrooms = [
    { value: 1, label: "1 Bedroom" },
    { value: 2, label: "2 Bedrooms" },
    { value: 3, label: "3 Bedrooms" },
    { value: 4, label: "4 Bedrooms" },
    { value: 5, label: "5 Bedrooms" },
    { value: 6, label: "6+ Bedrooms" },
  ];

  // Define bathroom options for dropdown
  const bathrooms = [
    { value: 1, label: "1 Bathroom" },
    { value: 2, label: "2 Bathrooms" },
    { value: 3, label: "3 Bathrooms" },
    { value: 4, label: "4 Bathrooms" },
    { value: 5, label: "5+ Bathrooms" },
  ];

  // Define status options from backend schema
  const statuses = [
    { value: "available", label: "Available" },
    { value: "sold", label: "Sold" },
    { value: "rented", label: "Rented" },
  ];

  // Handle filter changes and update parent state
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filterState, [key]: value }; // Create new filter state
    onFilterChange(newFilters); // Pass updated filters to parent
  };

  return (
    // Render collapsible sidebar with Offcanvas
    <Offcanvas
      show={show}
      onHide={onHide}
      placement="start"
      className="bg-white w-80"
    >
      // Sidebar header with close button
      <Offcanvas.Header className="border-b border-gray-200 pb-3">
        <Button
          variant="link"
          onClick={onHide}
          className="text-gray-600 p-0 font-semibold text-lg hover:text-gray-800"
        >
          Close Filter // Button to close the sidebar
        </Button>
      </Offcanvas.Header>
      // Sidebar body with filter form
      <Offcanvas.Body className="p-4">
        // Form container for filter inputs
        <Form className="space-y-4">
          // Verification filter section
          <Form.Group className="mb-3">
            <Form.Label className="text-lg font-semibold text-gray-800">
              Verification
            </Form.Label>{" "}
            // Label for verification filters
            <div className="space-y-2">
              // Checkbox for Verified filter
              <Form.Check
                type="checkbox"
                label="Verified"
                checked={filterState?.is_urgent || false}
                onChange={(e) =>
                  handleFilterChange("is_urgent", e.target.checked)
                } // Update isUrgent filter
                className="form-check text-gray-700"
              />
              // Checkbox for SuperAgent filter
              <Form.Check
                type="checkbox"
                label="SuperAgent"
                checked={filterState?.is_featured || false}
                onChange={(e) =>
                  handleFilterChange("is_featured", e.target.checked)
                } // Update isFeatured filter
                className="form-check text-gray-700"
              />
            </div>
          </Form.Group>
          // Location filter section
          <Form.Group className="mb-3">
            <Form.Label className="text-lg font-semibold text-gray-800">
              Location
            </Form.Label>{" "}
            // Label for location filter
            <Form.Control
              type="text"
              value={filterState?.location || ""} // Set location input value
              onChange={(e) => handleFilterChange("location", e.target.value)} // Update location filter
              placeholder="Enter location (e.g., New York)"
              className="form-control border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </Form.Group>
          // Category filter section
          <Form.Group className="mb-3">
            <Form.Label className="text-lg font-semibold text-gray-800">
              Category
            </Form.Label>{" "}
            // Label for category filter
            <Select
              options={categories}
              value={
                categories.find((opt) => opt.value === filterState?.category) ||
                null
              } // Set selected category
              onChange={(opt) =>
                handleFilterChange("category", opt ? opt.value : "")
              } // Update category filter
              isClearable // Allow clearing selection
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
          // Property Type filter section
          <Form.Group className="mb-3">
            <Form.Label className="text-lg font-semibold text-gray-800">
              Property Type
            </Form.Label>{" "}
            // Label for property type filter
            <Select
              options={propertyTypes}
              value={
                propertyTypes.find(
                  (opt) => opt.value === filterState?.propertyType
                ) || null
              } // Set selected property type
              onChange={(opt) =>
                handleFilterChange("propertyType", opt ? opt.value : "")
              } // Update property type filter
              isClearable // Allow clearing selection
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
          // Bedrooms filter section
          <Form.Group className="mb-3">
            <Form.Label className="text-lg font-semibold text-gray-800">
              Bedrooms
            </Form.Label>{" "}
            // Label for bedrooms filter
            <Select
              options={bedrooms}
              value={
                bedrooms.find((opt) => opt.value === filterState?.bedrooms) ||
                null
              } // Set selected bedrooms
              onChange={(opt) =>
                handleFilterChange("bedrooms", opt ? opt.value : "")
              } // Update bedrooms filter
              isClearable // Allow clearing selection
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
          // Bathrooms filter section
          <Form.Group className="mb-3">
            <Form.Label className="text-lg font-semibold text-gray-800">
              Bathrooms
            </Form.Label>{" "}
            // Label for bathrooms filter
            <Select
              options={bathrooms}
              value={
                bathrooms.find((opt) => opt.value === filterState?.bathrooms) ||
                null
              } // Set selected bathrooms
              onChange={(opt) =>
                handleFilterChange("bathrooms", opt ? opt.value : "")
              } // Update bathrooms filter
              isClearable // Allow clearing selection
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
          // Status filter section
          <Form.Group className="mb-3">
            <Form.Label className="text-lg font-semibold text-gray-800">
              Status
            </Form.Label>{" "}
            // Label for status filter
            <Select
              options={statuses}
              value={
                statuses.find((opt) => opt.value === filterState?.status) || null
              } // Set selected status
              onChange={(opt) =>
                handleFilterChange("status", opt ? opt.value : "")
              } // Update status filter
              isClearable // Allow clearing selection
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
          // Area Size filter section
          <Form.Group className="mb-3">
            <Form.Label className="text-lg font-semibold text-gray-800">
              Area Size (SQFT)
            </Form.Label>{" "}
            // Label for area size filter
            <div className="d-flex space-x-2">
              // Min area size input
              <Form.Control
                type="number"
                value={filterState?.areaSizeMin || ""} // Set min area size value
                onChange={(e) =>
                  handleFilterChange(
                    "areaSizeMin",
                    e.target.value ? Number(e.target.value) : ""
                  )
                } // Update min area size
                placeholder="Min (e.g., 500)"
                className="form-control border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              // Max area size input
              <Form.Control
                type="number"
                value={filterState?.areaSizeMax || ""} // Set max area size value
                onChange={(e) =>
                  handleFilterChange(
                    "areaSizeMax",
                    e.target.value ? Number(e.target.value) : ""
                  )
                } // Update max area size
                placeholder="Max (e.g., 2000)"
                className="form-control border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </Form.Group>
          // Tags filter section
          <Form.Group className="mb-3">
            <Form.Label className="text-lg font-semibold text-gray-800">
              Tags
            </Form.Label>{" "}
            // Label for tags filter
            <Form.Control
              type="text"
              value={filterState?.tags || ""} // Set tags input value
              onChange={(e) => handleFilterChange("tags", e.target.value)} // Update tags filter
              placeholder="Enter tags (e.g., luxury, pet-friendly)"
              className="form-control border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </Form.Group>
          // Display total results
          <div className="text-lg font-semibold text-gray-800">
            {filterState?.total || 0} Results Show // Show number of filtered
            results
          </div>
        </Form>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default FilterSidebar; // Export the FilterSidebar component
