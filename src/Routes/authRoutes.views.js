import { Router } from "express";
import path from "path";
import url from "url";

// Create a new router instance
const router = Router();

// Resolve __dirname in ESM
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const viewsPath = path.join(__dirname, '../Views');
