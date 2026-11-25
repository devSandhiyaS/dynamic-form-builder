
const Form = require("../models/form.model");

// Create form

const createForm = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Validate form title
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Form title is required"
      });
    }

    // Get creator ID from verified JWT
    const createdBy = req.user.id;

    const formId = await Form.createForm(
      title.trim(),
      description || "",
      createdBy
    );

    return res.status(201).json({
      success: true,
      message: "Form created successfully",
      data: {
        id: formId,
        title: title.trim(),
        description: description || "",
        status: "DRAFT",
        created_by: createdBy
      }
    });

  } catch (error) {
    console.error("Create form error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create form"
    });
  }
};

// Get all forms
const getForms = async (req, res) => {
  try {
    const forms = await Form.getAllForms();

    res.status(200).json({
      success: true,
      data: forms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get form by ID

// Public: Retrieve only published forms
const getFormById = async (req, res) => {
  try {
    const { id } = req.params;

    const form = await Form.getFormById(id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found"
      });
    }

    if (form.status !== "PUBLISHED") {
      return res.status(404).json({
        success: false,
        message: "Form not found or is not published"
      });
    }

    return res.status(200).json({
      success: true,
      data: form
    });

  } catch (error) {
    console.error("Get public form error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve form"
    });
  }
};

// Admin: Retrieve forms regardless of status
const getAdminFormById = async (req, res) => {
  try {
    const { id } = req.params;

    const form = await Form.getFormById(id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: form
    });

  } catch (error) {
    console.error("Get admin form error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve form"
    });
  }
};

// Update form
const updateForm = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, description, status } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID"
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Form title is required"
      });
    }

    if (!["DRAFT", "PUBLISHED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be DRAFT or PUBLISHED"
      });
    }

    const affectedRows = await Form.updateForm(
      id,
      title.trim(),
      description,
      status
    );

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Form not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Form updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete form
const deleteForm = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID"
      });
    }

    const affectedRows = await Form.deleteForm(id);

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Form not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Form deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createForm,
  getForms,
  getFormById,
  getAdminFormById,
  updateForm,
  deleteForm
};
