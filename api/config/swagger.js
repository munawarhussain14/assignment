/**
 * Import Swagger JSDoc library for API documentation generation
 */
const swaggerJsdoc = require("swagger-jsdoc");

/**
 * Swagger configuration options
 */
const options = {
  definition: {
    // OpenAPI specification version
    openapi: "3.0.0",

    // API information
    info: {
      title: "Express.js RBAC API",
      version: "1.0.0",
      description:
        "A Node.js/Express.js application implementing Role-Based Access Control (RBAC) for a social network backend.",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },

    // Server configurations
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],

    // Components section containing reusable schemas and security definitions
    components: {
      // Security scheme definitions
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token for authentication",
        },
      },

      // Reusable schema definitions
      schemas: {
        // User schema definition
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "User ID",
              example: "u1",
            },
            role: {
              type: "string",
              enum: ["user", "admin"],
              description: "User role",
              example: "user",
            },
          },
        },

        // Post schema definition
        Post: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Post ID",
              example: "1",
            },
            title: {
              type: "string",
              description: "Post title",
              example: "First Post",
            },
            content: {
              type: "string",
              description: "Post content",
              example: "Hello World!",
            },
          },
        },

        // Login request schema
        LoginRequest: {
          type: "object",
          required: ["userId"],
          properties: {
            userId: {
              type: "string",
              description: "User ID for authentication",
              example: "u1",
            },
          },
        },

        // Login response schema
        LoginResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Login successful",
            },
            token: {
              type: "string",
              description: "JWT token",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            user: {
              $ref: "#/components/schemas/User",
            },
          },
        },

        // Posts response schema
        PostsResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Posts retrieved successfully",
            },
            posts: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Post",
              },
            },
          },
        },

        // Delete post response schema
        DeletePostResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Post deleted successfully",
            },
            deletedPost: {
              $ref: "#/components/schemas/Post",
            },
          },
        },

        // Error response schema
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              example: "Bad Request",
            },
            message: {
              type: "string",
              example: "userId is required",
            },
          },
        },

        // Health check response schema
        HealthResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "OK",
            },
            message: {
              type: "string",
              example: "Server is running",
            },
          },
        },
      },
    },

    // Global security requirement
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Paths to files containing API documentation
  apis: ["./controllers/*.js", "./app.js"],
};

/**
 * Generate Swagger specification from options
 */
const specs = swaggerJsdoc(options);

/**
 * Export the Swagger specification
 */
module.exports = specs;
