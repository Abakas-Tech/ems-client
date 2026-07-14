import React, { useEffect, useState } from "react";

import CVOneComponent from "./../../../../components/workers/modules/CV/CVOne";
import CVTwoComponent from "./../../../../components/workers/modules/CV/CVTwo";
import CVThreeComponent from "./../../../../components/workers/modules/CV/CVThree";

const STORAGE_KEY = "cv_template_preference";
import useProfile from "../../../../../../context/Profile/useProfile";
/**
 * Three-way switch between the CV layouts.
 * Persists the choice per browser so reopening the page keeps the last pick.
 */
function TemplateSwitcher({ active, onChange }) {
  const { profile } = useProfile();
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
      {[
        { id: "one", label: "Abo Bejad" },
        { id: "two", label: "Semu Al-Shifa" },
        profile.role_id <= 2 && { id: "three", label: "New Partner" },
      ].map((option) => {
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
  const [template, setTemplate] = useState(
    () => localStorage.getItem(STORAGE_KEY) || "one",
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, template);
  }, [template]);

  const Active =
    template === "two"
      ? CVTwoComponent
      : template === "three"
        ? CVThreeComponent
        : CVOneComponent;

  return (
    <Active
      templateSwitcher={
        <TemplateSwitcher active={template} onChange={setTemplate} />
      }
    />
  );
}
