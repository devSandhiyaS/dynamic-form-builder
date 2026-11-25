const getOptions = (options) => {
  if (Array.isArray(options)) return options;

  if (typeof options === "string") {
    try {
      const parsed = JSON.parse(options);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};

function FormPreview({ form, fields, onClose }) {
  const renderField = (field) => {
    const options = getOptions(field.options);
    const required = field.is_required === true ||
      field.is_required === 1 ||
      field.is_required === "1";

    const commonProps = {
      name: field.field_key,
      placeholder: field.placeholder || "",
      required,
      defaultValue: field.default_value || ""
    };

    switch (field.field_type) {
      case "TEXTAREA":
        return (
          <textarea
            {...commonProps}
            rows={4}
          />
        );

      case "SELECT":
        return (
          <select
            name={field.field_key}
            required={required}
            defaultValue={field.default_value || ""}
          >
            <option value="">Select an option</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "RADIO":
        return (
          <div className="preview-options">
            {options.map((option) => (
              <label key={option}>
                <input
                  type="radio"
                  name={field.field_key}
                  value={option}
                  required={required}
                  defaultChecked={field.default_value === option}
                />
                {option}
              </label>
            ))}
          </div>
        );

      case "CHECKBOX":
        return (
          <div className="preview-options">
            {options.map((option) => (
              <label key={option}>
                <input
                  type="checkbox"
                  name={field.field_key}
                  value={option}
                  defaultChecked={getOptions(field.default_value).includes(option)}
                />
                {option}
              </label>
            ))}
          </div>
        );

      default: {
        const inputTypes = {
          TEXT: "text",
          EMAIL: "email",
          NUMBER: "number",
          PHONE: "tel",
          DATE: "date"
        };

        return (
          <input
            type={inputTypes[field.field_type] || "text"}
            {...commonProps}
          />
        );
      }
    }
  };

  return (
    <div className="preview-overlay">
      <div className="preview-modal">
        <div className="preview-modal-header">
          <div>
            <h2>Form Preview</h2>
            <p>Preview how your form will appear to users.</p>
          </div>

          <button type="button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="preview-form-content">
          <h1>{form.title}</h1>

          {form.description && (
            <p className="preview-description">
              {form.description}
            </p>
          )}

          {fields.map((field) => (
            <div className="preview-field" key={field.id}>
              <label>
                {field.label}
                {(field.is_required === true ||
                  field.is_required === 1 ||
                  field.is_required === "1") && (
                    <span className="preview-required"> *</span>
                  )}
              </label>

              {renderField(field)}
            </div>
          ))}

          <button type="button" disabled>
            Submit (Preview Only)
          </button>
        </div>
      </div>
    </div>
  );
}

export default FormPreview;