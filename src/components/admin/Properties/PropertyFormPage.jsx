import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
const getPropertyById = async (...args) => {
  const module = await import("../../../api/Public/properties.api");
  return module.getPropertyById(...args);
};
const updateProperty = async (...args) => {
  const module = await import("../../../api/Public/properties.api");
  return module.updateProperty(...args);
};
const getPropertyImages = async (...args) => {
  const module = await import("../../../api/public/PropertiesImage.api");
  return module.getPropertyImages(...args);
};
const updatePropertyImage = async (...args) => {
  const module = await import("../../../api/public/PropertiesImage.api");
  return module.updatePropertyImage(...args);
};

const PropertyFormPage = () => {
  const propertyIdParam  = 28;
  const navigate = useNavigate();
  const location = useLocation();
  const [files, setFiles] = useState([]);
  const [altTexts, setAltTexts] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [formStage, setFormStage] = useState(
    location.state?.initialFormStage || "property"
  );
  const [propertyId, setPropertyId] = useState(propertyIdParam || null);
  const [isEditMode, setIsEditMode] = useState(true);
  const [isNewProperty, setIsNewProperty] = useState(
    !!location.state?.isNewProperty
  );
  const [initialValues, setInitialValues] = useState({
    title: "",
    category: null,
    propertyType: null,
    address: "",
    latitude: "",
    longitude: "",
    description: "",
    tags: "",
    features: [],
    isUrgent: false,
    isFeatured: false,
    status: null,
    areaSize: "",
    bedrooms: null,
    bathrooms: null,
    halls: null,
    kitchens: null,
  });

  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  useEffect(() => {
    if (!propertyIdParam) return;

    setIsEditMode(true);
    setPropertyId(propertyIdParam);
    showLoader();

    (async () => {
      try {
        const [propertyRes, imagesRes] = await Promise.all([
          getPropertyById(propertyIdParam),
          getPropertyImages(propertyIdParam),
        ]);

        const propPayload = propertyRes?.data ?? propertyRes;
        const data =
          propPayload && typeof propPayload === "object" && propPayload.data
            ? propPayload.data
            : propPayload;

        const propertyTypeLabel = (pt) =>
          pt === "apartment"
            ? "Apartment"
            : pt === "house"
            ? "House"
            : pt === "villa"
            ? "Villa"
            : "Land";

        const statusLabel = (s) =>
          s === "available" ? "Available" : s === "sold" ? "Sold" : "Rented";

        if (data && (data.id || data.title)) {
          setInitialValues({
            title: data.title || "",
            category: data.category
              ? {
                  value: data.category,
                  label:
                    data.category === "rent"
                      ? "For Rent"
                      : data.category === "sale"
                      ? "For Sale"
                      : String(data.category),
                }
              : null,
            propertyType: data.property_type
              ? {
                  value: data.property_type,
                  label: propertyTypeLabel(data.property_type),
                }
              : null,
            address: data.location || "",
            latitude:
              (data.coordinates && data.coordinates.latitude) ??
              data.latitude ??
              "",
            longitude:
              (data.coordinates && data.coordinates.longitude) ??
              data.longitude ??
              "",
            description: data.description || "",
            tags: Array.isArray(data.tags)
              ? data.tags.join(", ")
              : data.tags || "",
            features: Array.isArray(data.features) ? data.features : [],
            isUrgent: !!data.is_urgent,
            isFeatured: !!data.is_featured,
            status: data.status
              ? { value: data.status, label: statusLabel(data.status) }
              : null,
            areaSize: data.area_size ?? "",
            bedrooms: data.bedrooms
              ? { value: data.bedrooms, label: String(data.bedrooms) }
              : null,
            bathrooms: data.bathrooms
              ? { value: data.bathrooms, label: String(data.bathrooms) }
              : null,
            halls: data.halls
              ? { value: data.halls, label: String(data.halls) }
              : null,
            kitchens: data.kitchens
              ? { value: data.kitchens, label: String(data.kitchens) }
              : null,
          });
        } else {
          addMessage(
            "error",
            propertyRes?.message ||
              propertyRes?.data?.message ||
              "Failed to fetch property."
          );
        }

        const imgs = (() => {
          if (!imagesRes) return [];
          if (Array.isArray(imagesRes)) return imagesRes;
          if (Array.isArray(imagesRes.data)) return imagesRes.data;
          if (imagesRes.data && Array.isArray(imagesRes.data.data))
            return imagesRes.data.data;
          if (imagesRes.data && Array.isArray(imagesRes.data.images))
            return imagesRes.data.images;
          if (
            imagesRes.data &&
            imagesRes.data.data &&
            Array.isArray(imagesRes.data.data.data)
          )
            return imagesRes.data.data.data;
          return [];
        })();

        if (imgs.length > 0) {
          setExistingImages(
            imgs.map((img) => ({
              id: img.id ?? img.imageId ?? img._id,
              url:
                (img.image_url ??
                  img.imageUrl ??
                  img.url ??
                  img.path ??
                  img.image) ||
                "",
              altText: img.alt_text ?? img.altText ?? img.alt ?? "",
              originalAltText: img.alt_text ?? img.altText ?? img.alt ?? "",
              publicId: img.public_id ?? img.publicId ?? null,
              file: null,
            }))
          );
        } else {
          if (imagesRes && imagesRes.success === false) {
            addMessage("error", imagesRes.message || "Failed to fetch images.");
          }
        }
      } catch (err) {
        console.error(err);
        addMessage("error", "Failed to fetch property details.");
      } finally {
        hideLoader();
      }
    })();
  }, [propertyIdParam]);

  // ✅ Updated: stays on page, renders image form instead of navigating
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
      let propertyResponse;
      if (isEditMode) {
        propertyResponse = await updateProperty(propertyId, propertyData);
        if (!propertyResponse.success) {
          addMessage("error", propertyResponse.message);
          hideLoader();
          return;
        }
        addMessage("success", "Property updated successfully!");
      } else {
        propertyResponse = await createProperty(propertyData);
        if (!propertyResponse.success) {
          addMessage("error", propertyResponse.message);
          hideLoader();
          return;
        }
        addMessage("success", "Property added successfully!");

        // ✅ Instead of navigating, render Images form
        setPropertyId(propertyResponse.data.id);
        setIsNewProperty(true);
        setFormStage("images");
      }
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
   showLoader();
   try {
     if (isNewProperty && files.length === 0) {
       addMessage("error", "At least one image is required.");
       hideLoader();
       return;
     }

     // ✅ Update existing images if replaced or altText changed
     for (const img of existingImages) {
       if (img.altText !== img.originalAltText || img.file) {
         const formData = new FormData();
         if (img.file) {
           formData.append("image", img.file); // raw file
         }
         // backend expects altTexts as JSON array
         formData.append("altTexts", JSON.stringify([img.altText || ""]));

         const updateRes = await updatePropertyImage(
           propertyId,
           img.id,
           formData
         );
         if (!updateRes.success) {
           addMessage("error", updateRes.message || "Failed to update image.");
           hideLoader();
           return;
         }
       }
     }

     // ✅ Add new images if any
     if (files.length > 0) {
       const formData = new FormData();
       files.forEach((file) => formData.append("images", file));
       formData.append("altTexts", JSON.stringify(altTexts));
       const addRes = await addPropertyImages(propertyId, formData);
       if (!addRes.success) {
         addMessage("error", addRes.message);
         hideLoader();
         return;
       }
     }

     addMessage(
       "success",
       isNewProperty
         ? "Images submitted successfully!"
         : "Images updated successfully!"
     );

     // Refresh images list
     const imagesRes = await getPropertyImages(propertyId);
     if (imagesRes.success) {
       setExistingImages(
         imagesRes.data.data.map((img) => ({
           id: img.id,
           url: img.imageUrl,
           altText: img.altText || "",
           originalAltText: img.altText || "",
           file: null,
         }))
       );
     }
     setFiles([]);
     setAltTexts([]);
     setIsNewProperty(false);
     setFormStage("property");
     hideLoader();
   } catch {
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
    if (!isEditMode) setPropertyId(null);
  };

  return (
    <div>
      {/* Page Title */}
      <div className="page-title">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 col-md-12">
              <h2 className="ipt-title">
                {isEditMode ? "Edit Property" : "Submit Property"}
              </h2>
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
                  <>
                    <PropertyDetailsForm
                      initialValues={initialValues}
                      onSubmit={handlePropertySubmit}
                      isEditMode={isEditMode}
                    />
                    {isEditMode && (
                      <div className="form-group col-lg-12 col-md-12 mt-3">
                        <button
                          type="button"
                          className="btn btn-secondary fw-medium px-5"
                          onClick={() => setFormStage("images")}
                        >
                          Update Images
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <ImagesUploadForm
                    propertyId={propertyId}
                    files={files}
                    setFiles={setFiles}
                    altTexts={altTexts}
                    setAltTexts={setAltTexts}
                    existingImages={existingImages}
                    setExistingImages={setExistingImages}
                    onSubmit={handleImagesSubmit}
                    onCancel={handleCancel}
                    isEditMode={isEditMode}
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
