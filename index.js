import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Import config
import { PORT } from "./Config/config.js";
import "./Config/ConnectionToBd.js"; 

// Import routers
import authRoutes from "./src/Routes/authRoutes.js";
import userRoutes from "./src/Routes/userRoutes.js";
import EbookRoutes from "./src/Routes/EbookRoutes.js";
import categoryRoutes from "./src/Routes/categoryRoutes.js";
import CartRoutes from "./src/Routes/CartRoutes.js";
import sellerRequestRoutes from "./src/Routes/sellerRequestRoutes.js";
import OrdersRoutes from './src/Routes/OrdersRoutes.js';
import adressRoutes from './src/Routes/addressRoutes.js'
import PaymentsRoutes from './src/Routes/PaymentsRoutes.js';
import invoicesRoutes from './src/Routes/InvoiceRoutes.js';

// ES module dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Init app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ebooks", EbookRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", CartRoutes);
app.use("/api/seller-requests", sellerRequestRoutes);
app.use('/api/orders', OrdersRoutes);
app.use("/api/addresses", adressRoutes);
app.use('/api/payments', PaymentsRoutes);
app.use('/api/invoices', invoicesRoutes);


// Static Views (solo si necesitas HTML desde backend)
app.use(express.static(path.join(__dirname, "src", "Views")));
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "src", "Views", "Login.html"))
);

// Dashboard routes
app.get("/ebooks-dashboard.html", (req, res) =>
  res.sendFile(path.join(__dirname, "src", "Views", "ebooks-dashboard.html"))
);
app.get("/dashboard.html", (req, res) =>
  res.sendFile(path.join(__dirname, "src", "Views", "ebooks-dashboard.html"))
);

// Healthcheck
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "E-commerce API is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handlers
app.use("*", (req, res) =>
  res.status(404).json({ success: false, message: "Route not found" })
);

app.use((error, req, res, next) => {
  console.error("Global error:", error);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
