DROP SCHEMA PUBLIC CASCADE;
CREATE SCHEMA PUBLIC;


CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    codename VARCHAR(100) NOT NULL
);

insert into roles(name, codename) values
('ADMIN', 'admin'),
('SELLER', 'seller'),
('CUSTOMER', 'customer');

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone VARCHAR(20),
    role_id INT REFERENCES roles(role_id) ON DELETE CASCADE,
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

CREATE TABLE ebooks (
    ebook_id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(category_id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creator_id INT REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE ebooks_images (
    image_id SERIAL PRIMARY KEY,
    ebook_id INT REFERENCES ebooks(ebook_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL
);


CREATE TABLE cart_items (
    cart_item_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    ebook_id INT REFERENCES ebooks(ebook_id),
    quantity INT NOT NULL CHECK (quantity > 0),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders_status (
    Orderstatus_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    codename VARCHAR(100) NOT NULL
);

insert into orders_status (name, codename) values
('PENDING', 'pending'),
('PAID', 'paid'),
('SHIPPED', 'shipped'),
('DELIVERED', 'delivered'),
('CANCELLED', 'cancelled');

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    address_id INT REFERENCES addresses(address_id),
    total NUMERIC(12,2) NOT NULL,
    status INT REFERENCES Orders_status(Orderstatus_id), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
    ebook_id INT REFERENCES ebooks(ebook_id),
    quantity INT NOT NULL CHECK (quantity > 0),
    price NUMERIC(10,2) NOT NULL
);


CREATE TABLE payments_status (
    Pstatus_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    codename VARCHAR(100) NOT NULL
);

insert into payments_status (name, codename) values
('SOLD', 'sold'),
('PENDING', 'pending'),
('CANCELLED', 'cancelled');


CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
    method VARCHAR(50) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    Pstatus_id INT REFERENCES payments_status(Pstatus_id) ON DELETE CASCADE,
    paid_at TIMESTAMP
);

CREATE TABLE invoices (
    invoice_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(order_id),
    user_id INT REFERENCES users(user_id),
    issued_at TIMESTAMP DEFAULT NOW(),
    total NUMERIC(10,2),
    pdf_url TEXT
);

CREATE TABLE seller_request_status (
    sr_status_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    codename VARCHAR(100) NOT NULL
);

INSERT INTO seller_request_status (name, codename) VALUES
('PENDING', 'pending'),
('APPROVED', 'approved'),
('REJECTED', 'rejected');

CREATE TABLE seller_requests (
    request_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    business_name VARCHAR(150) NOT NULL,
    document_id VARCHAR(50) NOT NULL,
    sr_status_id INT REFERENCES seller_request_status(sr_status_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);