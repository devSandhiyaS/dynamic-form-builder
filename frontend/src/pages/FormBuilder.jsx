import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchBuilderForm,
    addFormField,
    updateFormField,
    deleteFormField,
    reorderFormFields,
    updateBuilderForm,
    clearBuilder
} from "../features/forms/formBuilderSlice";
import FormPreview from "../components/FormPreview";

const fieldTypes = [
    "TEXT",
    "EMAIL",
    "NUMBER",
    "PHONE",
    "TEXTAREA",
    "DATE",
    "SELECT",
    "RADIO",
    "CHECKBOX"
];

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

function FormBuilder() {
    const { formId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        form,
        fields,
        loading,
        saving,
        error,
        saveError
    } = useSelector((state) => state.formBuilder);

    const [label, setLabel] = useState("");
    const [fieldKey, setFieldKey] = useState("");
    const [fieldType, setFieldType] = useState("TEXT");
    const [placeholder, setPlaceholder] = useState("");
    const [defaultValue, setDefaultValue] = useState("");
    const [options, setOptions] = useState("");
    const [isRequired, setIsRequired] = useState(false);
    const [editingFieldId, setEditingFieldId] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        dispatch(fetchBuilderForm(formId));

        return () => {
            dispatch(clearBuilder());
        };
    }, [dispatch, formId]);

    const needsOptions = ["SELECT", "RADIO", "CHECKBOX"].includes(
        fieldType
    );

    const resetFieldForm = () => {
        setLabel("");
        setFieldKey("");
        setFieldType("TEXT");
        setPlaceholder("");
        setDefaultValue("");
        setOptions("");
        setIsRequired(false);
        setEditingFieldId(null);
    };

    const handleLabelChange = (value) => {
        setLabel(value);

        if (!editingFieldId) {
            setFieldKey(
                value
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9]+/g, "_")
                    .replace(/^_|_$/g, "")
            );
        }
    };

    const handleFormStatus = async (status) => {
        if (!form) return;
        if (fields.length === 0) {
            alert("Please add at least one field before saving or publishing.");
            return;
        }

        const formData = {
            title: form.title,
            description: form.description,
            status
        };

        try {
            await dispatch(
                updateBuilderForm({ formId, formData })
            ).unwrap();

            await dispatch(fetchBuilderForm(formId)).unwrap();

            alert(
                status === "PUBLISHED"
                    ? "Form published successfully!"
                    : "Form saved as draft successfully!"
            );
        } catch (error) {
            console.error("Form status update failed:", error);
        }
    };

    const handleEdit = (field) => {
        setEditingFieldId(field.id);
        setLabel(field.label || "");
        setFieldKey(field.field_key || "");
        setFieldType(field.field_type || "TEXT");
        setPlaceholder(field.placeholder || "");
        setDefaultValue(field.default_value || "");
        setOptions(getOptions(field.options).join(", "));
        setIsRequired(
            field.is_required === true || field.is_required === 1
        );

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const optionList = options
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

        if (needsOptions && optionList.length === 0) {
            alert("Please enter at least one option.");
            return;
        }

        const fieldData = {
            label: label.trim(),
            field_key: fieldKey.trim(),
            field_type: fieldType,
            placeholder: placeholder.trim(),
            default_value: defaultValue.trim(),
            options: needsOptions ? optionList : null,
            validation_rules: {},
            is_required: isRequired
        };

        try {
            if (editingFieldId) {
                await dispatch(
                    updateFormField({
                        formId,
                        fieldId: editingFieldId,
                        fieldData
                    })
                ).unwrap();
            } else {
                await dispatch(
                    addFormField({ formId, fieldData })
                ).unwrap();
            }

            await dispatch(fetchBuilderForm(formId)).unwrap();
            resetFieldForm();
        } catch (error) {
            console.error("Field operation failed:", error);
        }
    };

    const handleDelete = async (fieldId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this field?"
        );

        if (!confirmed) return;

        try {
            await dispatch(
                deleteFormField({ formId, fieldId })
            ).unwrap();

            await dispatch(fetchBuilderForm(formId)).unwrap();

            if (editingFieldId === fieldId) {
                resetFieldForm();
            }
        } catch (error) {
            console.error("Delete field failed:", error);
        }
    };

    const handleReorder = async (index, direction) => {
        const newFields = [...fields];
        const targetIndex = index + direction;

        if (targetIndex < 0 || targetIndex >= newFields.length) {
            return;
        }

        [newFields[index], newFields[targetIndex]] = [
            newFields[targetIndex],
            newFields[index]
        ];

        const fieldIds = newFields.map((field) => field.id);

        try {
            await dispatch(
                reorderFormFields({ formId, fieldIds })
            ).unwrap();

            await dispatch(fetchBuilderForm(formId)).unwrap();
        } catch (error) {
            console.error("Reorder fields failed:", error);
        }
    };

    if (loading) {
        return <p>Loading form...</p>;
    }

    if (error) {
        return (
            <div>
                <p className="error-message">{error}</p>
                <button onClick={() => navigate("/forms")}>
                    Back to My Forms
                </button>
            </div>
        );
    }

    if (!form) {
        return <p>Form not found.</p>;
    }

    return (
        <div>
            <div className="page-heading">
                <button
                    className="back-button"
                    onClick={() => navigate("/forms")}
                >
                    ← Back to My Forms
                </button>

                <h1>{form.title}</h1>
                <p>{form.description || "Build your form by adding fields."}</p>

                <button
                    type="button"
                    className="preview-button"
                    onClick={() => setShowPreview(true)}
                >
                    Preview Form
                </button>

                {/* Save and Publish Actions */}
                <div className="builder-header-actions">
                    <button
                        type="button"
                        onClick={() => handleFormStatus("DRAFT")}
                        disabled={saving}
                    >
                        Save as Draft
                    </button>

                    <button
                        type="button"
                        onClick={() => handleFormStatus("PUBLISHED")}
                        disabled={saving}
                    >
                        Publish Form
                    </button>
                </div>

                {saveError && (
                    <p className="error-message">{saveError}</p>
                )}
            </div>

            <div className="builder-grid">
                {/* Add/Edit Field */}
                <div className="builder-card">
                    <h2>
                        {editingFieldId ? "Edit Field" : "Add New Field"}
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="fieldLabel">Field Label *</label>

                            <input
                                id="fieldLabel"
                                type="text"
                                placeholder="Example: Full Name"
                                value={label}
                                onChange={(e) => handleLabelChange(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="fieldKey">Field Key *</label>

                            <input
                                id="fieldKey"
                                type="text"
                                placeholder="Example: full_name"
                                value={fieldKey}
                                onChange={(e) => setFieldKey(e.target.value)}
                                required
                            />

                            <small>Unique identifier used to store the answer.</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="fieldType">Field Type *</label>

                            <select
                                id="fieldType"
                                value={fieldType}
                                onChange={(e) => {
                                    setFieldType(e.target.value);
                                    setOptions("");
                                }}
                            >
                                {fieldTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="placeholder">Placeholder</label>

                            <input
                                id="placeholder"
                                type="text"
                                value={placeholder}
                                onChange={(e) => setPlaceholder(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="defaultValue">Default Value</label>

                            <input
                                id="defaultValue"
                                type="text"
                                value={defaultValue}
                                onChange={(e) => setDefaultValue(e.target.value)}
                            />
                        </div>

                        {needsOptions && (
                            <div className="form-group">
                                <label htmlFor="options">Field Options *</label>

                                <textarea
                                    id="options"
                                    rows={3}
                                    placeholder="IT, HR, Finance, Marketing"
                                    value={options}
                                    onChange={(e) => setOptions(e.target.value)}
                                    required
                                />

                                <small>Separate each option with a comma.</small>
                            </div>
                        )}

                        <div className="required-checkbox">
                            <input
                                id="isRequired"
                                type="checkbox"
                                checked={isRequired}
                                onChange={(e) => setIsRequired(e.target.checked)}
                            />

                            <label htmlFor="isRequired">
                                This field is required
                            </label>
                        </div>

                        {saveError && (
                            <p className="error-message" role="alert">
                                {saveError}
                            </p>
                        )}

                        <div className="create-form-actions">
                            <button
                                type="submit"
                                className="create-form-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingFieldId
                                        ? "Update Field"
                                        : "+ Add Field"}
                            </button>

                            {editingFieldId && (
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={resetFieldForm}
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Existing Fields */}
                <div className="builder-card">
                    <h2>Form Fields ({fields.length})</h2>

                    {fields.length === 0 ? (
                        <div className="empty-state">
                            <h3>No fields added</h3>
                            <p>Start by adding your first form field.</p>
                        </div>
                    ) : (
                        <div className="builder-field-list">
                            {fields.map((field, index) => (
                                <div className="builder-field-item" key={field.id}>
                                    <div className="builder-field-details">
                                        <strong>
                                            {index + 1}. {field.label}
                                        </strong>

                                        <p>
                                            {field.field_type} · {field.field_key}
                                        </p>

                                        <span
                                            className={
                                                field.is_required
                                                    ? "required-label"
                                                    : "optional-label"
                                            }
                                        >
                                            {field.is_required ? "Required" : "Optional"}
                                        </span>
                                    </div>

                                    <div className="field-actions">
                                        <button
                                            type="button"
                                            onClick={() => handleReorder(index, -1)}
                                            disabled={index === 0 || saving}
                                            title="Move up"
                                        >
                                            ↑
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleReorder(index, 1)}
                                            disabled={index === fields.length - 1 || saving}
                                            title="Move down"
                                        >
                                            ↓
                                        </button>

                                        <button
                                            type="button"
                                            className="edit-field-button"
                                            onClick={() => handleEdit(field)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            className="delete-field-button"
                                            onClick={() => handleDelete(field.id)}
                                            disabled={saving}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {saveError && (
                        <p className="error-message" role="alert">
                            {saveError}
                        </p>
                    )}
                </div>
            </div>
            {showPreview && (
                <FormPreview
                    form={form}
                    fields={fields}
                    onClose={() => setShowPreview(false)}
                />
            )}
        </div>
    );
}

export default FormBuilder;