import React from "react";

/**
 * Right-side toolbox for the CV preview. UI only - never rendered inside
 * cvRef / passportRef, so it is never captured by html2canvas and never
 * appears in the downloaded PDF.
 */
const CVToolbox = ({
  isPartnerRole,
  partners,
  selectedPartnerId,
  onPartnerChange,
  getPartnerOptionLabel,
  colorOptions,
  selectedColor,
  onColorChange,
  includePassport,
  onTogglePassport,
}) => {
  return (
    <div
      className="cv-toolbox"
      style={{
        border: "1px solid #e3e6ec",
        borderRadius: 12,
        background: "#fff",
        padding: 16,
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      }}
    >
      <h6 className="fw-bold text-dark mb-3">CV Options</h6>

      {/* Partner selector - hidden for the partner role, which is always
          locked to its own single entry. */}
      {!isPartnerRole && (
        <div className="mb-3">
          <label
            className="form-label small fw-semibold text-muted mb-1"
            htmlFor="cv-toolbox-partner"
          >
            Partner
          </label>
          <select
            id="cv-toolbox-partner"
            className="form-select form-select-sm"
            value={selectedPartnerId}
            onChange={onPartnerChange}
            style={{ borderRadius: 8, fontWeight: 600, fontSize: 13 }}
          >
            <option value="">Select Partner</option>

            {partners.map((partner) => (
              <option key={partner.partner_id} value={partner.partner_id}>
                {getPartnerOptionLabel(partner)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* CV color selector - small filled circles */}
      <div className="mb-3">
        <label className="form-label small fw-semibold text-muted mb-2 d-block">
          CV Color
        </label>
        <div className="d-flex gap-2 flex-wrap">
          {colorOptions.map((color) => {
            const isSelected = selectedColor === color.value;
            return (
              <button
                key={color.value}
                type="button"
                title={color.name}
                aria-label={`Use ${color.name} theme`}
                aria-pressed={isSelected}
                onClick={() => onColorChange(color.value)}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: color.value,
                  border: isSelected ? "2px solid #222" : "2px solid #fff",
                  boxShadow: isSelected
                    ? "0 0 0 2px rgba(0,0,0,0.25)"
                    : "0 0 0 1px rgba(0,0,0,0.12)",
                  cursor: "pointer",
                  padding: 0,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Include Passport toggle */}
      <div className="form-check">
        <input
          className="form-check-input"
          type="checkbox"
          id="cv-toolbox-include-passport"
          checked={includePassport}
          onChange={(event) => onTogglePassport(event.target.checked)}
        />
        <label
          className="form-check-label small fw-semibold"
          htmlFor="cv-toolbox-include-passport"
        >
          Include Passport
        </label>
      </div>
    </div>
  );
};

export default CVToolbox;
