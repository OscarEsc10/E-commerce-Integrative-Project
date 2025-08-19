DROP SCHEMA PUBLIC CASCADE;
CREATE SCHEMA PUBLIC;

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK(role in('admin', 'seller', 'customer')), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE addresses (
    address_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    street VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE
);

CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(category_id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_images (
    image_id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(product_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL
);


CREATE TABLE cart_items (
    cart_item_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    product_id INT REFERENCES products(product_id),
    quantity INT NOT NULL CHECK (quantity > 0),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    address_id INT REFERENCES addresses(address_id),
    total NUMERIC(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id INT REFERENCES products(product_id),
    quantity INT NOT NULL CHECK (quantity > 0),
    price NUMERIC(10,2) NOT NULL
);

CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
    method VARCHAR(50) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('Sold', 'Pending', 'Cancelled')),
    paid_at TIMESTAMP
);
