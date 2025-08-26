// Config/config.js
// This file is used to configure the application settings
import 'dotenv/config';

// Exporting the port from environment variables or defaulting to 3000
export const PORT = process.env.PORT || 3000;

// Exporting the database connection URL from environment variables
export const DB_URL = process.env.DB_URL;

// JWT configuration
export const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';