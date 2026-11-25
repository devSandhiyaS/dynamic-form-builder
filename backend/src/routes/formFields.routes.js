
const express = require("express");

const router = express.Router({ mergeParams: true });

const {
  addFormField,
  updateFormField,
  deleteFormField,
  reorderFormFields
} = require("../controllers/formFields.controller");

const {
  authenticateToken,
  authorizeAdmin
} = require("../middleware/auth.middleware");

// All field-management operations require admin access
router.use(authenticateToken, authorizeAdmin);

router.post("/", addFormField);
router.put("/reorder", reorderFormFields);
router.put("/:fieldId", updateFormField);
router.delete("/:fieldId", deleteFormField);

module.exports = router;
