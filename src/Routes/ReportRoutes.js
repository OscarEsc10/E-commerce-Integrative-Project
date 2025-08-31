// Routes/ReportRoutes.js
import express from "express";
import { ReportController } from "../Controllers/ReportsController.js";
import { authenticateToken } from "../Middleware/auth.js";

const router = express.Router();

router.get("/sales-summary", authenticateToken, ReportController.getSalesSummary);
router.get("/sales/user/:id", authenticateToken, ReportController.getSalesByUser);
export default router;
