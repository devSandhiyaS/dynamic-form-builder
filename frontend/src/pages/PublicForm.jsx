import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

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

const isRequired = (field) =>
  field.is_required === true ||
  field.is_required === 1 ||
  field.is_required === "1";

const getInitialAnswers = (fields) => {
  const initialAnswers = {};

  fields.forEach((field) => {
    if (field.field_type === "CHECKBOX") {
      initialAnswers[field.field_key] = getOptions(field.default_value);
    } else {
      initialAnswers[field.field_key] = field.default_value || "";
    }
  });

  return initialAnswers;
};

function PublicForm() {
  const { formId } = useParams();

  const [form, setForm] = useState(null);
  const [fields, setFields] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchPublicForm = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/forms/${formId}`);

        const formData =
          response.data.data ||
          response.data.form ||
          response.data;

        const formFields = formData.fields || [];

        setForm(formData);
        setFields(formFields);
        setAnswers(getInitialAnswers(formFields));
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load this form. It may not exist or may not be published."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPublicForm();
  }, [formId]);

  const handleAnswerChange = (fieldKey, value) => {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [fieldKey]: value
    }));

    setValidationErrors([]);
    setError("");
    setSuccessMessage("");
  };

  const handleCheckboxChange = (fieldKey, option, checked) => {
    const currentValues = answers[fieldKey] || [];

    const updatedValues = checked
      ? [...currentValues, option]
      : currentValues.filter((value) => value !== option);

    handleAnswerChange(fieldKey, updatedValues);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setValidationErrors([]);
    setSuccessMessage("");

    // Checkbox required validation
    const checkboxErrors = fields
      .filter(
        (field) =>
          field.field_type === "CHECKBOX" &&
          isRequired(field) &&
          (!Array.isArray(answers[field.field_key]) ||
            answers[field.field_key].length === 0)
      )
      .map((field) => `${field.label} is required.`);

    if (checkboxErrors.length > 0) {
      setValidationErrors(checkboxErrors);
      return;
    }

    // Convert number field values to numbers
    const submittedAnswers = {};

    fields.forEach((field) => {
      const value = answers[field.field_key];

      if (
        field.field_type === "NUMBER" &&
        value !== "" &&
        value !== null &&
        value !== undefined
      ) {
        submittedAnswers[field.field_key] = Number(value);
      } else {
        submittedAnswers[field.field_key] = value;
      }
    });

    try {
      setSubmitting(true);

      const response = await api.post(
        `/forms/${formId}/submissions`,
        {
          answers: submittedAnswers
        }
      );

      setSuccessMessage(
        response.data.message || "Form submitted successfully!"
      );

      setAnswers(getInitialAnswers(fields));
    } catch (err) {
      const responseData = err.response?.data;

      if (Array.isArray(responseData?.errors)) {
        const messages = responseData.errors.map((item) => {
          if (typeof item === "string") return item;

          return `${item.field || item.field_key || "Field"}: ${item.message || item.error || "Invalid value"
            }`;
        });

        setValidationErrors(messages);
      } else {
        setError(
          responseData?.message || "Unable to submit the form. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    const options = getOptions(field.options);
    const required = isRequired(field);
    const value = answers[field.field_key] ?? "";

    switch (field.field_type) {
      case "TEXTAREA":
        return (
          <textarea
            name={field.field_key}
            placeholder={field.placeholder || ""}
            value={value}
            onChange={(e) =>
              handleAnswerChange(field.field_key, e.target.value)
            }
            required={required}
            rows={4}
          />
        );

      case "SELECT":
        return (
          <select
            name={field.field_key}
            value={value}
            onChange={(e) =>
              handleAnswerChange(field.field_key, e.target.value)
            }
            required={required}
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
          <div className="public-form-options">
            {options.map((option) => (
              <label key={option}>
                <input
                  type="radio"
                  name={field.field_key}
                  value={option}
                  checked={value === option}
                  onChange={(e) =>
                    handleAnswerChange(field.field_key, e.target.value)
                  }
                  required={required}
                />
                {option}
              </label>
            ))}
          </div>
        );

      case "CHECKBOX": {
        const selectedValues = Array.isArray(value) ? value : [];

        return (
          <div className="public-form-options">
            {options.map((option) => (
              <label key={option}>
                <input
                  type="checkbox"
                  name={field.field_key}
                  value={option}
                  checked={selectedValues.includes(option)}
                  onChange={(e) =>
                    handleCheckboxChange(
                      field.field_key,
                      option,
                      e.target.checked
                    )
                  }
                />
                {option}
              </label>
            ))}
          </div>
        );
      }

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
            name={field.field_key}
            placeholder={field.placeholder || ""}
            value={value}
            onChange={(e) =>
              handleAnswerChange(field.field_key, e.target.value)
            }
            required={required}
          />
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="public-form-message">
        Loading form...
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="public-form-message">
        <h2>Form unavailable</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="public-form-message">
        <h2>Form unavailable</h2>
      </div>
    );
  }

  return (
    <div className="public-form-page">
      <div className="public-form-card">
        <h1>{form.title}</h1>

        {form.description && (
          <p className="public-form-description">
            {form.description}
          </p>
        )}

        {successMessage && (
          <div className="submission-success" role="status">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="submission-error" role="alert">
            {error}
          </div>
        )}

        {validationErrors.length > 0 && (
          <div className="submission-error" role="alert">
            <strong>Please correct the following:</strong>

            <ul>
              {validationErrors.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div className="public-form-field" key={field.id}>
              <label className="public-field-label">
                {field.label}

                {isRequired(field) && (
                  <span className="public-required"> *</span>
                )}
              </label>

              {renderField(field)}
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="public-submit-button"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PublicForm;