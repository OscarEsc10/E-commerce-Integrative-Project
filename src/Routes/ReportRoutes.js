// src/Routes/ReportRoutes.js
// Express routes for generating sales reports
// All routes require authentication

import express from "express";
import { ReportController } from "../Controllers/ReportsController.js";
import { authenticateToken } from "../Middleware/auth.js";

const router = express.Router();

/**
 * GET /sales-summary - Retrieve sales summary report (authenticated)
 * GET /sales/user/:id - Retrieve sales report for a specific user (authenticated)
 * All routes require a valid JWT token
 */
router.get("/sales-summary", authenticateToken, ReportController.getSalesSummary);
router.get("/sales/user/:id", authenticateToken, ReportController.getSalesByUser);

export default router;
