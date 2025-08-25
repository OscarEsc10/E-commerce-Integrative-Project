import express from "express";
// Importing the PORT configuration from Config/config.js
import { PORT } from "./Config/config.js";

import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import { PORT } from "./Config/config.js";
import "./Config/ConnectionToBd.js"; 

// Import routers
import authRoutes from "./src/Routes/authRoutes.js";
import userRoutes from "./src/Routes/userRoutes.js";
// import productRoutes from "./src/Routes/products.routes.js";
// import orderRoutes from "./src/Routes/orders.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
>>>>>>> Stashed changes

const app = express();

// Middlewares
app.use(express.json());

<<<<<<< Updated upstream
// Test route
app.get("/", (req, res) => {
  res.send("Welcome to E-commerce API 🚀");
=======
// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/orders', orderRoutes);

// Static Views (solo si necesitas HTML desde backend)
app.use(express.static(path.join(__dirname, 'src', 'Views')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'src', 'Views', 'Login.html')));

// Healthcheck
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "E-commerce API is running", timestamp: new Date().toISOString() });
});

// Error handlers
app.use('*', (req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(500).json({ success: false, message: 'Internal server error' });
>>>>>>> Stashed changes
});

// Start server
app.listen(PORT, () => {
<<<<<<< Updated upstream
  console.log(`Server running on http://localhost:${PORT}`);
});
=======
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
>>>>>>> Stashed changes
