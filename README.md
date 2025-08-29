# 📚 E-commerce Ebooks Platform

A modern **E-commerce web application** specialized in digital books (ebooks), built with **Node.js**, **Express**, and **PostgreSQL**. Features a complete authentication system, role-based access control, shopping cart functionality, and modern pagination with clean URLs.

---

## 🚀 Key Features

### Authentication & Authorization
- **JWT-based authentication** with bcrypt password hashing
- **Role-based access control** (Admin, Seller, Customer)
- **Secure registration/login** with input validation
- **Password requirements** enforcement

### Ebook Management
- **CRUD operations** for ebooks (Create, Read, Update, Delete)
- **Category-based organization** with filtering
- **Advanced search functionality** across titles, descriptions, and categories
- **Pagination system** with modern UI transitions

### Shopping Cart
- **Add/remove items** with real-time updates
- **Quantity management** and total calculation
- **Persistent cart** across sessions

### Modern UI/UX
- **Clean URLs** without file extensions (`/register`, `/login`, `/dashboard`)
- **Responsive design** with Tailwind CSS and Bootstrap
- **Modern animations** and smooth transitions
- **Fixed footer** positioning for better UX

---

## 📂 Project Structure

```
E-commerce-Integrative-Project/
├── Assest/
│   ├── css/
│   │   ├── catalog.css           # Catalog page styles
│   │   ├── dashboard.css         # Dashboard styles
│   │   └── modern-pagination.css # Pagination components
│   ├── img/
│   └── styles.css
├── Config/
│   ├── ConnectionToBd.js         # Database connection
│   └── config.js                 # Environment configuration
├── SQL/
│   └── E-commerce.sql           # Database schema and seed data
├── src/
│   ├── Controllers/
│   │   ├── AuthController.js     # Authentication logic
│   │   ├── CartController.js     # Shopping cart operations
│   │   ├── CategoryController.js # Category management
│   │   ├── EbookController.js    # Ebook CRUD operations
│   │   └── UserController.js     # User management
│   ├── Middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── Models/
│   │   ├── CartModel.js         # Cart data model
│   │   ├── Category.js          # Category model
│   │   ├── Ebook.js             # Ebook model
│   │   ├── Order.js             # Order model
│   │   └── User.js              # User model
│   ├── Routes/
│   │   ├── authRoutes.js        # Authentication routes
│   │   ├── CartRoutes.js        # Cart API routes
│   │   ├── categoryRoutes.js    # Category routes
│   │   ├── EbookRoutes.js       # Ebook API routes
│   │   ├── userRoutes.js        # User routes
│   │   └── viewRoutes.js        # Clean URL routing
│   ├── Services/
│   │   └── PaginationService.js # Pagination logic
│   └── Views/
│       ├── js/
│       │   ├── auth.js          # Authentication utilities
│       │   ├── api.js           # API client
│       │   ├── catalog.js       # Catalog functionality
│       │   ├── dashboard.js     # Dashboard logic
│       │   ├── ebooks-dashboard.js # Ebooks management
│       │   ├── login.js         # Login form handling
│       │   ├── modern-pagination.js # Pagination effects
│       │   └── register.js      # Registration form
│       ├── admin/
│       │   └── adminDashboard.html
│       ├── catalog.html         # Public ebook catalog
│       ├── dashboard.html       # Main dashboard
│       ├── ebooks-dashboard.html # Ebooks management view
│       ├── Login.html           # Login page
│       └── register.html        # Registration page
├── .env                         # Environment variables
├── .gitignore
├── eslint.config.mjs
├── index.js                     # Application entry point
└── package.json
```

---

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js framework
- **PostgreSQL** database with raw SQL queries
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation

### Frontend
- **Vanilla JavaScript** (ES6+ modules)
- **Tailwind CSS** for utility-first styling
- **Bootstrap 5** for responsive components
- **Font Awesome** for icons

### Development Tools
- **ESLint** for code quality
- **Prettier** for code formatting
- **Nodemon** for development server
- **Git** for version control

---

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/OscarEsc10/E-commerce-Integrative-Project.git
   cd E-commerce-Integrative-Project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   DB_URL=postgresql://username:password@localhost:5432/ecommerce_db
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=24h
   ```

4. **Set up the database:**
   - Create a PostgreSQL database
   - Run the SQL script: `SQL/E-commerce.sql`

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Access the application:**
   - Open `http://localhost:3000` in your browser
   - Default route redirects to login page

---

## 🌐 Available Routes

### Clean URLs (No .html extensions)
- `/` - Home (redirects to dashboard)
- `/login` - User login
- `/register` - User registration  
- `/dashboard` - Main dashboard
- `/ebooks` - Ebooks management
- `/catalog` - Public ebook catalog
- `/admin` - Admin dashboard

### API Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/ebooks/paginated` - Paginated ebooks with search/filter
- `GET /api/categories` - Get all categories
- `POST /api/cart` - Add items to cart
- `GET /api/cart/:userId` - Get user's cart

---

## 👥 User Roles & Permissions

### Customer
- Browse and search ebooks
- Add items to cart
- View purchase history

### Seller
- Manage their own ebooks
- View sales analytics
- Process orders

### Admin
- Full system access
- User management
- Category management
- System analytics

---

## 🎨 Features Implemented

### Authentication System
- ✅ Secure login/registration
- ✅ JWT token management
- ✅ Role-based access control
- ✅ Password validation requirements

### Ebook Management
- ✅ CRUD operations
- ✅ Category filtering
- ✅ Advanced search functionality
- ✅ Pagination with modern UI

### Shopping Cart
- ✅ Add/remove items
- ✅ Quantity management
- ✅ Real-time total calculation

### UI/UX Enhancements
- ✅ Clean URL routing
- ✅ Separated JavaScript logic
- ✅ Modern pagination animations
- ✅ Fixed footer positioning
- ✅ Responsive design

---

## 🚀 Development Scripts

```bash
npm run dev    # Start development server with nodemon
npm start      # Start production server
npm test       # Run tests (to be implemented)
```

---

## 📧 Contributors

Developed by:
- **Oscar Escorcia** - [@OscarEsc10](https://github.com/OscarEsc10)
- **Hernan Vazquez**
- **Ehider Vilanueva**
- **Jose Montes**
---

## 📄 License

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)