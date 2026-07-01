import React, { useState, useEffect } from "react";
import CVOneComponent from "./../../../../components/workers/modules/CV/CVOne";
import CVTwoComponent from "./../../../../components/workers/modules/CV/CVTwo";

const STORAGE_KEY = "cv_template_preference";

/**
 * Two-way switch between the two CV layouts.
 * Persists the choice per-browser so re-opening the page keeps the last pick.
 */
function TemplateSwitcher({ active, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="CV template"
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
        { id: "one", label: "Template 1" },
        { id: "two", label: "Template 2" },
      ].map((opt) => {
        const isActive = active === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.id)}
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
            {opt.label}
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

  const Active = template === "two" ? CVTwoComponent : CVOneComponent;

  return (
    <Active
      templateSwitcher={
        <TemplateSwitcher active={template} onChange={setTemplate} />
      }
    />
  );
}
