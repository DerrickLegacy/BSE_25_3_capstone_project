-- Create the database (you don't need this in Render, since Render creates the DB for you)
-- CREATE DATABASE books;

-- Switch to database (not needed on Render either)
-- \c books;

-- Create table
CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    middle_name VARCHAR(255),
    last_name VARCHAR(255) NOT NULL
);

-- Insert sample data
INSERT INTO authors (first_name, last_name)
VALUES ('William', 'Shakespeare');

INSERT INTO authors (first_name, middle_name, last_name)
VALUES ('Edgar', 'Allan', 'Poe');

INSERT INTO authors (first_name, last_name)
VALUES ('Fyodor', 'Dostoyevsky');

INSERT INTO authors (first_name, last_name)
VALUES ('Gabriel', 'Garcia Marquez');

-- Show all records
SELECT * FROM authors;
