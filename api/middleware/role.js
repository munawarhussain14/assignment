const jwt = require("jsonwebtoken");

const authorize = (roles) => {
  return (req, res, next) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          error: "Access token required",
          message: "Authorization header must start with Bearer",
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify and decode JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user role is in the allowed roles
      if (!roles.includes(decoded.role)) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Insufficient permissions to access this resource",
        });
      }

      // Add user info to request object
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          error: "Invalid token",
          message: "The provided token is invalid",
        });
      }
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          error: "Token expired",
          message: "The provided token has expired",
        });
      }
      return res.status(500).json({
        error: "Internal server error",
        message: "Error processing authentication",
      });
    }
  };
};

module.exports = authorize;
