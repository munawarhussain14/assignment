// Load environment variables from .env file
require("dotenv").config();

// Import required dependencies
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./config/swagger");

// Initialize Express app and set port
const app = express();
const PORT = process.env.PORT || 3000;

// Set up Swagger UI documentation endpoint with custom styling
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, {
    customCss: ".swagger-ui .topbar { display: none }", // Hide default Swagger topbar
    customSiteTitle: "Express.js RBAC API Documentation",
  })
);

// Redirect root endpoint to API documentation
app.get("/", (req, res) => {
  res.redirect("/api-docs");
});

// Import and initialize controller routes
const controller = require("./controllers/controller");
controller(app);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log error stack trace
  res.status(500).json({
    error: "Internal Server Error",
    message: "Something went wrong!",
  });
});

// Handle 404 - Route not found
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "Route not found",
  });
});

// Start server if this file is run directly (not imported as a module)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // Log available test users
    console.log(`Available users for testing:`);
    console.log(`- User: {id: "u1", role: "user"}`);
    console.log(`- Admin: {id: "u2", role: "admin"}`);
  });
}

// Export app for testing purposes
module.exports = app;
