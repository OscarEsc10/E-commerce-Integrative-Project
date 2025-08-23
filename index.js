// index.js
// This is the main entry point of the application
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';

// Importing configurations
import { PORT } from "./Config/config.js";
import "./Config/ConnectionToBd.js"; // Initialize database connection

// Importing routes
import authRoutes from "./src/Routes/authRoutes.js";

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initializing the Express application
const app = express();

// Middlewares
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'your-domain.com' : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from Views directory
app.use(express.static(path.join(__dirname, 'src', 'Views')));

// API Routes
app.use('/api/auth', authRoutes);

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'Views', 'Login.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'Views', 'Login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'Views', 'register.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'Views', 'dashboard.html'));
});

// Test API route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "E-commerce API is running ",
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Starting the server
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` Login page: http://localhost:${PORT}/login`);
  console.log(` Register page: http://localhost:${PORT}/register`);
  console.log(` Dashboard: http://localhost:${PORT}/dashboard`);
});