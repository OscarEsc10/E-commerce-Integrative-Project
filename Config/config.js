// Config/config.js
// This file is used to configure the application settings
import 'dotenv/config';

// Exporting the port from environment variables or defaulting to 3000
export const PORT = process.env.PORT

// Exporting the database connection URL from environment variables
export const DB_URL = process.env.DB_URL