// Import required dependencies
const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");

// Main test suite for the Express.js RBAC Application
describe("Express.js RBAC Application", () => {
  // Declare tokens that will be used across tests
  let adminToken;
  let userToken;
  let invalidToken;

  // Generate test tokens before running any tests
  beforeAll(() => {
    // Generate admin token
    adminToken = jwt.sign({ id: "u2", role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    // Generate regular user token
    userToken = jwt.sign({ id: "u1", role: "user" }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    // Create an invalid token for testing error cases
    invalidToken = "invalid.token.here";
  });

  // Test suite for login endpoint
  describe("POST /login", () => {
    // Test successful login scenario
    test("should return JWT token for valid user ID", async () => {
      const response = await request(app)
        .post("/login")
        .send({ userId: "u1" })
        .expect(200);

      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toEqual({ id: "u1", role: "user" });
      expect(response.body.message).toBe("Login successful");
    });

    // Test non-existent user login attempt
    test("should return 404 for non-existent user", async () => {
      const response = await request(app)
        .post("/login")
        .send({ userId: "nonexistent" })
        .expect(404);

      expect(response.body.error).toBe("User not found");
    });

    // Test missing userId in request
    test("should return 400 for missing userId", async () => {
      const response = await request(app).post("/login").send({}).expect(400);

      expect(response.body.error).toBe("Bad Request");
    });
  });

  // Test suite for post deletion endpoint
  describe("DELETE /posts/:id", () => {
    // Test successful post deletion by admin
    test("1. Successful delete by admin", async () => {
      const response = await request(app)
        .delete("/posts/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe("Post deleted successfully");
      expect(response.body.deletedPost).toEqual({
        id: "1",
        title: "First Post",
        content: "Hello World!",
      });
    });

    // Test deletion attempt by regular user
    test("2. Forbidden delete by normal user", async () => {
      const response = await request(app)
        .delete("/posts/2")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.error).toBe("Forbidden");
      expect(response.body.message).toBe(
        "Insufficient permissions to access this resource"
      );
    });

    // Test deletion attempt without authentication token
    test("3. Missing token", async () => {
      const response = await request(app).delete("/posts/2").expect(401);

      expect(response.body.error).toBe("Access token required");
      expect(response.body.message).toBe(
        "Authorization header must start with Bearer"
      );
    });

    // Test deletion attempt with invalid token
    test("4. Invalid token", async () => {
      const response = await request(app)
        .delete("/posts/2")
        .set("Authorization", `Bearer ${invalidToken}`)
        .expect(401);

      expect(response.body.error).toBe("Invalid token");
      expect(response.body.message).toBe("The provided token is invalid");
    });

    // Test deletion attempt with malformed auth header
    test("5. Malformed Authorization header", async () => {
      const response = await request(app)
        .delete("/posts/2")
        .set("Authorization", "InvalidFormat")
        .expect(401);

      expect(response.body.error).toBe("Access token required");
    });

    // Test deletion of non-existent post
    test("6. Post not found", async () => {
      const response = await request(app)
        .delete("/posts/999")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.error).toBe("Post not found");
      expect(response.body.message).toBe(
        "Post with the provided ID does not exist"
      );
    });
  });

  // Test suite for retrieving all posts
  describe("GET /posts", () => {
    test("should return all posts", async () => {
      const response = await request(app).get("/posts").expect(200);

      expect(response.body.message).toBe("Posts retrieved successfully");
      expect(response.body.posts).toBeInstanceOf(Array);
      expect(response.body.posts.length).toBeGreaterThan(0);
    });
  });

  // Test suite for health check endpoint
  describe("Health check", () => {
    test("should return health status", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.body.status).toBe("OK");
      expect(response.body.message).toBe("Server is running");
    });
  });

  // Test suite for 404 error handling
  describe("404 handler", () => {
    test("should return 404 for non-existent routes", async () => {
      const response = await request(app).get("/nonexistent").expect(404);

      expect(response.body.error).toBe("Not Found");
      expect(response.body.message).toBe("Route not found");
    });
  });
});
