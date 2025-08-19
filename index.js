// index.js
// This is the main entry point of the application
import express from "express";

// Importing the PORT configuration from Config/config.js
import { PORT } from "./Config/config.js";

// Initializing the Express application
const app = express();

// Middlewares
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Welcome to E-commerce API 🚀");
});

// Starting the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});