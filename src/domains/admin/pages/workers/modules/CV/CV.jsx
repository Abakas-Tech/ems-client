import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import CVOneComponent from "./../../../../components/workers/modules/CV/CVOne";
import CVTwoComponent from "./../../../../components/workers/modules/CV/CVTwo";
import CVThreeComponent from "./../../../../components/workers/modules/CV/CVThree";
import { getWorkerCVData } from "../../../../api/worker.api";
import useProfile from "../../../../../../context/Profile/useProfile";
import useLoader from "../../../../../../context/Loader/useLoader";
import useResponse from "../../../../../../context/Response/useResponse";

const STORAGE_KEY = "cv_template_preference";

const TEMPLATE_OPTIONS = [
  { id: "one", category: "CV_ONE", label: "Abo Bejad" },
  { id: "two", category: "CV_TWO", label: "Semu Al-Shifa" },
  { id: "three", category: "CV_THREE", label: "New Partner" },
];

const CATEGORY_TO_TEMPLATE = {
  CV_ONE: "one",
  CV_TWO: "two",
  CV_THREE: "three",
};

function TemplateSwitcher({ active, onChange, options }) {
  return (
    <div
      role="tablist"
      aria-label="CV format"
      style={{
        display: "inline-flex",
        border: "1px solid #d8dadd",
        borderRadius: 8,
        padding: 3,
        background: "#f4f5f6",
        gap: 2,
        marginRight: "50px",
      }}
    >
      {options.map((option) => {
        const isActive = active === option.id;

        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.id)}
            style={{
              border: "none",
              borderRadius: 6,
              padding: "6px 14px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              color: isActive ? "#fff" : "#5b5f66",
              background: isActive ? "#47BCD2" : "transparent",
              transition: "background 0.15s ease, color 0.15s ease",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default function CV() {
  const { id } = useParams();
  const { profile } = useProfile();
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const [template, setTemplate] = useState(
    () => localStorage.getItem(STORAGE_KEY) || "one",
  );
  const [options, setOptions] = useState([]);
  const [employerAccess, setEmployerAccess] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [ready, setReady] = useState(false);

  const roleId = Number(profile?.role_id);
  const workerId = id ?? profile?.id;

  useEffect(() => {
    if (!profile || !workerId) return;

    let cancelled = false;

    const configurePage = async () => {
      setReady(false);
      setLoadError("");
      showLoader();

      try {
        const response = await getWorkerCVData(workerId);
        const data = response?.data || {};
        const generatedCvs = Array.isArray(data.generated_cvs)
          ? data.generated_cvs
          : [];

        if (cancelled) return;

        if (roleId === 1 || roleId === 2) {
          /*
           * Internal template priority:
           * Abo Bejad → Semu Al-Shifa → New Partner.
           */
          const firstAvailableCategory = ["CV_ONE", "CV_TWO", "CV_THREE"].find(
            (category) => generatedCvs.some((cv) => cv.category === category),
          );

          const savedTemplate = localStorage.getItem(STORAGE_KEY) || "one";
          const defaultTemplate = firstAvailableCategory
            ? CATEGORY_TO_TEMPLATE[firstAvailableCategory]
            : savedTemplate;

          setOptions(TEMPLATE_OPTIONS);
          setTemplate(defaultTemplate);
          setEmployerAccess(null);
        } else if (roleId === 5) {
          /* Employer receives one backend-authorized CV option only. */
          const access = data.cv_access || null;
          setEmployerAccess(access);

          if (access?.available && CATEGORY_TO_TEMPLATE[access.category]) {
            const templateId = CATEGORY_TO_TEMPLATE[access.category];
            const allowedOption = TEMPLATE_OPTIONS.find(
              (option) => option.id === templateId,
            );

            setOptions(allowedOption ? [allowedOption] : []);
            setTemplate(templateId);
          } else {
            setOptions([]);
          }
        } else {
          /* Preserve the previous partner/worker behavior. */
          const previousOptions = TEMPLATE_OPTIONS.filter(
            (option) => option.id !== "three",
          );
          const savedTemplate = localStorage.getItem(STORAGE_KEY);
          const savedIsAllowed = previousOptions.some(
            (option) => option.id === savedTemplate,
          );

          setOptions(previousOptions);
          setTemplate(savedIsAllowed ? savedTemplate : "one");
          setEmployerAccess(null);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error?.response?.data?.message ||
            error?.message ||
            "Failed to load CV information";

          console.error("Failed to configure CV page:", error);
          setLoadError(message);
          addMessage(false, message);
        }
      } finally {
        if (!cancelled) {
          setReady(true);
          hideLoader();
        }
      }
    };

    configurePage();

    return () => {
      cancelled = true;
    };
    // Context action functions are intentionally excluded to avoid refetch loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerId, roleId]);

  useEffect(() => {
    if (ready && roleId !== 5) {
      localStorage.setItem(STORAGE_KEY, template);
    }
  }, [template, ready, roleId]);

  if (!ready) return null;

  if (loadError) {
    return (
      <div className="dashboard-wraper">
        <h2 className="fw-bold text-dark mb-2">CV</h2>
        <p className="text-muted mb-0">{loadError}</p>
      </div>
    );
  }

  if (roleId === 5 && !employerAccess?.available) {
    return (
      <div className="dashboard-wraper">
        <h2 className="fw-bold text-dark mb-2">CV</h2>
        <p className="text-muted mb-0">A CV has not been generated</p>
      </div>
    );
  }

  const Active =
    template === "two"
      ? CVTwoComponent
      : template === "three"
        ? CVThreeComponent
        : CVOneComponent;

  return (
    <Active
      templateSwitcher={
        <TemplateSwitcher
          active={template}
          onChange={setTemplate}
          options={options}
        />
      }
    />
  );
}
