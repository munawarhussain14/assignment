/**
 * Import JSON Web Token library for token verification
 */
const jwt = require("jsonwebtoken");

/**
 * Middleware factory function that creates role-based authorization middleware
 * @param {string[]} roles - Array of roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
const authorize = (roles) => {
  return (req, res, next) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;

      // Check if Authorization header exists and has correct format
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          error: "Access token required",
          message: "Authorization header must start with Bearer",
        });
      }

      // Extract token by removing 'Bearer ' prefix
      const token = authHeader.substring(7);

      // Verify token signature and decode payload
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user's role is included in the allowed roles array
      if (!roles.includes(decoded.role)) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Insufficient permissions to access this resource",
        });
      }

      // Attach decoded user information to request object for downstream middleware
      req.user = decoded;
      next();
    } catch (error) {
      // Handle invalid token format or signature
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          error: "Invalid token",
          message: "The provided token is invalid",
        });
      }
      // Handle expired tokens
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          error: "Token expired",
          message: "The provided token has expired",
        });
      }
      // Handle any other unexpected errors
      return res.status(500).json({
        error: "Internal server error",
        message: "Error processing authentication",
      });
    }
  };
};

/**
 * Export the authorization middleware factory function
 */
module.exports = authorize;
