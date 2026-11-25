
// Load environment variables first
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

// Import database connection
const { testConnection } = require("./config/db");

// Import routes
const formRoutes = require("./routes/forms.routes");
const formFieldRoutes = require("./routes/formFields.routes");
const submissionRoutes = require("./routes/submissions.routes");
const authRoutes = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

// Initialize Express
const app = express();

// Middleware
app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use("/api/forms", formRoutes);
app.use("/api/forms/:formId/fields", formFieldRoutes);
app.use("/api/forms/:formId/submissions", submissionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Dynamic Form Builder API is running"
  });
});

// Handle invalid routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found"
  });
});

// Server configuration
const PORT = process.env.PORT || 5000;

// Start server after database connection
const startServer = async () => {
  try {
    await testConnection();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error.message);
    process.exit(1);
  }
};

startServer();