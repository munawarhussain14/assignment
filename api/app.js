// Load environment variables
require("dotenv").config();

const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./config/swagger");

const app = express();
const PORT = process.env.PORT || 3000;

// Swagger UI setup
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Express.js RBAC API Documentation",
  })
);

// redirect it to /api-docs
app.get("/", (req, res) => {
  res.redirect("/api-docs");
});

const controller = require("./controllers/controller");
controller(app);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: "Something went wrong!",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "Route not found",
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Available users for testing:`);
    console.log(`- User: {id: "u1", role: "user"}`);
    console.log(`- Admin: {id: "u2", role: "admin"}`);
  });
}

module.exports = app;
