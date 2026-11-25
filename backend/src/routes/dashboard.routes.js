const express = require("express");
const router = express.Router();

const { getDashboardStats } = require("../controllers/dashboard.controller");

const {
  authenticateToken,
  authorizeAdmin
} = require("../middleware/auth.middleware");

router.get("/", authenticateToken, authorizeAdmin, getDashboardStats);

module.exports = router;