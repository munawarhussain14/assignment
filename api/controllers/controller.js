const express = require("express");
const jwt = require("jsonwebtoken");
const users = require("../data/users.json");
const posts = require("../data/posts.json");
const authorize = require("../middleware/role");

const controller = (app) => {
  // Middleware
  app.use(express.json());

  // Routes

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
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "userId is required",
      });
    }

    // Find user by ID
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        message: "User with the provided ID does not exist",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedPosts = posts.slice(startIndex, endIndex);

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
    const postId = req.params.id;

    // Find post index
    const postIndex = posts.findIndex((post) => post.id === postId);

    if (postIndex === -1) {
      return res.status(404).json({
        error: "Post not found",
        message: "Post with the provided ID does not exist",
      });
    }

    // Remove post from array
    const deletedPost = posts.splice(postIndex, 1)[0];

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
    res.json({ status: "OK", message: "Server is running" });
  });
};

module.exports = controller;
