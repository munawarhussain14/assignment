const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
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
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token for authentication",
        },
      },
      schemas: {
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
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./controllers/*.js", "./app.js"], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = specs;
