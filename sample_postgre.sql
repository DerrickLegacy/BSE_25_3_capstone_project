-- Enable dblink for conditional DB creation
CREATE EXTENSION IF NOT EXISTS dblink;

-- Create the "books" database only if it doesn't exist
DO
$$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_database WHERE datname = 'books'
   ) THEN
      PERFORM dblink_exec('dbname=postgres', 'CREATE DATABASE books');
   END IF;
END
$$;

-- Connect to the books database
\connect books;

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
