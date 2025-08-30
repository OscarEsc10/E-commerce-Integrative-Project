// View Routes Configuration
import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = Router();

// Base path for views
const viewsPath = path.join(__dirname, '../Views');

// Route mappings - clean URLs without .html extensions
const routes = {
  '/': 'dashboard.html',
  '/login': 'Login.html',
  '/register': 'register.html',
  '/dashboard': 'dashboard.html',
  '/ebooks': 'ebooks-dashboard.html',
  '/catalog': 'catalog.html',
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

// Redirect old .html routes to clean URLs
const redirects = {
  '/Login.html': '/login',
  '/register.html': '/register',
  '/dashboard.html': '/dashboard',
  '/ebooks-dashboard.html': '/ebooks',
  '/catalog.html': '/catalog',
  '/admin/adminDashboard.html': '/admin'
};

Object.entries(redirects).forEach(([oldRoute, newRoute]) => {
  router.get(oldRoute, (req, res) => {
    res.redirect(301, newRoute);
  });
});

// Serve static assets
router.use('/Assest', (req, res, next) => {
  const assetsPath = path.join(__dirname, '../../Assest');
  res.sendFile(path.join(assetsPath, req.path), (err) => {
    if (err) {
      next();
    }
  });
});

// Serve JavaScript files
router.use('/src/Views/js', (req, res, next) => {
  const jsPath = path.join(viewsPath, 'js');
  res.sendFile(path.join(jsPath, req.path), (err) => {
    if (err) {
      next();
    }
  });
});

export default router;
