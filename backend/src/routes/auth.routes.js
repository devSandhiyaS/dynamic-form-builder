const express = require("express");
const router = express.Router();

const { login } = require("../controllers/auth.controller");
const { rateLimit } = require("express-rate-limit");

// Allow a maximum of 5 login attempts within 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes."
  }
});

// Login API
router.post("/login", loginLimiter, login);

module.exports = router;
