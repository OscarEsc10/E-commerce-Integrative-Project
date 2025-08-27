# 🛒 E-commerce Project

A modern **E-commerce web application** built with **JavaScript**, following best practices in project structure, scalability, and maintainability.  
This project uses **Node.js + Express** for the backend, **PostgreSQL** for the database, and follows **MVC architecture** to keep code clean and organized.

---

## 🚀 Features

- User Authentication (JWT + bcrypt)
- Product Management (CRUD: Create, Read, Update, Delete)
- Shopping Cart functionality
- Order Management
- RESTful API with Express
- PostgreSQL database integration
- Environment variables configuration with dotenv
- Secure password hashing
- Error handling & middleware
- Modular project structure

---

## 📂 Project Structure

```
E-COMMERCE/
│── Config/
│ └── config.js # Database & server configuration
│── SQL/
│ └── E-commerce.sql # Database schema and queries
│── src/
│ ├── Controllers/ # Business logic
│ │ └── Controller.js
│ ├── Models/ # Database interaction
│ │ └── Model.js
│ ├── Utils/ # Helper functions
│ │ └── Modals.js
│ ├── Views/ # Views or frontend integration (if needed)
│ │ └── Login.js
│── .env # Environment variables
│── .env.examples # Example env file for contributors
│── .gitignore # Ignored files (node_modules, .env, etc.)
│── eslint.config.mjs # ESLint configuration for best practices
│── index.js # Application entry point
│── package.json # Project dependencies and scripts
│── README.md # Project documentation
```

---

## 🛠️ Tech Stack

- **Backend:** Express.js  
- **Database:** PostgreSQL (`pg` library + raw SQL scripts)  
- **Environment Management:** dotenv  
- **Code Quality:** ESLint  
- **Version Control:**GitHub  

---

## ⚙️ Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/e-commerce.git
   cd e-commerce
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables in .env (example provided in .env.examples):

   ```bash
   PORT=5000
   DB_URL=postgresql://username:password@localhost:5432/ecommerce_db
   ```

4. **Run the SQL script inside SQL/E-commerce.sql to set up your database schema.**

---

### Start development server with nodemon:

   ```bash
   npm run dev
   ```

### 🧩 Best Practices

```
Separation of concerns using MVC pattern

Sensitive data stored in .env (never pushed to GitHub)

Database schema versioned under SQL/

ESLint configured for clean and consistent code

Example .env.examples provided for contributors

```

### 📧 Contact

Developed by **Oscar Escorcia**, **Hernan Vazquez** and **Ehider Vilanueva**