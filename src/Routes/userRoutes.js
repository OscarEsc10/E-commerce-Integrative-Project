// src/Routes/userRoutes.js
// Express routes for managing users (admin only)
// All endpoints require authentication and admin role

import { Router } from "express";
import { UserController } from "../Controllers/UsersController.js";
import { authenticateToken, requireRole } from "../Middleware/auth.js";

const router = Router();

/**
 * GET / - List all users (admin)
 * GET /:id - Get user by ID (admin)
 * POST / - Create a new user (admin)
 * PUT /:id - Update user by ID (admin)
 * DELETE /:id - Delete user by ID (admin)
 * All routes require a valid JWT token and admin role
 */
router.use(authenticateToken, requireRole(["admin"]));

// CRUD operations for users

// List all users
router.get("/", UserController.getAllUsers);

// Get user by ID
router.get("/:id", UserController.getUserById);

// Create a new user
router.post("/", UserController.createUser);

// Update user by ID
router.put("/:id", UserController.updateUser);

// Delete user by ID
router.delete("/:id", UserController.deleteUser);

export default router;
