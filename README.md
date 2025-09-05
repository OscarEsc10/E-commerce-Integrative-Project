# E-commerce Ebooks Platform

A comprehensive **E-commerce web application** specialized in digital books (ebooks), built with **Node.js**, **Express**, and **PostgreSQL**. Features complete authentication system, role-based access control, shopping cart functionality, payment processing, AI chatbot integration, and modern responsive design with clean URLs.

---

## Key Features

### Authentication & Authorization
- **JWT-based authentication** with bcrypt password hashing
- **Role-based access control** (Admin, Seller, Customer)
- **Secure registration/login** with comprehensive input validation
- **Password requirements** enforcement (8+ chars, uppercase, lowercase, number, special char)
- **Session management** with token expiration (24h)

### Ebook Management
- **CRUD operations** for ebooks (Create, Read, Update, Delete)
- **Category-based organization** with dynamic filtering
- **Advanced search functionality** across titles, descriptions, and categories
- **Condition-based filtering** (New, Used, Donate)
- **Pagination system** with modern UI transitions and performance optimization

### Shopping Cart & Payments
- **Add/remove items** with real-time updates
- **Quantity management** and automatic total calculation
- **Persistent cart** using localStorage
- **Complete checkout flow** with payment form integration
- **Payment processing** with credential validation
- **Multiple payment methods** (Credit Card, Debit Card, PayPal)
- **Order management** with status tracking

### AI Chatbot Integration
- **OpenAI GPT-3.5-turbo** powered customer support
- **Floating chat widget** with modern UI design
- **Real-time messaging** with typing indicators
- **Conversation history** management
- **Error tracking** and analytics
- **Session-based** context management

### Modern UI/UX
- **Clean URLs** without file extensions (`/register`, `/login`, `/dashboard`, `/checkout`)
- **Responsive design** optimized for mobile and desktop
- **Modern animations** and smooth transitions
- **Professional styling** with Tailwind CSS and Bootstrap
- **Fixed cart toggle** with dropdown functionality
- **Toast notifications** for user feedback

---

## Project Structure

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
│   │   ├── ChatbotController.js  # AI chatbot endpoints
│   │   ├── EbookController.js    # Ebook CRUD operations
│   │   ├── PaymentsController.js # Payment processing
│   │   └── UserController.js     # User management
│   ├── Middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── Models/
│   │   ├── Addresses.js         # User addresses model
│   │   ├── CartModel.js         # Cart data model
│   │   ├── Category.js          # Category model
│   │   ├── Ebook.js             # Ebook model
│   │   ├── Orders.js            # Order management model
│   │   ├── Payments.js          # Payment processing model
│   │   └── User.js              # User model
│   ├── Routes/
│   │   ├── authRoutes.js        # Authentication routes
│   │   ├── CartRoutes.js        # Cart API routes
│   │   ├── categoryRoutes.js    # Category routes
│   │   ├── chatbotRoutes.js     # AI chatbot routes
│   │   ├── EbookRoutes.js       # Ebook API routes
│   │   ├── InvoiceRoutes.js     # Invoice management
│   │   ├── PaymentsRoutes.js    # Payment processing routes
│   │   ├── userRoutes.js        # User routes
│   │   └── viewRoutes.js        # Clean URL routing
│   ├── Services/
│   │   ├── ChatbotService.js    # Chatbot business logic
│   │   ├── ErrorTrackingService.js # Error logging
│   │   ├── OpenAIService.js     # OpenAI API integration
│   │   └── PaginationService.js # Pagination logic
│   └── Views/
│       ├── js/
│       │   ├── auth.js          # Authentication utilities
│       │   ├── api.js           # API client
│       │   ├── CartManager.js   # Cart management
│       │   ├── catalog.js       # Catalog functionality
│       │   ├── ChatWidget.js    # AI chatbot widget
│       │   ├── checkout.js      # Checkout process
│       │   ├── dashboard.js     # Dashboard logic
│       │   ├── ebooks-dashboard.js # Ebooks management
│       │   ├── login.js         # Login form handling
│       │   ├── modern-pagination.js # Pagination effects
│       │   └── register.js      # Registration form
│       ├── admin/
│       │   └── adminDashboard.html
│       ├── catalog.html         # Public ebook catalog
│       ├── checkout.html        # Payment checkout page
│       ├── dashboard.html       # Main dashboard (public access)
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

## Tech Stack

### Backend
- **Node.js** with Express.js framework (ES modules)
- **PostgreSQL** database with optimized SQL queries
- **JWT** for secure authentication
- **bcryptjs** for password hashing (12 salt rounds)
- **express-validator** for comprehensive input validation
- **OpenAI API** for AI chatbot integration
- **CORS** for cross-origin resource sharing

### Frontend
- **Vanilla JavaScript** (ES6+ modules with modern async/await)
- **Hybrid CSS Framework**: **Bootstrap 5** + **Tailwind CSS**
  - Bootstrap 5 for catalog, navbar components and grid system
  - Tailwind CSS for checkout, authentication pages and utility styling
- **Font Awesome** for comprehensive icon library
- **LocalStorage** for client-side data persistence

### Development Tools
- **ESLint** for code quality
- **Prettier** for code formatting
- **Nodemon** for development server
- **Git** for version control

---

## Installation & Setup

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
   OPENAI_API_KEY=your_openai_api_key_here
   PAYMENT_ENABLED=true
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
   - Default route shows public dashboard (no login required)
   - Navigate to `/login` or `/register` for authentication
   - Use `/catalog` for public ebook browsing

---

## Available Routes

### Clean URLs (No .html extensions)
- `/` - Public dashboard (no authentication required)
- `/login` - User login
- `/register` - User registration  
- `/dashboard` - Main dashboard
- `/ebooks` - Ebooks management (authenticated)
- `/catalog` - Public ebook catalog
- `/checkout` - Payment checkout page
- `/admin` - Admin dashboard

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

#### Ebooks
- `GET /api/ebooks/paginated` - Paginated ebooks with search/filter
- `GET /api/ebooks/search` - Advanced search functionality
- `GET /api/ebooks/new` - Get new condition ebooks
- `GET /api/ebooks/used` - Get used condition ebooks
- `GET /api/ebooks/donate` - Get donated ebooks
- `GET /api/ebooks/condition/:condition_id` - Filter by condition

#### Shopping Cart
- `POST /api/cart` - Add items to cart
- `GET /api/cart/:userId` - Get user's cart
- `PUT /api/cart/:itemId` - Update cart item
- `DELETE /api/cart/:itemId` - Remove cart item

#### Payments
- `POST /api/payments/process` - Process payment
- `GET /api/payments/status` - Check payment system status
- `GET /api/payments/order/:order_id` - Get payment by order

#### AI Chatbot
- `POST /api/chatbot/message` - Send message to chatbot
- `GET /api/chatbot/history/:session_id` - Get conversation history
- `DELETE /api/chatbot/session/:session_id` - Clear chat session

#### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

---

## User Roles & Permissions

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

## Features Implemented

### Authentication System
- Secure login/registration with comprehensive validation
- JWT token management with 24h expiration
- Role-based access control (Admin, Seller, Customer)
- Password requirements enforcement
- Session management and auto-logout
- Profile management and updates

### Ebook Management
- Complete CRUD operations
- Category-based filtering and organization
- Advanced search functionality across multiple fields
- Condition-based filtering (New, Used, Donate)
- Modern pagination with performance optimization
- Public catalog access without authentication

### Shopping Cart & Checkout
- Add/remove items with real-time updates
- Quantity management and validation
- Persistent cart using localStorage
- Real-time total calculation
- Complete checkout flow with payment form
- Direct purchase from catalog
- Cart toggle with dropdown interface

### Payment Processing
- Payment credential validation
- Multiple payment methods support
- Backend payment status control
- Order creation and management
- Payment security with card validation
- Transaction processing simulation

### AI Chatbot Integration
- OpenAI GPT-3.5-turbo integration
- Floating chat widget with modern UI
- Real-time messaging with typing indicators
- Conversation history management
- Error tracking and fallback responses
- Session-based context management
- Admin dashboard integration

### Modern UI/UX
- Clean URL routing without file extensions
- Modular JavaScript architecture with ES modules
- Modern pagination animations and effects
- Responsive design for all screen sizes
- Professional styling with Tailwind CSS
- Toast notifications for user feedback
- Loading states and error handling
- Public dashboard access (no login required)

### Technical Architecture
- Separation of concerns with MVC pattern
- RESTful API design
- Error handling and logging
- Input validation and sanitization
- Database optimization and indexing
- Environment configuration management

---

## Development Scripts

```bash
npm run dev    # Start development server with nodemon
npm start      # Start production server
npm test       # Run tests (to be implemented)
```

---

## Recent Updates

### Version 2.0 Features
- AI Chatbot Integration - OpenAI-powered customer support
- Complete Payment System - Full checkout flow with validation
- Enhanced Shopping Cart - Improved UI with toggle functionality
- Modern UI Overhaul - Professional styling and animations
- Advanced Authentication - Enhanced security and session management
- Mobile Optimization - Fully responsive design

### Performance Improvements
- Optimized database queries
- Improved pagination system
- Modular JavaScript architecture
- Better error handling and logging

---

## Contributors

Developed by:
- **Oscar Escorcia** - [@OscarEsc10](https://github.com/OscarEsc10) - Lead Developer
- **Hernan Vazquez** - Backend Developer, Database Architect
- **Ehider Vilanueva** - Frontend Developer  
- **Jose Montes** - Frontend Developer

---

## Future Roadmap

- [ ] Real Payment Gateway Integration (Stripe/PayPal)
- [ ] Email Notifications for orders and updates
- [ ] Advanced Analytics Dashboard for admins
- [ ] Recommendation System based on user preferences
- [ ] Multi-language Support (i18n)
- [ ] Progressive Web App (PWA) features
- [ ] Real-time Notifications with WebSockets
- [ ] Advanced Search Filters (price range, ratings)

---

## License

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.