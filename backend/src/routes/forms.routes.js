
const express = require("express");
const router = express.Router();

const {
  createForm,
  getForms,
  getFormById,
  getAdminFormById,
  updateForm,
  deleteForm
} = require("../controllers/forms.controller");

const {
  authenticateToken,
  authorizeAdmin
} = require("../middleware/auth.middleware");

// Admin-only APIs
router.post("/", authenticateToken, authorizeAdmin, createForm);
router.get("/", authenticateToken, authorizeAdmin, getForms);

// Admin can retrieve both draft and published forms
router.get("/admin/:id", authenticateToken, authorizeAdmin, getAdminFormById);

router.put("/:id", authenticateToken, authorizeAdmin, updateForm);
router.delete("/:id", authenticateToken, authorizeAdmin, deleteForm);

// Public users can retrieve published forms only
router.get("/:id", getFormById);

module.exports = router;
