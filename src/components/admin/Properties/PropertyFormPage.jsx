import React, { useState } from "react";
import PropertyDetailsForm from "./PropertyDetailsForm";
import ImagesUploadForm from "./ImagesUploadForm";

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
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [files, setFiles] = useState([]);
  const [altTexts, setAltTexts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStage, setFormStage] = useState("property");
  const [propertyId, setPropertyId] = useState(null);

  const handlePropertySubmit = async (data) => {
    setIsSubmitting(true);
    setSubmissionStatus(null);

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
      features: data.features.filter(Boolean),
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
        setSubmissionStatus({
          type: "error",
          message: propertyResponse.message,
        });
        setIsSubmitting(false);
        return;
      }

      setPropertyId(propertyResponse.data.id);
      setFormStage("images");
      setIsSubmitting(false);
    } catch (error) {
      console.error("Property submission error:", error);
      setSubmissionStatus({
        type: "error",
        message:
          "An error occurred during property submission. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  const handleImagesSubmit = async () => {
    if (files.length === 0) {
      return { success: false, message: "At least one image is required." };
    }

    setIsSubmitting(true);
    setSubmissionStatus(null);

    try {
      console.log("Files before FormData:", files);
      console.log("AltTexts before FormData:", altTexts);
      console.log("Property ID:", propertyId);

      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append("images", file);
        console.log(
          `Appending image ${index}:`,
          file.name,
          file.type,
          file.size
        );
      });
      formData.append("altTexts", JSON.stringify(altTexts));
      console.log("FormData contents:", Array.from(formData.entries()));

      const imageResponse = await addPropertyImages(propertyId, formData);
      if (!imageResponse.success) {
        setSubmissionStatus({
          type: "error",
          message: imageResponse.message || "Failed to upload images.",
        });
        setIsSubmitting(false);
        return;
      }

      setSubmissionStatus({
        type: "success",
        message: "Images submitted successfully!",
      });
      setFiles([]);
      setAltTexts([]);
      setFormStage("property");
      setIsSubmitting(false);
    } catch (error) {
      console.error("Image submission error:", error);
      setSubmissionStatus({
        type: "error",
        message: "An error occurred during image submission. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormStage("property");
    setFiles([]);
    setAltTexts([]);
    setPropertyId(null);
    setSubmissionStatus(null);
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
                {submissionStatus && (
                  <div
                    className={`alert ${
                      submissionStatus.type === "success"
                        ? "bg-green text-light"
                        : "alert-danger"
                    } text-center`}
                    role="alert"
                  >
                    {submissionStatus.message}
                  </div>
                )}

                {formStage === "property" ? (
                  <PropertyDetailsForm
                    onSubmit={handlePropertySubmit}
                    isSubmitting={isSubmitting}
                  />
                ) : (
                  <ImagesUploadForm
                    propertyId={propertyId}
                    files={files}
                    setFiles={setFiles}
                    altTexts={altTexts}
                    setAltTexts={setAltTexts}
                    onSubmit={handleImagesSubmit}
                    onCancel={handleCancel}
                    isSubmitting={isSubmitting}
                    setError={(message) =>
                      setSubmissionStatus({ type: "error", message })
                    }
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
