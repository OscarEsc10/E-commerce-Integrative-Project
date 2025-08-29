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
('SHIPPED', 'shipped');

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


--inserción de categorias
INSERT INTO categories (name, description) VALUES
('Programación', 'Libros sobre desarrollo de software, lenguajes y frameworks.'),
('Diseño', 'Libros sobre diseño gráfico, UX/UI, ilustración y creatividad.'),
('Negocios y Emprendimiento', 'Libros sobre startups, marketing, liderazgo y finanzas.'),
('Ciencia y Tecnología', 'Libros sobre avances científicos, IA, física, química y biología.'),
('Ficción', 'Novelas, cuentos y relatos de distintos géneros.'),
('Autoayuda y Desarrollo Personal', 'Libros para mejorar habilidades, hábitos y bienestar.'),
('Educación y Aprendizaje', 'Libros de estudio, guías y material académico.'),
('Historia', 'Libros sobre historia mundial, cultura y biografías.'),
('Salud y Bienestar', 'Libros sobre medicina, nutrición, deporte y hábitos saludables.'),
('Arte y Fotografía', 'Libros sobre pintura, escultura, fotografía y técnicas artísticas.');



-- Inserción de 20 e-books de ejemplo
INSERT INTO ebooks (name, description, price, category_id, creator_id)
VALUES
('Aprendiendo JavaScript', 'Manual completo de JS', 29.99, 1, 5),
('CSS Moderno', 'Guía de CSS avanzado', 19.99, 2, 6),
('Node.js desde cero', 'Backend con Node y Express', 34.99, 1, 5),
('React para principiantes', 'Frontend con React', 24.99, 2, 7),
('Python Intermedio', 'Conceptos de Python para proyectos', 27.50, 1, 8),
('Bases de Datos SQL', 'Aprende SQL desde cero', 21.00, 3, 9),
('Git y GitHub', 'Control de versiones para desarrolladores', 15.00, 2, 9),
('Angular Avanzado', 'Frontend profesional con Angular', 32.00, 2, 5),
('Java para principiantes', 'Aprende Java paso a paso', 28.50, 1, 5),
('PHP Moderno', 'Backend con PHP y Laravel', 22.00, 1, 6),
('Vue.js desde cero', 'Frontend con Vue.js', 26.00, 2, 7),
('C# y .NET', 'Desarrollo profesional en C#', 30.00, 1, 8),
('Ruby on Rails', 'Backend con Ruby', 25.00, 1, 9),
('Django para todos', 'Python Backend Framework', 29.00, 1, 9),
('Machine Learning básico', 'Introducción a ML', 35.00, 3, 5),
('Inteligencia Artificial', 'Conceptos fundamentales', 38.00, 3, 5),
('Diseño UI/UX', 'Principios de diseño', 18.00, 2, 6),
('Docker y Kubernetes', 'Contenedores y orquestación', 32.00, 3, 7),
('Seguridad Informática', 'Protege tus aplicaciones', 27.00, 3, 8),
('Cloud Computing', 'Servicios en la nube', 31.00, 3, 9);


--inserción de Sellers para asignar creator_id solo los Sellers tienen creator_id
--los Sellers deben enviarse mediante el endpoints creando un user admin y usando el token para poder acceder al crud de users o directamente desde la vista de register
/*{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "JuanP@2025",
  "phone": "3001112222",
  "role_id": 2
}

{
  "name": "Ana Gómez",
  "email": "ana@example.com",
  "password": "AnaG@2025",
  "phone": "3003334444",
  "role_id": 2
}

{
  "name": "Miguel Torres",
  "email": "miguel@example.com",
  "password": "MigT$2025",
  "phone": "3009990000",
  "role_id": 2
}

{
  "name": "Sofía Ríos",
  "email": "sofia@example.com",
  "password": "SofR%2025",
  "phone": "3011112222",
  "role_id": 2
}


{
  "name": "Daniel torres",
  "email": "Daniel12345@example.com",
  "password": "Daniel12345@",
  "phone": "3000258966",
  "role_id": 2
}

{
  "name": "Dubeiker",
  "email": "Dubeiker@example.com",
  "password": "Dubeiker12345@",
  "phone": "32165498",
  "role_id": 2
}


{
  "name": "Juan archila",
  "email": "JuanArch@example.com",
  "password": "Juan12345@",
  "phone": "322458963",
  "role_id": 2
}

{
  "name": "Caleb ariza",
  "email": "CalebA@example.com",
  "password": "CalebA12345@",
  "phone": "325698741",
  "role_id": 2
}

{
  "name": "Gabriel Ariza",
  "email": "Gabo@example.com",
  "password": "Gabo12345@",
  "phone": "3126179273",
  "role_id": 2
}* */