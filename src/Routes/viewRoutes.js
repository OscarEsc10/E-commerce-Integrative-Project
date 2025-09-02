// src/Routes/viewRoutes.js
// Express routes for serving frontend views and static assets
// Provides clean URLs and redirects for legacy .html routes

import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = Router();

// Base path for views
const viewsPath = path.join(__dirname, '../Views');

/**
 * Route mappings for clean URLs (no .html extension)
 * Example: /dashboard serves dashboard.html
 */
const routes = {
  '/': 'register.html',
  '/login': 'Login.html',
  '/register': 'register.html',
  '/dashboard': 'dashboard.html',
  '/ebooks': 'catalog.html',
  '/catalog': 'catalog.html',
  '/checkout': 'checkout.html',
  '/admin': 'admin/adminDashboard.html'
};

// Create routes for each mapping
Object.entries(routes).forEach(([route, file]) => {
  router.get(route, (req, res) => {
    const filePath = path.join(viewsPath, file);
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error(`Error serving ${file}:`, err);
        res.status(404).send('Page not found');
      }
    });
  });
});

/**
 * Redirect legacy .html routes to clean URLs
 * Example: /dashboard.html redirects to /dashboard
 */
const redirects = {
  '/Login.html': '/login',
  '/register.html': '/register',
  '/dashboard.html': '/dashboard',
  '/ebooks-dashboard.html': '/catalog',
  '/catalog.html': '/catalog',
  '/admin/adminDashboard.html': '/admin'
};

Object.entries(redirects).forEach(([oldRoute, newRoute]) => {
  router.get(oldRoute, (req, res) => {
    res.redirect(301, newRoute);
  });
});

/**
 * Serve static assets from /Assest
 */
router.use('/Assest', (req, res, next) => {
  const assetsPath = path.join(__dirname, '../../Assest');
  res.sendFile(path.join(assetsPath, req.path), (err) => {
    if (err) {
      next();
    }
  });
});

/**
 * Serve JavaScript files for views
 */
router.use('/src/Views/js', (req, res, next) => {
  const jsPath = path.join(viewsPath, 'js');
  res.sendFile(path.join(jsPath, req.path), (err) => {
    if (err) {
      next();
    }
  });
});

export default router;
