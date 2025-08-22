import React, { useState } from "react";
import PropertyDetailsForm from "./PropertyDetailsForm";
import ImagesUploadForm from "./ImagesUploadForm";
import useLoader from "../../../context/Loader/UseLoader";
import useResponse from "../../../context/response/UseResponse";

// Lazy-load API functions
const createProperty = async (...args) => {
  const module = await import("../../../api/Public/properties.api");
  return module.createProperty(...args);
};

const addPropertyImages = async (...args) => {
  const module = await import("../../../api/public/PropertiesImage.api");
  return module.addPropertyImages(...args);
};

const PropertyFormPage = () => {
  const [files, setFiles] = useState([]);
  const [altTexts, setAltTexts] = useState([]);
  const [formStage, setFormStage] = useState("property");
  const [propertyId, setPropertyId] = useState(null);
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const handlePropertySubmit = async (data) => {
    showLoader();
    const propertyData = {
      title: data.title,
      description: data.description,
      location: data.address,
      propertyType: data.propertyType?.value,
      bedrooms: data.bedrooms?.value,
      bathrooms: data.bathrooms?.value,
      halls: data.halls?.value,
      kitchens: data.kitchens?.value,
      areaSize: data.areaSize ? parseInt(data.areaSize) : undefined,
      category: data.category?.value,
      isUrgent: !!data.isUrgent,
      isFeatured: !!data.isFeatured,
      features: Array.isArray(data.features)
        ? data.features.filter(Boolean)
        : [],
      tags: data.tags
        ? data.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      status: data.status?.value,
    };

    try {
      const propertyResponse = await createProperty(propertyData);
      if (!propertyResponse.success) {
        addMessage("error", propertyResponse.message);
        hideLoader();
        return;
      }

      setPropertyId(propertyResponse.data.id);
      addMessage("success", "Property added successfully!");
      setFormStage("images");
      hideLoader();
    } catch {
      addMessage(
        "error",
        "An error occurred during property submission. Please try again."
      );
      hideLoader();
    }
  };

  const handleImagesSubmit = async () => {
    if (files.length === 0) {
      addMessage("error", "At least one image is required.");
      return;
    }

    showLoader();
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });
      formData.append("altTexts", JSON.stringify(altTexts));

      const imageResponse = await addPropertyImages(propertyId, formData);
      if (!imageResponse.success) {
        addMessage(
          "error",
          imageResponse.message || "Failed to upload images."
        );
        hideLoader();
        return;
      }

      addMessage("success", "Images submitted successfully!");
      setFiles([]);
      setAltTexts([]);
      setFormStage("property");
      hideLoader();
    } catch  {
      addMessage(
        "error",
        "An error occurred during image submission. Please try again."
      );
      hideLoader();
    }
  };

  const handleCancel = () => {
    setFormStage("property");
    setFiles([]);
    setAltTexts([]);
    setPropertyId(null);
  };

  return (
    <div>
      {/* Page Title */}
      <div className="page-title">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 col-md-12">
              <h2 className="ipt-title">Submit Property</h2>
              <span className="ipn-subtitle">Just Submit Your Property</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <section className="gray-simple">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 col-md-12">
              <div className="submit-page">
                {formStage === "property" ? (
                  <PropertyDetailsForm onSubmit={handlePropertySubmit} />
                ) : (
                  <ImagesUploadForm
                    propertyId={propertyId}
                    files={files}
                    setFiles={setFiles}
                    altTexts={altTexts}
                    setAltTexts={setAltTexts}
                    onSubmit={handleImagesSubmit}
                    onCancel={handleCancel}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PropertyFormPage;
