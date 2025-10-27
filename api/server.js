const express = require("express");
const cors = require("cors");
const path = require("path");
const blogRoutes = require("./routes/blog");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// API Routes
app.use("/api/blog", blogRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("API Error:", error);
  res.status(500).json({
    success: false,
    error: "Error interno del servidor",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint no encontrado",
  });
});

// Start server only if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
  });
}

module.exports = app;
