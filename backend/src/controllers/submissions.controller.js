
const Form = require("../models/form.model");
const Submission = require("../models/submission.model");

const isEmpty = (value) =>
  value === undefined ||
  value === null ||
  value === "" ||
  (Array.isArray(value) && value.length === 0);

const validateAnswer = (field, value) => {
  const rules =
    typeof field.validation_rules === "string"
      ? JSON.parse(field.validation_rules || "{}")
      : field.validation_rules || {};

  const options =
    typeof field.options === "string"
      ? JSON.parse(field.options || "[]")
      : field.options || [];

  // Required field validation
  if (isEmpty(value)) {
    if (field.is_required) {
      return `${field.label} is required`;
    }
    return null;
  }

  // Field type validation
  switch (field.field_type) {
    case "TEXT":
    case "TEXTAREA":
      if (typeof value !== "string") {
        return `${field.label} must be text`;
      }

      if (rules.minLength && value.length < rules.minLength) {
        return `${field.label} must contain at least ${rules.minLength} characters`;
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        return `${field.label} cannot exceed ${rules.maxLength} characters`;
      }
      break;

    case "EMAIL":
      if (
        typeof value !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ) {
        return `${field.label} must be a valid email address`;
      }
      break;

    case "NUMBER":
      if (typeof value !== "number" || !Number.isFinite(value)) {
        return `${field.label} must be a valid number`;
      }

      if (rules.min !== undefined && value < rules.min) {
        return `${field.label} must be at least ${rules.min}`;
      }

      if (rules.max !== undefined && value > rules.max) {
        return `${field.label} cannot exceed ${rules.max}`;
      }
      break;

    case "PHONE":
      if (
        typeof value !== "string" ||
        !/^\+?[0-9\s()-]{7,20}$/.test(value)
      ) {
        return `${field.label} must be a valid phone number`;
      }
      break;

    case "DATE":
      if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
        Number.isNaN(Date.parse(value))
      ) {
        return `${field.label} must be a valid date in YYYY-MM-DD format`;
      }
      break;

    case "SELECT":
    case "RADIO":
      if (typeof value !== "string" || !options.includes(value)) {
        return `Please select a valid option for ${field.label}`;
      }
      break;

    case "CHECKBOX":
      if (
        !Array.isArray(value) ||
        !value.every((item) => options.includes(item))
      ) {
        return `Please select valid options for ${field.label}`;
      }
      break;

    default:
      return `Unsupported field type: ${field.field_type}`;
  }

  return null;
};

// Submit dynamic form
const submitForm = async (req, res) => {
  try {
    const formId = Number(req.params.formId);
    const { answers } = req.body;

    if (!Number.isInteger(formId) || formId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID"
      });
    }

    if (
      !answers ||
      typeof answers !== "object" ||
      Array.isArray(answers)
    ) {
      return res.status(400).json({
        success: false,
        message: "Answers must be provided as an object"
      });
    }

    // Fetch form and its dynamic fields
    const form = await Form.getFormById(formId);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found"
      });
    }

    if (form.status !== "PUBLISHED") {
      return res.status(400).json({
        success: false,
        message: "This form is not published"
      });
    }

    const fields = form.fields || [];
    const allowedKeys = fields.map((field) => field.field_key);

    // Reject answers for fields that do not belong to this form
    const unknownKeys = Object.keys(answers).filter(
      (key) => !allowedKeys.includes(key)
    );

    if (unknownKeys.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Unknown form fields provided",
        errors: unknownKeys
      });
    }

    // Validate every configured field
    const errors = [];

    for (const field of fields) {
      const error = validateAnswer(field, answers[field.field_key]);

      if (error) {
        errors.push(error);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Form validation failed",
        errors
      });
    }

    // Save submission
    const submissionId = await Submission.createSubmission(
      formId,
      answers
    );

    res.status(201).json({
      success: true,
      message: "Form submitted successfully",
      data: {
        submissionId
      }
    });
  } catch (error) {
    console.error("Submit form error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to submit form"
    });
  }
};


// Get all submissions with pagination
const getSubmissions = async (req, res) => {
  try {
    const formId = Number(req.params.formId);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (!Number.isInteger(formId) || formId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID"
      });
    }

    if (
      !Number.isInteger(page) || page < 1 ||
      !Number.isInteger(limit) || limit < 1 || limit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Page must be positive and limit must be between 1 and 100"
      });
    }

    const form = await Form.getFormById(formId);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found"
      });
    }

    const offset = (page - 1) * limit;

    const result = await Submission.getSubmissions(
      formId,
      limit,
      offset
    );

    res.status(200).json({
      success: true,
      data: result.submissions,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit)
      }
    });
  } catch (error) {
    console.error("Get submissions error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve submissions"
    });
  }
};

// Get one submission by ID
const getSubmissionById = async (req, res) => {
  try {
    const formId = Number(req.params.formId);
    const submissionId = Number(req.params.submissionId);

    if (
      !Number.isInteger(formId) || formId <= 0 ||
      !Number.isInteger(submissionId) || submissionId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID or submission ID"
      });
    }

    const submission = await Submission.getSubmissionById(
      formId,
      submissionId
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found"
      });
    }

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error("Get submission error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve submission"
    });
  }
};

// Delete a submission
const deleteSubmission = async (req, res) => {
  try {
    const formId = Number(req.params.formId);
    const submissionId = Number(req.params.submissionId);

    if (
      !Number.isInteger(formId) || formId <= 0 ||
      !Number.isInteger(submissionId) || submissionId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID or submission ID"
      });
    }

    const affectedRows = await Submission.deleteSubmission(
      formId,
      submissionId
    );

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Submission not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Submission deleted successfully"
    });
  } catch (error) {
    console.error("Delete submission error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete submission"
    });
  }
};

module.exports = {
  submitForm,
  getSubmissions,
  getSubmissionById,
  deleteSubmission
};

