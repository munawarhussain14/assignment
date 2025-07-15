/**
 * Import required dependencies
 */
const express = require("express");
const jwt = require("jsonwebtoken");
const users = require("../data/users.json");
const posts = require("../data/posts.json");
const authorize = require("../middleware/role");

/**
 * Main controller function that sets up routes and middleware
 * @param {Express} app - Express application instance
 */
const controller = (app) => {
  // Configure middleware to parse JSON request bodies
  app.use(express.json());

  // Define API Routes

  /**
   * @swagger
   * /login:
   *   post:
   *     summary: Authenticate user and get JWT token
   *     description: Authenticates a user by ID and returns a JWT token for API access
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LoginResponse'
   *       400:
   *         description: Bad request - userId is required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.post("/login", (req, res) => {
    // Extract userId from request body
    const { userId } = req.body;

    // Validate that userId was provided
    if (!userId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "userId is required",
      });
    }

    // Find user by ID in users data
    const user = users.find((u) => u.id === userId);

    // Return error if user not found
    if (!user) {
      return res.status(404).json({
        error: "User not found",
        message: "User with the provided ID does not exist",
      });
    }

    // Generate JWT token with user data and expiry
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // Return success response with token and user info
    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, role: user.role },
    });
  });

  /**
   * @swagger
   * /posts:
   *   get:
   *     summary: Get paginated posts
   *     description: Retrieves paginated posts (public endpoint, no authentication required)
   *     tags: [Posts]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Number of records per page
   *     responses:
   *       200:
   *         description: Posts retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PostsResponse'
   */
  app.get("/posts", (req, res) => {
    // Extract and parse pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Get slice of posts for current page
    const paginatedPosts = posts.slice(startIndex, endIndex);

    // Return paginated results with metadata
    res.json({
      message: "Posts retrieved successfully",
      currentPage: page,
      totalPages: Math.ceil(posts.length / limit),
      totalPosts: posts.length,
      posts: paginatedPosts,
    });
  });

  /**
   * @swagger
   * /posts/{id}:
   *   delete:
   *     summary: Delete a post
   *     description: Deletes a post by ID (admin only)
   *     tags: [Posts]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Post ID
   *         example: "1"
   *     responses:
   *       200:
   *         description: Post deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/DeletePostResponse'
   *       401:
   *         description: Unauthorized - Invalid or missing token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Forbidden - Insufficient permissions
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Post not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.delete("/posts/:id", authorize(["admin"]), (req, res) => {
    // Get post ID from URL parameters
    const postId = req.params.id;

    // Find index of post in posts array
    const postIndex = posts.findIndex((post) => post.id === postId);

    // Return error if post not found
    if (postIndex === -1) {
      return res.status(404).json({
        error: "Post not found",
        message: "Post with the provided ID does not exist",
      });
    }

    // Remove post from array and store deleted post
    const deletedPost = posts.splice(postIndex, 1)[0];

    // Return success response with deleted post data
    res.json({
      message: "Post deleted successfully",
      deletedPost,
    });
  });

  /**
   * @swagger
   * /health:
   *   get:
   *     summary: Health check
   *     description: Returns server health status
   *     tags: [System]
   *     responses:
   *       200:
   *         description: Server is healthy
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/HealthResponse'
   */
  app.get("/health", (req, res) => {
    // Return basic health check response
    res.json({ status: "OK", message: "Server is running" });
  });
};

// Export controller for use in main application
module.exports = controller;
