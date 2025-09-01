import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Main entry point for the E-commerce backend server.
 * Sets up Express app, middleware, API routes, static assets, error handling, and server startup.
 */
// Import config
import { PORT } from "./Config/config.js";
import "./Config/ConnectionToBd.js";

 

// Import routers
import authRoutes from "./src/Routes/authRoutes.js";
import userRoutes from "./src/Routes/userRoutes.js";
// Import routers for all API and view endpoints
import EbookRoutes from "./src/Routes/EbookRoutes.js";
import categoryRoutes from "./src/Routes/categoryRoutes.js";
import CartRoutes from "./src/Routes/CartRoutes.js";
import sellerRequestRoutes from "./src/Routes/sellerRequestRoutes.js";
import OrdersRoutes from './src/Routes/OrdersRoutes.js';
import adressRoutes from './src/Routes/addressRoutes.js'
import PaymentsRoutes from './src/Routes/PaymentsRoutes.js';
import invoicesRoutes from './src/Routes/InvoiceRoutes.js';
import viewRoutes from "./src/Routes/viewRoutes.js";
import ReportRoutes from "./src/Routes/ReportRoutes.js"
// ES module dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get __dirname for ES modules
// Init app
const app = express();

// Middlewares
// Initialize Express app
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Global middlewares

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ebooks", EbookRoutes);
// Register API routes
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", CartRoutes);
app.use("/api/seller-requests", sellerRequestRoutes);
app.use('/api/orders', OrdersRoutes);
app.use("/api/addresses", adressRoutes);
app.use('/api/payments', PaymentsRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/reports', ReportRoutes);

// View Routes (clean URLs)
app.use("/", viewRoutes);

// Static Assets
// Register view routes for frontend pages
app.use('/Assest', express.static('Assest'));

// Healthcheck
// Serve static assets (images, CSS, etc.)
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
// Healthcheck endpoint for monitoring
    message: "E-commerce API is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handlers
app.use("*", (req, res) =>
  res.status(404).json({ success: false, message: "Route not found" })
);
// Error handling for 404 and global errors

app.use((error, req, res, next) => {
  console.error("Global error:", error);
  console.error("Error stack:", error.stack);
  res.status(500).json({ success: false, message: "Internal server error", error: error.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
// Start the Express server
