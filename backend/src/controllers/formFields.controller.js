
const Form = require("../models/form.model");
const FormField = require("../models/formField.model");

// Supported field types
const allowedTypes = [
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

const selectionTypes = ["SELECT", "RADIO", "CHECKBOX"];

// Validate positive integer IDs
const isValidId = (id) => {
  return Number.isInteger(Number(id)) && Number(id) > 0;
};

// Validate field key
const isValidFieldKey = (key) => {
  return (
    typeof key === "string" &&
    /^[a-zA-Z][a-zA-Z0-9_]*$/.test(key)
  );
};

// Validate field options
const isValidOptions = (type, options) => {
  if (!selectionTypes.includes(type)) {
    return options === undefined || options === null ||
      (Array.isArray(options) && options.length === 0);
  }

  return (
    Array.isArray(options) &&
    options.length > 0 &&
    options.every(
      (option) =>
        typeof option === "string" &&
        option.trim().length > 0
    ) &&
    new Set(options.map((option) => option.trim())).size === options.length
  );
};

// Validate validation rules
const isValidValidationRules = (rules) => {
  return (
    rules === undefined ||
    rules === null ||
    (
      typeof rules === "object" &&
      !Array.isArray(rules)
    )
  );
};

// Validate common field data
const validateFieldData = (body) => {
  const {
    label,
    field_key,
    field_type,
    options,
    validation_rules
  } = body;

  if (
    typeof label !== "string" ||
    !label.trim()
  ) {
    return "Field label is required";
  }

  if (!isValidFieldKey(field_key)) {
    return "Field key must start with a letter and contain only letters, numbers and underscores";
  }

  if (!allowedTypes.includes(field_type)) {
    return "Invalid field type";
  }

  if (!isValidOptions(field_type, options)) {
    return "Invalid field options";
  }

  if (!isValidValidationRules(validation_rules)) {
    return "Validation rules must be a valid object";
  }

  return null;
};

// Check whether the parent form exists
const checkFormExists = async (formId) => {
  const form = await Form.getFormById(formId);
  return Boolean(form);
};

// --------------------------------------------------
// ADD FORM FIELD
// POST /api/forms/:formId/fields
// --------------------------------------------------

const addFormField = async (req, res) => {
  try {
    const formId = Number(req.params.formId);

    if (!isValidId(formId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID"
      });
    }

    const validationError = validateFieldData(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    const formExists = await checkFormExists(formId);

    if (!formExists) {
      return res.status(404).json({
        success: false,
        message: "Form not found"
      });
    }

    const field = {
      label: req.body.label.trim(),
      field_key: req.body.field_key.trim(),
      field_type: req.body.field_type,
      placeholder: req.body.placeholder || null,
      default_value: req.body.default_value ?? null,
      options: req.body.options ?? null,
      validation_rules: req.body.validation_rules ?? null,
      is_required: Boolean(req.body.is_required)
    };

    const fieldId = await FormField.addField(formId, field);

    return res.status(201).json({
      success: true,
      message: "Form field added successfully",
      data: {
        id: fieldId,
        form_id: formId,
        ...field
      }
    });

  } catch (error) {
    console.error("Add form field error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "A field with this key already exists in the form"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to add form field"
    });
  }
};

// --------------------------------------------------
// UPDATE FORM FIELD
// PUT /api/forms/:formId/fields/:fieldId
// --------------------------------------------------

const updateFormField = async (req, res) => {
  try {
    const formId = Number(req.params.formId);
    const fieldId = Number(req.params.fieldId);

    if (!isValidId(formId) || !isValidId(fieldId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID or field ID"
      });
    }

    const validationError = validateFieldData(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    const formExists = await checkFormExists(formId);

    if (!formExists) {
      return res.status(404).json({
        success: false,
        message: "Form not found"
      });
    }

    const field = {
      label: req.body.label.trim(),
      field_key: req.body.field_key.trim(),
      field_type: req.body.field_type,
      placeholder: req.body.placeholder || null,
      default_value: req.body.default_value ?? null,
      options: req.body.options ?? null,
      validation_rules: req.body.validation_rules ?? null,
      is_required: Boolean(req.body.is_required)
    };

    const affectedRows = await FormField.updateField(
      formId,
      fieldId,
      field
    );

    if (!affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Form field not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Form field updated successfully",
      data: {
        id: fieldId,
        form_id: formId,
        ...field
      }
    });

  } catch (error) {
    console.error("Update form field error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "A field with this key already exists in the form"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update form field"
    });
  }
};

// --------------------------------------------------
// DELETE FORM FIELD
// DELETE /api/forms/:formId/fields/:fieldId
// --------------------------------------------------

const deleteFormField = async (req, res) => {
  try {
    const formId = Number(req.params.formId);
    const fieldId = Number(req.params.fieldId);

    if (!isValidId(formId) || !isValidId(fieldId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID or field ID"
      });
    }

    const formExists = await checkFormExists(formId);

    if (!formExists) {
      return res.status(404).json({
        success: false,
        message: "Form not found"
      });
    }

    const affectedRows = await FormField.deleteField(
      formId,
      fieldId
    );

    if (!affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Form field not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Form field deleted successfully"
    });

  } catch (error) {
    console.error("Delete form field error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete form field"
    });
  }
};

// --------------------------------------------------
// REORDER FORM FIELDS
// PUT /api/forms/:formId/fields/reorder
// --------------------------------------------------

const reorderFormFields = async (req, res) => {
  try {
    const formId = Number(req.params.formId);
    const { fieldIds } = req.body;

    if (!isValidId(formId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID"
      });
    }

    if (
      !Array.isArray(fieldIds) ||
      !fieldIds.every(isValidId) ||
      new Set(fieldIds.map(Number)).size !== fieldIds.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Field IDs must be an array of unique positive integers"
      });
    }

    const formExists = await checkFormExists(formId);

    if (!formExists) {
      return res.status(404).json({
        success: false,
        message: "Form not found"
      });
    }

    await FormField.reorderFields(
      formId,
      fieldIds.map(Number)
    );

    return res.status(200).json({
      success: true,
      message: "Form fields reordered successfully",
      data: {
        form_id: formId,
        field_ids: fieldIds.map(Number)
      }
    });

  } catch (error) {
    console.error("Reorder form fields error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to reorder form fields"
    });
  }
};

module.exports = {
  addFormField,
  updateFormField,
  deleteFormField,
  reorderFormFields
};
