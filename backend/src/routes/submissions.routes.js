
const express = require("express");

const router = express.Router({ mergeParams: true });

const {
  submitForm,
  getSubmissions,
  getSubmissionById,
  deleteSubmission
} = require("../controllers/submissions.controller");

const {
  authenticateToken,
  authorizeAdmin
} = require("../middleware/auth.middleware");

// Public API: anyone can submit a published form
router.post("/", submitForm);

// Admin-only submission management
router.get("/", authenticateToken, authorizeAdmin, getSubmissions);
router.get("/:submissionId", authenticateToken, authorizeAdmin, getSubmissionById);
router.delete("/:submissionId", authenticateToken, authorizeAdmin, deleteSubmission);

module.exports = router;
